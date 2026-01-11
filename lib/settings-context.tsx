"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface SettingsContextType {
  accessToken: string
  setAccessToken: (token: string) => void
  phoneNumberId: string
  setPhoneNumberId: (id: string) => void
  wabaId: string
  setWabaId: (id: string) => void
  apiVersion: string
  setApiVersion: (version: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState("")
  const [phoneNumberId, setPhoneNumberIdState] = useState("")
  const [wabaId, setWabaIdState] = useState("")
  const [apiVersion, setApiVersionState] = useState("")

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("whatsapp_settings")
    if (saved) {
      try {
        const { accessToken: token, phoneNumberId: id, wabaId: waba, apiVersion: version } = JSON.parse(saved)
        setAccessTokenState(token || "")
        setPhoneNumberIdState(id || "")
        setWabaIdState(waba || "")
        setApiVersionState(version || "")
      } catch (e) {
        console.error("Failed to parse saved settings:", e)
      }
    }
  }, [])

  const setAccessToken = (token: string) => {
    setAccessTokenState(token)
    updateSettings({ accessToken: token })
  }

  const setPhoneNumberId = (id: string) => {
    setPhoneNumberIdState(id)
    updateSettings({ phoneNumberId: id })
  }

  const setWabaId = (id: string) => {
    setWabaIdState(id)
    updateSettings({ wabaId: id })
  }

  const setApiVersion = (version: string) => {
    setApiVersionState(version)
    updateSettings({ apiVersion: version })
  }

  const updateSettings = (
    partial: Partial<{ accessToken: string; phoneNumberId: string; wabaId: string; apiVersion: string }>,
  ) => {
    const current = localStorage.getItem("whatsapp_settings")
    const parsed = current ? JSON.parse(current) : {}
    const updated = { ...parsed, ...partial }
    localStorage.setItem("whatsapp_settings", JSON.stringify(updated))
  }

  return (
    <SettingsContext.Provider
      value={{
        accessToken,
        setAccessToken,
        phoneNumberId,
        setPhoneNumberId,
        wabaId,
        setWabaId,
        apiVersion,
        setApiVersion,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return context
}
