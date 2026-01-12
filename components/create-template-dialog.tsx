"use client"

import { useState } from "react"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { TemplateCreationRequest } from "@/lib/template-creation-helpers"
import {
    formatTemplateName,
    validateTemplateCreation,
    countVariables,
} from "@/lib/template-creation-helpers"
import { Loader2, Plus, X, AlertCircle, CheckCircle2 } from "lucide-react"
import type { ComponentFormat, ButtonType } from "@/lib/whatsapp-template-types"

interface CreateTemplateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function CreateTemplateDialog({ open, onOpenChange, onSuccess }: CreateTemplateDialogProps) {
    const { accessToken, wabaId, apiVersion } = useSettings()

    // Basic info
    const [name, setName] = useState("")
    const [category, setCategory] = useState<"MARKETING" | "UTILITY" | "AUTHENTICATION">("MARKETING")
    const [language, setLanguage] = useState("en_US")

    // Components
    const [headerFormat, setHeaderFormat] = useState<ComponentFormat | "NONE">("NONE")
    const [headerText, setHeaderText] = useState("")
    const [headerMediaId, setHeaderMediaId] = useState("")
    const [bodyText, setBodyText] = useState("")
    const [footerText, setFooterText] = useState("")

    // Buttons
    const [buttonType, setButtonType] = useState<"NONE" | "QUICK_REPLY" | "CTA" | "OTP">("NONE")
    const [buttons, setButtons] = useState<Array<{ type: ButtonType; text: string; url?: string; phone?: string }>>([])

    // State
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    const handleNameChange = (value: string) => {
        setName(value)
        // Auto-format as user types
        const formatted = formatTemplateName(value)
        if (formatted !== value) {
            setTimeout(() => setName(formatted), 0)
        }
    }

    const addButton = () => {
        if (buttonType === "QUICK_REPLY") {
            if (buttons.length < 3) {
                setButtons([...buttons, { type: "QUICK_REPLY", text: "" }])
            }
        } else if (buttonType === "CTA") {
            if (buttons.length < 2) {
                setButtons([...buttons, { type: "URL", text: "", url: "" }])
            }
        }
    }

    const removeButton = (index: number) => {
        setButtons(buttons.filter((_, i) => i !== index))
    }

