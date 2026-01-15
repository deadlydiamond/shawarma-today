"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useOrders, Order } from "@/contexts/OrderContext"
import { useAuth } from "@/contexts/AuthContext"
import LockScreen from "@/components/admin/LockScreen"
import CashCalculator from "@/components/admin/CashCalculator"
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Bell,
  LogOut,
  Lock,
  RefreshCw,
  User,
  Package,
  CreditCard,
  Banknote,
  MapPin,
  AlertTriangle,
  LayoutGrid,
  List,
  TrendingUp,
  Utensils,
  Settings,
  Receipt,
  ArrowRight,
  Timer,
  Flame,
  Zap,
  X,
  ChevronRight,
  DollarSign,
} from "lucide-react"

const statusConfig: Record<Order["status"], { bg: string; text: string; icon: React.ReactNode; label: string; gradient: string }> = {
  pending: { bg: "bg-amber-500", text: "text-white", icon: <Bell className="h-4 w-4" />, label: "Awaiting", gradient: "from-amber-500 to-orange-500" },
  paid: { bg: "bg-emerald-500", text: "text-white", icon: <CreditCard className="h-4 w-4" />, label: "Paid", gradient: "from-emerald-500 to-green-500" },
  preparing: { bg: "bg-violet-500", text: "text-white", icon: <ChefHat className="h-4 w-4" />, label: "Cooking", gradient: "from-violet-500 to-purple-500" },
  ready: { bg: "bg-green-500", text: "text-white", icon: <Package className="h-4 w-4" />, label: "Ready", gradient: "from-green-500 to-emerald-500" },
  completed: { bg: "bg-slate-400", text: "text-white", icon: <CheckCircle className="h-4 w-4" />, label: "Done", gradient: "from-slate-400 to-gray-500" },
  cancelled: { bg: "bg-red-500", text: "text-white", icon: <XCircle className="h-4 w-4" />, label: "Cancelled", gradient: "from-red-500 to-rose-500" },
}

