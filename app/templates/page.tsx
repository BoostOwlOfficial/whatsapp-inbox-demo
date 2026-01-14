"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { sampleTemplates, templateCategories, Template } from "@/lib/sample-data"
import { transformTemplateForUI } from "@/lib/whatsapp-template-types"
import type { WhatsAppTemplate } from "@/lib/whatsapp-template-types"
import { CreateTemplateDialog } from "@/components/create-template-dialog"
import {
    FileText,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
    AlertCircle,
} from "lucide-react"

export default function TemplatesPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [isCreating, setIsCreating] = useState(false)

    // Fetch templates from WhatsApp API
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true)
                setError(null)

                // Check if settings are configured
                if (!accessToken || !wabaId) {
                    throw new Error("Please configure your WhatsApp settings first")
                }

                // Build URL with settings from context (only non-sensitive params)
                const params = new URLSearchParams({
                    wabaId,
                    apiVersion: apiVersion || "v21.0",
                })

                // Send access token in Authorization header (more secure)
                const response = await fetch(`/api/templates?${params.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.details || errorData.error || "Failed to fetch templates")
                }

                const data = await response.json()

                // Transform WhatsApp templates to UI format
                const transformedTemplates = data.templates.map((template: WhatsAppTemplate) =>
                    transformTemplateForUI(template)
                )

                setTemplates(transformedTemplates)
            } catch (err) {
                console.error("Error fetching templates:", err)
                setError(err instanceof Error ? err.message : "Failed to load templates")
                // Fallback to sample data on error
                setTemplates(sampleTemplates)
            } finally {
                setLoading(false)
            }
        }

        fetchTemplates()
    }, [accessToken, wabaId, apiVersion])

    const handleRefresh = () => {
        // Refetch templates after creating a new one
        fetch(`/api/templates`)
            .then(res => res.json())
            .then(data => {
                const transformed = data.templates.map((t: WhatsAppTemplate) => transformTemplateForUI(t))
                setTemplates(transformed)
            })
            .catch(console.error)
    }

    const handleDeleteTemplate = (id: string) => {
        setTemplates(templates.filter((t) => t.id !== id))
    }

    const filteredTemplates = templates.filter((template) => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-600" />
            case "rejected":
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "rejected":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <ProtectedRoute>
            <div className="flex h-full flex-col bg-slate-50">
                {/* Fixed Header Section */}
                <div className="flex-none bg-white border-b border-slate-200 z-10">
                    <div className="px-8 py-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-green-600 p-2.5 rounded-xl shadow-lg shadow-green-600/20">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Message Templates</h1>
                                <p className="text-sm text-slate-500 font-medium">Create and manage your WhatsApp templates</p>
                            </div>
                        </div>

                        {/* Search and Filters Bar */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative max-w-2xl">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search templates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:ring-green-500 transition-all focus:bg-white"
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-48 h-11 border-slate-200 bg-white">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {templateCategories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={() => setIsCreating(true)}
                                className="h-11 px-6 bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20 font-medium transition-all hover:scale-105 active:scale-95"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Template
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Create Template Dialog */}
                <CreateTemplateDialog
                    open={isCreating}
                    onOpenChange={setIsCreating}
                    onSuccess={handleRefresh}
                />

                {/* Loading State */}
                {loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
                            <p className="text-slate-600 font-medium">Loading templates...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center max-w-md">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Templates</h3>
                                <p className="text-sm text-slate-600 mb-4">{error}</p>
                                <p className="text-xs text-slate-500">Showing sample data instead.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scrollable Content Area */}
                {!loading && (
                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                    {filteredTemplates.map((template) => (
                                        <Card key={template.id} className="group border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 bg-white overflow-hidden">
                                            <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0 pr-3">
                                                        <CardTitle className="text-lg font-bold text-slate-900 truncate" title={template.name}>
                                                            {template.name}
                                                        </CardTitle>
                                                        <CardDescription className="mt-1 flex items-center gap-2 text-xs font-medium">
                                                            <span className="text-slate-500">{template.category}</span>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="text-slate-500 uppercase">{template.language}</span>
                                                        </CardDescription>
                                                    </div>
                                                    <Badge className={`${getStatusColor(template.status)} shadow-none border-0 px-2.5 py-0.5`}>
                                                        <span className="flex items-center gap-1.5">
                                                            {getStatusIcon(template.status)}
                                                            <span className="capitalize">{template.status}</span>
                                                        </span>
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4 pt-4">
                                                {/* Template Preview with Header, Body, Footer */}
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 group-hover:border-slate-200 transition-colors">
                                                    {template.headerText && (
                                                        <p className="text-sm font-bold text-slate-900 mb-2">
                                                            {template.headerText}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-slate-600 font-mono leading-relaxed line-clamp-3">
                                                        {template.content}
                                                    </p>
                                                    {template.footerText && (
                                                        <p className="text-xs text-slate-500 italic mt-2">
                                                            {template.footerText}
                                                        </p>
                                                    )}
                                                </div>

                                                {template.variables.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {template.variables.map((variable) => (
                                                            <Badge key={variable} variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 px-2 py-0.5 rounded-md font-mono">
                                                                {`{{${variable}}}`}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex gap-2 pt-2">
                                                    <Button variant="outline" size="sm" className="flex-1 h-9 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium">
                                                        <Eye className="mr-2 h-3.5 w-3.5" />
                                                        Preview
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="flex-1 h-9 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium">
                                                        <Edit className="mr-2 h-3.5 w-3.5" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteTemplate(template.id)}
                                                        className="h-9 px-3 border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>

                                                <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
                                                    <p className="text-[10px] text-slate-400 font-medium">
                                                        Created {new Date(template.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
