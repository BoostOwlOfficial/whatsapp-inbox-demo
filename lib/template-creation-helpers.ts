// Template creation helper types and validation functions

import type {
    TemplateCategory,
    ComponentFormat,
    ButtonType,
    WhatsAppTemplateButton,
    OTPType,
    URLType,
} from "./whatsapp-template-types"

/**
 * Template creation request structure
 */
export interface TemplateCreationComponent {
    type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS"
    format?: ComponentFormat
    text?: string
    example?: {
        header_handle?: string[]
        header_text?: string[]
        body_text?: string[][]
    }
    buttons?: WhatsAppTemplateButton[]
}

export interface TemplateCreationRequest {
    name: string
    category: TemplateCategory
    language: string
    components: TemplateCreationComponent[]
}

/**
 * Template creation response
 */
export interface TemplateCreationResponse {
    id: string
    status: string
    name: string
    category: string
    language: string
}

/**
 * Validation result
 */
export interface ValidationResult {
    isValid: boolean
    errors: string[]
}

/**
 * Validate template name format
 * Must be lowercase with underscores only, no spaces or special chars
 */
export function validateTemplateName(name: string): ValidationResult {
    const errors: string[] = []

    if (!name || name.trim().length === 0) {
        errors.push("Template name is required")
        return { isValid: false, errors }
    }

    // Check for lowercase and underscores only
    if (!/^[a-z0-9_]+$/.test(name)) {
        errors.push("Template name must contain only lowercase letters, numbers, and underscores")
    }

    // Check length (WhatsApp typically allows up to 512 chars, but be conservative)
    if (name.length > 100) {
        errors.push("Template name is too long (max 100 characters)")
    }

    // Check doesn't start or end with underscore
    if (name.startsWith("_") || name.endsWith("_")) {
        errors.push("Template name cannot start or end with an underscore")
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Format template name to be valid
 */
export function formatTemplateName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_") // Replace invalid chars with underscore
        .replace(/_+/g, "_") // Replace multiple underscores with single
        .replace(/^_|_$/g, "") // Remove leading/trailing underscores
}

/**
 * Validate variable sequence in text
 * Ensures variables are sequential ({{1}}, {{2}}, {{3}}, not {{1}}, {{3}})
 */
export function validateVariableSequence(text: string): ValidationResult {
    const errors: string[] = []
    const matches = text.match(/\{\{(\d+)\}\}/g)

    if (!matches) {
        return { isValid: true, errors: [] }
    }

    const numbers = matches.map(m => parseInt(m.replace(/\{\{|\}\}/g, "")))
    const uniqueNumbers = Array.from(new Set(numbers)).sort((a, b) => a - b)

    // Check if starts from 1
    if (uniqueNumbers[0] !== 1) {
        errors.push("Variables must start from {{1}}")
    }

    // Check if sequential
    for (let i = 0; i < uniqueNumbers.length; i++) {
        if (uniqueNumbers[i] !== i + 1) {
            errors.push(`Variables must be sequential. Found {{${uniqueNumbers[i]}}} but expected {{${i + 1}}}`)
            break
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Count variables in text
 */
export function countVariables(text: string): number {
    const matches = text.match(/\{\{(\d+)\}\}/g)
    return matches ? new Set(matches).size : 0
}

/**
 * Validate button configuration
 */
export function validateButtons(buttons: WhatsAppTemplateButton[], category: TemplateCategory): ValidationResult {
    const errors: string[] = []

    if (!buttons || buttons.length === 0) {
        return { isValid: true, errors: [] }
    }

    const buttonTypes = buttons.map(b => b.type)
    const quickReplyCount = buttonTypes.filter(t => t === "QUICK_REPLY").length
    const ctaCount = buttonTypes.filter(t => t === "URL" || t === "PHONE_NUMBER").length
    const otpCount = buttonTypes.filter(t => t === "OTP").length
    const catalogCount = buttonTypes.filter(t => t === "CATALOG").length

    // Quick reply buttons: max 3
    if (quickReplyCount > 3) {
        errors.push("Maximum 3 quick reply buttons allowed")
    }

    // Call-to-action buttons: max 2
    if (ctaCount > 2) {
        errors.push("Maximum 2 call-to-action buttons (URL/Phone) allowed")
    }

    // OTP buttons: max 1, only for AUTHENTICATION
    if (otpCount > 1) {
        errors.push("Maximum 1 OTP button allowed")
    }
    if (otpCount > 0 && category !== "AUTHENTICATION") {
        errors.push("OTP buttons are only allowed in AUTHENTICATION category templates")
    }

    // Catalog buttons: max 1
    if (catalogCount > 1) {
        errors.push("Maximum 1 catalog button allowed")
    }

    // Cannot mix quick reply with CTA or catalog
    if (quickReplyCount > 0 && (ctaCount > 0 || catalogCount > 0)) {
        errors.push("Cannot mix quick reply buttons with call-to-action or catalog buttons")
    }

    // Cannot mix OTP with other button types
    if (otpCount > 0 && (quickReplyCount > 0 || ctaCount > 0 || catalogCount > 0)) {
        errors.push("OTP buttons cannot be combined with other button types")
    }

    // Validate individual buttons
    buttons.forEach((button, index) => {
        if (!button.text || button.text.trim().length === 0) {
            errors.push(`Button ${index + 1}: Text is required`)
        }

        if (button.text && button.text.length > 25) {
            errors.push(`Button ${index + 1}: Text too long (max 25 characters)`)
        }

        if (button.type === "URL") {
            if (!button.url) {
                errors.push(`Button ${index + 1}: URL is required for URL buttons`)
            }
        }

        if (button.type === "PHONE_NUMBER") {
            if (!button.phone_number) {
                errors.push(`Button ${index + 1}: Phone number is required for phone buttons`)
            }
        }

        if (button.type === "OTP") {
            if (!button.otp_type) {
                errors.push(`Button ${index + 1}: OTP type is required for OTP buttons`)
            }
        }
    })

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Validate complete template creation request
 */
export function validateTemplateCreation(request: TemplateCreationRequest): ValidationResult {
    const errors: string[] = []

    // Validate name
    const nameValidation = validateTemplateName(request.name)
    if (!nameValidation.isValid) {
        errors.push(...nameValidation.errors)
    }

    // Validate category
    if (!["MARKETING", "UTILITY", "AUTHENTICATION"].includes(request.category)) {
        errors.push("Invalid category. Must be MARKETING, UTILITY, or AUTHENTICATION")
    }

    // Validate language
    if (!request.language || request.language.trim().length === 0) {
        errors.push("Language is required")
    }

    // Validate components
    if (!request.components || request.components.length === 0) {
        errors.push("At least one component is required")
    }

    const bodyComponent = request.components.find(c => c.type === "BODY")
    if (!bodyComponent || !bodyComponent.text || bodyComponent.text.trim().length === 0) {
        errors.push("BODY component with text is required")
    }

    // Validate body text variables
    if (bodyComponent?.text) {
        const variableValidation = validateVariableSequence(bodyComponent.text)
        if (!variableValidation.isValid) {
            errors.push(...variableValidation.errors)
        }

        // Check body length
        if (bodyComponent.text.length > 1024) {
            errors.push("Body text is too long (max 1024 characters)")
        }
    }

    // Validate header if present
    const headerComponent = request.components.find(c => c.type === "HEADER")
    if (headerComponent) {
        if (!headerComponent.format) {
            errors.push("Header format is required")
        }

        if (headerComponent.format === "TEXT" && !headerComponent.text) {
            errors.push("Header text is required for TEXT format")
        }

        if (
            (headerComponent.format === "IMAGE" ||
                headerComponent.format === "DOCUMENT" ||
                headerComponent.format === "VIDEO") &&
            (!headerComponent.example || !headerComponent.example.header_handle)
        ) {
            errors.push(`Media ID (header_handle) is required for ${headerComponent.format} format headers`)
        }
    }

    // Validate footer if present
    const footerComponent = request.components.find(c => c.type === "FOOTER")
    if (footerComponent) {
        if (!footerComponent.text || footerComponent.text.trim().length === 0) {
            errors.push("Footer text is required when footer component is present")
        }

        if (footerComponent.text && footerComponent.text.length > 60) {
            errors.push("Footer text is too long (max 60 characters)")
        }

        // Footer cannot have variables
        if (footerComponent.text && /\{\{\d+\}\}/.test(footerComponent.text)) {
            errors.push("Footer text cannot contain variables")
        }
    }

    // Validate buttons if present
    const buttonsComponent = request.components.find(c => c.type === "BUTTONS")
    if (buttonsComponent?.buttons && buttonsComponent.buttons.length > 0) {
        const buttonValidation = validateButtons(buttonsComponent.buttons, request.category)
        if (!buttonValidation.isValid) {
            errors.push(...buttonValidation.errors)
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

/**
 * Get example structure for header based on format and media ID
 */
export function getHeaderExample(format: ComponentFormat, mediaId?: string): any {
    if (format === "TEXT") {
        return undefined // No example needed for text headers
    }

    if (format === "LOCATION") {
        return undefined // Location headers don't need examples in creation
    }

    // For IMAGE, DOCUMENT, VIDEO
    if (mediaId) {
        return {
            header_handle: [mediaId],
        }
    }

    return undefined
}
