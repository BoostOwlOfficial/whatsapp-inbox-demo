"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  Users,
  ShoppingBag,
  ShoppingCart,
  Megaphone,
  Bot,
  LogOut,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    {
      title: "Core",
      items: [
        { name: "Home", href: "/", icon: LayoutDashboard },
        { name: "Contacts", href: "/contacts", icon: Users },
        { name: "Inbox", href: "/inbox", icon: MessageSquare },
      ],
    },
    {
      title: "Commerce",
      items: [
        { name: "Products", href: "/products", icon: ShoppingBag },
        { name: "Orders", href: "/orders", icon: ShoppingCart },
      ],
    },
    {
      title: "Sales",
      items: [
        { name: "Campaigns", href: "/campaigns", icon: Megaphone },
        { name: "Start New Chat", href: "/chatbot", icon: Bot },
        { name: "Templates", href: "/templates", icon: FileText },
      ],
    },
  ];

  return (
    <div className="w-64 bg-[#0f172a] text-white flex flex-col h-screen border-r border-[#1e293b]">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center justify-center">
        <div className="relative w-full h-10">
          <Image
            src="/boostowl-logo-primary (1).svg"
            alt="BoostOwl Logo"
            fill
            className="object-contain hover:opacity-90 transition-opacity"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navItems.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        isActive
                          ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#1e293b] space-y-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-[#1e293b] rounded-lg border border-[#334155]">
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-medium text-sm">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email || "email@example.com"}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Link href="/settings">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                pathname === "/settings"
                  ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={logout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
