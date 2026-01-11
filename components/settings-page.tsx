"use client"

import { useState, useEffect } from "react"
import { useSettings } from "@/lib/settings-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Copy, ExternalLink } from "lucide-react"

export function SettingsPage() {
  const { accessToken, setAccessToken, phoneNumberId, setPhoneNumberId, wabaId, setWabaId, apiVersion, setApiVersion } =
    useSettings()

  const [localAccessToken, setLocalAccessToken] = useState(accessToken)
  const [localPhoneNumberId, setLocalPhoneNumberId] = useState(phoneNumberId)
  const [localWabaId, setLocalWabaId] = useState(wabaId)
  const [localApiVersion, setLocalApiVersion] = useState(apiVersion)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [verifyToken, setVerifyToken] = useState("whatsapp_webhook_token")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Generate webhook URL
    if (typeof window !== "undefined") {
      const baseUrl = window.location.origin
      setWebhookUrl(`${baseUrl}/api/webhook`)
    }
  }, [])

  const handleSave = () => {
    setAccessToken(localAccessToken)
    setPhoneNumberId(localPhoneNumberId)
    setWabaId(localWabaId)
    setApiVersion(localApiVersion)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your WhatsApp Business API credentials</p>
        </div>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="api">API Credentials</TabsTrigger>
            <TabsTrigger value="webhook">Webhook Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-6">
            {saved && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">Settings saved successfully!</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>WhatsApp API Credentials</CardTitle>
                <CardDescription>Get these from your Meta/Facebook Business Account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Access Token *</label>
                  <Input
                    type="password"
                    placeholder="Your WhatsApp API access token"
                    value={localAccessToken}
                    onChange={(e) => setLocalAccessToken(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get this from Meta Business Manager &gt; System User &gt; Access Tokens
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    WABA ID (WhatsApp Business Account ID) *
                  </label>
                  <Input
                    placeholder="Your WABA ID"
                    value={localWabaId}
                    onChange={(e) => setLocalWabaId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get this from Meta Business Manager &gt; WhatsApp Accounts
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number ID *</label>
                  <Input
                    placeholder="Your Phone Number ID"
                    value={localPhoneNumberId}
                    onChange={(e) => setLocalPhoneNumberId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Get this by querying your WABA phone numbers endpoint</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">API Version *</label>
                  <Input
                    placeholder="e.g., v18.0 or v19.0"
                    value={localApiVersion}
                    onChange={(e) => setLocalApiVersion(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Specify the Facebook Graph API version (e.g., v18.0, v19.0, v20.0)
                  </p>
                </div>

                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 w-full">
                  Save Settings
                </Button>

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
          </TabsContent>

          <TabsContent value="webhook" className="space-y-6">
            <Card>
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
                    <h3 className="text-sm font-semibold text-foreground mb-2">Webhook Callback URL</h3>
                    <div className="flex gap-2">
                      <Input readOnly value={webhookUrl} className="font-mono text-xs" />
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(webhookUrl)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Verify Token</h3>
                    <div className="flex gap-2">
                      <Input readOnly value={verifyToken} className="font-mono text-xs" />
                      <Button size="icon" variant="outline" onClick={() => copyToClipboard(verifyToken)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-3">
                  <h3 className="font-semibold text-foreground">Setup Steps:</h3>
                  <ol className="space-y-2 text-sm text-foreground list-decimal list-inside">
                    <li>Go to Meta Business Manager</li>
                    <li>Navigate to your WhatsApp App</li>
                    <li>Go to Configuration in the WhatsApp section</li>
                    <li>In Webhooks, click Edit</li>
                    <li>Paste the Webhook URL above</li>
                    <li>Paste the Verify Token above</li>
                    <li>Subscribe to &quot;messages&quot; and &quot;message_status&quot; webhook fields</li>
                    <li>Click Verify and Save</li>
                  </ol>
                </div>

                <Button variant="outline" className="w-full bg-transparent" asChild>
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

            <Card>
              <CardHeader>
                <CardTitle>Incoming Messages</CardTitle>
                <CardDescription>Messages received via webhook will appear in your inbox</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  When someone sends a message to your WhatsApp Business number, it will be automatically received and
                  displayed in your conversations.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
