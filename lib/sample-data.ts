// Sample data for making the prototype look production-ready

export interface Contact {
    id: string
    name: string
    phone: string
    email?: string
    tags: string[]
    leadStatus: "new" | "contacted" | "qualified" | "converted" | "lost"
    source: string
    value?: number
    lastContact: string
    notes: string[]
    customFields: Record<string, any>
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

// Sample contacts
export const sampleContacts: Contact[] = [
    {
        id: "1",
        name: "Sarah Miller",
        phone: "+1234567890",
        email: "sarah.miller@example.com",
        tags: ["VIP", "Premium"],
        leadStatus: "qualified",
        source: "Website",
        value: 5000,
        lastContact: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        notes: ["Interested in premium package", "Follow up next week"],
        customFields: {
            company: "Tech Solutions Inc",
            position: "Marketing Director",
        },
    },
    {
        id: "2",
        name: "John Doe",
        phone: "+1234567891",
        email: "john.doe@example.com",
        tags: ["New Lead"],
        leadStatus: "new",
        source: "Facebook Ads",
        value: 2000,
        lastContact: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        notes: ["Requested product demo"],
        customFields: {
            company: "Startup Co",
            position: "CEO",
        },
    },
    {
        id: "3",
        name: "Emma Wilson",
        phone: "+1234567892",
        email: "emma.w@example.com",
        tags: ["Customer", "Repeat"],
        leadStatus: "converted",
        source: "Referral",
        value: 8500,
        lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        notes: ["Happy customer", "Referred 3 friends"],
        customFields: {
            company: "Design Studio",
            position: "Creative Director",
        },
    },
    {
        id: "4",
        name: "Michael Chen",
        phone: "+1234567893",
        tags: ["Hot Lead"],
        leadStatus: "contacted",
        source: "LinkedIn",
        value: 12000,
        lastContact: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        notes: ["Needs enterprise solution", "Budget approved"],
        customFields: {
            company: "Global Corp",
            position: "VP of Sales",
        },
    },
    {
        id: "5",
        name: "Lisa Anderson",
        phone: "+1234567894",
        email: "lisa.a@example.com",
        tags: ["Support"],
        leadStatus: "converted",
        source: "Direct",
        lastContact: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        notes: ["Technical support inquiry"],
        customFields: {
            company: "Retail Plus",
            position: "Operations Manager",
        },
    },
]

// Sample conversations with realistic WhatsApp messages
export const sampleConversations: Conversation[] = [
    {
        id: "conv-1",
        recipientPhone: "+1234567890",
        senderPhone: "+1987654321",
        contactName: "Sarah Miller",
        tags: ["VIP", "Premium"],
        leadStatus: "qualified",
        notes: ["Interested in premium package", "Follow up next week"],
        unread: true,
        archived: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        messages: [
            {
                id: "msg-1-1",
                from: "+1234567890",
                to: "+1987654321",
                text: "Hi! I'm interested in your premium package. Can you tell me more about it?",
                timestamp: Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-1-2",
                from: "+1987654321",
                to: "+1234567890",
                text: "Hello Sarah! Thank you for your interest. Our premium package includes 24/7 support, advanced analytics, and custom integrations. Would you like to schedule a demo?",
                timestamp: Math.floor((Date.now() - 1.5 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-1-3",
                from: "+1234567890",
                to: "+1987654321",
                text: "That sounds great! Yes, I'd love to see a demo. What times are available this week?",
                timestamp: Math.floor((Date.now() - 10 * 60 * 1000) / 1000),
                status: "delivered",
                type: "text",
            },
        ],
    },
    {
        id: "conv-2",
        recipientPhone: "+1234567891",
        senderPhone: "+1987654321",
        contactName: "John Doe",
        tags: ["New Lead"],
        leadStatus: "new",
        notes: ["Requested product demo"],
        unread: true,
        archived: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        messages: [
            {
                id: "msg-2-1",
                from: "+1234567891",
                to: "+1987654321",
                text: "Hello, I saw your ad on Facebook. Can you provide more details about your services?",
                timestamp: Math.floor((Date.now() - 1 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-2-2",
                from: "+1987654321",
                to: "+1234567891",
                text: "Hi John! Thanks for reaching out. We offer comprehensive business solutions including CRM, automation, and analytics. What specific challenges are you looking to solve?",
                timestamp: Math.floor((Date.now() - 45 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-2-3",
                from: "+1234567891",
                to: "+1987654321",
                text: "We need better customer communication tools. Currently using email but it's not efficient enough.",
                timestamp: Math.floor((Date.now() - 5 * 60 * 1000) / 1000),
                status: "delivered",
                type: "text",
            },
        ],
    },
    {
        id: "conv-3",
        recipientPhone: "+1234567892",
        senderPhone: "+1987654321",
        contactName: "Emma Wilson",
        tags: ["Customer", "Repeat"],
        leadStatus: "converted",
        notes: ["Happy customer", "Referred 3 friends"],
        unread: false,
        archived: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        messages: [
            {
                id: "msg-3-1",
                from: "+1234567892",
                to: "+1987654321",
                text: "Hi! Just wanted to say thank you for the excellent service. Everything is working perfectly!",
                timestamp: Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-3-2",
                from: "+1987654321",
                to: "+1234567892",
                text: "That's wonderful to hear, Emma! We're so glad you're happy with our service. Please don't hesitate to reach out if you need anything.",
                timestamp: Math.floor((Date.now() - 23 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-3-3",
                from: "+1234567892",
                to: "+1987654321",
                text: "I've already recommended you to 3 of my colleagues! 😊",
                timestamp: Math.floor((Date.now() - 22 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
        ],
    },
    {
        id: "conv-4",
        recipientPhone: "+1234567893",
        senderPhone: "+1987654321",
        contactName: "Michael Chen",
        tags: ["Hot Lead"],
        leadStatus: "contacted",
        notes: ["Needs enterprise solution", "Budget approved"],
        unread: false,
        archived: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        messages: [
            {
                id: "msg-4-1",
                from: "+1987654321",
                to: "+1234567893",
                text: "Hi Michael, following up on our LinkedIn conversation. I'd love to discuss your enterprise needs in more detail.",
                timestamp: Math.floor((Date.now() - 3 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-4-2",
                from: "+1234567893",
                to: "+1987654321",
                text: "Perfect timing! Our budget was just approved. We're looking for a solution that can handle 500+ users.",
                timestamp: Math.floor((Date.now() - 2.5 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-4-3",
                from: "+1987654321",
                to: "+1234567893",
                text: "Excellent! Our enterprise plan is perfect for that scale. Can we schedule a call tomorrow to go over the details?",
                timestamp: Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000),
                status: "delivered",
                type: "text",
            },
        ],
    },
    {
        id: "conv-5",
        recipientPhone: "+1234567894",
        senderPhone: "+1987654321",
        contactName: "Lisa Anderson",
        tags: ["Support"],
        leadStatus: "converted",
        notes: ["Technical support inquiry"],
        unread: false,
        archived: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        messages: [
            {
                id: "msg-5-1",
                from: "+1234567894",
                to: "+1987654321",
                text: "Hi, I'm having trouble with the integration. Can you help?",
                timestamp: Math.floor((Date.now() - 5 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-5-2",
                from: "+1987654321",
                to: "+1234567894",
                text: "Of course! What specific issue are you experiencing?",
                timestamp: Math.floor((Date.now() - 4.5 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-5-3",
                from: "+1234567894",
                to: "+1987654321",
                text: "The webhook isn't receiving messages. I've checked the URL and it seems correct.",
                timestamp: Math.floor((Date.now() - 4 * 60 * 60 * 1000) / 1000),
                status: "read",
                type: "text",
            },
            {
                id: "msg-5-4",
                from: "+1987654321",
                to: "+1234567894",
                text: "Let me check your configuration. Can you verify that you've subscribed to the 'messages' webhook field in your Meta app settings?",
                timestamp: Math.floor((Date.now() - 3.5 * 60 * 60 * 1000) / 1000),
                status: "delivered",
                type: "text",
            },
        ],
    },
]

// Dashboard statistics
export const dashboardStats = {
    totalContacts: 1248,
    totalContactsChange: "+12%",
    activeChats: 45,
    activeChatsChange: "+5%",
    pendingOrders: 8,
    pendingOrdersChange: "+2%",
    responseRate: "94%",
    responseRateChange: "+3%",
}

// Recent activity
export const recentActivity = [
    {
        id: "1",
        type: "contact",
        message: "New contact added: Sarah Miller",
        time: "2 mins ago",
    },
    {
        id: "2",
        type: "appointment",
        message: "Appointment confirmed with John Doe",
        time: "1 hour ago",
    },
    {
        id: "3",
        type: "campaign",
        message: "Campaign 'Summer Sale' started",
        time: "3 hours ago",
    },
    {
        id: "4",
        type: "message",
        message: "New message from Emma Wilson",
        time: "5 hours ago",
    },
]

// Template categories
export const templateCategories = [
    "Marketing",
    "Utility",
    "Authentication",
    "Order Updates",
    "Customer Support",
    "Appointment Reminders",
]

// Sample templates
export interface Template {
    id: string
    name: string
    category: string
    language: string
    status: "approved" | "pending" | "rejected"
    content: string
    variables: string[]
    createdAt: string
}

export const sampleTemplates: Template[] = [
    {
        id: "tmpl-1",
        name: "Welcome Message",
        category: "Marketing",
        language: "en",
        status: "approved",
        content: "Hello {{1}}! Welcome to our service. We're excited to have you on board!",
        variables: ["name"],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "tmpl-2",
        name: "Order Confirmation",
        category: "Order Updates",
        language: "en",
        status: "approved",
        content: "Hi {{1}}, your order #{{2}} has been confirmed and will be delivered by {{3}}.",
        variables: ["name", "order_id", "delivery_date"],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "tmpl-3",
        name: "Appointment Reminder",
        category: "Appointment Reminders",
        language: "en",
        status: "approved",
        content: "Hi {{1}}, this is a reminder about your appointment on {{2}} at {{3}}. See you soon!",
        variables: ["name", "date", "time"],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
]
