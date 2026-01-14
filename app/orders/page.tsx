"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Phone, Clock, CheckCircle, ChefHat, Package, XCircle, Search, ArrowRight, CreditCard, Banknote, MapPin, Sparkles, Receipt, RefreshCw, UtensilsCrossed } from "lucide-react"
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
  status: "pending" | "paid" | "preparing" | "ready" | "completed" | "cancelled"
  created_at: string
  pickup_time?: string
}

const statusConfig = {
  pending: {
    label: "Awaiting Payment",
    icon: Banknote,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    progress: 1,
  },
  paid: {
    label: "Payment Confirmed",
    icon: CreditCard,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    progress: 2,
  },
  preparing: {
    label: "Being Prepared",
    icon: ChefHat,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    progress: 3,
  },
  ready: {
    label: "Ready for Pickup!",
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    progress: 4,
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    progress: 4,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    progress: 0,
  },
}

const progressSteps = [
  { label: "Ordered", icon: Receipt },
  { label: "Confirmed", icon: CreditCard },
  { label: "Preparing", icon: ChefHat },
  { label: "Ready", icon: Package },
]

export default function MyOrdersPage() {
  const [phone, setPhone] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [savedPhone, setSavedPhone] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("customer_phone")
    if (saved) {
      setPhone(saved)
      setSavedPhone(saved)
      searchOrders(saved)
    }
  }, [])

  useEffect(() => {
    if (!savedPhone) return

    const channel = supabase
      .channel("my-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order
            if (newOrder.customer_phone === savedPhone) {
              setOrders((prev) => [newOrder, ...prev])
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedOrder = payload.new as Order
            setOrders((prev) =>
              prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [savedPhone])

  const searchOrders = async (phoneNumber: string) => {
    const cleanPhone = phoneNumber.trim()
    if (!cleanPhone) return

    setLoading(true)
    setSearched(true)

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_phone", cleanPhone)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        const storedOrders = localStorage.getItem("cafe_orders")
        if (storedOrders) {
          const allOrders = JSON.parse(storedOrders)
          const filtered = allOrders.filter((o: any) => 
            (o.customer?.phone || o.customer_phone) === cleanPhone
          )
          setOrders(filtered)
        }
      } else {
        setOrders(data || [])
      }

      localStorage.setItem("customer_phone", cleanPhone)
      setSavedPhone(cleanPhone)
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchOrders(phone)
  }

  const formatPrice = (price: number) => `£${price.toFixed(2)}`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    if (isToday) {
      return `Today, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
    }
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const activeOrders = orders.filter(o => 
    ["pending", "paid", "preparing", "ready"].includes(o.status)
  )
  const pastOrders = orders.filter(o => 
    ["completed", "cancelled"].includes(o.status)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-shawarma/10 text-shawarma font-semibold text-sm rounded-full mb-4">
              <Receipt className="h-4 w-4" />
              Order Tracking
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-500">Track your orders in real-time</p>
          </div>

          {/* Phone Search Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-shawarma/20 focus:border-shawarma transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !phone.trim()}
                className="px-6 py-4 bg-shawarma hover:bg-shawarma-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>
            </form>
            {savedPhone && (
              <p className="text-sm text-gray-500 mt-4 text-center flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live updates for {savedPhone}
              </p>
            )}
          </div>

          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <h2 className="text-lg font-bold text-gray-900">Active Orders</h2>
              </div>
              
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const status = statusConfig[order.status]
                  const StatusIcon = status.icon
                  const currentProgress = status.progress
                  
                  return (
                    <Link href={`/order/${order.id}`} key={order.id} className="block group">
                      <div className={`bg-white rounded-3xl p-5 shadow-sm border-2 ${status.border} hover:shadow-xl transition-all duration-300`}>
                        
                        {/* Progress Bar */}
                        <div className="mb-5">
                          <div className="flex items-center justify-between mb-2">
                            {progressSteps.map((step, index) => {
                              const StepIcon = step.icon
                              const isActive = index < currentProgress
                              const isCurrent = index === currentProgress - 1
                              return (
                                <div key={step.label} className="flex flex-col items-center flex-1">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isActive 
                                      ? isCurrent 
                                        ? 'bg-shawarma text-white scale-110 shadow-lg' 
                                        : 'bg-green-500 text-white' 
                                      : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {isActive && !isCurrent ? (
                                      <CheckCircle className="h-5 w-5" />
                                    ) : (
                                      <StepIcon className="h-5 w-5" />
                                    )}
                                  </div>
                                  <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                          {/* Progress line */}
                          <div className="flex gap-1 px-5 -mt-[52px] mb-8">
                            {[1, 2, 3].map((i) => (
                              <div 
                                key={i} 
                                className={`flex-1 h-1 rounded-full transition-colors ${i < currentProgress ? 'bg-green-500' : 'bg-gray-200'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        {/* Order Info */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</p>
                              {order.table_number && (
                                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-900 text-white flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {order.table_number === "takeaway" ? "Takeaway" : 
                                   order.table_number === "counter" ? "Counter" :
                                   order.table_number === "outdoor" ? "Outdoor" :
                                   `Table ${order.table_number}`}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}`}>
                            <StatusIcon className={`h-4 w-4 ${status.color}`} />
                            <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="flex items-center gap-3 py-3 border-t border-gray-100">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div 
                                key={idx} 
                                className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white overflow-hidden flex items-center justify-center"
                              >
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} width={40} height={40} className="object-cover" />
                                ) : (
                                  <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center">
                                <span className="text-xs font-bold text-white">+{order.items.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">{formatPrice(order.total)}</span>
                            <div className="p-2 bg-gray-100 rounded-full group-hover:bg-shawarma group-hover:text-white transition-colors">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-400 mb-4">Past Orders</h2>
              <div className="space-y-3">
                {pastOrders.map((order) => {
                  const status = statusConfig[order.status]
                  const StatusIcon = status.icon
                  return (
                    <Link href={`/order/${order.id}`} key={order.id} className="block group">
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all opacity-80 hover:opacity-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${status.bg}`}>
                              <StatusIcon className={`h-4 w-4 ${status.color}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
                              <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-shawarma transition-colors" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Orders Found */}
          {searched && orders.length === 0 && !loading && (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Receipt className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                We couldn&apos;t find any orders with this phone number. Ready to place your first order?
              </p>
              <Link 
                href="/#menu"
                className="inline-flex items-center gap-2 px-6 py-3 bg-shawarma hover:bg-shawarma-600 text-white font-semibold rounded-2xl transition-all hover:scale-105"
              >
                <Sparkles className="h-5 w-5" />
                Browse Menu
              </Link>
            </div>
          )}

          {/* Not Searched Yet */}
          {!searched && (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-shawarma/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="h-8 w-8 text-shawarma" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Track Your Order</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Enter the phone number you used when placing your order to see real-time updates
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
