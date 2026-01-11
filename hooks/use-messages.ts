import { useState, useEffect, useCallback, useRef } from "react"
import type { WhatsAppMessage } from "@/lib/supabase"

interface UseMessagesOptions {
    phoneNumberId?: string
    fromNumber?: string
    toNumber?: string
    enabled?: boolean
    pollingInterval?: number // in milliseconds, default 5000 (5 seconds)
}

interface UseMessagesReturn {
    messages: WhatsAppMessage[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useMessages(options: UseMessagesOptions = {}): UseMessagesReturn {
    const {
        phoneNumberId,
        fromNumber,
        toNumber,
        enabled = true,
        pollingInterval = 5000,
    } = options

    const [messages, setMessages] = useState<WhatsAppMessage[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const isMountedRef = useRef(true)
    const lastFetchTimestampRef = useRef<number>(0)

    const fetchMessages = useCallback(async (isInitialFetch = false) => {
        if (!enabled) return

        try {
            setLoading(true)
            setError(null)

            // Build query parameters
            const params = new URLSearchParams()
            if (phoneNumberId) params.append("phoneNumberId", phoneNumberId)
            if (fromNumber) params.append("fromNumber", fromNumber)
            if (toNumber) params.append("toNumber", toNumber)

            // Only fetch messages newer than last fetch (incremental polling)
            if (!isInitialFetch && lastFetchTimestampRef.current > 0) {
                params.append("since", lastFetchTimestampRef.current.toString())
            }

            const response = await fetch(`/api/messages?${params.toString()}`)

            if (!response.ok) {
                throw new Error("Failed to fetch messages")
            }

            const data = await response.json()
            const newMessages = data.messages || []

            if (isMountedRef.current && newMessages.length > 0) {
                if (isInitialFetch) {
                    // Initial fetch: replace all messages
                    setMessages(newMessages)
                } else {
                    // Incremental fetch: merge new messages
                    setMessages((prevMessages) => {
                        const messageMap = new Map(prevMessages.map(m => [m.id, m]))
                        newMessages.forEach((msg: WhatsAppMessage) => {
                            messageMap.set(msg.id, msg)
                        })
                        // Sort by timestamp
                        return Array.from(messageMap.values()).sort((a, b) => a.timestamp - b.timestamp)
                    })
                }

                // Update last fetch timestamp to the latest message timestamp
                const latestTimestamp = Math.max(...newMessages.map((m: WhatsAppMessage) => m.timestamp))
                lastFetchTimestampRef.current = latestTimestamp
            }
        } catch (err) {
            if (isMountedRef.current) {
                setError(err instanceof Error ? err.message : "Failed to fetch messages")
                console.error("Error fetching messages:", err)
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false)
            }
        }
    }, [phoneNumberId, fromNumber, toNumber, enabled])

    // Initial fetch
    useEffect(() => {
        if (enabled) {
            fetchMessages(true) // Initial fetch gets all messages
        }
    }, [enabled, phoneNumberId, fromNumber, toNumber])

    // Set up polling
    useEffect(() => {
        if (!enabled || pollingInterval <= 0) {
            return
        }

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        // Set up new polling interval
        intervalRef.current = setInterval(() => {
            fetchMessages(false) // Incremental fetch gets only new messages
        }, pollingInterval)

        // Cleanup on unmount or when dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [fetchMessages, enabled, pollingInterval])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    return {
        messages,
        loading,
        error,
        refetch: () => fetchMessages(true),
    }
}
