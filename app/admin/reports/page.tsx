"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useOrders, Order } from "@/contexts/OrderContext"
import { useAuth } from "@/contexts/AuthContext"
import {
  RefreshCw,
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  TrendingUp,
  Settings,
  ExternalLink,
  LogOut,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Banknote,
  ShoppingBag,
  Clock,
  Target,
  CreditCard,
  Wallet,
  XCircle,
  CheckCircle,
  Timer,
  Users,
  Flame,
  FileText,
  Printer,
  Download,
} from "lucide-react"

export default function ReportsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, logout } = useAuth()
  const { orders, loading, refreshOrders } = useOrders()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<"daily" | "closing">("daily")

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
  const pendingOrders = selectedDateOrders.filter((o) => o.status === "pending" || o.status === "preparing" || o.status === "ready")

  // Calculate metrics
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
  const totalItems = completedOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)
  
  // Payment breakdown
  const cashPayments = completedOrders.filter(o => o.paymentMethod === "cash")
  const cardPayments = completedOrders.filter(o => o.paymentMethod === "card")
  const cashTotal = cashPayments.reduce((sum, o) => sum + o.total, 0)
  const cardTotal = cardPayments.reduce((sum, o) => sum + o.total, 0)
  
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
    .slice(0, 8)

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

  // Peak hours
  const peakHours = Object.entries(hourlyData)
    .filter(([_, data]) => data.orders > 0)
    .sort((a, b) => b[1].orders - a[1].orders)
    .slice(0, 3)

  // Business hours (9am - 11pm typical restaurant hours)
  const businessHours = Object.entries(hourlyData).filter(([hour]) => {
    const h = parseInt(hour)
    return h >= 9 && h <= 23
  })

  const formatPrice = (price: number) => `£${price.toFixed(2)}`
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
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
  const currentDate = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

  // Sidebar navigation
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: false },
    { icon: Receipt, label: "POS", href: "/pos", active: false },
    { icon: UtensilsCrossed, label: "Menu", href: "/admin/menu", active: false },
    { icon: TrendingUp, label: "Reports", href: "/admin/reports", active: true },
    { icon: Settings, label: "Settings", href: "/admin/settings", active: false },
  ]

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-shawarma border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading reports...</p>
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
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">Reports</h1>
                    <p className="text-sm text-slate-500">{currentDate} • Admin</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => refreshOrders()}
                  className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all border border-slate-700/50"
                  title="Refresh Data"
                >
                  <RefreshCw className={`h-5 w-5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-3 bg-gradient-to-r from-shawarma to-orange-600 hover:from-shawarma/90 hover:to-orange-600/90 text-white rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-shawarma/20 transition-all"
                >
                  <Printer className="h-5 w-5" />
                  Print Report
                </button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Date Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("daily")}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    activeTab === "daily"
                      ? "bg-shawarma text-white shadow-lg shadow-shawarma/20"
                      : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Daily Report
                </button>
                <button
                  onClick={() => setActiveTab("closing")}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                    activeTab === "closing"
                      ? "bg-shawarma text-white shadow-lg shadow-shawarma/20"
                      : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Daily Closing
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-400" />
                </button>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <Calendar className="h-5 w-5 text-shawarma" />
                  <span className="font-semibold">{formatDate(selectedDate)}</span>
                  {isToday && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                      Today
                    </span>
                  )}
                </div>
                <button
                  onClick={() => changeDate(1)}
                  disabled={isToday}
                  className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl p-5 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black text-white">{formatPrice(totalRevenue)}</p>
                    <p className="text-sm text-slate-400 mt-1">Total Revenue</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Banknote className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-2xl p-5 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black text-white">{completedOrders.length}</p>
                    <p className="text-sm text-slate-400 mt-1">Completed Orders</p>
                    {cancelledOrders.length > 0 && (
                      <p className="text-xs text-red-400 mt-0.5">{cancelledOrders.length} cancelled</p>
                    )}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <ShoppingBag className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Average Order Value */}
              <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 rounded-2xl p-5 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black text-white">{formatPrice(averageOrderValue)}</p>
                    <p className="text-sm text-slate-400 mt-1">Avg Order Value</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Items Sold */}
              <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-2xl p-5 border border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black text-white">{totalItems}</p>
                    <p className="text-sm text-slate-400 mt-1">Items Sold</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <UtensilsCrossed className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {activeTab === "daily" ? (
              <>
                {/* Payment Breakdown & Peak Hours */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Payment Methods */}
                  <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-shawarma" />
                      Payment Breakdown
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Banknote className="h-5 w-5 text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold">Cash</p>
                            <p className="text-sm text-slate-400">{cashPayments.length} orders</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-green-400">{formatPrice(cashTotal)}</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold">Card</p>
                            <p className="text-sm text-slate-400">{cardPayments.length} orders</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-blue-400">{formatPrice(cardTotal)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Peak Hours */}
                  <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-shawarma" />
                      Peak Hours
                    </h3>
                    {peakHours.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No data for this day</p>
                    ) : (
                      <div className="space-y-3">
                        {peakHours.map(([hour, data], index) => (
                          <div key={hour} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                              index === 0 ? "bg-gradient-to-br from-yellow-500 to-amber-600 text-white" :
                              index === 1 ? "bg-slate-600 text-white" :
                              "bg-orange-900/50 text-orange-400"
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{hour.padStart(2, "0")}:00 - {(parseInt(hour) + 1).toString().padStart(2, "0")}:00</p>
                              <p className="text-sm text-slate-400">{data.orders} orders</p>
                            </div>
                            <p className="font-bold text-shawarma">{formatPrice(data.revenue)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Status Summary */}
                  <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Timer className="h-5 w-5 text-shawarma" />
                      Order Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span>Completed</span>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg font-bold">{completedOrders.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Timer className="h-5 w-5 text-yellow-400" />
                          <span>Pending/In Progress</span>
                        </div>
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg font-bold">{pendingOrders.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-400" />
                          <span>Cancelled</span>
                        </div>
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg font-bold">{cancelledOrders.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hourly Chart & Popular Items */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Hourly Breakdown */}
                  <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-shawarma" />
                      Hourly Sales
                    </h3>
                    {completedOrders.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No orders for this day</p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {businessHours.map(([hour, data]) => {
                          const maxOrders = Math.max(...Object.values(hourlyData).map((d) => d.orders), 1)
                          const percentage = (data.orders / maxOrders) * 100
                          return (
                            <div key={hour} className="flex items-center gap-3">
                              <span className="w-14 text-sm text-slate-500 font-mono">
                                {hour.padStart(2, "0")}:00
                              </span>
                              <div className="flex-1 h-8 bg-slate-800/50 rounded-lg overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-shawarma to-orange-500 rounded-lg flex items-center justify-end pr-3 transition-all"
                                  style={{ width: `${Math.max(percentage, data.orders > 0 ? 15 : 0)}%` }}
                                >
                                  {data.orders > 0 && (
                                    <span className="text-xs text-white font-medium">
                                      {data.orders}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="w-16 text-sm text-slate-400 text-right font-mono">
                                {formatPrice(data.revenue)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Popular Items */}
                  <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-shawarma" />
                      Best Sellers
                    </h3>
                    {popularItems.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No orders for this day</p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {popularItems.map((item, index) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                          >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                              index === 0 ? "bg-gradient-to-br from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30" :
                              index === 1 ? "bg-slate-600 text-white" :
                              index === 2 ? "bg-orange-900/50 text-orange-400" :
                              "bg-slate-800 text-slate-500"
                            }`}>
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-slate-500">{item.count} sold</p>
                            </div>
                            <p className="font-bold text-shawarma">{formatPrice(item.revenue)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Daily Closing Tab */
              <div className="space-y-6">
                {/* Closing Summary Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black">Daily Closing Summary</h2>
                      <p className="text-slate-400">{formatDate(selectedDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Store ID: SHAWARMA-001</p>
                      <p className="text-sm text-slate-400">Closing Time: 23:00</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sales Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b border-slate-700 pb-2">Sales Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gross Sales</span>
                          <span className="font-bold">{formatPrice(totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Discounts</span>
                          <span className="font-bold text-red-400">-£0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Refunds</span>
                          <span className="font-bold text-red-400">-£0.00</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-700">
                          <span className="font-bold text-lg">Net Sales</span>
                          <span className="font-black text-xl text-green-400">{formatPrice(totalRevenue)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold border-b border-slate-700 pb-2">Payment Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-green-400" />
                            <span className="text-slate-400">Cash ({cashPayments.length})</span>
                          </div>
                          <span className="font-bold">{formatPrice(cashTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-blue-400" />
                            <span className="text-slate-400">Card ({cardPayments.length})</span>
                          </div>
                          <span className="font-bold">{formatPrice(cardTotal)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-700">
                          <span className="font-bold text-lg">Total Collected</span>
                          <span className="font-black text-xl text-green-400">{formatPrice(totalRevenue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50 text-center">
                    <p className="text-4xl font-black text-white">{selectedDateOrders.length}</p>
                    <p className="text-sm text-slate-400 mt-1">Total Orders</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50 text-center">
                    <p className="text-4xl font-black text-green-400">{completedOrders.length}</p>
                    <p className="text-sm text-slate-400 mt-1">Completed</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50 text-center">
                    <p className="text-4xl font-black text-red-400">{cancelledOrders.length}</p>
                    <p className="text-sm text-slate-400 mt-1">Cancelled</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50 text-center">
                    <p className="text-4xl font-black text-shawarma">{totalItems}</p>
                    <p className="text-sm text-slate-400 mt-1">Items Sold</p>
                  </div>
                </div>

                {/* Cash Drawer */}
                <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-shawarma" />
                    Cash Drawer Reconciliation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-800/30 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Opening Float</p>
                      <p className="text-2xl font-bold">£100.00</p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-xl">
                      <p className="text-sm text-slate-400 mb-1">Cash Sales</p>
                      <p className="text-2xl font-bold text-green-400">+{formatPrice(cashTotal)}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-shawarma/20 to-orange-500/20 rounded-xl border border-shawarma/30">
                      <p className="text-sm text-slate-400 mb-1">Expected in Drawer</p>
                      <p className="text-2xl font-black text-shawarma">{formatPrice(100 + cashTotal)}</p>
                    </div>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-shawarma" />
                    All Orders ({selectedDateOrders.length})
                  </h3>
                  {selectedDateOrders.length === 0 ? (
                    <p className="text-slate-500 text-center py-12">No orders for this day</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Order</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Time</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Items</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Payment</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDateOrders.map((order) => (
                            <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 px-4 font-mono text-sm text-shawarma">#{order.id.slice(-4).toUpperCase()}</td>
                              <td className="py-3 px-4 text-sm text-slate-400">
                                {new Date(order.createdAt).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs font-medium">
                                  {order.tableNumber === "takeaway" ? "Takeaway" : 
                                   order.tableNumber === "counter" ? "Counter" :
                                   order.tableNumber === "outdoor" ? "Outdoor" :
                                   `Table ${order.tableNumber}`}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-400">
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  order.paymentMethod === "cash" 
                                    ? "bg-green-500/20 text-green-400" 
                                    : order.paymentMethod === "card"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-slate-700 text-slate-400"
                                }`}>
                                  {order.paymentMethod || "—"}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  order.status === "completed" ? "bg-green-500/20 text-green-400" :
                                  order.status === "cancelled" ? "bg-red-500/20 text-red-400" :
                                  order.status === "ready" ? "bg-blue-500/20 text-blue-400" :
                                  "bg-yellow-500/20 text-yellow-400"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-bold">{formatPrice(order.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-slate-700">
                            <td colSpan={6} className="py-4 px-4 text-right font-bold text-lg">Total Revenue:</td>
                            <td className="py-4 px-4 text-right font-black text-xl text-green-400">{formatPrice(totalRevenue)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </main>
    </div>
  )
}
