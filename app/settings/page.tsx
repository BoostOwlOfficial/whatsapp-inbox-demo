"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
    Settings as SettingsIcon,
    CheckCircle,
    AlertCircle,
    Copy,
    ExternalLink,
    Key,
    Building,
    Bell,
    User,
    Loader2,
} from "lucide-react"

export default function SettingsPage() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const { accessToken, setAccessToken, phoneNumberId, setPhoneNumberId, wabaId, setWabaId, apiVersion, setApiVersion } =
        useSettings()

    const [localAccessToken, setLocalAccessToken] = useState(accessToken)
    const [localPhoneNumberId, setLocalPhoneNumberId] = useState(phoneNumberId)
    const [localWabaId, setLocalWabaId] = useState(wabaId)
    const [localApiVersion, setLocalApiVersion] = useState(apiVersion)
    const [webhookUrl, setWebhookUrl] = useState("")
    const [verifyToken] = useState("whatsapp_webhook_token")
    const [saved, setSaved] = useState(false)
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<"success" | "error" | null>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const baseUrl = window.location.origin
            setWebhookUrl(`${baseUrl}/api/webhook`)
        }
    }, [])

    const handleSaveCredentials = () => {
        setAccessToken(localAccessToken)
        setPhoneNumberId(localPhoneNumberId)
        setWabaId(localWabaId)
        setApiVersion(localApiVersion)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const handleTestConnection = async () => {
        setTesting(true)
        setTestResult(null)

        try {
            // Test by fetching phone number details from WhatsApp API
            const response = await fetch(
                `https://graph.facebook.com/${localApiVersion}/${localPhoneNumberId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localAccessToken}`,
                    },
                }
            )

            if (response.ok) {
                setTestResult("success")
            } else {
                const error = await response.json()
                console.error("WhatsApp API test failed:", error)
                setTestResult("error")
            }
        } catch (error) {
            console.error("Connection test error:", error)
            setTestResult("error")
        }

        setTesting(false)
        setTimeout(() => setTestResult(null), 5000)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <ProtectedRoute>
            <div className="h-full flex flex-col bg-gradient-to-br from-green-50 via-white to-green-50">
                <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-600 p-2 rounded-lg">
                            <SettingsIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-sm text-gray-600">Configure your application</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Tabs defaultValue="credentials" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-6">
                                <TabsTrigger value="credentials">
                                    <Key className="mr-2 h-4 w-4" />
                                    WhatsApp API
                                </TabsTrigger>
                                <TabsTrigger value="business">
                                    <Building className="mr-2 h-4 w-4" />
                                    Business Profile
                                </TabsTrigger>
                                <TabsTrigger value="notifications">
                                    <Bell className="mr-2 h-4 w-4" />
                                    Notifications
                                </TabsTrigger>
                                <TabsTrigger value="account">
                                    <User className="mr-2 h-4 w-4" />
                                    Account
                                </TabsTrigger>
                            </TabsList>

                            {/* WhatsApp API Credentials */}
                            <TabsContent value="credentials" className="space-y-6">
                                {saved && (
                                    <Alert className="border-green-200 bg-green-50">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-800">Settings saved successfully!</AlertDescription>
                                    </Alert>
                                )}

                                {testResult === "success" && (
                                    <Alert className="border-green-200 bg-green-50">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-800">Connection test successful!</AlertDescription>
                                    </Alert>
                                )}

                                {testResult === "error" && (
                                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-800">
                                            Connection test failed. Please check your credentials.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Card className="border-gray-200 shadow-md">
                                    <CardHeader>
                                        <CardTitle>WhatsApp API Credentials</CardTitle>
                                        <CardDescription>Configure your Meta/Facebook Business Account credentials</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Access Token *</label>
                                            <Input
                                                type="password"
                                                placeholder="Your WhatsApp API access token"
                                                value={localAccessToken}
                                                onChange={(e) => setLocalAccessToken(e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500">
                                                Get this from Meta Business Manager → System User → Access Tokens
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                WABA ID (WhatsApp Business Account ID) *
                                            </label>
                                            <Input
                                                placeholder="Your WABA ID"
                                                value={localWabaId}
                                                onChange={(e) => setLocalWabaId(e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500">Get this from Meta Business Manager → WhatsApp Accounts</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Phone Number ID *</label>
                                            <Input
                                                placeholder="Your Phone Number ID"
                                                value={localPhoneNumberId}
                                                onChange={(e) => setLocalPhoneNumberId(e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500">Get this by querying your WABA phone numbers endpoint</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">API Version *</label>
                                            <Input
                                                placeholder="e.g., v18.0 or v19.0"
                                                value={localApiVersion}
                                                onChange={(e) => setLocalApiVersion(e.target.value)}
                                            />
                                            <p className="text-xs text-gray-500">
                                                Specify the Facebook Graph API version (e.g., v18.0, v19.0, v20.0)
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button onClick={handleSaveCredentials} className="bg-green-600 hover:bg-green-700 flex-1">
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Save Credentials
                                            </Button>
                                            <Button
                                                onClick={handleTestConnection}
                                                variant="outline"
                                                disabled={testing}
                                                className="flex-1 border-green-200 hover:bg-green-50"
                                            >
                                                {testing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Testing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Test Connection
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {localAccessToken && localWabaId && localPhoneNumberId && localApiVersion && (
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                    <span className="text-sm font-medium text-green-800">All credentials configured</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Webhook Configuration */}
                                <Card className="border-gray-200 shadow-md">
                                    <CardHeader>
                                        <CardTitle>Webhook Configuration</CardTitle>
                                        <CardDescription>Set up webhooks to receive incoming messages</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <Alert className="border-blue-200 bg-blue-50">
                                            <AlertCircle className="h-4 w-4 text-blue-600" />
                                            <AlertDescription className="text-blue-800">
                                                Configure your webhook in Meta Business Manager to receive incoming messages
                                            </AlertDescription>
                                        </Alert>

                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Webhook Callback URL</h3>
                                                <div className="flex gap-2">
                                                    <Input readOnly value={webhookUrl} className="font-mono text-xs" />
                                                    <Button size="icon" variant="outline" onClick={() => copyToClipboard(webhookUrl)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Verify Token</h3>
                                                <div className="flex gap-2">
                                                    <Input readOnly value={verifyToken} className="font-mono text-xs" />
                                                    <Button size="icon" variant="outline" onClick={() => copyToClipboard(verifyToken)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <Button variant="outline" className="w-full" asChild>
                                            <a
                                                href="https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/setup-webhooks"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Official Documentation
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Business Profile */}
                            <TabsContent value="business" className="space-y-6">
                                <Card className="border-gray-200 shadow-md">
                                    <CardHeader>
                                        <CardTitle>Business Information</CardTitle>
                                        <CardDescription>Manage your business profile details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Business Name</label>
                                            <Input placeholder="Your business name" defaultValue="BoostOwl" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Description</label>
                                            <Input placeholder="Brief description" defaultValue="WhatsApp Business Solutions" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Address</label>
                                            <Input placeholder="Business address" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Business Hours</label>
                                            <Input placeholder="e.g., Mon-Fri 9AM-5PM" />
                                        </div>
                                        <Button className="w-full bg-green-600 hover:bg-green-700">Save Business Profile</Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Notifications */}
                            <TabsContent value="notifications" className="space-y-6">
                                <Card className="border-gray-200 shadow-md">
                                    <CardHeader>
                                        <CardTitle>Notification Preferences</CardTitle>
                                        <CardDescription>Configure how you receive notifications</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">Email Notifications</p>
                                                <p className="text-sm text-gray-500">Receive notifications via email</p>
                                            </div>
                                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">New Message Alerts</p>
                                                <p className="text-sm text-gray-500">Get notified of new messages</p>
                                            </div>
                                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">Webhook Events</p>
                                                <p className="text-sm text-gray-500">Receive webhook event notifications</p>
                                            </div>
                                            <input type="checkbox" className="h-4 w-4" defaultChecked />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Account */}
                            <TabsContent value="account" className="space-y-6">
                                <Card className="border-gray-200 shadow-md">
                                    <CardHeader>
                                        <CardTitle>Account Settings</CardTitle>
                                        <CardDescription>Manage your account information</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Username</label>
                                            <Input value={user?.username} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Display Name</label>
                                            <Input defaultValue={user?.name} />
                                        </div>
                                        <Separator />
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Current Password</label>
                                            <Input type="password" placeholder="Enter current password" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">New Password</label>
                                            <Input type="password" placeholder="Enter new password" />
                                        </div>
                                        <Button className="w-full bg-green-600 hover:bg-green-700">Update Account</Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
