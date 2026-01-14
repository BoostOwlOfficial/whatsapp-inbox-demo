"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWhatsAppSignup } from "@/hooks/use-whatsapp-signup"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"
import { WhatsAppSignupDialog } from "@/components/whatsapp-signup-dialog"
import { ProtectedRoute } from "@/components/protected-route"

export default function SettingsPage() {
    const { accountStatus, isLoading } = useWhatsAppSignup()
    const [showSignupDialog, setShowSignupDialog] = useState(false)

    const isConnected = accountStatus?.connected || false

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

                                    <div className="pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowSignupDialog(true)}
                                            className="w-full"
                                        >
                                            Reconnect Account
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
            </div>
        </ProtectedRoute >
    )
}
