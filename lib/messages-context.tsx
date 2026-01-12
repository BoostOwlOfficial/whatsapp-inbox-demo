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
    updateMessageId: (tempId: string, realId: string) => void
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
    const lastPolledTimestamp = useRef<number>(0)

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

            // Update last polled timestamp
            if (fetchedMessages.length > 0) {
                const maxTimestamp = Math.max(...fetchedMessages.map(m => m.timestamp))
                lastPolledTimestamp.current = maxTimestamp
                console.log("📅 Initial lastPolledTimestamp set to:", maxTimestamp)
            }

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
                // Use the tracked timestamp instead of last message timestamp
                const timestampToUse = lastPolledTimestamp.current || (currentMessages[currentMessages.length - 1]?.timestamp || 0)
                console.log("📡 Polling: lastPolledTimestamp =", timestampToUse, "total messages =", currentMessages.length)
                const newMessages = await pollNewMessages(phoneNumberId, timestampToUse)

                if (newMessages.length > 0) {
                    console.log("✅ Found", newMessages.length, "new messages:", newMessages.map(m => ({
                        id: m.id.substring(0, 20),
                        timestamp: m.timestamp,
                        text: m.message_text?.substring(0, 30)
                    })))

                    // Update last polled timestamp to the latest from this batch
                    const maxTimestamp = Math.max(...newMessages.map(m => m.timestamp))
                    lastPolledTimestamp.current = maxTimestamp
                    console.log("📅 Updated lastPolledTimestamp to:", maxTimestamp)

                    // Deduplicate messages by ID to prevent duplicates
                    const existingIds = new Set(currentMessages.map(m => m.id))
                    const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id))

                    if (uniqueNewMessages.length > 0) {
                        console.log(`📝 Adding ${uniqueNewMessages.length} unique messages (filtered ${newMessages.length - uniqueNewMessages.length} duplicates)`)

                        // Append only unique new messages
                        const updatedMessages = [...currentMessages, ...uniqueNewMessages]
                        console.log("📝 Updating state with", updatedMessages.length, "total messages")
                        setMessages(updatedMessages)

                        // Re-group conversations and contacts
                        const grouped = groupMessagesByConversation(updatedMessages, phoneNumberId)
                        console.log("📊 Grouped into", grouped.length, "conversations")
                        setConversations(grouped)

                        const extractedContacts = extractContacts(updatedMessages, phoneNumberId)
                        setContacts(extractedContacts)
                    } else {
                        console.log("⏭️ All new messages were duplicates, but timestamp updated to prevent re-polling")
                    }
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
        // Check if message already exists to prevent duplicates
        const messageExists = messages.some(m => m.id === message.id)
        if (messageExists) {
            console.log("⏭️ Message already exists, skipping optimistic add:", message.id.substring(0, 20))
            return
        }

        // Add message to state immediately
        console.log("➕ Adding optimistic message:", message.id.substring(0, 20))
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

    // Update temporary message ID with real WhatsApp message ID
    const updateMessageId = useCallback((tempId: string, realId: string) => {
        console.log(`🔄 Updating message ID: ${tempId.substring(0, 20)} → ${realId.substring(0, 20)}`)

        setMessages(currentMessages => {
            // Find the message with temp ID
            const messageIndex = currentMessages.findIndex(m => m.id === tempId)

            if (messageIndex === -1) {
                console.log("⚠️ Temp message not found, skipping ID update")
                return currentMessages
            }

            // Update the ID
            const updatedMessages = [...currentMessages]
            updatedMessages[messageIndex] = {
                ...updatedMessages[messageIndex],
                id: realId
            }

            console.log("✅ Message ID updated successfully")

            // Re-group conversations with updated message
            if (phoneNumberId) {
                const grouped = groupMessagesByConversation(updatedMessages, phoneNumberId)
                setConversations(grouped)

                const extractedContacts = extractContacts(updatedMessages, phoneNumberId)
                setContacts(extractedContacts)
            }

            return updatedMessages
        })
    }, [phoneNumberId])

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
                updateMessageId,
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
