import { useState, useEffect, useCallback } from "react";
import { fetchMessages, groupMessagesByConversation } from "@/lib/whatsapp-api";
import type { Conversation } from "@/lib/whatsapp-api";
import type { WhatsAppMessage } from "@/lib/supabase";

interface UseMessagesOptions {
  phoneNumberId: string;
  myPhoneNumber: string;
  enabled?: boolean;
}

interface UseMessagesReturn {
  conversations: Conversation[];
  messages: WhatsAppMessage[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

import { useAuth } from "@/lib/auth-context";

export function useMessages({
  phoneNumberId,
  myPhoneNumber,
  enabled = true,
}: UseMessagesOptions): UseMessagesReturn {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndGroupMessages = useCallback(async () => {
    if (!accessToken) return;
    try {
      setError(null);
      const fetchedMessages = await fetchMessages(phoneNumberId, accessToken);
      setMessages(fetchedMessages);

      const grouped = groupMessagesByConversation(
        fetchedMessages,
        myPhoneNumber
      );
      setConversations(grouped);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [phoneNumberId, myPhoneNumber, accessToken]);

  // Initial fetch
  useEffect(() => {
    if (!enabled || !phoneNumberId || !myPhoneNumber) {
      setLoading(false);
      return;
    }

    fetchAndGroupMessages();
  }, [enabled, phoneNumberId, myPhoneNumber, fetchAndGroupMessages]);

  // Note: Real-time updates are handled by MessagesContext via Supabase Realtime
  // No polling needed here anymore!

  return {
    conversations,
    messages,
    loading,
    error,
    refetch: fetchAndGroupMessages,
  };
}
