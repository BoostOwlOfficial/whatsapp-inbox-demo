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

    const fetchMessages = useCallback(async () => {
        if (!enabled) return

        try {
            setLoading(true)
            setError(null)

            // Build query parameters
            const params = new URLSearchParams()
            if (phoneNumberId) params.append("phoneNumberId", phoneNumberId)
            if (fromNumber) params.append("fromNumber", fromNumber)
            if (toNumber) params.append("toNumber", toNumber)

            const response = await fetch(`/api/messages?${params.toString()}`)

            if (!response.ok) {
                throw new Error("Failed to fetch messages")
            }

            const data = await response.json()

            if (isMountedRef.current) {
                setMessages(data.messages || [])
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
            fetchMessages()
        }
    }, [fetchMessages, enabled])

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
            fetchMessages()
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
        refetch: fetchMessages,
    }
}
