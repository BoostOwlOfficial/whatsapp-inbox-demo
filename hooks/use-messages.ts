import { useState, useEffect, useCallback } from "react"
import { fetchMessages, pollNewMessages, groupMessagesByConversation } from "@/lib/whatsapp-api"
import type { Conversation } from "@/lib/whatsapp-api"
import type { WhatsAppMessage } from "@/lib/supabase"

interface UseMessagesOptions {
    phoneNumberId: string
    myPhoneNumber: string
    pollingInterval?: number // milliseconds, default 5000
    enabled?: boolean
}

interface UseMessagesReturn {
    conversations: Conversation[]
    messages: WhatsAppMessage[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useMessages({
    phoneNumberId,
    myPhoneNumber,
    pollingInterval = 5000,
    enabled = true,
}: UseMessagesOptions): UseMessagesReturn {
    const [messages, setMessages] = useState<WhatsAppMessage[]>([])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAndGroupMessages = useCallback(async () => {
        try {
            setError(null)
            const fetchedMessages = await fetchMessages(phoneNumberId)
            setMessages(fetchedMessages)

            const grouped = groupMessagesByConversation(fetchedMessages, myPhoneNumber)
            setConversations(grouped)
        } catch (err) {
            console.error("Error fetching messages:", err)
            setError(err instanceof Error ? err.message : "Failed to fetch messages")
        } finally {
            setLoading(false)
        }
    }, [phoneNumberId, myPhoneNumber])

    // Initial fetch
    useEffect(() => {
        if (!enabled || !phoneNumberId || !myPhoneNumber) {
            setLoading(false)
            return
        }

        fetchAndGroupMessages()
    }, [enabled, phoneNumberId, myPhoneNumber, fetchAndGroupMessages])

    // Polling for new messages
    useEffect(() => {
        if (!enabled || !phoneNumberId || messages.length === 0) {
            return
        }

        const interval = setInterval(async () => {
            try {
                const lastTimestamp = messages[messages.length - 1]?.timestamp || 0
                const newMessages = await pollNewMessages(phoneNumberId, lastTimestamp)

                if (newMessages.length > 0) {
                    const updatedMessages = [...messages, ...newMessages]
                    setMessages(updatedMessages)

                    const grouped = groupMessagesByConversation(updatedMessages, myPhoneNumber)
                    setConversations(grouped)
                }
            } catch (err) {
                console.error("Error polling messages:", err)
            }
        }, pollingInterval)

        return () => clearInterval(interval)
    }, [enabled, phoneNumberId, messages, myPhoneNumber, pollingInterval])

    return {
        conversations,
        messages,
        loading,
        error,
        refetch: fetchAndGroupMessages,
    }
}
