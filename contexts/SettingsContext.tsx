"use client"

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export interface CafeSettings {
  businessHours: {
    [key: string]: { open: string; close: string }
  }
  acceptingOrders: boolean
  estimatedWaitBase: number
  estimatedWaitPerOrder: number
  tableCount: number
  taxRate: number
  currency: string
  cafeName: string
  cafeAddress: string
  cafePhone: string
}

interface SettingsContextType {
  settings: CafeSettings
  loading: boolean
  error: string | null
  updateSetting: (key: string, value: any) => Promise<void>
  refreshSettings: () => Promise<void>
}

const defaultSettings: CafeSettings = {
  businessHours: {
    monday: { open: "08:00", close: "18:00" },
    tuesday: { open: "08:00", close: "18:00" },
    wednesday: { open: "08:00", close: "18:00" },
    thursday: { open: "08:00", close: "18:00" },
    friday: { open: "08:00", close: "18:00" },
    saturday: { open: "09:00", close: "17:00" },
    sunday: { open: "10:00", close: "16:00" },
  },
  acceptingOrders: true,
  estimatedWaitBase: 5,
  estimatedWaitPerOrder: 3,
  tableCount: 20,
  taxRate: 0,
  currency: "£",
  cafeName: "Leaf & Bean Café",
  cafeAddress: "123 Morningside Road, Edinburgh",
  cafePhone: "+44 7887 910900",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<CafeSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from("cafe_settings")
        .select("key, value")

      if (fetchError) {
        console.error("Error loading settings:", fetchError)
        setError(fetchError.message)
        return
      }

      if (data && data.length > 0) {
        const loadedSettings: Partial<CafeSettings> = {}
        
        data.forEach((row: { key: string; value: any }) => {
          switch (row.key) {
            case "business_hours":
              loadedSettings.businessHours = row.value
              break
            case "accepting_orders":
              loadedSettings.acceptingOrders = row.value === true || row.value === "true"
              break
            case "estimated_wait_base":
              loadedSettings.estimatedWaitBase = parseInt(row.value) || 5
              break
            case "estimated_wait_per_order":
              loadedSettings.estimatedWaitPerOrder = parseInt(row.value) || 3
              break
            case "table_count":
              loadedSettings.tableCount = parseInt(row.value) || 20
              break
            case "tax_rate":
              loadedSettings.taxRate = parseFloat(row.value) || 0
              break
            case "currency":
              loadedSettings.currency = row.value || "£"
              break
            case "cafe_name":
              loadedSettings.cafeName = row.value || "Leaf & Bean Café"
              break
            case "cafe_address":
              loadedSettings.cafeAddress = row.value || ""
              break
            case "cafe_phone":
              loadedSettings.cafePhone = row.value || ""
              break
          }
        })

        setSettings({ ...defaultSettings, ...loadedSettings })
      }
      setError(null)
    } catch (err) {
      console.error("Error loading settings:", err)
      setError("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const updateSetting = useCallback(async (key: string, value: any) => {
    try {
      // Map frontend keys to database keys
      const dbKeyMap: Record<string, string> = {
        businessHours: "business_hours",
        acceptingOrders: "accepting_orders",
        estimatedWaitBase: "estimated_wait_base",
        estimatedWaitPerOrder: "estimated_wait_per_order",
        tableCount: "table_count",
        taxRate: "tax_rate",
        currency: "currency",
        cafeName: "cafe_name",
        cafeAddress: "cafe_address",
        cafePhone: "cafe_phone",
      }

      const dbKey = dbKeyMap[key] || key

      const { error: upsertError } = await supabase
        .from("cafe_settings")
        .upsert(
          { key: dbKey, value: value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        )

      if (upsertError) {
        console.error("Error updating setting:", upsertError)
        throw upsertError
      }

      // Update local state
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }))
    } catch (err) {
      console.error("Error updating setting:", err)
      throw err
    }
  }, [])

  const refreshSettings = useCallback(async () => {
    await loadSettings()
  }, [loadSettings])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        updateSetting,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
