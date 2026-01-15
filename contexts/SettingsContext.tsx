"use client"

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export interface RestaurantSettings {
  acceptingOrders: boolean
  tableCount: number
  taxRate: number
  currency: string
  restaurantName: string
  restaurantAddress: string
  restaurantPhone: string
}

interface SettingsContextType {
  settings: RestaurantSettings
  loading: boolean
  error: string | null
  updateSetting: (key: string, value: any) => Promise<void>
  refreshSettings: () => Promise<void>
}

// Empty default - all settings must come from Supabase
const defaultSettings: RestaurantSettings = {
  acceptingOrders: false,
  tableCount: 10,
  taxRate: 0,
  currency: "£",
  restaurantName: "",
  restaurantAddress: "",
  restaurantPhone: "",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    if (!supabase) {
      console.error("Supabase not configured")
      setError("Database not configured")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from("settings")
        .select("key, value")

      if (fetchError) {
        console.error("Error loading settings:", fetchError)
        setError(fetchError.message)
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        console.error("No settings found in database - please run the schema SQL")
        setError("No settings in database. Please run the schema SQL in Supabase.")
        setLoading(false)
        return
      }

      const loadedSettings: Partial<RestaurantSettings> = {}
      
      data.forEach((row: { key: string; value: any }) => {
        switch (row.key) {
          case "accepting_orders":
            loadedSettings.acceptingOrders = row.value === true || row.value === "true"
            break
          case "table_count":
            loadedSettings.tableCount = parseInt(row.value) || 10
            break
          case "tax_rate":
            loadedSettings.taxRate = parseFloat(row.value) || 0
            break
          case "currency":
            loadedSettings.currency = row.value || "£"
            break
          case "restaurant_name":
            loadedSettings.restaurantName = row.value || ""
            break
          case "restaurant_address":
            loadedSettings.restaurantAddress = row.value || ""
            break
          case "restaurant_phone":
            loadedSettings.restaurantPhone = row.value || ""
            break
        }
      })

      setSettings({ ...defaultSettings, ...loadedSettings })
      setError(null)
    } catch (err) {
      console.error("Error loading settings:", err)
      setError("Failed to load settings from database")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()

    // Subscribe to real-time settings changes
    const channel = supabase
      ?.channel("settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => {
          // Reload settings when any change occurs
          loadSettings()
        }
      )
      .subscribe()

    return () => {
      channel?.unsubscribe()
    }
  }, [loadSettings])

  const updateSetting = useCallback(async (key: string, value: any) => {
    try {
      // Map frontend keys to database keys
      const dbKeyMap: Record<string, string> = {
        acceptingOrders: "accepting_orders",
        tableCount: "table_count",
        taxRate: "tax_rate",
        currency: "currency",
        restaurantName: "restaurant_name",
        restaurantAddress: "restaurant_address",
        restaurantPhone: "restaurant_phone",
      }

      const dbKey = dbKeyMap[key] || key

      const { error: upsertError } = await supabase
        .from("settings")
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
