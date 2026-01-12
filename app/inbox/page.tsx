"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSettings } from "@/lib/settings-context"
import { useMessagesContext } from "@/lib/messages-context"
import { sendMessage } from "@/lib/whatsapp-api"
import type { Conversation } from "@/lib/whatsapp-api"
import {
    Search,
    Phone,
    Video,
    MoreHorizontal,
    Paperclip,
    Send,
    Check,
    CheckCheck,
    X,
    Plus,
    Tag,
    MessageSquare,
    Loader2,
    AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function InboxPage() {
    const { phoneNumberId, accessToken, apiVersion } = useSettings()
    const [myPhoneNumber, setMyPhoneNumber] = useState("")

    // Use global messages context instead of hook
    const { conversations, loading, error, refetch } = useMessagesContext()

    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messageInput, setMessageInput] = useState("")
    const [activeTab, setActiveTab] = useState<"open" | "unread" | "my_chats">("open")
    const [sending, setSending] = useState(false)

    // Get my phone number from settings on mount
    useEffect(() => {
        // In a real app, you'd fetch this from the WhatsApp API or settings
        // For now, we'll use the phoneNumberId as a proxy
        if (phoneNumberId) {
            setMyPhoneNumber(phoneNumberId)
        }
    }, [phoneNumberId])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!messageInput.trim() || !selectedConversation || !accessToken || !phoneNumberId) return

        setSending(true)
        try {
            const result = await sendMessage({
                accessToken,
                phoneNumberId,
                recipientPhone: selectedConversation.recipientPhone,
                message: messageInput,
                apiVersion: apiVersion || "v21.0",
                senderPhone: myPhoneNumber,
            })

            if (result.success) {
                setMessageInput("")
                // Refetch messages to show the sent message
                await refetch()
            } else {
                console.error("Failed to send message:", result.error)
                alert("Failed to send message: " + result.error)
            }
        } catch (error) {
            console.error("Error sending message:", error)
            alert("Error sending message")
        } finally {
            setSending(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    const formatTime = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Filter conversations based on active tab
    const filteredConversations = conversations.filter(conv => {
        if (activeTab === "unread") return conv.unread
        return true
    })

    // Show configuration prompt if settings not configured
    if (!phoneNumberId || !accessToken) {
        return (
            <ProtectedRoute>
                <div className="flex h-full items-center justify-center bg-slate-50">
                    <div className="text-center max-w-md p-8">
                        <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">WhatsApp Not Configured</h2>
                        <p className="text-slate-600 mb-6">
                            Please configure your WhatsApp Business API credentials in Settings to start using the Inbox.
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
            <div className="flex h-full bg-white overflow-hidden">
                {/* Left Panel: Conversation List */}
                <div className="w-full sm:w-96 md:w-80 lg:w-96 xl:w-[28%] 2xl:w-[25%] flex-shrink-0 border-r border-slate-200 flex flex-col bg-white overflow-hidden">
                    {/* Search Header */}
                    <div className="p-4 border-b border-slate-100 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 bg-white border-slate-200 focus-visible:ring-green-500 h-9 text-sm"
                            />
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab("open")}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "open"
                                    ? "bg-slate-900 text-white"
                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                Open ({conversations.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("unread")}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "unread"
                                    ? "bg-slate-900 text-white"
                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                Unread ({conversations.filter(c => c.unread).length})
                            </button>
                            <button
                                onClick={() => setActiveTab("my_chats")}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === "my_chats"
                                    ? "bg-slate-900 text-white"
                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                My Chats
                            </button>
                        </div>
                    </div>

                    {/* Conversation List */}
                    <ScrollArea className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                            </div>
                        ) : error ? (
                            <div className="p-4">
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
                                <p className="text-sm text-slate-500">No conversations yet</p>
                                <p className="text-xs text-slate-400 mt-1">Messages will appear here</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {filteredConversations.map((conv) => {
                                    const lastMessage = conv.messages[conv.messages.length - 1]
                                    const contactName = conv.contactName || "Unknown"
                                    const avatarColor = ["bg-blue-100 text-blue-600", "bg-purple-100 text-purple-600", "bg-green-100 text-green-600", "bg-orange-100 text-orange-600"][contactName.length % 4 || 0]

                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv)}
                                            className={`relative p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedConversation?.id === conv.id ? "bg-slate-50 border-l-4 border-green-500" : "border-l-4 border-transparent"
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <Avatar className={`h-10 w-10 border border-slate-100 ${avatarColor}`}>
                                                    <AvatarFallback className={avatarColor}>
                                                        {getInitials(contactName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                                                            {contactName}
                                                        </h3>
                                                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                            {formatTime(lastMessage.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate mb-2">{lastMessage.text}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {conv.tags.slice(0, 2).map(tag => (
                                                            <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-50 text-green-700 border border-green-100 font-medium">
                                                            {conv.unread ? "Unassigned" : "Me"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {conv.unread && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Middle Panel: Chat Window */}
                {selectedConversation ? (
                    <div className="flex-1 flex flex-col bg-[#efeae2] overflow-hidden" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: "overlay" }}>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 bg-blue-100 text-blue-600">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                        {getInitials(selectedConversation.contactName || "Unknown")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">{selectedConversation.contactName || "Unknown Contact"}</h2>
                                    <p className="text-xs text-slate-500">{selectedConversation.recipientPhone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-300 text-slate-700">
                                    <Check className="mr-1.5 h-3 w-3" />
                                    Resolve
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-300 text-slate-700">
                                    <Plus className="mr-1.5 h-3 w-3" />
                                    Assign
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-300 text-slate-700">
                                    CRM Info
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 min-h-0 scroll-smooth">
                            <div className="space-y-6">
                                <div className="flex justify-center">
                                    <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-medium text-slate-500 shadow-sm border border-slate-100">
                                        TODAY
                                    </span>
                                </div>

                                {selectedConversation.messages.map((msg) => {
                                    const isSelf = msg.from === myPhoneNumber
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[60%] rounded-lg p-3 shadow-sm relative text-sm ${isSelf
                                                    ? "bg-green-100 text-slate-900 rounded-tr-none"
                                                    : "bg-white text-slate-900 rounded-tl-none"
                                                    }`}
                                            >
                                                <p className="leading-relaxed">{msg.text}</p>
                                                <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isSelf ? "text-green-700/70" : "text-slate-400"
                                                    }`}>
                                                    <span>{formatTime(msg.timestamp)}</span>
                                                    {isSelf && (
                                                        <span>
                                                            {msg.status === "read" ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3" />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="bg-white p-4 border-t border-slate-200">
                            <form onSubmit={handleSendMessage} className="flex gap-4 items-center max-w-4xl mx-auto">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <Input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-green-500"
                                    disabled={sending}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0 w-10 h-10 rounded-lg"
                                    disabled={sending || !messageInput.trim()}
                                >
                                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </form>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-slate-400">
                                    Press Enter to send, Shift + Enter for new line
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50 border-r border-slate-200">
                        <div className="text-center">
                            <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                                <MessageSquare className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Select a conversation</h3>
                            <p className="text-sm text-slate-500">Choose a conversation from the list to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
