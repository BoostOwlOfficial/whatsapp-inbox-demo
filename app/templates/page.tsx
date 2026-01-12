"use client"

import { useState } from "react"
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
} from "lucide-react"

export default function TemplatesPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [templates, setTemplates] = useState<Template[]>(sampleTemplates)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [isCreating, setIsCreating] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

    // New template form state
    const [newTemplate, setNewTemplate] = useState({
        name: "",
        category: "Marketing",
        language: "en",
        content: "",
    })

    const handleCreateTemplate = () => {
        const template: Template = {
            id: `tmpl-${Date.now()}`,
            name: newTemplate.name,
            category: newTemplate.category,
            language: newTemplate.language,
            status: "pending",
            content: newTemplate.content,
            variables: extractVariables(newTemplate.content),
            createdAt: new Date().toISOString(),
        }

        setTemplates([...templates, template])
        setIsCreating(false)
        setNewTemplate({ name: "", category: "Marketing", language: "en", content: "" })
    }

    const extractVariables = (content: string): string[] => {
        const matches = content.match(/\{\{(\d+)\}\}/g)
        return matches ? matches.map((m) => m.replace(/\{\{|\}\}/g, "")) : []
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
                            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                                <DialogTrigger asChild>
                                    <Button className="h-11 px-6 bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20 font-medium transition-all hover:scale-105 active:scale-95">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Template
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Create New Template</DialogTitle>
                                        <DialogDescription>
                                            Create a new WhatsApp message template. Use {`{{1}}`}, {`{{2}}`}, etc. for variables.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Template Name</label>
                                            <Input
                                                placeholder="e.g., Welcome Message"
                                                value={newTemplate.name}
                                                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Category</label>
                                                <Select
                                                    value={newTemplate.category}
                                                    onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {templateCategories.map((cat) => (
                                                            <SelectItem key={cat} value={cat}>
                                                                {cat}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Language</label>
                                                <Select
                                                    value={newTemplate.language}
                                                    onValueChange={(value) => setNewTemplate({ ...newTemplate, language: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="en">English</SelectItem>
                                                        <SelectItem value="es">Spanish</SelectItem>
                                                        <SelectItem value="fr">French</SelectItem>
                                                        <SelectItem value="de">German</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Message Content</label>
                                            <Textarea
                                                placeholder="Enter your message template here. Use {{1}}, {{2}}, etc. for dynamic variables."
                                                value={newTemplate.content}
                                                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                                                rows={6}
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Variables detected: {extractVariables(newTemplate.content).length}
                                            </p>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setIsCreating(false)}>
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleCreateTemplate}
                                                disabled={!newTemplate.name || !newTemplate.content}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Create Template
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
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
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 group-hover:border-slate-200 transition-colors">
                                                <p className="text-sm text-slate-600 line-clamp-3 font-mono leading-relaxed">
                                                    {template.content}
                                                </p>
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
            </div>
        </ProtectedRoute>
    )
}
