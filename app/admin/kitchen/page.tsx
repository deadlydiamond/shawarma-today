"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useOrders, Order } from "@/contexts/OrderContext"
import { useAuth } from "@/contexts/AuthContext"
import {
  ChefHat,
  Clock,
  CheckCircle,
  Timer,
  Flame,
  Package,
  Volume2,
  VolumeX,
  Maximize,
  RefreshCw,
  LayoutGrid,
  Utensils,
} from "lucide-react"

// Order urgency thresholds (minutes)
const URGENCY = {
  OK: 5,      // Green: under 5 minutes
  WARNING: 10, // Yellow: 5-10 minutes
  URGENT: 15,  // Orange: 10-15 minutes
  CRITICAL: 20 // Red: over 15 minutes
}

export default function KitchenDisplay() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { orders, updateOrderStatus, refreshOrders } = useOrders()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const audioContextRef = useRef<AudioContext | null>(null)
  const lastOrderCountRef = useRef(0)

  // Create beep sound using Web Audio API
  const playBeep = useCallback(() => {
    if (!soundEnabled) return
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      }
      
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = "sine"
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
      
      // Play second beep
      setTimeout(() => {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.frequency.value = 1000
        osc2.type = "sine"
        gain2.gain.setValueAtTime(0.3, ctx.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc2.start(ctx.currentTime)
        osc2.stop(ctx.currentTime + 0.3)
      }, 200)
    } catch (e) {
      console.log("Audio not supported")
    }
  }, [soundEnabled])

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-refresh orders every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => refreshOrders(), 10000)
    return () => clearInterval(interval)
  }, [refreshOrders])

  // Get kitchen orders (preparing status - orders sent to kitchen from POS)
  const kitchenOrders = orders.filter(o => 
    o.status === "preparing" && 
    !["completed", "cancelled"].includes(o.status)
  )

  // Sort by creation time (oldest first)
  const sortedOrders = [...kitchenOrders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  // New orders (< 1 minute old)
  const newOrders = sortedOrders.filter(o => getWaitTime(o.createdAt) < 1)
  
  // In progress orders
  const inProgressOrders = sortedOrders.filter(o => getWaitTime(o.createdAt) >= 1)

  // Ready orders
  const readyOrders = orders.filter(o => o.status === "ready")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Play sound for new orders
  useEffect(() => {
    if (kitchenOrders.length > lastOrderCountRef.current) {
      playBeep()
    }
    lastOrderCountRef.current = kitchenOrders.length
  }, [kitchenOrders.length, playBeep])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  function getWaitTime(dateString: string): number {
    return Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
  }

  function getUrgencyColor(minutes: number): string {
    if (minutes < URGENCY.OK) return "from-green-500 to-emerald-600"
    if (minutes < URGENCY.WARNING) return "from-yellow-500 to-amber-500"
    if (minutes < URGENCY.URGENT) return "from-orange-500 to-red-500"
    return "from-red-600 to-red-700"
  }

  function getUrgencyBg(minutes: number): string {
    if (minutes < URGENCY.OK) return "bg-green-500/10 border-green-500/30"
    if (minutes < URGENCY.WARNING) return "bg-yellow-500/10 border-yellow-500/30"
    if (minutes < URGENCY.URGENT) return "bg-orange-500/10 border-orange-500/30"
    return "bg-red-500/10 border-red-500/30 animate-pulse"
  }

  function getOrderCode(order: Order): string {
    const match = order.specialInstructions?.match(/#(\d{4})/)
    return match ? match[1] : order.id.slice(-4)
  }

  function getPrepTime(order: Order): string | null {
    const match = order.specialInstructions?.match(/Prep: (\d+)min/)
    return match ? match[1] : null
  }

  const handleBump = async (order: Order, newStatus: "ready" | "completed") => {
    await updateOrderStatus(order.id, newStatus)
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <RefreshCw className="h-12 w-12 animate-spin text-shawarma" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-lg border-b border-white/10 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Back to Dashboard"
          >
            <LayoutGrid className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-shawarma to-orange-600 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kitchen Display</h1>
              <p className="text-gray-400 text-xs">
                {kitchenOrders.length} active • {readyOrders.length} ready
              </p>
            </div>
          </div>
        </div>

        {/* Clock & Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-mono font-bold">
              {currentTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-gray-400 text-xs">
              {currentTime.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${soundEnabled ? "bg-green-500/20 text-green-400" : "bg-white/10 text-gray-400"}`}
              title={soundEnabled ? "Sound On" : "Sound Off"}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
              title="Fullscreen"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-6 px-6 min-h-screen">
        {kitchenOrders.length === 0 && readyOrders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
            <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Utensils className="h-16 w-16 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">All Clear!</h2>
            <p className="text-gray-600">No orders in the kitchen right now</p>
          </div>
        ) : (
          /* Order Columns */
          <div className="grid grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
            {/* Column 1: New Orders */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">New Orders</h2>
                  <p className="text-gray-500 text-xs">{newOrders.length} orders</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {newOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onBump={() => handleBump(order, "ready")}
                    getOrderCode={getOrderCode}
                    getWaitTime={getWaitTime}
                    getUrgencyColor={getUrgencyColor}
                    getUrgencyBg={getUrgencyBg}
                    getPrepTime={getPrepTime}
                    isNew
                  />
                ))}
                {newOrders.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new orders</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Preparing</h2>
                  <p className="text-gray-500 text-xs">{inProgressOrders.length} orders</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {inProgressOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onBump={() => handleBump(order, "ready")}
                    getOrderCode={getOrderCode}
                    getWaitTime={getWaitTime}
                    getUrgencyColor={getUrgencyColor}
                    getUrgencyBg={getUrgencyBg}
                    getPrepTime={getPrepTime}
                  />
                ))}
                {inProgressOrders.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nothing cooking</p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Ready */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Ready for Pickup</h2>
                  <p className="text-gray-500 text-xs">{readyOrders.length} orders</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {readyOrders.map(order => (
                  <ReadyCard 
                    key={order.id} 
                    order={order} 
                    onComplete={() => handleBump(order, "completed")}
                    getOrderCode={getOrderCode}
                  />
                ))}
                {readyOrders.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No orders ready</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Order Card Component
function OrderCard({ 
  order, 
  onBump, 
  getOrderCode, 
  getWaitTime, 
  getUrgencyColor, 
  getUrgencyBg,
  getPrepTime,
  isNew = false 
}: {
  order: Order
  onBump: () => void
  getOrderCode: (order: Order) => string
  getWaitTime: (dateString: string) => number
  getUrgencyColor: (minutes: number) => string
  getUrgencyBg: (minutes: number) => string
  getPrepTime: (order: Order) => string | null
  isNew?: boolean
}) {
  const waitTime = getWaitTime(order.createdAt)
  const orderCode = getOrderCode(order)
  const prepTime = getPrepTime(order)
  const isUrgent = waitTime >= URGENCY.URGENT

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${getUrgencyBg(waitTime)} ${isNew ? "ring-2 ring-blue-500 animate-pulse" : ""}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${getUrgencyColor(waitTime)} p-4`}>
        <div className="flex items-center justify-between">
          <span className="text-4xl font-black text-white">{orderCode}</span>
          <div className="text-right">
            <div className="flex items-center gap-1 text-white/90">
              <Timer className="h-4 w-4" />
              <span className="font-mono font-bold text-lg">{waitTime}m</span>
            </div>
            {prepTime && (
              <p className="text-white/70 text-xs">Target: {prepTime}m</p>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg bg-black/20 text-white text-sm font-medium">
            {order.tableNumber === "counter" ? "Counter" : 
             order.tableNumber === "takeaway" ? "Takeaway" : 
             `Table ${order.tableNumber}`}
          </span>
          {order.customer?.name && (
            <span className="text-white/80 text-sm truncate">
              {order.customer.name.split("#")[0].trim()}
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="p-4 bg-gray-800/50">
        <div className="space-y-2 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white flex-shrink-0">
                {item.quantity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{item.name}</p>
                {item.specialInstructions && (
                  <p className="text-amber-400 text-sm mt-0.5">⚠️ {item.specialInstructions}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && !order.specialInstructions.includes("POS Order") && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <p className="text-amber-400 text-sm font-medium">📝 Note:</p>
            <p className="text-white/80 text-sm mt-1">
              {order.specialInstructions.split("|").filter(s => !s.includes("POS") && !s.includes("Prep:") && !s.includes("#") && !s.includes("UNPAID") && !s.includes("PAID")).join(" • ")}
            </p>
          </div>
        )}

        {/* Bump Button */}
        <button
          onClick={onBump}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            isUrgent 
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          <CheckCircle className="h-6 w-6" />
          READY
        </button>
      </div>
    </div>
  )
}

// Ready Card Component
function ReadyCard({ 
  order, 
  onComplete,
  getOrderCode 
}: {
  order: Order
  onComplete: () => void
  getOrderCode: (order: Order) => string
}) {
  const orderCode = getOrderCode(order)

  return (
    <div className="rounded-2xl border border-green-500/30 bg-green-500/10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
        <div className="flex items-center justify-between">
          <span className="text-4xl font-black text-white">{orderCode}</span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white">
            <Package className="h-4 w-4" />
            <span className="font-semibold text-sm">READY</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="px-2 py-1 rounded-lg bg-black/20 text-white text-sm font-medium">
            {order.tableNumber === "counter" ? "Counter" : 
             order.tableNumber === "takeaway" ? "Takeaway" : 
             `Table ${order.tableNumber}`}
          </span>
          {order.customer?.name && (
            <span className="text-white/80 text-sm truncate">
              {order.customer.name.split("#")[0].trim()}
            </span>
          )}
        </div>
      </div>

      {/* Items Summary */}
      <div className="p-4 bg-gray-800/50">
        <p className="text-gray-400 text-sm mb-3">
          {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
        </p>
        <div className="text-white/70 text-sm line-clamp-2 mb-4">
          {order.items.map(i => `${i.quantity}× ${i.name}`).join(" • ")}
        </div>

        {/* Complete Button */}
        <button
          onClick={onComplete}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <CheckCircle className="h-5 w-5" />
          Picked Up
        </button>
      </div>
    </div>
  )
}
