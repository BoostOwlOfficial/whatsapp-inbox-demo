"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useMessagesContext } from "@/lib/messages-context"
import type { Contact } from "@/lib/whatsapp-api"
import {
    Search,
    Users,
    Phone,
    MessageSquare,
    Calendar,
    Loader2,
    AlertCircle,
    Download,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ContactsPage() {
    const { contacts, loading, error, phoneNumberId } = useMessagesContext()
    const [searchQuery, setSearchQuery] = useState("")

    const filteredContacts = contacts.filter(contact => {
        const query = searchQuery.toLowerCase()
        return (
            contact.phone.includes(query) ||
            contact.name?.toLowerCase().includes(query)
        )
    })

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    const exportContacts = () => {
        const csv = [
            ["Phone", "Name", "Message Count", "First Contact", "Last Contact"],
            ...contacts.map(c => [
                c.phone,
                c.name || "Unknown",
                c.messageCount.toString(),
                c.firstContactDate.toLocaleDateString(),
                c.lastMessageDate.toLocaleDateString()
            ])
        ].map(row => row.join(",")).join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!phoneNumberId) {
        return (
            <ProtectedRoute>
                <div className="flex h-full items-center justify-center bg-slate-50">
                    <div className="text-center max-w-md p-8">
                        <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">WhatsApp Not Configured</h2>
                        <p className="text-slate-600 mb-6">
                            Please configure your WhatsApp Business API credentials in Settings.
                        </p>
                        <Button onClick={() => window.location.href = "/settings"} className="bg-green-600 hover:bg-green-700">
                            Go to Settings
                        </Button>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="flex h-full flex-col bg-slate-50">
                {/* Header */}
                <div className="flex-none bg-white border-b border-slate-200 z-10">
                    <div className="px-8 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-600 p-2.5 rounded-xl shadow-lg shadow-green-600/20">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {contacts.length} contacts from your conversations
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={exportContacts}
                                variant="outline"
                                className="border-slate-300"
                                disabled={contacts.length === 0}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or phone number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:ring-green-500 transition-all focus:bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-8">
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                                </div>
                            ) : error ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            ) : filteredContacts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <Users className="h-16 w-16 text-slate-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        {searchQuery ? "No contacts found" : "No contacts yet"}
                                    </h3>
                                    <p className="text-sm text-slate-500 max-w-md">
                                        {searchQuery
                                            ? "Try adjusting your search query"
                                            : "Contacts will automatically appear here when you receive or send messages"}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredContacts.map((contact) => {
                                        const avatarColor = ["bg-blue-100 text-blue-600", "bg-purple-100 text-purple-600", "bg-green-100 text-green-600", "bg-orange-100 text-orange-600"][(contact.name?.length || 0) % 4]

                                        return (
                                            <Card
                                                key={contact.id}
                                                className="group border-slate-200 shadow-sm hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
                                                onClick={() => window.location.href = "/inbox"}
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <Avatar className={`h-12 w-12 ${avatarColor}`}>
                                                            <AvatarFallback className={avatarColor}>
                                                                {getInitials(contact.name || "?")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-slate-900 truncate">
                                                                {contact.name || "Unknown Contact"}
                                                            </h3>
                                                            <p className="text-sm text-slate-500 font-mono">
                                                                {contact.phone}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <MessageSquare className="h-4 w-4 text-slate-400" />
                                                            <span>{contact.messageCount} messages</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Calendar className="h-4 w-4 text-slate-400" />
                                                            <span>Last: {contact.lastMessageDate.toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Calendar className="h-4 w-4 text-slate-400" />
                                                            <span>First: {contact.firstContactDate.toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                                        >
                                                            <Phone className="mr-2 h-3.5 w-3.5" />
                                                            View Conversation
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </ProtectedRoute>
    )
}
