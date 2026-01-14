"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useOrders, Order } from "@/contexts/OrderContext"
import { useAuth } from "@/contexts/AuthContext"
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Bell,
  LogOut,
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
} from "lucide-react"

const statusConfig: Record<Order["status"], { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  pending: { bg: "bg-amber-500", text: "text-white", icon: <Bell className="h-4 w-4" />, label: "Awaiting Payment" },
  paid: { bg: "bg-emerald-500", text: "text-white", icon: <CreditCard className="h-4 w-4" />, label: "Paid" },
  preparing: { bg: "bg-purple-500", text: "text-white", icon: <ChefHat className="h-4 w-4" />, label: "Preparing" },
  ready: { bg: "bg-green-500", text: "text-white", icon: <Package className="h-4 w-4" />, label: "Ready" },
  completed: { bg: "bg-gray-400", text: "text-white", icon: <CheckCircle className="h-4 w-4" />, label: "Completed" },
  cancelled: { bg: "bg-red-500", text: "text-white", icon: <XCircle className="h-4 w-4" />, label: "Cancelled" },
}

export default function AdminDashboard() {
  const router = useRouter()
  const { staff, isAuthenticated, loading: authLoading, logout } = useAuth()
  const { orders, loading: ordersLoading, updateOrderStatus, getTodayOrders, getTodayRevenue, refreshOrders } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState<"active" | "completed">("active")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  const activeOrders = orders.filter(o => ["pending", "paid", "preparing", "ready"].includes(o.status))
  const completedOrders = orders.filter(o => ["completed", "cancelled"].includes(o.status))
  const filteredOrders = filter === "active" ? activeOrders : completedOrders

  const kitchenOrders = orders.filter(o => o.status === "paid" || o.status === "preparing")

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  }

  const formatPrice = (price: number) => `£${price.toFixed(2)}`

  const getWaitTime = (dateString: string) => {
    return Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-shawarma" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-gray-900 flex flex-col items-center py-6 z-50">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logos/shawarma-logo.png"
            alt="Logo"
            width={48}
            height={48}
            className="rounded-xl"
          />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          <Link
            href="/admin"
            className="p-3 rounded-xl bg-shawarma text-white transition-colors"
            title="Dashboard"
          >
            <LayoutGrid className="h-6 w-6" />
          </Link>
          <Link
            href="/pos"
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="POS - Walk-in Orders"
          >
            <Receipt className="h-6 w-6" />
          </Link>
          <Link
            href="/admin/menu"
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Menu Management"
          >
            <Utensils className="h-6 w-6" />
          </Link>
          <Link
            href="/admin/reports"
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Reports"
          >
            <TrendingUp className="h-6 w-6" />
          </Link>
          <Link
            href="/admin/settings"
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Settings"
          >
            <Settings className="h-6 w-6" />
          </Link>
        </nav>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="View Website"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <button
            onClick={() => { logout(); router.push("/admin/login") }}
            className="p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-20 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {staff?.name || "Admin"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(getTodayRevenue())}</p>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending Payment", value: orders.filter(o => o.status === "pending").length, icon: Banknote, color: "bg-amber-500" },
            { label: "In Kitchen", value: kitchenOrders.length, icon: ChefHat, color: "bg-purple-500" },
            { label: "Ready", value: orders.filter(o => o.status === "ready").length, icon: Package, color: "bg-green-500" },
            { label: "Today's Orders", value: getTodayOrders().length, icon: ShoppingBag, color: "bg-shawarma" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kitchen Queue */}
        {kitchenOrders.length > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-white">
                <ChefHat className="h-6 w-6" />
                <h2 className="text-xl font-bold">Kitchen Queue</h2>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{kitchenOrders.length} orders</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {kitchenOrders
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map(order => {
                  const waitTime = getWaitTime(order.createdAt)
                  const isUrgent = waitTime >= 15
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${isUrgent ? "ring-2 ring-red-500" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-gray-900">#{order.id.slice(-4)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].bg} ${statusConfig[order.status].text}`}>
                          {order.status === "preparing" ? "Cooking" : "New"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="h-3 w-3" />
                        {order.tableNumber === "takeaway" ? "Takeaway" : `Table ${order.tableNumber}`}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Timer className="h-3 w-3" />
                        <span className={isUrgent ? "text-red-600 font-semibold" : ""}>{waitTime}min</span>
                        {isUrgent && <AlertTriangle className="h-3 w-3 text-red-500" />}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateOrderStatus(order.id, order.status === "paid" ? "preparing" : "ready")
                        }}
                        className={`w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                          order.status === "preparing" ? "bg-green-500 hover:bg-green-600" : "bg-purple-500 hover:bg-purple-600"
                        }`}
                      >
                        {order.status === "preparing" ? "Ready ✓" : "Start →"}
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Orders Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-900">Orders</h2>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setFilter("active")}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        filter === "active" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                      }`}
                    >
                      Active ({activeOrders.length})
                    </button>
                    <button
                      onClick={() => setFilter("completed")}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        filter === "completed" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                      }`}
                    >
                      History
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Orders */}
              <div className={`p-4 ${viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-2"}`}>
                {filteredOrders.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No {filter} orders</p>
                  </div>
                ) : (
                  filteredOrders.map(order => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedOrder?.id === order.id ? "border-shawarma bg-orange-50" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-gray-900">#{order.id.slice(-4)}</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${statusConfig[order.status].bg} ${statusConfig[order.status].text}`}>
                          {statusConfig[order.status].icon}
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3 text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.tableNumber === "takeaway" ? "Takeaway" : `T${order.tableNumber}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(order.createdAt)}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 sticky top-6">
              {selectedOrder ? (
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="font-mono text-sm text-gray-500">Order</p>
                      <h3 className="text-xl font-bold text-gray-900">#{selectedOrder.id.slice(-4)}</h3>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${statusConfig[selectedOrder.status].bg} ${statusConfig[selectedOrder.status].text}`}>
                      {statusConfig[selectedOrder.status].label}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="bg-shawarma rounded-xl p-4 text-white text-center mb-4">
                    <p className="text-xs uppercase tracking-wide opacity-80">Deliver To</p>
                    <p className="text-2xl font-bold">
                      {selectedOrder.tableNumber === "takeaway" ? "TAKEAWAY" : `TABLE ${selectedOrder.tableNumber}`}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedOrder.customer.name}</p>
                      <p className="text-sm text-gray-500">{formatTime(selectedOrder.createdAt)}</p>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {selectedOrder.specialInstructions && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                      <div className="flex items-center gap-2 text-amber-700 mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-semibold">Special Instructions</span>
                      </div>
                      <p className="text-sm text-amber-800">{selectedOrder.specialInstructions}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-900">{item.quantity}x {item.name}</span>
                          <span className="text-gray-600">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 border-t border-gray-100 mb-4">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(selectedOrder.total)}</span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {selectedOrder.status === "pending" && (
                      <button
                        onClick={() => { updateOrderStatus(selectedOrder.id, "paid"); setSelectedOrder({ ...selectedOrder, status: "paid" }) }}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <CreditCard className="h-5 w-5" /> Confirm Payment
                      </button>
                    )}
                    {selectedOrder.status === "paid" && (
                      <button
                        onClick={() => { updateOrderStatus(selectedOrder.id, "preparing"); setSelectedOrder({ ...selectedOrder, status: "preparing" }) }}
                        className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <ChefHat className="h-5 w-5" /> Start Preparing
                      </button>
                    )}
                    {selectedOrder.status === "preparing" && (
                      <button
                        onClick={() => { updateOrderStatus(selectedOrder.id, "ready"); setSelectedOrder({ ...selectedOrder, status: "ready" }) }}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <Package className="h-5 w-5" /> Mark Ready
                      </button>
                    )}
                    {selectedOrder.status === "ready" && (
                      <button
                        onClick={() => { updateOrderStatus(selectedOrder.id, "completed"); setSelectedOrder({ ...selectedOrder, status: "completed" }) }}
                        className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" /> Complete
                      </button>
                    )}
                    {!["completed", "cancelled"].includes(selectedOrder.status) && (
                      <button
                        onClick={() => { updateOrderStatus(selectedOrder.id, "cancelled"); setSelectedOrder({ ...selectedOrder, status: "cancelled" }) }}
                        className="w-full py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Select an order</p>
                  <p className="text-sm text-gray-400">Click on any order to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
