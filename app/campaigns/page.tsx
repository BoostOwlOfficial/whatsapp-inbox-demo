"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Megaphone } from "lucide-react"

export default function CampaignsPage() {
    return (
        <ProtectedRoute>
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center p-8">
                <div className="bg-green-100 p-6 rounded-full mb-6">
                    <Megaphone className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h1>
                <p className="text-gray-600 max-w-md">
                    Create and manage marketing campaigns. Reach your audience with targeted broadcast messages.
                </p>
            </div>
        </ProtectedRoute>
    )
}
