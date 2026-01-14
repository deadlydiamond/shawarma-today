"use client"

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react"
import { supabase, DbOrder, OrderItem } from "@/lib/supabase"

export type { OrderItem }

export interface Order {
  id: string
  items: OrderItem[]
  customer: {
    name: string
    phone: string
  }
  tableNumber: string
  pickupTime?: string
  specialInstructions?: string
  subtotal: number
  total: number
  status: "pending" | "paid" | "preparing" | "ready" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}

interface OrderContextType {
  orders: Order[]
  loading: boolean
  addOrder: (order: Omit<Order, "id" | "status" | "createdAt" | "updatedAt">) => Promise<string | null>
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>
  updateOrderNotes: (orderId: string, notes: string) => Promise<void>
  getOrder: (orderId: string) => Order | undefined
  getPendingOrders: () => Order[]
  getTodayOrders: () => Order[]
  getTodayRevenue: () => number
  refreshOrders: () => Promise<void>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

// Convert database row to Order type
const dbToOrder = (row: DbOrder): Order => ({
  id: row.id,
  items: row.items,
  customer: {
    name: row.customer_name,
    phone: row.customer_phone,
  },
  tableNumber: row.table_number || "",
  pickupTime: row.pickup_time || "",
  specialInstructions: row.special_instructions || "",
  subtotal: row.subtotal,
  total: row.total,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

// Generate order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `ORD-${timestamp}-${random}`.toUpperCase()
}

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch orders from Supabase
  const fetchOrders = useCallback(async () => {
    if (!supabase) {
      // Fallback to localStorage if Supabase not available
      const storedOrders = localStorage.getItem("cafe_orders")
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders))
      }
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        // Fallback to localStorage if Supabase fails
        const storedOrders = localStorage.getItem("cafe_orders")
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders))
        }
      } else if (data) {
        const mappedOrders = data.map(dbToOrder)
        setOrders(mappedOrders)
      }
    } catch (err) {
      console.error("Error:", err)
      // Fallback to localStorage
      const storedOrders = localStorage.getItem("cafe_orders")
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Set up real-time subscription
  useEffect(() => {
    if (!supabase) return

    let realtimeWorking = false

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Orders real-time update:", payload)
          
          if (payload.eventType === "INSERT") {
            const newOrder = dbToOrder(payload.new as DbOrder)
            setOrders((prev) => {
              // Check if order already exists to prevent duplicates
              if (prev.some(o => o.id === newOrder.id)) return prev
              return [newOrder, ...prev]
            })
            
            // Play notification sound for new order
            if (typeof window !== "undefined") {
              try {
                // Create a simple beep sound
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
                const oscillator = audioContext.createOscillator()
                const gainNode = audioContext.createGain()
                oscillator.connect(gainNode)
                gainNode.connect(audioContext.destination)
                oscillator.frequency.value = 800
                oscillator.type = "sine"
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
                oscillator.start(audioContext.currentTime)
                oscillator.stop(audioContext.currentTime + 0.5)
              } catch {}
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedOrder = dbToOrder(payload.new as DbOrder)
            setOrders((prev) =>
              prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
            )
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id
            setOrders((prev) => prev.filter((order) => order.id !== deletedId))
          }
        }
      )
      .subscribe((status) => {
        console.log("Orders realtime subscription status:", status)
        if (status === "SUBSCRIBED") {
          realtimeWorking = true
        }
      })

    // Fallback: Poll every 5 seconds if realtime doesn't work (faster for orders)
    const pollInterval = setInterval(() => {
      if (!realtimeWorking) {
        fetchOrders()
      }
    }, 5000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [fetchOrders])

  const addOrder = async (orderData: Omit<Order, "id" | "status" | "createdAt" | "updatedAt">) => {
    const orderId = generateOrderId()
    
    try {
      const { error } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: orderData.customer.name,
        customer_phone: orderData.customer.phone,
        table_number: orderData.tableNumber,
        pickup_time: orderData.pickupTime || "",
        special_instructions: orderData.specialInstructions || "",
        items: orderData.items,
        subtotal: orderData.subtotal,
        total: orderData.total,
        status: "pending",
      })

      if (error) {
        console.error("Error creating order:", error)
        // Fallback to localStorage
        const newOrder: Order = {
          ...orderData,
          id: orderId,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setOrders((prev) => [newOrder, ...prev])
        localStorage.setItem("cafe_orders", JSON.stringify([newOrder, ...orders]))
        return orderId
      }

      return orderId
    } catch (err) {
      console.error("Error:", err)
      return null
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)

      if (error) {
        console.error("Error updating order:", error)
        // Fallback to local state update
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order
          )
        )
      }
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const updateOrderNotes = async (orderId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ special_instructions: notes })
        .eq("id", orderId)

      if (error) {
        console.error("Error updating order notes:", error)
      }
      
      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, specialInstructions: notes, updatedAt: new Date().toISOString() }
            : order
        )
      )
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const getOrder = (orderId: string) => {
    return orders.find((order) => order.id === orderId)
  }

  const getPendingOrders = () => {
    return orders.filter((order) =>
      order.status === "paid" || order.status === "preparing"
    )
  }

  const getTodayOrders = () => {
    const today = new Date().toDateString()
    return orders.filter((order) => new Date(order.createdAt).toDateString() === today)
  }

  const getTodayRevenue = () => {
    return getTodayOrders()
      .filter((order) => order.status !== "cancelled")
      .reduce((total, order) => total + order.total, 0)
  }

  const refreshOrders = async () => {
    setLoading(true)
    await fetchOrders()
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrderStatus,
        updateOrderNotes,
        getOrder,
        getPendingOrders,
        getTodayOrders,
        getTodayRevenue,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export const useOrders = () => {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}
