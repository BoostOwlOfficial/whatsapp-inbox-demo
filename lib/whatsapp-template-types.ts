// TypeScript types for WhatsApp Business Cloud API Message Templates

/**
 * Component format types for template headers
 */
export type ComponentFormat = "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION"

/**
 * Component types in a WhatsApp template
 */
export type ComponentType = "HEADER" | "BODY" | "FOOTER" | "BUTTONS"

/**
 * Button types for template buttons
 */
export type ButtonType = "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "OTP" | "CATALOG"

/**
 * OTP button types for authentication templates
 */
export type OTPType = "COPY_CODE" | "ONE_TAP"

/**
 * URL types for URL buttons
 */
export type URLType = "STATIC" | "DYNAMIC"

/**
 * Template status from WhatsApp
 */
export type TemplateStatus = "APPROVED" | "PENDING" | "REJECTED"

/**
 * Template categories
 */
export type TemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION"

/**
 * Button in a template
 */
export interface WhatsAppTemplateButton {
    type: ButtonType
    text: string
    // For URL buttons
    url?: string
    url_type?: URLType
    // For phone buttons
    phone_number?: string
    // For OTP buttons
    otp_type?: OTPType
}

/**
 * Example data for template variables
 */
export interface TemplateExample {
    body_text?: string[][]
    header_text?: string[]
    header_handle?: string[]
}

/**
 * Component in a WhatsApp template
 */
export interface WhatsAppTemplateComponent {
    type: ComponentType
    format?: ComponentFormat
    text?: string
    example?: TemplateExample
    buttons?: WhatsAppTemplateButton[]
}

/**
 * WhatsApp message template from the API
 */
export interface WhatsAppTemplate {
    id: string
    name: string
    language: string
    status: TemplateStatus
    category: TemplateCategory
    previous_category?: string
    components: WhatsAppTemplateComponent[]
}

/**
 * Pagination cursors from WhatsApp API
 */
export interface PaginationCursors {
    before: string
    after: string
}

/**
 * Paging information from WhatsApp API
 */
export interface PagingInfo {
    cursors: PaginationCursors
}

/**
 * Full response from WhatsApp message templates API
 */
export interface WhatsAppTemplatesResponse {
    data: WhatsAppTemplate[]
    paging?: PagingInfo
}

/**
 * Simplified template format for UI display
 */
export interface UITemplate {
    id: string
    name: string
    category: string
    language: string
    status: "approved" | "pending" | "rejected"
    content: string
    variables: string[]
    createdAt: string
    components: WhatsAppTemplateComponent[]
    headerText?: string
    footerText?: string
    buttons?: WhatsAppTemplateButton[]
}

/**
 * Transform WhatsApp API template to UI format
 */
export function transformTemplateForUI(template: WhatsAppTemplate): UITemplate {
    const headerComponent = template.components.find(c => c.type === "HEADER")
    const bodyComponent = template.components.find(c => c.type === "BODY")
    const footerComponent = template.components.find(c => c.type === "FOOTER")
    const buttonsComponent = template.components.find(c => c.type === "BUTTONS")

    // Extract body text for content
    const content = bodyComponent?.text || ""

    // Extract variables from body text ({{1}}, {{2}}, etc.)
    const variables = extractVariables(content)

    return {
        id: template.id,
        name: template.name,
        category: template.category,
        language: template.language,
        status: template.status.toLowerCase() as "approved" | "pending" | "rejected",
        content,
        variables,
        createdAt: new Date().toISOString(), // WhatsApp API doesn't provide creation date
        components: template.components,
        headerText: headerComponent?.text,
        footerText: footerComponent?.text,
        buttons: buttonsComponent?.buttons,
    }
}

/**
 * Extract variable placeholders from template text
 */
export function extractVariables(text: string): string[] {
    const matches = text.match(/\{\{(\d+)\}\}/g)
    return matches ? matches.map(m => m.replace(/\{\{|\}\}/g, "")) : []
}

/**
 * Build full template preview text including header, body, and footer
 */
export function buildTemplatePreview(template: WhatsAppTemplate): string {
    const parts: string[] = []

    template.components.forEach(component => {
        if (component.type === "HEADER" && component.text) {
            parts.push(`**${component.text}**`)
        } else if (component.type === "BODY" && component.text) {
            parts.push(component.text)
        } else if (component.type === "FOOTER" && component.text) {
            parts.push(`_${component.text}_`)
        }
    })

    return parts.join("\n\n")
}
