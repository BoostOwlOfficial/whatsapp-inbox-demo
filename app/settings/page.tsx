"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWhatsAppStatus } from "@/lib/whatsapp-status-context"
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { WhatsAppSignupDialog } from "@/components/whatsapp-signup-dialog"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
    const { accountStatus, isLoading, refetch } = useWhatsAppStatus()
    const { accessToken } = useAuth()
    const { toast } = useToast()
    const [showSignupDialog, setShowSignupDialog] = useState(false)
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
    const [disconnecting, setDisconnecting] = useState(false)

    const isConnected = accountStatus?.connected || false

    const handleDisconnect = async () => {
        try {
            setDisconnecting(true)

            const response = await fetch("/api/whatsapp/disconnect", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.details || data.error || "Failed to disconnect")
            }

            toast({
                title: "WhatsApp Disconnected",
                description: `Successfully disconnected ${data.disconnectedAccount?.businessName || 'account'}`,
            })

            // Refresh account status
            refetch()
            setShowDisconnectDialog(false)
        } catch (error) {
            console.error("Error disconnecting WhatsApp:", error)
            toast({
                title: "Disconnect Failed",
                description: error instanceof Error ? error.message : "Failed to disconnect WhatsApp account",
                variant: "destructive",
            })
        } finally {
            setDisconnecting(false)
        }
    }

    return (
        <ProtectedRoute>
            <div className="container mx-auto py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your WhatsApp Business integration</p>
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
                                Connect your WhatsApp Business account to send and receive messages
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isConnected && accountStatus?.account ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-sm text-muted-foreground">Phone Number</span>
                                        <span className="text-sm font-medium">{accountStatus.account.phone_number}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-sm text-muted-foreground">Display Name</span>
                                        <span className="text-sm font-medium">{accountStatus.account.display_name}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-sm text-muted-foreground">Quality Rating</span>
                                        <span className="text-sm font-medium">{accountStatus.account.quality_rating}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-sm text-muted-foreground">Connected At</span>
                                        <span className="text-sm font-medium">
                                            {new Date(accountStatus.account.connected_at).toLocaleDateString()}
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
                                            {disconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

                <WhatsAppSignupDialog open={showSignupDialog} onOpenChange={setShowSignupDialog} />

                {/* Disconnect Confirmation Dialog */}
                <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Disconnect WhatsApp Account?
                            </AlertDialogTitle>
                            <div className="text-sm text-muted-foreground space-y-2 pt-2">
                                <p>This will remove your WhatsApp Business account connection from BoostOwl.</p>
                                <p className="font-medium">You will lose access to:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>Inbox and message history</li>
                                    <li>Message templates</li>
                                    <li>Automated responses</li>
                                </ul>
                                <p className="text-destructive font-medium mt-4">
                                    This action cannot be undone. You can reconnect later, but your message history
                                    will not be restored.
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
            </div>
        </ProtectedRoute >
    )
}
