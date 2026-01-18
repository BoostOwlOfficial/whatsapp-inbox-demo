"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWhatsAppStatus } from "@/lib/whatsapp-status-context";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { WhatsAppSignupDialog } from "@/components/whatsapp-signup-dialog";
import { AIResponseDialog } from "@/components/ai-response-dialog";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/lib/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface AIResponse {
  id: string;
  response_text: string;
  keywords?: string[];
  category?: string;
  is_active: boolean;
}

export default function SettingsPage() {
  const { accountStatus, isLoading, refetch } = useWhatsAppStatus();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // AI Auto-Reply state
  const [aiEnabled, setAiEnabled] = useState(false);
  const [togglingAI, setTogglingAI] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [editingResponse, setEditingResponse] = useState<AIResponse | null>(
    null,
  );

  const isConnected = accountStatus?.connected || false;

  // Load AI auto-reply status and responses on mount
  useEffect(() => {
    if (isConnected && accessToken) {
      loadAIStatus();
      loadResponses();
    }
  }, [isConnected, accessToken]);

  const loadAIStatus = async () => {
    try {
      const response = await fetch("/api/settings/ai-auto-reply", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAiEnabled(data.use_ai_to_reply || false);
      }
    } catch (error) {
      console.error("Error loading AI status:", error);
    }
  };

  const loadResponses = async () => {
    try {
      setLoadingResponses(true);
      const response = await fetch("/api/ai-responses", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setResponses(data.responses || []);
      }
    } catch (error) {
      console.error("Error loading responses:", error);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleToggleAI = async () => {
    try {
      setTogglingAI(true);
      const response = await fetch("/api/settings/ai-auto-reply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: !aiEnabled }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiEnabled(data.use_ai_to_reply);
        toast({
          title: data.use_ai_to_reply
            ? "AI Auto-Reply Enabled"
            : "AI Auto-Reply Disabled",
          description: data.use_ai_to_reply
            ? "Incoming messages will be automatically replied to"
            : "Auto-reply has been disabled",
        });
      } else {
        throw new Error("Failed to toggle AI auto-reply");
      }
    } catch (error) {
      console.error("Error toggling AI:", error);
      toast({
        title: "Error",
        description: "Failed to toggle AI auto-reply",
        variant: "destructive",
      });
    } finally {
      setTogglingAI(false);
    }
  };

  const handleSaveResponse = async (response: Partial<AIResponse>) => {
    try {
      const url = response.id ? "/api/ai-responses" : "/api/ai-responses";
      const method = response.id ? "PUT" : "POST";

      const apiResponse = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      });

      if (apiResponse.ok) {
        await loadResponses();
        toast({
          title: response.id ? "Response Updated" : "Response Added",
          description: `Successfully ${response.id ? "updated" : "added"} AI response`,
        });
      } else {
        throw new Error("Failed to save response");
      }
    } catch (error) {
      console.error("Error saving response:", error);
      toast({
        title: "Error",
        description: "Failed to save response",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteResponse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this response?")) {
      return;
    }

    try {
      const response = await fetch("/api/ai-responses", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await loadResponses();
        toast({
          title: "Response Deleted",
          description: "Successfully deleted AI response",
        });
      } else {
        throw new Error("Failed to delete response");
      }
    } catch (error) {
      console.error("Error deleting response:", error);
      toast({
        title: "Error",
        description: "Failed to delete response",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);

      const response = await fetch("/api/whatsapp/disconnect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to disconnect");
      }

      toast({
        title: "WhatsApp Disconnected",
        description: `Successfully disconnected ${data.disconnectedAccount?.businessName || "account"}`,
      });

      // Refresh account status
      refetch();
      setShowDisconnectDialog(false);
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      toast({
        title: "Disconnect Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to disconnect WhatsApp account",
        variant: "destructive",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your WhatsApp Business integration
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* WhatsApp Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                WhatsApp Business Account
                {isLoading ? (
                  <Badge variant="secondary">
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Checking...
                  </Badge>
                ) : isConnected ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="mr-2 h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-2 h-3 w-3" />
                    Not Connected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Connect your WhatsApp Business account to send and receive
                messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected && accountStatus?.account ? (
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Phone Number
                    </span>
                    <span className="text-sm font-medium">
                      {accountStatus.account.phone_number}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Display Name
                    </span>
                    <span className="text-sm font-medium">
                      {accountStatus.account.display_name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      Quality Rating
                    </span>
                    <span className="text-sm font-medium">
                      {accountStatus.account.quality_rating}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">
                      Connected At
                    </span>
                    <span className="text-sm font-medium">
                      {new Date(
                        accountStatus.account.connected_at,
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSignupDialog(true)}
                      className="w-full"
                    >
                      Reconnect Account
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDisconnectDialog(true)}
                      className="w-full"
                      disabled={disconnecting}
                    >
                      {disconnecting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Disconnect WhatsApp
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    No WhatsApp Business account connected
                  </p>
                  <Button onClick={() => setShowSignupDialog(true)}>
                    Connect WhatsApp Business
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Auto-Reply Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                AI Auto-Reply
                {aiEnabled ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="mr-2 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Automatically reply to customer messages using AI-powered
                matching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <div className="font-medium">Enable AI Auto-Reply</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically respond to incoming messages
                  </div>
                </div>
                <Button
                  variant={aiEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleAI}
                  disabled={togglingAI || !isConnected}
                  className={aiEnabled ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {togglingAI && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {aiEnabled ? "Enabled" : "Enable"}
                </Button>
              </div>

              {/* Responses List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Predefined Responses ({responses.length})
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingResponse(null);
                      setShowResponseDialog(true);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!isConnected}
                  >
                    + Add Response
                  </Button>
                </div>

                {loadingResponses ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : responses.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-3">
                      No responses configured yet
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingResponse(null);
                        setShowResponseDialog(true);
                      }}
                      disabled={!isConnected}
                    >
                      Add Your First Response
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {responses.map((response) => (
                      <div
                        key={response.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {response.response_text}
                            </p>
                            {response.category && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {response.category}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingResponse(response);
                                setShowResponseDialog(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteResponse(response.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!isConnected && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Connect your WhatsApp Business account first to use AI
                    auto-reply
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Note */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>How your credentials are stored</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Access tokens are encrypted using AES-256-GCM</li>
                <li>✓ Credentials are stored securely in the database</li>
                <li>✓ No sensitive data is stored in browser localStorage</li>
                <li>✓ All API calls use JWT authentication</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <WhatsAppSignupDialog
          open={showSignupDialog}
          onOpenChange={setShowSignupDialog}
        />

        {/* Disconnect Confirmation Dialog */}
        <AlertDialog
          open={showDisconnectDialog}
          onOpenChange={setShowDisconnectDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Disconnect WhatsApp Account?
              </AlertDialogTitle>
              <div className="text-sm text-muted-foreground space-y-2 pt-2">
                <p>
                  This will remove your WhatsApp Business account connection
                  from BoostOwl.
                </p>
                <p className="font-medium">You will lose access to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Inbox and message history</li>
                  <li>Message templates</li>
                  <li>Automated responses</li>
                </ul>
                <p className="text-destructive font-medium mt-4">
                  This action cannot be undone. You can reconnect later, but
                  your message history will not be restored.
                </p>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={disconnecting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {disconnecting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Yes, Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AI Response Dialog */}
        <AIResponseDialog
          open={showResponseDialog}
          onOpenChange={setShowResponseDialog}
          response={editingResponse}
          onSave={handleSaveResponse}
        />
      </div>
    </ProtectedRoute>
  );
}
