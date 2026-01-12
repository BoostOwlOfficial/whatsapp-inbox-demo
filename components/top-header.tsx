"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, HelpCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function TopHeader() {
    const { user } = useAuth()

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-3 flex items-center justify-between">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search for anything..."
                    className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-green-500"
                />
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
                    <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
                    <HelpCircle className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Owner • Skilloura</p>
                    </div>
                    <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=16a34a&color=fff`} />
                        <AvatarFallback className="bg-green-600 text-white">
                            {user?.name?.substring(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}