export default function AdminDashboard() {
  const router = useRouter()
  const { staff, isAuthenticated, loading: authLoading, logout } = useAuth()
  const { orders, loading: ordersLoading, updateOrderStatus, updatePaymentMethod, getTodayOrders, getTodayRevenue, refreshOrders } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<"active" | "completed">("active")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLocked, setIsLocked] = useState(false)
  const [showCashCalculator, setShowCashCalculator] = useState(false)
  const [cashCalculatorOrder, setCashCalculatorOrder] = useState<{ total: number; orderCode: string; order: Order } | null>(null)

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [authLoading, isAuthenticated, router])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshOrders()
    setIsRefreshing(false)
  }

  // Check if payment was collected for an order
  const isPaymentCollected = (order: Order) => {
    if (order.status === "paid" || order.status === "completed") return true
    if (order.specialInstructions) {
      const hasPaymentMarker = order.specialInstructions.includes("[PAYMENT:") || 
                               order.specialInstructions.includes("Payment:") ||
                               order.specialInstructions.includes("💳") ||
                               order.specialInstructions.includes("💵")
      if (hasPaymentMarker) return true
    }
    return false
  }

  const activeOrders = orders.filter(o => ["pending", "paid", "preparing", "ready"].includes(o.status))
  const completedOrders = orders.filter(o => ["completed", "cancelled"].includes(o.status))
  const filteredOrders = filter === "active" ? activeOrders : completedOrders
  const kitchenOrders = orders.filter(o => o.status === "paid" || o.status === "preparing")
  const needsPaymentOrders = orders.filter(o => o.status === "ready" && !isPaymentCollected(o))

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  }

  const formatPrice = (price: number) => `£${price.toFixed(2)}`

  const getWaitTime = (dateString: string) => {
    return Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-shawarma/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-shawarma border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col items-center py-6 z-50">
        {/* Logo */}
        <div className="mb-8 relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-shawarma to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
          <Image
            src="/logos/shawarma-logo.png"
            alt="Logo"
            width={48}
            height={48}
            className="rounded-xl relative z-10"
          />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          <Link
            href="/admin"
            className="p-3 rounded-xl bg-gradient-to-br from-shawarma to-orange-600 text-white shadow-lg shadow-shawarma/20 transition-all"
            title="Dashboard"
          >
            <LayoutGrid className="h-6 w-6" />
          </Link>
          <Link
            href="/pos"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
            title="POS"
          >
            <Receipt className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </Link>
          <Link
            href="/admin/menu"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
            title="Menu"
          >
            <Utensils className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </Link>
          <Link
            href="/admin/reports"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
            title="Reports"
          >
            <TrendingUp className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </Link>
          <Link
            href="/admin/settings"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
            title="Settings"
          >
            <Settings className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </Link>
        </nav>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
            title="View Website"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setIsLocked(true)}
            className="p-3 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
            title="Lock Screen"
          >
            <Lock className="h-5 w-5" />
          </button>
          <button
            onClick={() => { logout(); router.push("/admin/login") }}
            className="p-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Lock Screen */}
      {isLocked && (
        <LockScreen 
          onUnlock={() => setIsLocked(false)} 
          staffName={staff?.name}
        />
      )}

      {/* Main Content */}
      <main className="ml-20 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {currentTime.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} • {staff?.name || "Admin"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-700/50"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl px-6 py-3">
                <p className="text-xs text-emerald-400 font-medium">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold text-white">{formatPrice(getTodayRevenue())}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Needs Payment", value: needsPaymentOrders.length, icon: Banknote, color: "from-amber-500 to-orange-500", alert: needsPaymentOrders.length > 0 },
              { label: "In Kitchen", value: kitchenOrders.length, icon: Flame, color: "from-violet-500 to-purple-500", alert: false },
              { label: "Ready for Pickup", value: orders.filter(o => o.status === "ready").length, icon: Package, color: "from-emerald-500 to-green-500", alert: false },
              { label: "Today's Orders", value: getTodayOrders().length, icon: ShoppingBag, color: "from-shawarma to-orange-600", alert: false },
            ].map((stat, i) => (
              <div 
                key={stat.label} 
                className={`relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800/50 p-5 group hover:border-slate-700/50 transition-all ${stat.alert ? "ring-2 ring-amber-500/50" : ""}`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-4xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                {stat.alert && (
                  <div className="absolute top-3 right-3">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Kitchen Queue */}
          {kitchenOrders.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-violet-500/20">
                  <ChefHat className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold">Kitchen Queue</h2>
                <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs font-semibold">
                  {kitchenOrders.length} active
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {kitchenOrders
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map(order => {
                    const waitTime = getWaitTime(order.createdAt)
                    const isUrgent = waitTime >= 15
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`relative overflow-hidden bg-slate-900/80 backdrop-blur rounded-xl border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
                          isUrgent ? "border-red-500/50 shadow-red-500/10" : "border-slate-700/50 hover:border-slate-600"
                        }`}
                      >
                        {/* Status bar */}
                        <div className={`h-1 bg-gradient-to-r ${order.status === "preparing" ? "from-violet-500 to-purple-500" : "from-emerald-500 to-green-500"}`}></div>
                        
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-xl font-bold">#{order.id.slice(-4)}</span>
                            {isUrgent && (
                              <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                                <AlertTriangle className="h-3 w-3" />
                                {waitTime}m
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{order.tableNumber === "takeaway" ? "Takeaway" : `Table ${order.tableNumber}`}</span>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateOrderStatus(order.id, order.status === "paid" ? "preparing" : "ready")
                            }}
                            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                              order.status === "preparing" 
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white" 
                                : "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                            }`}
                          >
                            {order.status === "preparing" ? (
                              <><CheckCircle className="h-4 w-4" /> Ready</>
                            ) : (
                              <><Zap className="h-4 w-4" /> Start</>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800/50 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Orders</h2>
                    <div className="flex bg-slate-800/50 rounded-xl p-1">
                      <button
                        onClick={() => setFilter("active")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filter === "active" 
                            ? "bg-gradient-to-r from-shawarma to-orange-600 text-white shadow-lg shadow-shawarma/20" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Active ({activeOrders.length})
                      </button>
                      <button
                        onClick={() => setFilter("completed")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          filter === "completed" 
                            ? "bg-gradient-to-r from-shawarma to-orange-600 text-white shadow-lg shadow-shawarma/20" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        History
                      </button>
                    </div>
                  </div>
                </div>

                {/* Orders Grid */}
                <div className="p-4 grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                  {filteredOrders.length === 0 ? (
                    <div className="col-span-2 text-center py-16">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="h-8 w-8 text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium">No {filter} orders</p>
                      <p className="text-slate-500 text-sm mt-1">Orders will appear here</p>
                    </div>
                  ) : (
                    filteredOrders.map(order => {
                      const isPaid = isPaymentCollected(order)
                      const needsPayment = order.status === "ready" && !isPaid
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`relative overflow-hidden rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                            selectedOrder?.id === order.id 
                              ? "border-shawarma bg-shawarma/5 ring-1 ring-shawarma/50" 
                              : needsPayment
                                ? "border-amber-500/50 bg-amber-500/5"
                                : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50"
                          }`}
                        >
                          {/* Status bar */}
                          <div className={`h-0.5 bg-gradient-to-r ${statusConfig[order.status].gradient}`}></div>
                          
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-mono text-lg font-bold">#{order.id.slice(-4)}</span>
                              <div className="flex items-center gap-2">
                                {order.paymentMethod && (
                                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                                    order.paymentMethod === "cash" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                                  }`}>
                                    {order.paymentMethod === "cash" ? <Banknote className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                                  </span>
                                )}
                                {needsPayment && (
                                  <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                  </span>
                                )}
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${statusConfig[order.status].gradient} text-white`}>
                                  {statusConfig[order.status].label}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4 text-slate-400">
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {order.tableNumber === "takeaway" ? "Takeaway" : `T${order.tableNumber}`}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatTime(order.createdAt)}
                                </span>
                              </div>
                              <span className="font-semibold text-white">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800/50 sticky top-28">
                {selectedOrder ? (
                  <div className="p-6">
                    {/* Close button */}
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-3xl font-bold">#{selectedOrder.id.slice(-4)}</span>
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r ${statusConfig[selectedOrder.status].gradient} text-white`}>
                          {statusConfig[selectedOrder.status].label}
                        </span>
                        {selectedOrder.paymentMethod && (
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 ${
                            selectedOrder.paymentMethod === "cash" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {selectedOrder.paymentMethod === "cash" ? <Banknote className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                            {selectedOrder.paymentMethod === "cash" ? "Cash" : "Card"}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{formatTime(selectedOrder.createdAt)}</p>
                    </div>

                    {/* Location Card */}
                    <div className="bg-gradient-to-br from-shawarma to-orange-600 rounded-xl p-5 text-center mb-5 shadow-lg shadow-shawarma/20">
                      <MapPin className="h-6 w-6 mx-auto mb-2 opacity-80" />
                      <p className="text-2xl font-bold">
                        {selectedOrder.tableNumber === "takeaway" ? "TAKEAWAY" : `TABLE ${selectedOrder.tableNumber}`}
                      </p>
                    </div>

                    {/* Customer */}
                    <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl mb-5 border border-slate-700/50">
                      <div className="p-2.5 bg-slate-700/50 rounded-lg">
                        <User className="h-5 w-5 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{selectedOrder.customer.name}</p>
                        <p className="text-sm text-slate-400">Customer</p>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {selectedOrder.specialInstructions && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-5">
                        <div className="flex items-center gap-2 text-amber-400 mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-semibold">Special Notes</span>
                        </div>
                        <p className="text-sm text-amber-200/80">{selectedOrder.specialInstructions}</p>
                      </div>
                    )}

                    {/* Items */}
                    <div className="mb-5">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                              <span className="text-slate-200">{item.name}</span>
                            </div>
                            <span className="text-slate-400">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center py-4 border-t border-slate-700/50 mb-5">
                      <span className="font-semibold text-slate-300">Total</span>
                      <span className="text-3xl font-bold">{formatPrice(selectedOrder.total)}</span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      {selectedOrder.status === "pending" && (
                        <button
                          onClick={() => { updateOrderStatus(selectedOrder.id, "paid"); setSelectedOrder({ ...selectedOrder, status: "paid" }) }}
                          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          <CreditCard className="h-5 w-5" /> Confirm Payment
                        </button>
                      )}
                      {selectedOrder.status === "paid" && (
                        <button
                          onClick={() => { updateOrderStatus(selectedOrder.id, "preparing"); setSelectedOrder({ ...selectedOrder, status: "preparing" }) }}
                          className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all"
                        >
                          <ChefHat className="h-5 w-5" /> Start Cooking
                        </button>
                      )}
                      {selectedOrder.status === "preparing" && (
                        <button
                          onClick={() => { updateOrderStatus(selectedOrder.id, "ready"); setSelectedOrder({ ...selectedOrder, status: "ready" }) }}
                          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all"
                        >
                          <Package className="h-5 w-5" /> Mark Ready
                        </button>
                      )}
                      {selectedOrder.status === "ready" && (
                        isPaymentCollected(selectedOrder) ? (
                          <button
                            onClick={() => { updateOrderStatus(selectedOrder.id, "completed"); setSelectedOrder({ ...selectedOrder, status: "completed" }) }}
                            className="w-full py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                          >
                            <CheckCircle className="h-5 w-5" /> Complete Order
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                              <p className="text-sm text-amber-400 text-center font-medium flex items-center justify-center gap-2">
                                <Banknote className="h-4 w-4" />
                                Collect payment to complete
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => {
                                  setCashCalculatorOrder({ 
                                    total: selectedOrder.total, 
                                    orderCode: selectedOrder.id.slice(-4), 
                                    order: selectedOrder 
                                  })
                                  setShowCashCalculator(true)
                                }}
                                className="py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                              >
                                <Banknote className="h-5 w-5" /> Cash
                              </button>
                              <button
                                onClick={async () => { 
                                  await updatePaymentMethod(selectedOrder.id, "card")
                                  updateOrderStatus(selectedOrder.id, "completed")
                                  setSelectedOrder({ ...selectedOrder, status: "completed", paymentMethod: "card" })
                                }}
                                className="py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                              >
                                <CreditCard className="h-5 w-5" /> Card
                              </button>
                            </div>
                          </div>
                        )
                      )}
                      {!["completed", "cancelled"].includes(selectedOrder.status) && (
                        <button
                          onClick={() => { updateOrderStatus(selectedOrder.id, "cancelled"); setSelectedOrder({ ...selectedOrder, status: "cancelled" }) }}
                          className="w-full py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-all"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="h-10 w-10 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium mb-2">No Order Selected</p>
                    <p className="text-sm text-slate-500">Click on any order to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cash Calculator Modal */}
      {showCashCalculator && cashCalculatorOrder && (
        <CashCalculator
          total={cashCalculatorOrder.total}
          orderCode={cashCalculatorOrder.orderCode}
          onConfirm={async () => {
            await updatePaymentMethod(cashCalculatorOrder.order.id, "cash")
            updateOrderStatus(cashCalculatorOrder.order.id, "completed")
            if (selectedOrder?.id === cashCalculatorOrder.order.id) {
              setSelectedOrder({ ...selectedOrder, status: "completed", paymentMethod: "cash" })
            }
            setShowCashCalculator(false)
            setCashCalculatorOrder(null)
          }}
          onCancel={() => {
            setShowCashCalculator(false)
            setCashCalculatorOrder(null)
          }}
        />
      )}
    </div>
  )
}
