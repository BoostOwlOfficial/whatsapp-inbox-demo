"use client"

import { useState } from "react"
import { SettingsProvider } from "@/lib/settings-context"
import { ChatInterface } from "@/components/chat-interface"
import { SettingsPage } from "@/components/settings-page"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import Image from "next/image"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"chat" | "settings">("chat")

  return (
    <SettingsProvider>
      <div className="flex h-screen bg-background">
        {/* Header Navigation */}
        <div className="w-full">
          <header className="border-b border-border bg-card">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Image src="/boostowl-logo.png" alt="BoostOwl Logo" width={40} height={40} className="h-10 w-[67px]" />
                <h1 className="text-2xl font-bold text-foreground">WhatsApp Business</h1>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage("chat")}
                  variant={currentPage === "chat" ? "default" : "outline"}
                  size="sm"
                >
                  Inbox
                </Button>
                <Button
                  onClick={() => setCurrentPage("settings")}
                  variant={currentPage === "settings" ? "default" : "outline"}
                  size="sm"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="h-[calc(100vh-73px)] overflow-hidden">
            {currentPage === "chat" ? <ChatInterface /> : <SettingsPage />}
          </div>
        </div>
      </div>
    </SettingsProvider>
  )
}
