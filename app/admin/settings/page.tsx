"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useSettings } from "@/contexts/SettingsContext"
import {
  Save,
  Clock,
  MapPin,
  Bell,
  RefreshCw,
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  TrendingUp,
  Settings,
  ExternalLink,
  LogOut,
  Store,
  Phone,
  Hash,
  Percent,
  CheckCircle,
  XCircle,
  Globe,
  Utensils,
} from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, logout } = useAuth()
  const { settings, loading: settingsLoading, updateSetting } = useSettings()
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
      if (localSettings.restaurantName !== settings.restaurantName) {
        await updateSetting("restaurantName", localSettings.restaurantName)
      }
      if (localSettings.restaurantAddress !== settings.restaurantAddress) {
        await updateSetting("restaurantAddress", localSettings.restaurantAddress)
      }
      if (localSettings.restaurantPhone !== settings.restaurantPhone) {
        await updateSetting("restaurantPhone", localSettings.restaurantPhone)
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
      
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const currentDate = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

  // Sidebar navigation
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: false },
    { icon: Receipt, label: "POS", href: "/pos", active: false },
    { icon: UtensilsCrossed, label: "Menu", href: "/admin/menu", active: false },
    { icon: TrendingUp, label: "Reports", href: "/admin/reports", active: false },
    { icon: Settings, label: "Settings", href: "/admin/settings", active: true },
  ]

  if (authLoading || !isAuthenticated || settingsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-shawarma border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="flex">
        {/* Sidebar */}
        <aside className="w-20 min-h-screen bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col items-center py-6 fixed left-0 top-0 z-50">
          <nav className="flex flex-col items-center gap-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group relative ${
                  item.active
                    ? "bg-gradient-to-br from-shawarma to-orange-600 text-white shadow-lg shadow-shawarma/30"
                    : "text-slate-500 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              <ExternalLink className="h-5 w-5" />
            </Link>
            <button
              onClick={() => logout()}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-20 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-shawarma to-orange-600 rounded-xl">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">Settings</h1>
                    <p className="text-sm text-slate-500">{currentDate} • Admin</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-5 py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg transition-all ${
                    saved
                      ? "bg-green-500 text-white shadow-green-500/20"
                      : "bg-gradient-to-r from-shawarma to-orange-600 hover:from-shawarma/90 hover:to-orange-600/90 text-white shadow-shawarma/20"
                  }`}
                >
                  {saving ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : saved ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Restaurant Info */}
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <Store className="h-5 w-5 text-shawarma" />
                Restaurant Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Restaurant Name</label>
                  <div className="relative">
                    <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="text"
                      value={localSettings.restaurantName}
                      onChange={(e) => setLocalSettings({ ...localSettings, restaurantName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all"
                      placeholder="Enter restaurant name"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="text"
                      value={localSettings.restaurantAddress}
                      onChange={(e) => setLocalSettings({ ...localSettings, restaurantAddress: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="tel"
                      value={localSettings.restaurantPhone}
                      onChange={(e) => setLocalSettings({ ...localSettings, restaurantPhone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all"
                      placeholder="+44 1onal234 567890"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Number of Tables</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="number"
                      min="1"
                      value={localSettings.tableCount}
                      onChange={(e) => setLocalSettings({ ...localSettings, tableCount: parseInt(e.target.value) || 1 })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Settings */}
            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <Bell className="h-5 w-5 text-shawarma" />
                Order Settings
              </h2>
              
              {/* Accept Orders Toggle */}
              <div className="flex items-center justify-between p-5 bg-slate-800/30 rounded-xl mb-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    localSettings.acceptingOrders ? "bg-green-500/20" : "bg-red-500/20"
                  }`}>
                    {localSettings.acceptingOrders ? (
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Accept Online Orders</p>
                    <p className="text-sm text-slate-500">
                      {localSettings.acceptingOrders ? "Customers can place orders" : "Orders are currently disabled"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const newValue = !localSettings.acceptingOrders
                    setLocalSettings({ ...localSettings, acceptingOrders: newValue })
                    // Save immediately to database
                    try {
                      await updateSetting("acceptingOrders", newValue)
                    } catch (err) {
                      console.error("Failed to update accepting orders:", err)
                      // Revert on error
                      setLocalSettings({ ...localSettings, acceptingOrders: !newValue })
                    }
                  }}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    localSettings.acceptingOrders 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                      : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
                      localSettings.acceptingOrders ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tax Rate (%)</label>
                <div className="relative max-w-xs">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={localSettings.taxRate}
                    onChange={(e) => setLocalSettings({ ...localSettings, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <Globe className="h-5 w-5 text-shawarma" />
                Website Preview
              </h2>
              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                <div className="text-center space-y-3">
                  <h3 className="text-2xl font-black text-shawarma">{localSettings.restaurantName || "Restaurant Name"}</h3>
                  <p className="text-slate-400 flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {localSettings.restaurantAddress || "Address not set"}
                  </p>
                  <p className="text-slate-400 flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    {localSettings.restaurantPhone || "Phone not set"}
                  </p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    localSettings.acceptingOrders 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {localSettings.acceptingOrders ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Open for Orders
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Currently Closed
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 text-center mt-4">
                This is how your restaurant info appears on the website
              </p>
            </div>

          </div>
        </main>
      </main>
    </div>
  )
}
