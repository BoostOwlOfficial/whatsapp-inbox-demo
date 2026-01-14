import type { WhatsAppMessage } from "./supabase"

export interface Conversation {
    id: string
    recipientPhone: string
    senderPhone: string
    contactName?: string
    messages: Message[]
    createdAt: string
    tags: string[]
    leadStatus: "new" | "contacted" | "qualified" | "converted" | "lost"
    notes: string[]
    unread: boolean
    archived: boolean
}

export interface Message {
    id: string
    from: string
    to: string
    text: string
    timestamp: number
    status: "sent" | "delivered" | "read" | "failed"
    type: "text" | "image" | "document"
}

export interface Contact {
    id: string
    phone: string
    name: string | null
    lastMessageDate: Date
    messageCount: number
    firstContactDate: Date
}

/**
 * Fetch messages from the API
 */
export async function fetchMessages(
    phoneNumberId?: string,
    since?: number
): Promise<WhatsAppMessage[]> {
    const params = new URLSearchParams()
    if (phoneNumberId) params.append("phoneNumberId", phoneNumberId)
    if (since) params.append("since", since.toString())

    const response = await fetch(`/api/messages?${params.toString()}`)
    if (!response.ok) {
        throw new Error("Failed to fetch messages")
    }

    const { messages } = await response.json()
    return messages || []
}

/**
 * Send a message via WhatsApp API
 */
export async function sendMessage(params: {
    accessToken: string
    phoneNumberId: string
    recipientPhone: string
    message: string
    apiVersion: string
    senderPhone: string
}): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const { accessToken, recipientPhone, message } = params

    console.log('🔐 Sending message with token:', accessToken ? 'Token present' : 'NO TOKEN')

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
        console.log('✅ Authorization header added')
    } else {
        console.warn('⚠️ No access token provided!')
    }

    const response = await fetch("/api/send-message", {
        method: "POST",
        headers,
        body: JSON.stringify({
            recipientPhone,
            message,
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        console.error('❌ API Error:', error)
        return { success: false, error: error.error || "Failed to send message" }
    }

    const data = await response.json()
    return { success: true, message_id: data.message_id }
}

/**
 * Group messages by conversation (phone number pairs)
 */
export function groupMessagesByConversation(
    messages: WhatsAppMessage[],
    myPhoneNumber: string
): Conversation[] {
    const conversationMap = new Map<string, Conversation>()

    messages.forEach((msg) => {
        // Determine the other party (not us)
        const otherPhone = msg.from_number === myPhoneNumber ? msg.to_number : msg.from_number
        if (!otherPhone) return

        const conversationId = otherPhone

        if (!conversationMap.has(conversationId)) {
            conversationMap.set(conversationId, {
                id: conversationId,
                recipientPhone: otherPhone,
                senderPhone: myPhoneNumber,
                contactName: msg.contact_name || undefined,
                messages: [],
                createdAt: new Date(msg.timestamp * 1000).toISOString(),
                tags: [],
                leadStatus: "new",
                notes: [],
                unread: msg.status === "received",
                archived: false,
            })
        }

        const conversation = conversationMap.get(conversationId)!

        // Add message to conversation
        conversation.messages.push({
            id: msg.id,
            from: msg.from_number,
            to: msg.to_number || "",
            text: msg.message_text || "",
            timestamp: msg.timestamp,
            status: msg.status,
            type: msg.message_type as "text" | "image" | "document",
        })

        // Update contact name if available
        if (msg.contact_name && !conversation.contactName) {
            conversation.contactName = msg.contact_name
        }

        // Update unread status
        if (msg.status === "received") {
            conversation.unread = true
        }
    })

    // Sort messages within each conversation by timestamp
    conversationMap.forEach((conversation) => {
        conversation.messages.sort((a, b) => a.timestamp - b.timestamp)
    })

    // Convert to array and sort by most recent message
    return Array.from(conversationMap.values()).sort((a, b) => {
        const aLastMsg = a.messages[a.messages.length - 1]
        const bLastMsg = b.messages[b.messages.length - 1]
        return bLastMsg.timestamp - aLastMsg.timestamp
    })
}

/**
 * Extract unique contacts from messages
 */
export function extractContacts(messages: WhatsAppMessage[], myPhoneNumber: string): Contact[] {
    const contactMap = new Map<string, Contact>()

    messages.forEach((msg) => {
        // Determine the other party (not us)
        const otherPhone = msg.from_number === myPhoneNumber ? msg.to_number : msg.from_number
        if (!otherPhone) return

        if (!contactMap.has(otherPhone)) {
            contactMap.set(otherPhone, {
                id: otherPhone,
                phone: otherPhone,
                name: msg.contact_name || null,
                lastMessageDate: new Date(msg.timestamp * 1000),
                messageCount: 0,
                firstContactDate: new Date(msg.timestamp * 1000),
            })
        }

        const contact = contactMap.get(otherPhone)!

        // Update contact info
        contact.messageCount++
        const msgDate = new Date(msg.timestamp * 1000)

        if (msgDate > contact.lastMessageDate) {
            contact.lastMessageDate = msgDate
        }

        if (msgDate < contact.firstContactDate) {
            contact.firstContactDate = msgDate
        }

        // Update name if available
        if (msg.contact_name && !contact.name) {
            contact.name = msg.contact_name
        }
    })

    // Convert to array and sort by most recent message
    return Array.from(contactMap.values()).sort(
        (a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime()
    )
}

/**
 * Poll for new messages since a given timestamp
 */
export async function pollNewMessages(
    phoneNumberId: string,
    lastTimestamp: number
): Promise<WhatsAppMessage[]> {
    return fetchMessages(phoneNumberId, lastTimestamp)
}
