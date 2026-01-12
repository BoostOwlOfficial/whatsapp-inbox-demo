"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react"
import { fetchMessages, pollNewMessages, groupMessagesByConversation, extractContacts, Conversation, Contact } from "./whatsapp-api"
import { WhatsAppMessage } from "./supabase"
import { useSettings } from "./settings-context"

export interface Message {
    id: string
    text: string
    from: string
    to: string
    timestamp: number
    status: string
}

interface MessagesContextType {
    messages: WhatsAppMessage[]
    conversations: Conversation[]
    contacts: Contact[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    initialized: boolean
    addOptimisticMessage: (message: WhatsAppMessage) => void
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export function MessagesProvider({ children }: { children: ReactNode }) {
    const { phoneNumberId } = useSettings()
    const [messages, setMessages] = useState<WhatsAppMessage[]>([])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [initialized, setInitialized] = useState(false)

    // Use ref to avoid polling restart on every message change
    const messagesRef = useRef<WhatsAppMessage[]>([])

    useEffect(() => {
        messagesRef.current = messages
    }, [messages])

    // Function to fetch and group messages
    const fetchAndGroupMessages = useCallback(async (phoneId: string) => {
        if (!phoneId) return

        try {
            setLoading(true)
            setError(null)
            console.log("Fetching messages for phoneNumberId:", phoneId)
            const fetchedMessages = await fetchMessages(phoneId)
            console.log("Fetched messages:", fetchedMessages.length)
            setMessages(fetchedMessages)

            // Group messages into conversations
            const grouped = groupMessagesByConversation(fetchedMessages, phoneId)
            console.log("Grouped conversations:", grouped.length)
            setConversations(grouped)

            // Extract contacts
            const extractedContacts = extractContacts(fetchedMessages, phoneId)
            console.log("Extracted contacts:", extractedContacts.length)
            setContacts(extractedContacts)

            setInitialized(true)
        } catch (err) {
            console.error("Error fetching messages:", err)
            setError(err instanceof Error ? err.message : "Failed to fetch messages")
        } finally {
            setLoading(false)
        }
    }, [])

    // Initialize when phoneNumberId is available
    useEffect(() => {
        if (phoneNumberId && !initialized) {
            console.log("Initializing MessagesContext with phoneNumberId:", phoneNumberId)
            fetchAndGroupMessages(phoneNumberId)
        }
    }, [phoneNumberId, initialized, fetchAndGroupMessages])

    // Polling for new messages - FIXED: removed messages from dependencies
    useEffect(() => {
        if (!phoneNumberId || !initialized) {
            console.log("Polling disabled - phoneNumberId:", phoneNumberId, "initialized:", initialized)
            return
        }

        console.log("Starting polling for phoneNumberId:", phoneNumberId)
        const pollingInterval = setInterval(async () => {
            try {
                const currentMessages = messagesRef.current
                const lastTimestamp = currentMessages[currentMessages.length - 1]?.timestamp || 0
                console.log("📡 Polling: lastTimestamp =", lastTimestamp, "total messages =", currentMessages.length)
                const newMessages = await pollNewMessages(phoneNumberId, lastTimestamp)

                if (newMessages.length > 0) {
                    console.log("✅ Found", newMessages.length, "new messages:", newMessages.map(m => ({
                        id: m.id.substring(0, 20),
                        timestamp: m.timestamp,
                        text: m.message_text?.substring(0, 30)
                    })))

                    // Append new messages
                    const updatedMessages = [...currentMessages, ...newMessages]
                    console.log("📝 Updating state with", updatedMessages.length, "total messages")
                    setMessages(updatedMessages)

                    // Re-group conversations and contacts
                    const grouped = groupMessagesByConversation(updatedMessages, phoneNumberId)
                    console.log("📊 Grouped into", grouped.length, "conversations")
                    setConversations(grouped)

                    const extractedContacts = extractContacts(updatedMessages, phoneNumberId)
                    setContacts(extractedContacts)
                } else {
                    console.log("⏭️ No new messages")
                }
            } catch (err) {
                console.error("❌ Polling error:", err)
            }
        }, 5000) // Poll every 5 seconds

        return () => {
            console.log("Stopping polling")
            clearInterval(pollingInterval)
        }
    }, [phoneNumberId, initialized]) // REMOVED messages from dependencies

    // Manual refetch function
    const refetch = useCallback(async () => {
        if (phoneNumberId) {
            await fetchAndGroupMessages(phoneNumberId)
        }
    }, [fetchAndGroupMessages, phoneNumberId])

    // Add optimistic message for instant UI update
    const addOptimisticMessage = useCallback((message: WhatsAppMessage) => {
        // Add message to state immediately
        const updatedMessages = [...messages, message]
        setMessages(updatedMessages)

        // Re-group conversations with the new message
        if (phoneNumberId) {
            const grouped = groupMessagesByConversation(updatedMessages, phoneNumberId)
            setConversations(grouped)

            // Re-extract contacts
            const extractedContacts = extractContacts(updatedMessages, phoneNumberId)
            setContacts(extractedContacts)
        }
    }, [messages, phoneNumberId])

    return (
        <MessagesContext.Provider
            value={{
                messages,
                conversations,
                contacts,
                loading,
                error,
                refetch,
                initialized,
                addOptimisticMessage,
            }}
        >
            {children}
        </MessagesContext.Provider>
    )
}

export function useMessagesContext() {
    const context = useContext(MessagesContext)
    if (!context) {
        throw new Error("useMessagesContext must be used within MessagesProvider")
    }
    return context
}
