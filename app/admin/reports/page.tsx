"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useOrders, Order } from "@/contexts/OrderContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  RefreshCw,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  Coffee,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react"

export default function ReportsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { orders, loading, refreshOrders } = useOrders()
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [authLoading, isAuthenticated, router])

  // Filter orders for selected date
  const getOrdersForDate = (date: Date) => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt).toDateString()
      return orderDate === date.toDateString()
    })
  }

  const selectedDateOrders = getOrdersForDate(selectedDate)
  const completedOrders = selectedDateOrders.filter((o) => o.status === "completed")
  const cancelledOrders = selectedDateOrders.filter((o) => o.status === "cancelled")

  // Calculate metrics
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
  
  // Get popular items
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {}
  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 }
      }
      itemCounts[item.name].count += item.quantity
      itemCounts[item.name].revenue += parseFloat(item.price.replace("£", "")) * item.quantity
    })
  })
  const popularItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Hourly breakdown
  const hourlyData: Record<number, { orders: number; revenue: number }> = {}
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { orders: 0, revenue: 0 }
  }
  completedOrders.forEach((order) => {
    const hour = new Date(order.createdAt).getHours()
    hourlyData[hour].orders++
    hourlyData[hour].revenue += order.total
  })

  // Peak hours (orders > 0)
  const peakHours = Object.entries(hourlyData)
    .filter(([_, data]) => data.orders > 0)
    .sort((a, b) => b[1].orders - a[1].orders)
    .slice(0, 3)

  const formatPrice = (price: number) => `£${price.toFixed(2)}`
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    if (newDate <= new Date()) {
      setSelectedDate(newDate)
    }
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  if (authLoading || !isAuthenticated) {
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
        <div className="max-w-7xl mx-auto px-6 py-4">
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
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Daily Reports</h1>
                  <p className="text-sm text-gray-500">Sales analytics and insights</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => refreshOrders()}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors"
              style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Date Selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button 
            onClick={() => changeDate(-1)}
            className="p-2 rounded-lg border transition-colors"
            style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-gray-200">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-gray-900">{formatDate(selectedDate)}</span>
            {isToday && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Today
              </span>
            )}
          </div>
          <button
            onClick={() => changeDate(1)}
            disabled={isToday}
            className="p-2 rounded-lg border transition-colors disabled:opacity-50"
            style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-shawarma rounded-xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
                  {cancelledOrders.length > 0 && (
                    <p className="text-xs text-red-500">{cancelledOrders.length} cancelled</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(averageOrderValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Peak Hour</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {peakHours.length > 0 ? `${peakHours[0][0]}:00` : "—"}
                  </p>
                  {peakHours.length > 0 && (
                    <p className="text-xs text-gray-500">{peakHours[0][1].orders} orders</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Items */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Coffee className="h-5 w-5" />
                Popular Items
              </h3>
              {popularItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders for this day</p>
              ) : (
                <div className="space-y-3">
                  {popularItems.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-gray-200 text-gray-700" :
                          index === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.count} sold</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">{formatPrice(item.revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hourly Breakdown */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hourly Breakdown
              </h3>
              {completedOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders for this day</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(hourlyData)
                    .filter(([_, data]) => data.orders > 0)
                    .map(([hour, data]) => {
                      const maxOrders = Math.max(...Object.values(hourlyData).map((d) => d.orders))
                      const percentage = (data.orders / maxOrders) * 100
                      return (
                        <div key={hour} className="flex items-center gap-3">
                          <span className="w-16 text-sm text-gray-600 font-mono">
                            {hour.padStart(2, "0")}:00
                          </span>
                          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-lg flex items-center justify-end pr-2 transition-all"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 30 && (
                                <span className="text-xs text-white font-medium">
                                  {data.orders}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="w-20 text-sm text-gray-600 text-right">
                            {formatPrice(data.revenue)}
                          </span>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="bg-white mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              All Orders ({selectedDateOrders.length})
            </h3>
            {selectedDateOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders for this day</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Table</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Items</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDateOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{order.id}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4 text-sm">{order.customer.name}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {order.tableNumber === "takeaway" ? "Takeaway" : 
                             order.tableNumber === "counter" ? "Counter" :
                             order.tableNumber === "outdoor" ? "Outdoor" :
                             `Table ${order.tableNumber}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.status === "completed" ? "bg-green-100 text-green-700" :
                            order.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">{formatPrice(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
