"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { fetchMessages, pollNewMessages, groupMessagesByConversation, extractContacts, Conversation, Contact } from "./whatsapp-api"
import { WhatsAppMessage } from "./supabase"

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
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export function MessagesProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<WhatsAppMessage[]>([])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [initialized, setInitialized] = useState(false)
    const [phoneNumberId, setPhoneNumberId] = useState<string>("")
    const [myPhoneNumber, setMyPhoneNumber] = useState<string>("")

    // Function to fetch and group messages
    const fetchAndGroupMessages = useCallback(async (phoneId?: string, myPhone?: string) => {
        if (!phoneId || !myPhone) return

        try {
            setLoading(true)
            setError(null)
            const fetchedMessages = await fetchMessages(phoneId)
            setMessages(fetchedMessages)

            // Group messages into conversations
            const grouped = groupMessagesByConversation(fetchedMessages, myPhone)
            setConversations(grouped)

            // Extract contacts
            const extractedContacts = extractContacts(fetchedMessages, myPhone)
            setContacts(extractedContacts)

            setInitialized(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch messages")
        } finally {
            setLoading(false)
        }
    }, [])

    // Initialize with settings from storage
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const settings = localStorage.getItem("whatsapp_settings")
                if (settings) {
                    const parsed = JSON.parse(settings)
                    if (parsed.phoneNumberId) {
                        setPhoneNumberId(parsed.phoneNumberId)
                        // You'll need to get myPhoneNumber from settings too
                        // For now, using a placeholder - this should come from WhatsApp API or settings
                        setMyPhoneNumber(parsed.businessPhoneNumber || "")
                        fetchAndGroupMessages(parsed.phoneNumberId, parsed.businessPhoneNumber || "")
                    }
                }
            } catch (err) {
                console.error("Error loading settings:", err)
            }
        }
    }, [fetchAndGroupMessages])

    // Polling for new messages
    useEffect(() => {
        if (!phoneNumberId || !myPhoneNumber || !initialized) return

        const pollingInterval = setInterval(async () => {
            try {
                const lastTimestamp = messages[messages.length - 1]?.timestamp || 0
                const newMessages = await pollNewMessages(phoneNumberId, lastTimestamp)

                if (newMessages.length > 0) {
                    // Append new messages
                    const updatedMessages = [...messages, ...newMessages]
                    setMessages(updatedMessages)

                    // Re-group conversations and contacts
                    const grouped = groupMessagesByConversation(updatedMessages, myPhoneNumber)
                    setConversations(grouped)

                    const extractedContacts = extractContacts(updatedMessages, myPhoneNumber)
                    setContacts(extractedContacts)
                }
            } catch (err) {
                console.error("Polling error:", err)
            }
        }, 5000) // Poll every 5 seconds

        return () => clearInterval(pollingInterval)
    }, [phoneNumberId, myPhoneNumber, messages, initialized])

    // Manual refetch function
    const refetch = useCallback(async () => {
        await fetchAndGroupMessages(phoneNumberId, myPhoneNumber)
    }, [fetchAndGroupMessages, phoneNumberId, myPhoneNumber])

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
