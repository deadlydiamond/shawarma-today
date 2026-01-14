"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Section } from "@/components/ui/Section"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Phone, Clock, CheckCircle, ChefHat, Package, XCircle, Bell, Search, Coffee, ArrowRight, CreditCard, Banknote, MapPin } from "lucide-react"
import Link from "next/link"

interface OrderItem {
  id: string
  name: string
  price: string
  quantity: number
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
}

const statusConfig = {
  pending: {
    label: "Awaiting Payment",
    icon: Banknote,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  paid: {
    label: "Payment Confirmed",
    icon: CreditCard,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  preparing: {
    label: "Preparing",
    icon: ChefHat,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  ready: {
    label: "Ready!",
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
  },
}

export default function MyOrdersPage() {
  const [phone, setPhone] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [savedPhone, setSavedPhone] = useState("")

  // Load saved phone from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customer_phone")
    if (saved) {
      setPhone(saved)
      setSavedPhone(saved)
      // Auto-search if phone is saved
      searchOrders(saved)
    }
  }, [])

  // Real-time subscription for order updates
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
        // Fallback to localStorage
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

      // Save phone for future visits
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      
      <Section className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3">My Orders</h1>
            <p className="text-foreground/60 text-lg">Track your orders with your phone number</p>
          </div>

          {/* Phone Search */}
          <Card className="mb-10">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full pl-12 pr-4 py-3 border-2 border-foreground/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 bg-white"
                  />
                </div>
                <Button type="submit" variant="primary" disabled={loading || !phone.trim()}>
                  {loading ? (
                    <Coffee className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </form>
              {savedPhone && (
                <p className="text-sm text-foreground/50 mt-3 text-center">
                  Showing orders for {savedPhone}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Active Orders
              </h2>
              <div className="flex flex-col gap-5">
                {activeOrders.map((order) => {
                  const status = statusConfig[order.status]
                  const StatusIcon = status.icon
                  return (
                    <Link href={`/order/${order.id}`} key={order.id} className="block">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-foreground/10">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="font-mono font-semibold text-lg">{order.id}</p>
                                {order.table_number && (
                                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-600 text-white flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {order.table_number === "takeaway" ? "Takeaway" : 
                                     order.table_number === "counter" ? "Counter" :
                                     order.table_number === "outdoor" ? "Outdoor" :
                                     `Table ${order.table_number}`}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-foreground/60 mt-1">{formatDate(order.created_at)}</p>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg}`}>
                              <StatusIcon className={`h-4 w-4 ${status.color}`} />
                              <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <p className="text-sm text-foreground/70">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-lg">{formatPrice(order.total)}</span>
                              <ArrowRight className="h-5 w-5 text-foreground/40" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 text-foreground/70">Past Orders</h2>
              <div className="flex flex-col gap-4">
                {pastOrders.map((order) => {
                  const status = statusConfig[order.status]
                  const StatusIcon = status.icon
                  return (
                    <Link href={`/order/${order.id}`} key={order.id} className="block">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-70 hover:opacity-100">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-mono text-sm font-medium">{order.id}</p>
                              <p className="text-sm text-foreground/50 mt-1">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-sm ${status.color}`}>{status.label}</span>
                              <span className="font-semibold">{formatPrice(order.total)}</span>
                              <ArrowRight className="h-4 w-4 text-foreground/30" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Orders */}
          {searched && orders.length === 0 && !loading && (
            <Card className="mt-8">
              <CardContent className="p-12 text-center">
                <Coffee className="h-16 w-16 mx-auto mb-6 text-foreground/30" />
                <h3 className="text-xl font-semibold mb-3">No orders found</h3>
                <p className="text-foreground/60 mb-6 text-lg">
                  We couldn&apos;t find any orders with this phone number
                </p>
                <Button asChild size="lg" variant="primary">
                  <Link href="/#menu">🍽️ Place Your First Order</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Not Searched Yet */}
          {!searched && (
            <Card className="mt-8">
              <CardContent className="p-12 text-center">
                <Phone className="h-16 w-16 mx-auto mb-6 text-foreground/30" />
                <h3 className="text-xl font-semibold mb-3">Enter your phone number</h3>
                <p className="text-foreground/60 text-lg">
                  Use the same phone number you used when placing your order
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </Section>

      <Footer />
    </div>
  )
}
