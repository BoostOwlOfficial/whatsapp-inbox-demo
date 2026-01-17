"use client";

import { useMessagesContext } from "@/lib/messages-context";

export function RealtimeStatusIndicator() {
  const { realtimeConnected } = useMessagesContext();

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`h-2 w-2 rounded-full ${
          realtimeConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
        }`}
        title={realtimeConnected ? "Connected to real-time" : "Disconnected"}
      />
      <span className="text-muted-foreground text-xs">
        {realtimeConnected ? "Live" : "Offline"}
      </span>
    </div>
  );
}