    const updateButton = (index: number, field: string, value: string) => {
        const newButtons = [...buttons]
        if (field === "text") {
            newButtons[index].text = value
        } else if (field === "url") {
            newButtons[index].url = value
        } else if (field === "phone") {
            newButtons[index].phone = value
        } else if (field === "type") {
            newButtons[index].type = value as ButtonType
        }
        setButtons(newButtons)
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError(null)
            setValidationErrors([])

            // Build request
            const components: any[] = []

            // Header
            if (headerFormat !== "NONE") {
                const headerComp: any = { type: "HEADER", format: headerFormat }

                if (headerFormat === "TEXT") {
                    headerComp.text = headerText
                } else if (["IMAGE", "DOCUMENT", "VIDEO"].includes(headerFormat)) {
                    if (headerMediaId) {
                        headerComp.example = { header_handle: [headerMediaId] }
                    }
                }

                components.push(headerComp)
            }

            // Body (required)
            components.push({
                type: "BODY",
                text: bodyText,
            })

            // Footer
            if (footerText.trim()) {
                components.push({
                    type: "FOOTER",
                    text: footerText,
                })
            }

            // Buttons
            if (buttons.length > 0) {
                const formattedButtons = buttons.map(btn => {
                    const button: any = {
                        type: btn.type,
                        text: btn.text,
                    }

                    if (btn.type === "URL") {
                        button.url = btn.url
                        button.url_type = "STATIC"
                    } else if (btn.type === "PHONE_NUMBER") {
                        button.phone_number = btn.phone
                    }

                    return button
                })

                components.push({
                    type: "BUTTONS",
                    buttons: formattedButtons,
                })
            }

            const request: TemplateCreationRequest = {
                name,
                category,
                language,
                components,
            }

            // Validate
            const validation = validateTemplateCreation(request)
            if (!validation.isValid) {
                setValidationErrors(validation.errors)
                return
            }

            // Submit
            const params = new URLSearchParams({
                wabaId: wabaId || "",
                apiVersion: apiVersion || "v21.0",
            })

            const response = await fetch(`/api/templates/create?${params.toString()}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.details || data.error || "Failed to create template")
            }

            // Success!
            onSuccess()
            resetForm()
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create template")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setName("")
        setCategory("MARKETING")
        setLanguage("en_US")
        setHeaderFormat("NONE")
        setHeaderText("")
        setHeaderMediaId("")
        setBodyText("")
        setFooterText("")
        setButtonType("NONE")
        setButtons([])
        setError(null)
        setValidationErrors([])
    }

    const variableCount = countVariables(bodyText)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create WhatsApp Template</DialogTitle>
                    <DialogDescription>
                        Create a new message template. Templates require Meta approval before use.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="my_template_name"
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                Lowercase letters, numbers, and underscores only
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MARKETING">Marketing</SelectItem>
                                        <SelectItem value="UTILITY">Utility</SelectItem>
                                        <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="language">Language *</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en_US">English (US)</SelectItem>
                                        <SelectItem value="en_GB">English (UK)</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="de">German</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-2">
                        <Label htmlFor="header">Header (Optional)</Label>
                        <Select value={headerFormat} onValueChange={(v: any) => setHeaderFormat(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">None</SelectItem>
                                <SelectItem value="TEXT">Text</SelectItem>
                                <SelectItem value="IMAGE">Image</SelectItem>
                                <SelectItem value="DOCUMENT">Document</SelectItem>
                                <SelectItem value="VIDEO">Video</SelectItem>
                            </SelectContent>
                        </Select>

                        {headerFormat === "TEXT" && (
                            <Input
                                value={headerText}
                                onChange={(e) => setHeaderText(e.target.value)}
                                placeholder="Header text"
                                maxLength={60}
                            />
                        )}

                        {["IMAGE", "DOCUMENT", "VIDEO"].includes(headerFormat) && (
                            <Input
                                value={headerMediaId}
                                onChange={(e) => setHeaderMediaId(e.target.value)}
                                placeholder="Media ID (upload media first)"
                            />
                        )}
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                        <Label htmlFor="body">Body Text *</Label>
                        <Textarea
                            id="body"
                            value={bodyText}
                            onChange={(e) => setBodyText(e.target.value)}
                            placeholder="Your message text. Use {{1}}, {{2}}, etc. for variables."
                            rows={4}
                            maxLength={1024}
                            className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                            {bodyText.length}/1024 characters • {variableCount} variable(s) detected
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="space-y-2">
                        <Label htmlFor="footer">Footer (Optional)</Label>
                        <Input
                            id="footer"
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            placeholder="Footer text (no variables allowed)"
                            maxLength={60}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="space-y-2">
                        <Label>Buttons (Optional)</Label>
                        <Select value={buttonType} onValueChange={(v: any) => setButtonType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">None</SelectItem>
                                <SelectItem value="QUICK_REPLY">Quick Reply (max 3)</SelectItem>
                                <SelectItem value="CTA">Call-to-Action (max 2)</SelectItem>
                            </SelectContent>
                        </Select>

                        {buttonType !== "NONE" && (
                            <div className="space-y-2">
                                {buttons.map((btn, index) => (
                                    <div key={index} className="flex gap-2">
                                        {buttonType === "CTA" && (
                                            <Select
                                                value={btn.type}
                                                onValueChange={(v) => updateButton(index, "type", v)}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="URL">URL</SelectItem>
                                                    <SelectItem value="PHONE_NUMBER">Phone</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                        <Input
                                            value={btn.text}
                                            onChange={(e) => updateButton(index, "text", e.target.value)}
                                            placeholder="Button text"
                                            maxLength={25}
                                        />
                                        {btn.type === "URL" && (
                                            <Input
                                                value={btn.url || ""}
                                                onChange={(e) => updateButton(index, "url", e.target.value)}
                                                placeholder="https://..."
                                            />
                                        )}
                                        {btn.type === "PHONE_NUMBER" && (
                                            <Input
                                                value={btn.phone || ""}
                                                onChange={(e) => updateButton(index, "phone", e.target.value)}
                                                placeholder="+1234567890"
                                            />
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeButton(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                {((buttonType === "QUICK_REPLY" && buttons.length < 3) ||
                                    (buttonType === "CTA" && buttons.length < 2)) && (
                                        <Button variant="outline" size="sm" onClick={addButton}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Button
                                        </Button>
                                    )}
                            </div>
                        )}
                    </div>

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-red-900 text-sm">Validation Errors:</p>
                                    <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                                        {validationErrors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* API Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <p className="text-sm text-red-900">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !bodyText.trim()}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
