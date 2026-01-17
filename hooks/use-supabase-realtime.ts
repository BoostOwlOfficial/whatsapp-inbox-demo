import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { WhatsAppMessage } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeOptions {
  phoneNumberId: string | null;
  enabled?: boolean;
  onMessageInsert: (message: WhatsAppMessage) => void;
  onMessageUpdate: (message: Partial<WhatsAppMessage> & { id: string }) => void;
}

export function useSupabaseRealtime({
  phoneNumberId,
  enabled = true,
  onMessageInsert,
  onMessageUpdate,
}: UseRealtimeOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!phoneNumberId || !enabled) {
      console.log("[Realtime] Disabled:", { phoneNumberId, enabled });
      setConnected(false);
      return;
    }

    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      try {
        console.log("[Realtime] Setting up subscription for:", phoneNumberId);

        // Subscribe to whatsapp_messages changes
        // RLS automatically filters by user_id - user only receives their own messages!
        channel = supabase
          .channel(`messages:${phoneNumberId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "whatsapp_messages",
            },
            (payload) => {
              console.log("📨 Realtime INSERT:", {
                id: payload.new.id,
                from: payload.new.from_number,
                text: payload.new.message_text?.substring(0, 30),
              });
              onMessageInsert(payload.new as WhatsAppMessage);
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "whatsapp_messages",
            },
            (payload) => {
              console.log("🔄 Realtime UPDATE:", {
                id: payload.new.id,
                status: payload.new.status,
              });
              onMessageUpdate(payload.new as WhatsAppMessage);
            }
          )
          .subscribe((status) => {
            console.log("[Realtime] Subscription status:", status);

            if (status === "SUBSCRIBED") {
              setConnected(true);
              setError(null);
              console.log("✅ Realtime connected successfully");
            } else if (status === "CHANNEL_ERROR") {
              setConnected(false);
              setError("Connection error");
              // @ts-ignore - channel may have error property on internal state
              console.error(
                "❌ Realtime channel error",
                channel?.error || "Unknown error"
              );
            } else if (status === "TIMED_OUT") {
              setConnected(false);
              setError("Connection timeout");
              console.error("❌ Realtime connection timeout");
            } else if (status === "CLOSED") {
              setConnected(false);
              console.log("🔌 Realtime connection closed");
            }
          });
      } catch (err) {
        console.error("❌ Realtime setup error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setConnected(false);
      }
    };

    setupRealtime();

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log("[Realtime] Cleaning up subscription");
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [phoneNumberId, enabled, onMessageInsert, onMessageUpdate]);

  return { connected, error };
}
