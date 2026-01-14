"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useSettings } from "@/contexts/SettingsContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Save,
  Clock,
  MapPin,
  Bell,
  Shield,
  RefreshCw,
} from "lucide-react"

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { settings, loading: settingsLoading, updateSetting, refreshSettings } = useSettings()
  const [localSettings, setLocalSettings] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Sync local state with context when settings load
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save each setting that has changed
      if (localSettings.cafeName !== settings.cafeName) {
        await updateSetting("cafeName", localSettings.cafeName)
      }
      if (localSettings.cafeAddress !== settings.cafeAddress) {
        await updateSetting("cafeAddress", localSettings.cafeAddress)
      }
      if (localSettings.cafePhone !== settings.cafePhone) {
        await updateSetting("cafePhone", localSettings.cafePhone)
      }
      if (localSettings.acceptingOrders !== settings.acceptingOrders) {
        await updateSetting("acceptingOrders", localSettings.acceptingOrders)
      }
      if (localSettings.tableCount !== settings.tableCount) {
        await updateSetting("tableCount", localSettings.tableCount)
      }
      if (localSettings.taxRate !== settings.taxRate) {
        await updateSetting("taxRate", localSettings.taxRate)
      }
      if (localSettings.estimatedWaitBase !== settings.estimatedWaitBase) {
        await updateSetting("estimatedWaitBase", localSettings.estimatedWaitBase)
      }
      if (localSettings.estimatedWaitPerOrder !== settings.estimatedWaitPerOrder) {
        await updateSetting("estimatedWaitPerOrder", localSettings.estimatedWaitPerOrder)
      }
      if (JSON.stringify(localSettings.businessHours) !== JSON.stringify(settings.businessHours)) {
        await updateSetting("businessHours", localSettings.businessHours)
      }
      
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const updateHours = (day: string, field: "open" | "close", value: string) => {
    setLocalSettings({
      ...localSettings,
      businessHours: {
        ...localSettings.businessHours,
        [day]: { ...localSettings.businessHours[day], [field]: value },
      },
    })
  }

  if (authLoading || !isAuthenticated || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push("/admin")}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage your café configuration</p>
              </div>
            </div>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#1f2937', color: 'white' }}
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : saved ? (
                "✓ Saved"
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Basic Info */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              Basic Information
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Café Name</label>
                <input
                  type="text"
                  value={localSettings.cafeName}
                  onChange={(e) => setLocalSettings({ ...localSettings, cafeName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={localSettings.cafeAddress}
                  onChange={(e) => setLocalSettings({ ...localSettings, cafeAddress: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={localSettings.cafePhone}
                  onChange={(e) => setLocalSettings({ ...localSettings, cafePhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Settings */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-500" />
              Order Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Accept Online Orders</p>
                  <p className="text-sm text-gray-500">Enable or disable ordering system</p>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, acceptingOrders: !localSettings.acceptingOrders })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    localSettings.acceptingOrders ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      localSettings.acceptingOrders ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tables</label>
                  <input
                    type="number"
                    min="1"
                    value={localSettings.tableCount}
                    onChange={(e) => setLocalSettings({ ...localSettings, tableCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={localSettings.taxRate}
                    onChange={(e) => setLocalSettings({ ...localSettings, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Wait Time (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={localSettings.estimatedWaitBase}
                    onChange={(e) => setLocalSettings({ ...localSettings, estimatedWaitBase: parseInt(e.target.value) || 5 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per Order Wait (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={localSettings.estimatedWaitPerOrder}
                    onChange={(e) => setLocalSettings({ ...localSettings, estimatedWaitPerOrder: parseInt(e.target.value) || 3 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Business Hours
            </h2>
            <div className="space-y-3">
              {days.map((day) => (
                <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className="w-24 capitalize font-medium text-gray-900">{day}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={localSettings.businessHours[day]?.open || "08:00"}
                      onChange={(e) => updateHours(day, "open", e.target.value)}
                      className="px-3 py-1 border border-gray-200 rounded text-gray-900"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={localSettings.businessHours[day]?.close || "18:00"}
                      onChange={(e) => updateHours(day, "close", e.target.value)}
                      className="px-3 py-1 border border-gray-200 rounded text-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-white border-red-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Refresh Settings from Database</p>
                  <p className="text-sm text-gray-500">Reload all settings from Supabase</p>
                </div>
                <button
                  onClick={refreshSettings}
                  className="px-4 py-2 text-sm rounded-lg border transition-colors"
                  style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
                >
                  Refresh
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
