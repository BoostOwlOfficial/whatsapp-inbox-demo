"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  fetchMessages,
  groupMessagesByConversation,
  extractContacts,
  Conversation,
  Contact,
} from "./whatsapp-api";
import { useSupabaseRealtime } from "@/hooks/use-supabase-realtime";
import { WhatsAppMessage } from "./supabase";
import { useWhatsAppStatus } from "./whatsapp-status-context";
import { useAuth } from "./auth-context";

export interface Message {
  id: string;
  text: string;
  from: string;
  to: string;
  timestamp: number;
  status: string;
}

interface MessagesContextType {
  messages: WhatsAppMessage[];
  conversations: Conversation[];
  contacts: Contact[];
  phoneNumberId: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  initialized: boolean;
  addOptimisticMessage: (message: WhatsAppMessage) => void;
  updateMessageId: (tempId: string, realId: string) => void;
  clearMessages: () => void;
  realtimeConnected: boolean; // Realtime connection status
}

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { accountStatus } = useWhatsAppStatus();
  // Get accessToken from auth context
  const { accessToken } = useAuth();

  const [phoneNumberId, setPhoneNumberId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Get phone number from WhatsApp account status
  useEffect(() => {
    if (accountStatus?.connected && accountStatus.account?.phone_number_id) {
      console.log(
        "[Messages] Connected phone:",
        accountStatus.account.phone_number_id
      );
      setPhoneNumberId(accountStatus.account.phone_number_id);
    } else {
      console.log(
        "[Messages] No WhatsApp account connected - clearing messages"
      );
      setPhoneNumberId(null);
      setInitialized(false);
      // Clear messages when disconnected
      setMessages([]);
      setConversations([]);
      setContacts([]);
    }
  }, [accountStatus]);

  // Function to fetch and group messages
  const fetchAndGroupMessages = useCallback(
    async (phoneId: string) => {
      if (!phoneId || !accessToken) return;

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching messages for phoneNumberId:", phoneId);
        const fetchedMessages = await fetchMessages(phoneId, accessToken);
        console.log("Fetched messages:", fetchedMessages.length);
        setMessages(fetchedMessages);

        // Group messages into conversations
        const grouped = groupMessagesByConversation(fetchedMessages, phoneId);
        console.log("Grouped conversations:", grouped.length);
        setConversations(grouped);

        // Extract contacts
        const extractedContacts = extractContacts(fetchedMessages, phoneId);
        console.log("Extracted contacts:", extractedContacts.length);
        setContacts(extractedContacts);

        setInitialized(true);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch messages"
        );
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // Initialize when phoneNumberId is available
  useEffect(() => {
    if (phoneNumberId && !initialized) {
      console.log(
        "Initializing MessagesContext with phoneNumberId:",
        phoneNumberId
      );
      fetchAndGroupMessages(phoneNumberId);
    }
  }, [phoneNumberId, initialized, fetchAndGroupMessages]);

  // Realtime subscription for new messages
  const { connected: realtimeStatus } = useSupabaseRealtime({
    phoneNumberId,
    enabled: initialized && !!phoneNumberId,
    onMessageInsert: useCallback(
      (newMessage: WhatsAppMessage) => {
        setMessages((currentMessages) => {
          // Deduplicate by ID
          if (currentMessages.some((m) => m.id === newMessage.id)) {
            console.log(
              "⏭️ Duplicate message ignored:",
              newMessage.id.substring(0, 20)
            );
            return currentMessages;
          }

          console.log(
            "✅ New message added via Realtime:",
            newMessage.id.substring(0, 20)
          );
          const updated = [...currentMessages, newMessage];

          // Re-group conversations
          if (phoneNumberId) {
            const grouped = groupMessagesByConversation(updated, phoneNumberId);
            setConversations(grouped);
            const extractedContacts = extractContacts(updated, phoneNumberId);
            setContacts(extractedContacts);
          }

          return updated;
        });
      },
      [phoneNumberId]
    ),

    onMessageUpdate: useCallback(
      (updatedMessage) => {
        setMessages((currentMessages) => {
          const index = currentMessages.findIndex(
            (m) => m.id === updatedMessage.id
          );
          if (index === -1) return currentMessages;

          const updated = [...currentMessages];
          updated[index] = { ...updated[index], ...updatedMessage };

          console.log(
            "🔄 Message updated via Realtime:",
            updatedMessage.id.substring(0, 20)
          );

          // Re-group conversations
          if (phoneNumberId) {
            const grouped = groupMessagesByConversation(updated, phoneNumberId);
            setConversations(grouped);
          }

          return updated;
        });
      },
      [phoneNumberId]
    ),
  });

  // Update realtime connection status
  useEffect(() => {
    setRealtimeConnected(realtimeStatus);
  }, [realtimeStatus]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    if (phoneNumberId) {
      await fetchAndGroupMessages(phoneNumberId);
    }
  }, [fetchAndGroupMessages, phoneNumberId]);

  // Add optimistic message for instant UI update
  const addOptimisticMessage = useCallback(
    (message: WhatsAppMessage) => {
      // Check if message already exists to prevent duplicates
      const messageExists = messages.some((m) => m.id === message.id);
      if (messageExists) {
        console.log(
          "⏭️ Message already exists, skipping optimistic add:",
          message.id.substring(0, 20)
        );
        return;
      }

      // Add message to state immediately
      console.log("➕ Adding optimistic message:", message.id.substring(0, 20));
      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);

      // Re-group conversations with the new message
      if (phoneNumberId) {
        const grouped = groupMessagesByConversation(
          updatedMessages,
          phoneNumberId
        );
        setConversations(grouped);

        // Re-extract contacts
        const extractedContacts = extractContacts(
          updatedMessages,
          phoneNumberId
        );
        setContacts(extractedContacts);
      }
    },
    [messages, phoneNumberId]
  );

  // Update temporary message ID with real WhatsApp message ID
  const updateMessageId = useCallback(
    (tempId: string, realId: string) => {
      console.log(
        `🔄 Updating message ID: ${tempId.substring(
          0,
          20
        )} → ${realId.substring(0, 20)}`
      );

      setMessages((currentMessages) => {
        // Find the message with temp ID
        const messageIndex = currentMessages.findIndex((m) => m.id === tempId);

        if (messageIndex === -1) {
          console.log("⚠️ Temp message not found, skipping ID update");
          return currentMessages;
        }

        // Update the ID
        const updatedMessages = [...currentMessages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          id: realId,
        };

        console.log("✅ Message ID updated successfully");

        // Re-group conversations with updated message
        if (phoneNumberId) {
          const grouped = groupMessagesByConversation(
            updatedMessages,
            phoneNumberId
          );
          setConversations(grouped);

          const extractedContacts = extractContacts(
            updatedMessages,
            phoneNumberId
          );
          setContacts(extractedContacts);
        }

        return updatedMessages;
      });
    },
    [phoneNumberId]
  );

  // Clear all messages and reset state (used when disconnecting WhatsApp)
  const clearMessages = useCallback(() => {
    console.log("🗑️ Clearing all messages and resetting state");
    setMessages([]);
    setConversations([]);
    setContacts([]);
    setInitialized(false);
  }, []);

  return (
    <MessagesContext.Provider
      value={{
        messages,
        conversations,
        contacts,
        phoneNumberId,
        loading,
        error,
        refetch,
        initialized,
        addOptimisticMessage,
        updateMessageId,
        clearMessages,
        realtimeConnected,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessagesContext() {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessagesContext must be used within MessagesProvider");
  }
  return context;
}
