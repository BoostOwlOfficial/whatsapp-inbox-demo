"use client"

import { useState, useEffect } from "react"
import { useSettings } from "@/lib/settings-context"
import { ConversationList } from "./conversation-list"
import { ChatWindow } from "./chat-window"
import { PhoneSelector } from "./phone-selector"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ChatInterface() {
  const { accessToken, apiVersion } = useSettings()
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>("")
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Map<string, any>>(new Map())

  useEffect(() => {
    const saved = localStorage.getItem("whatsapp_phone_numbers")
    if (saved) {
      const parsed = JSON.parse(saved)
      setPhoneNumbers(parsed)
      if (parsed.length > 0 && !selectedPhoneId) {
        setSelectedPhoneId(parsed[0].id)
      }
    }

    const savedConversations = localStorage.getItem("whatsapp_conversations")
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations)
      setConversations(new Map(parsed))
    }
  }, [])

  useEffect(() => {
    if (conversations.size > 0) {
      localStorage.setItem("whatsapp_conversations", JSON.stringify(Array.from(conversations.entries())))
    }
  }, [conversations])

  const handleSelectPhone = (phoneId: string) => {
    setSelectedPhoneId(phoneId)
    setSelectedConversation(null)
  }

  const handleNewConversation = (recipientPhone: string) => {
    const convId = `${selectedPhoneId}-${recipientPhone}`
    if (!conversations.has(convId)) {
      const newConv = {
        id: convId,
        recipientPhone,
        messages: [],
        senderPhone: phoneNumbers.find((p) => p.id === selectedPhoneId)?.display_phone_number || "",
        createdAt: new Date().toISOString(),
      }
      setConversations(new Map(conversations).set(convId, newConv))
    }
    setSelectedConversation(convId)
  }

  const handleSendMessage = async (message: string) => {
    if (!selectedConversation) return

    const conversation = conversations.get(selectedConversation)
    if (!conversation) return

    // Add message to local state
    const newMsg = {
      id: `msg_${Date.now()}`,
      from: conversation.senderPhone,
      to: conversation.recipientPhone,
      text: message,
      timestamp: Date.now(),
      status: "sending",
      type: "text",
    }

    const updated = { ...conversation }
    updated.messages.push(newMsg)
    setConversations(new Map(conversations).set(selectedConversation, updated))

    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken,
          phoneNumberId: selectedPhoneId,
          apiVersion,
          recipientPhone: conversation.recipientPhone,
          message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        newMsg.status = "sent"
        newMsg.id = data.message_id || newMsg.id
        updated.messages = updated.messages.map((m) => (m.id === newMsg.id ? newMsg : m))
        setConversations(new Map(conversations).set(selectedConversation, updated))
      } else {
        console.error("Send message error:", data.error)
        newMsg.status = "failed"
        updated.messages = updated.messages.map((m) => (m.id === newMsg.id ? newMsg : m))
        setConversations(new Map(conversations).set(selectedConversation, updated))
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      newMsg.status = "failed"
      updated.messages = updated.messages.map((m) => (m.id === newMsg.id ? newMsg : m))
      setConversations(new Map(conversations).set(selectedConversation, updated))
    }
  }

  if (!accessToken || !apiVersion) {
    return (
      <div className="flex h-full items-center justify-center bg-background p-4">
        <Alert className="max-w-md border-yellow-200 bg-yellow-50 text-yellow-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please configure your WhatsApp API credentials (Access Token and API Version) in the Settings page first.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!selectedPhoneId) {
    return (
      <div className="flex h-full bg-background">
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <PhoneSelector
            phoneNumbers={phoneNumbers}
            selectedPhoneId={selectedPhoneId}
            onSelectPhone={setSelectedPhoneId}
            onPhoneNumbersUpdate={setPhoneNumbers}
          />
        </div>
        <div className="flex flex-1 items-center justify-center bg-background p-4">
          <Alert className="max-w-md border-yellow-200 bg-yellow-50 text-yellow-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please select a phone number from the sidebar to start messaging.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar - Phone Selector & Conversations */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <PhoneSelector
          phoneNumbers={phoneNumbers}
          selectedPhoneId={selectedPhoneId}
          onSelectPhone={handleSelectPhone}
          onPhoneNumbersUpdate={setPhoneNumbers}
        />
        <ConversationList
          conversations={Array.from(conversations.values())}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Right Side - Chat Window */}
      {selectedConversation && conversations.has(selectedConversation) ? (
        <ChatWindow conversation={conversations.get(selectedConversation)!} onSendMessage={handleSendMessage} />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-muted-foreground">Select a conversation or start a new one</p>
          </div>
        </div>
      )}
    </div>
  )
}
