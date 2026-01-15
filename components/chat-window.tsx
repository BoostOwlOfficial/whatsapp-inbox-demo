"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, CheckCheck, Clock, AlertCircle } from "lucide-react"
import { cn, formatToIST } from "@/lib/utils"

interface ChatWindowProps {
  conversation: any
  onSendMessage: (message: string) => void
}

export function ChatWindow({ conversation, onSendMessage }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation.messages])

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput)
      setMessageInput("")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCheck className="h-4 w-4 text-blue-500" />
      case "sending":
        return <Clock className="h-4 w-4 text-gray-400" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Chat Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {conversation.contactName || conversation.recipientPhone}
          </h2>
          <p className="text-xs text-muted-foreground">
            {conversation.contactName ? conversation.recipientPhone : `From: ${conversation.senderPhone}`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          // Sort messages by timestamp before displaying
          [...conversation.messages]
            .sort((a: any, b: any) => a.timestamp - b.timestamp)
            .map((msg: any) => (
              <div
                key={msg.id}
                className={cn("flex gap-3", msg.direction === "outbound" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-xs px-4 py-2 rounded-lg",
                    msg.direction === "outbound" ? "bg-green-600 text-white" : "bg-muted text-foreground",
                  )}
                >
                  <p className="text-sm">{msg.text}</p>
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-1 text-xs",
                      msg.direction === "outbound" ? "text-green-100" : "text-muted-foreground",
                    )}
                  >
                    <span>{formatToIST(msg.timestamp, 'short')}</span>
                    {msg.direction === "outbound" && getStatusIcon(msg.status)}
                  </div>
                </div>
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} size="icon" className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
