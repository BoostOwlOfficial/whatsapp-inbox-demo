"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Phone, Plus } from "lucide-react"
import { useSettings } from "@/lib/settings-context"

interface PhoneSelectorProps {
  phoneNumbers: any[]
  selectedPhoneId: string
  onSelectPhone: (phoneId: string) => void
  onPhoneNumbersUpdate: (phones: any[]) => void
}

export function PhoneSelector({
  phoneNumbers,
  selectedPhoneId,
  onSelectPhone,
  onPhoneNumbersUpdate,
}: PhoneSelectorProps) {
  const { wabaId, accessToken, apiVersion } = useSettings()
  const [showAddPhone, setShowAddPhone] = useState(false)
  const [newPhoneId, setNewPhoneId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleFetchPhoneNumbers = async () => {
    if (!wabaId || !accessToken) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/get-phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wabaId, accessToken, apiVersion }),
      })

      if (response.ok) {
        const data = await response.json()
        onPhoneNumbersUpdate(data.phone_numbers || [])
        localStorage.setItem("whatsapp_phone_numbers", JSON.stringify(data.phone_numbers || []))
      }
    } catch (error) {
      console.error("Failed to fetch phone numbers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPhone = () => {
    if (newPhoneId.trim()) {
      const newPhone = {
        id: newPhoneId.trim(),
        display_phone_number: newPhoneId.trim(),
        verified_name: newPhoneId.trim(),
      }
      const updated = [...phoneNumbers, newPhone]
      onPhoneNumbersUpdate(updated)
      localStorage.setItem("whatsapp_phone_numbers", JSON.stringify(updated))
      setNewPhoneId("")
      setShowAddPhone(false)
    }
  }

  const handleRemovePhone = (phoneId: string) => {
    const updated = phoneNumbers.filter((p) => p.id !== phoneId)
    onPhoneNumbersUpdate(updated)
    localStorage.setItem("whatsapp_phone_numbers", JSON.stringify(updated))
  }

  return (
    <div className="border-b border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-green-600" />
          <h2 className="font-semibold text-foreground">Phone Numbers</h2>
        </div>
        <Button size="sm" variant="ghost" onClick={handleFetchPhoneNumbers} disabled={isLoading || !wabaId}>
          {isLoading ? "Loading..." : "Sync"}
        </Button>
      </div>

      {phoneNumbers.length > 0 ? (
        <Select value={selectedPhoneId} onValueChange={onSelectPhone}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {phoneNumbers.map((phone) => (
              <SelectItem key={phone.id} value={phone.id}>
                {phone.display_phone_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p className="text-sm text-muted-foreground">No phone numbers available</p>
      )}

      {!showAddPhone ? (
        <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={() => setShowAddPhone(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Phone Number ID
        </Button>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Enter Phone Number ID from Meta"
            value={newPhoneId}
            onChange={(e) => setNewPhoneId(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddPhone()}
          />
          <p className="text-xs text-muted-foreground">
            Get the Phone Number ID from Meta Business Manager or use Sync button to fetch automatically
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddPhone} className="flex-1">
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAddPhone(false)
                setNewPhoneId("")
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
