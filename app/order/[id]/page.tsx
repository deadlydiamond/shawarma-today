"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Section } from "@/components/ui/Section"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Clock, CheckCircle, ChefHat, Package, XCircle, Coffee, Bell, CreditCard, Banknote, MapPin } from "lucide-react"
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
    description: "Please pay at the counter to confirm your order",
    icon: Banknote,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    step: 1,
  },
  paid: {
    label: "Payment Confirmed",
    description: "Payment received - your order will be prepared shortly",
    icon: CreditCard,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    step: 2,
  },
  preparing: {
    label: "Preparing",
    description: "We're making your order",
    icon: ChefHat,
    color: "text-purple-600",
    bg: "bg-purple-100",
    step: 3,
  },
  ready: {
    label: "Ready for Pickup!",
    description: "Your order is ready - please collect it",
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-100",
    step: 4,
  },
  completed: {
    label: "Completed",
    description: "Thank you for your order!",
    icon: CheckCircle,
    color: "text-gray-600",
    bg: "bg-gray-100",
    step: 5,
  },
  cancelled: {
    label: "Cancelled",
    description: "This order has been cancelled",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
    step: 0,
  },
}

const steps = ["pending", "paid", "preparing", "ready"] as const

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single()

        if (error || !data) {
          // Try localStorage fallback
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
          setOrder(data)
        }
      } catch (err) {
        console.error("Error fetching order:", err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    // Real-time subscription for order updates
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
          console.log("Order updated:", payload)
          setOrder(payload.new as Order)
          
          // Play sound when order is ready
          if (payload.new.status === "ready") {
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
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  const formatPrice = (price: number) => `£${price.toFixed(2)}`

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        <Section className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Coffee className="h-12 w-12 animate-pulse mx-auto mb-4 text-foreground/50" />
            <p className="text-foreground/60">Loading order...</p>
          </div>
        </Section>
        <Footer />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        <Section className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-foreground/60 mb-6">We couldn&apos;t find order {orderId}</p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </Section>
        <Footer />
      </div>
    )
  }

  const currentStatus = statusConfig[order.status]
  const StatusIcon = currentStatus.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      
      <Section>
        <div className="max-w-2xl mx-auto">
          {/* Status Header */}
          <div className="text-center mb-8">
            <div className={`w-24 h-24 ${currentStatus.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <StatusIcon className={`h-12 w-12 ${currentStatus.color}`} />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${currentStatus.color}`}>
              {currentStatus.label}
            </h1>
            <p className="text-foreground/60">{currentStatus.description}</p>
          </div>

          {/* Order ID & Table */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-foreground/60 mb-1">Order Number</p>
                <p className="font-mono text-xl font-bold">{order.id}</p>
              </CardContent>
            </Card>
            <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#2563eb', color: 'white' }}>
              <p className="text-sm opacity-80 mb-1">Your Table</p>
              <p className="text-xl font-bold flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5" />
                {(() => {
                  const tableNum = order.table_number || (order as any).tableNumber || ""
                  if (!tableNum) return "—"
                  if (tableNum === "takeaway") return "Takeaway"
                  if (tableNum === "counter") return "Counter"
                  if (tableNum === "outdoor") return "Outdoor"
                  return `Table ${tableNum}`
                })()}
              </p>
            </div>
          </div>

          {/* Estimated Wait Time */}
          {(order.status === "pending" || order.status === "paid" || order.status === "preparing") && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-800">Estimated Ready In</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {order.status === "pending" ? "~15-20" : 
                         order.status === "paid" ? "~10-15" : 
                         "~5-10"} min
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">
                    {order.status === "pending" && "After payment"}
                    {order.status === "paid" && "In queue"}
                    {order.status === "preparing" && "Almost ready!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Steps */}
          {order.status !== "cancelled" && order.status !== "completed" && (
            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="relative">
                  {/* Connecting line behind icons */}
                  <div className="absolute top-5 sm:top-6 left-6 sm:left-7 right-6 sm:right-7 h-1 bg-gray-200 rounded" />
                  <div 
                    className="absolute top-5 sm:top-6 left-6 sm:left-7 h-1 bg-green-400 rounded transition-all"
                    style={{ 
                      width: `${Math.max(0, (steps.indexOf(order.status as typeof steps[number]) / (steps.length - 1)) * 100)}%`,
                      maxWidth: 'calc(100% - 48px)'
                    }}
                  />
                  
                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                      const stepConfig = statusConfig[step]
                      const StepIcon = stepConfig.icon
                      const isActive = steps.indexOf(order.status as typeof steps[number]) >= index
                      const isCurrent = order.status === step
                      
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all z-10 ${
                              isActive
                                ? isCurrent
                                  ? `${stepConfig.bg} ${stepConfig.color} ring-4 ring-offset-2 ${stepConfig.bg.replace('100', '200')}`
                                  : `${stepConfig.bg} ${stepConfig.color}`
                                : "bg-gray-100 text-gray-400"
                            }`}
                            style={{ backgroundColor: isActive ? undefined : '#f3f4f6' }}
                          >
                            <StepIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <p 
                            className={`text-[10px] sm:text-xs mt-2 text-center leading-tight max-w-[70px] ${isActive ? "text-foreground font-medium" : "text-gray-400"}`}
                          >
                            {stepConfig.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ready Alert */}
          {order.status === "ready" && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6 text-center animate-pulse">
              <Package className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-800 mb-2">Your Order is Ready!</h2>
              <p className="text-green-700">Please come to the counter to collect your order</p>
              <p className="text-green-600 font-semibold mt-2">Name: {order.customer_name}</p>
            </div>
          )}

          {/* Order Items */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.quantity}x {item.name}</span>
                      {item.selected_size && item.selected_size !== "regular" && (
                        <span className="text-foreground/60 ml-1">({item.selected_size})</span>
                      )}
                    </div>
                    <span>{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Reminder */}
          {order.status === "pending" && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center mb-6">
              <Banknote className="h-8 w-8 text-amber-600 mx-auto mb-3" />
              <h3 className="font-semibold text-amber-800 mb-2">Payment Required</h3>
              <p className="text-amber-700 text-sm">
                Please go to the counter and pay <span className="font-bold">{formatPrice(order.total)}</span> to start your order.
              </p>
              <p className="text-amber-600 text-xs mt-2">Your order will be prepared after payment is confirmed.</p>
            </div>
          )}
          
          {order.status === "paid" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center mb-6">
              <p className="text-emerald-800 text-sm">
                ✅ Payment received! Your order is in the queue.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/#menu">🍽️ Order More</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
