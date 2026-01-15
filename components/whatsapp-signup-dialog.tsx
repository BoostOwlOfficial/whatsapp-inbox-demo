"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, AlertTriangle } from "lucide-react";
import { useWhatsAppSignup } from "@/hooks/use-whatsapp-signup";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
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

interface WhatsAppSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsAppSignupDialog({
  open,
  onOpenChange,
}: WhatsAppSignupDialogProps) {
  const { isLoading, error, accountStatus, launchSignup, sdkReady, refetch } =
    useWhatsAppSignup();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [localError, setLocalError] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleSignup = async () => {
    try {
      setLocalError(null);
      await launchSignup();
      // On success, the dialog will show the connected status
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Failed to connect WhatsApp"
      );
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);

      const response = await fetch("/api/whatsapp/disconnect", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to disconnect");
      }

      toast({
        title: "WhatsApp Disconnected",
        description: `Successfully disconnected ${data.disconnectedAccount?.businessName || 'account'}`,
      });

      // Refresh account status and close dialogs
      refetch();
      setShowDisconnectDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect WhatsApp account",
        variant: "destructive",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const displayError = error || localError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-green-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Connect WhatsApp Business
          </DialogTitle>
          <DialogDescription>
            {accountStatus?.connected
              ? "Your WhatsApp Business account is connected"
              : "Connect your WhatsApp Business account to start messaging customers"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          {accountStatus?.connected && accountStatus.account ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-green-900 text-lg">
                      {accountStatus.account.display_name}
                    </p>
                    <p className="text-sm text-green-700 font-medium">
                      {accountStatus.account.phone_number}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-green-700 font-medium">
                        Quality:
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${accountStatus.account.quality_rating === "GREEN"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : accountStatus.account.quality_rating === "YELLOW"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                      >
                        {accountStatus.account.quality_rating}
                      </span>
                    </div>

                    {accountStatus.account.connected_at && (
                      <p className="text-xs text-green-600 mt-1">
                        Connected on{" "}
                        {new Date(
                          accountStatus.account.connected_at
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="outline"
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Change Connected Account"
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDisconnectDialog(true)}
                  disabled={disconnecting}
                  className="w-full"
                >
                  {disconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Disconnect WhatsApp
                </Button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Use this to switch to a different WhatsApp Business account
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Connect your WhatsApp Business account to start receiving and
                  sending messages directly from this inbox.
                </p>
              </div>

              <div className="text-sm text-slate-600 space-y-2 px-1">
                <p className="font-medium">You will need:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-500">
                  <li>A Facebook Business account</li>
                  <li>A WhatsApp Business account</li>
                  <li>A verified phone number</li>
                </ul>
              </div>

              <Button
                onClick={handleSignup}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : !sdkReady ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading SDK...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Connect with Facebook
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 text-center">
          By connecting, you agree to Meta's{" "}
          <a
            href="https://www.whatsapp.com/legal/business-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline"
          >
            Business Terms
          </a>
        </div>
      </DialogContent>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Disconnect WhatsApp Account?
            </AlertDialogTitle>
            <div className="text-sm text-muted-foreground space-y-2 pt-2">
              <p>This will remove your WhatsApp Business account connection.</p>
              <p className="font-medium">You will lose access to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Inbox and message history</li>
                <li>Message templates</li>
                <li>Automated responses</li>
              </ul>
              <p className="text-destructive font-medium mt-4">
                This cannot be undone. You can reconnect later, but message history will not be restored.
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {disconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
