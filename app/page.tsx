"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { dashboardStats, recentActivity } from "@/lib/sample-data"
import {
  Users,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Plus,
  Send,
  Search,
  Bell,
  HelpCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Main Content */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Good afternoon, {user?.name}</h1>
              <p className="text-slate-500 mt-1">Here's what's happening in your workspace today.</p>
            </div>
            <Button variant="outline" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
              Customize
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Total Contacts</CardTitle>
                <Users className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{dashboardStats.totalContacts}</div>
                <p className="text-xs font-medium text-green-600 mt-2 flex items-center">
                  {dashboardStats.totalContactsChange} from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Active Chats</CardTitle>
                <MessageSquare className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{dashboardStats.activeChats}</div>
                <p className="text-xs font-medium text-green-600 mt-2 flex items-center">
                  {dashboardStats.activeChatsChange} from last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Pending Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{dashboardStats.pendingOrders}</div>
                <p className="text-xs font-medium text-red-500 mt-2 flex items-center">
                  {dashboardStats.pendingOrdersChange} from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => router.push("/inbox")}>
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                    <Plus className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="font-medium text-slate-700">New Contact</span>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group" onClick={() => router.push("/inbox")}>
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                  <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="font-medium text-slate-700">Send Broadcast</span>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="col-span-1 lg:col-span-2 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors">
                      <div className="rounded-full bg-slate-100 p-2">
                        {activity.type === "contact" && <Users className="h-4 w-4 text-slate-600" />}
                        {activity.type === "appointment" && <MessageSquare className="h-4 w-4 text-slate-600" />}
                        {activity.type === "campaign" && <TrendingUp className="h-4 w-4 text-slate-600" />}
                        {activity.type === "message" && <MessageSquare className="h-4 w-4 text-slate-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
