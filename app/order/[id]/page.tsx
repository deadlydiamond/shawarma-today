"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Clock, CheckCircle, ChefHat, Package, XCircle, MapPin, Receipt, UtensilsCrossed, CreditCard, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface OrderItem {
  id: string
  name: string
  price: string
  quantity: number
  image?: string
  selected_size?: string
}

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  table_number: string
  special_instructions?: string
  items: OrderItem[]
  total: number
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  created_at: string
  pickup_time?: string
}

const statusConfig = {
  pending: {
    label: "Order Received",
    description: "Your order has been sent to the kitchen",
    icon: Receipt,
    color: "text-blue-600",
    bg: "bg-blue-100",
    progress: 1,
  },
  preparing: {
    label: "Being Prepared",
    description: "Our chefs are making your delicious food",
    icon: ChefHat,
    color: "text-purple-600",
    bg: "bg-purple-100",
    progress: 2,
  },
  ready: {
    label: "Ready to Serve!",
    description: "Your food is on its way to your table",
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-100",
    progress: 3,
  },
  completed: {
    label: "Completed",
    description: "Thank you for dining with us!",
    icon: CheckCircle,
    color: "text-gray-500",
    bg: "bg-gray-100",
    progress: 4,
  },
  cancelled: {
    label: "Cancelled",
    description: "This order has been cancelled",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-100",
    progress: 0,
  },
}

const progressSteps = [
  { key: "pending", label: "Received", icon: Receipt },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: Package },
]

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const prevStatusRef = useRef<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let realtimeWorking = false

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single()

        if (error || !data) {
          const storedOrders = localStorage.getItem("cafe_orders")
          if (storedOrders) {
            const orders = JSON.parse(storedOrders)
            const localOrder = orders.find((o: any) => o.id === orderId)
            if (localOrder) {
              setOrder({
                id: localOrder.id,
                customer_name: localOrder.customer?.name || localOrder.customer_name,
                customer_phone: localOrder.customer?.phone || localOrder.customer_phone,
                table_number: localOrder.tableNumber || localOrder.table_number || "",
                special_instructions: localOrder.specialInstructions || localOrder.special_instructions || "",
                items: localOrder.items,
                total: localOrder.total,
                status: localOrder.status,
                created_at: localOrder.createdAt || localOrder.created_at,
              })
              setLoading(false)
              return
            }
          }
          setNotFound(true)
        } else {
          // Check if status changed to ready and play sound
          if (data.status === "ready" && prevStatusRef.current !== "ready") {
            playReadySound()
          }
          prevStatusRef.current = data.status
          setOrder(data)
        }
      } catch (err) {
        console.error("Error fetching order:", err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    const playReadySound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 880
        oscillator.type = "sine"
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.8)
      } catch {}
    }

    fetchOrder()

    // Realtime subscription
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log("Realtime update received:", payload)
          const newOrder = payload.new as Order
          
          // Check if status changed to ready
          if (newOrder.status === "ready" && prevStatusRef.current !== "ready") {
            playReadySound()
          }
          prevStatusRef.current = newOrder.status
          setOrder(newOrder)
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status)
        if (status === "SUBSCRIBED") {
          realtimeWorking = true
        }
      })

    // Polling fallback - check every 3 seconds if realtime isn't working
    const pollInterval = setInterval(() => {
      if (!realtimeWorking) {
        console.log("Polling for order updates...")
        fetchOrder()
      }
    }, 3000)

    // Also poll every 10 seconds as backup even if realtime is working
    const backupPollInterval = setInterval(() => {
      fetchOrder()
    }, 10000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
      clearInterval(backupPollInterval)
    }
  }, [orderId])

  const formatPrice = (price: number) => `£${price.toFixed(2)}`

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <UtensilsCrossed className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500">Loading order...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Not Found State
  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h2>
            <p className="text-gray-500 mb-8">We couldn&apos;t find order #{orderId}</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-shawarma hover:bg-shawarma-600 text-white font-semibold rounded-2xl transition-all"
            >
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const currentStatus = statusConfig[order.status]
  const StatusIcon = currentStatus.icon
  const currentProgress = currentStatus.progress

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Status Header */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 text-center">
            <div className={`w-20 h-20 ${currentStatus.bg} rounded-full flex items-center justify-center mx-auto mb-5`}>
              <StatusIcon className={`h-10 w-10 ${currentStatus.color}`} />
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${currentStatus.color}`}>
              {currentStatus.label}
            </h1>
            <p className="text-gray-500">{currentStatus.description}</p>
            
            {/* Order ID */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <span className="text-sm text-gray-500">Order</span>
              <span className="font-mono font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
            </div>
          </div>

          {/* Progress Steps */}
          {order.status !== "cancelled" && order.status !== "completed" && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-2">
                {progressSteps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = index < currentProgress
                  const isCurrent = index === currentProgress - 1
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isActive 
                          ? isCurrent 
                            ? 'bg-shawarma text-white scale-110 shadow-lg' 
                            : 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isActive && !isCurrent ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <StepIcon className="h-6 w-6" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Progress line */}
              <div className="flex gap-1 px-6 -mt-[52px] mb-8">
                {[1, 2].map((i) => (
                  <div 
                    key={i} 
                    className={`flex-1 h-1 rounded-full transition-colors ${i < currentProgress ? 'bg-green-500' : 'bg-gray-200'}`} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Table & Time Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-shawarma rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <MapPin className="h-4 w-4" />
                Your Location
              </div>
              <p className="text-xl font-bold">
                {(() => {
                  const tableNum = order.table_number || ""
                  if (!tableNum) return "—"
                  if (tableNum === "takeaway") return "Takeaway"
                  if (tableNum === "counter") return "Counter"
                  if (tableNum === "outdoor") return "Outdoor"
                  return `Table ${tableNum}`
                })()}
              </p>
            </div>
            <div className="bg-shawarma/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-shawarma-600 text-sm mb-1">
                <Clock className="h-4 w-4" />
                Estimated Time
              </div>
              <p className="text-xl font-bold text-shawarma-800">
                {order.status === "pending" ? "10-15 min" : 
                 order.status === "preparing" ? "5-10 min" : 
                 order.status === "ready" ? "Now!" : "—"}
              </p>
            </div>
          </div>

          {/* Ready Alert */}
          {order.status === "ready" && (
            <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 mb-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-2">Your Food is Ready!</h2>
              <p className="text-green-700">
                {order.table_number === "takeaway" 
                  ? "Please collect from the counter" 
                  : "It's on the way to your table!"}
              </p>
              <p className="text-green-600 font-semibold mt-3 text-lg">{order.customer_name}</p>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Order Items</h3>
            </div>
            <div className="p-5 space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-900">{item.price}</p>
                </div>
              ))}
            </div>
            <div className="p-5 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Reminder */}
          <div className="bg-green-50 rounded-2xl p-5 mb-6 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Pay when you&apos;re done</p>
                <p className="text-sm text-green-700">Enjoy your meal, pay at the cashier before leaving</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/"
              className="flex-1 py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl text-center hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
            <Link 
              href="/#menu"
              className="flex-1 py-4 px-6 bg-shawarma hover:bg-shawarma-600 text-white font-semibold rounded-2xl text-center flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-5 w-5" />
              Order More
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
