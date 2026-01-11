"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, MessageCircle } from "lucide-react"
import { cn, getRelativeTime } from "@/lib/utils"

interface ConversationListProps {
  conversations: any[]
  selectedConversation: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: (phone: string) => void
}

export function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [showNewChat, setShowNewChat] = useState(false)
  const [newPhoneInput, setNewPhoneInput] = useState("")

  const handleStartChat = () => {
    if (newPhoneInput.trim()) {
      onNewConversation(newPhoneInput)
      setNewPhoneInput("")
      setShowNewChat(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        {!showNewChat ? (
          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => setShowNewChat(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Enter phone number"
              value={newPhoneInput}
              onChange={(e) => setNewPhoneInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleStartChat()}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleStartChat} className="flex-1 bg-green-600 hover:bg-green-700">
                Start
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowNewChat(false)
                  setNewPhoneInput("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const lastMessage = conv.messages[conv.messages.length - 1]
            const displayName = conv.contactName || conv.recipientPhone
            const showPhoneNumber = conv.contactName && conv.contactName !== conv.recipientPhone

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-muted",
                  selectedConversation === conv.id && "bg-muted",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {displayName}
                      </p>
                      {showPhoneNumber && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.recipientPhone}
                        </p>
                      )}
                    </div>
                  </div>
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {getRelativeTime(lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-xs text-muted-foreground truncate ml-6">
                    {lastMessage.text}
                  </p>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
