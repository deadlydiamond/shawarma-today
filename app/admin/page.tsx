"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useOrders, Order } from "@/contexts/OrderContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Coffee,
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Bell,
  LogOut,
  RefreshCw,
  User,
  Phone,
  Package,
  CreditCard,
  Banknote,
  MapPin,
  AlertTriangle,
  Edit,
  Save,
  X,
  Settings,
} from "lucide-react"

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  preparing: "bg-purple-100 text-purple-800 border-purple-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const statusLabels: Record<Order["status"], string> = {
  pending: "Awaiting Payment",
  paid: "Payment Collected",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
}

const statusIcons: Record<Order["status"], React.ReactNode> = {
  pending: <Bell className="h-4 w-4" />,
  paid: <CreditCard className="h-4 w-4" />,
  preparing: <ChefHat className="h-4 w-4" />,
  ready: <Package className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
}

// All possible order statuses
const allStatuses: Order["status"][] = ["pending", "paid", "preparing", "ready", "completed", "cancelled"]

export default function AdminDashboard() {
  const router = useRouter()
  const { staff, isAuthenticated, loading: authLoading, logout } = useAuth()
  const { orders, loading: ordersLoading, updateOrderStatus, updateOrderNotes, getTodayOrders, getTodayRevenue, refreshOrders } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [quickFilter, setQuickFilter] = useState<"all" | "active" | "completed">("active")
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">("all")
  const [tableFilter, setTableFilter] = useState<string>("all")
  const [orderTypeFilter, setOrderTypeFilter] = useState<"all" | "dine-in" | "takeaway">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState("")

  useEffect(() => {
    // Redirect if not authenticated after loading completes
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [authLoading, isAuthenticated, router])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshOrders()
    setIsRefreshing(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  // Get unique table numbers from orders
  const uniqueTables = [...new Set(orders.map(o => o.tableNumber))].sort((a, b) => {
    if (a === "takeaway") return 1
    if (b === "takeaway") return -1
    if (a === "counter") return 1
    if (b === "counter") return -1
    return Number(a) - Number(b)
  })

  // Get status counts for badges
  const statusCounts = allStatuses.reduce((acc, status) => {
    acc[status] = orders.filter(o => o.status === status).length
    return acc
  }, {} as Record<Order["status"], number>)

  // Get order type counts
  const orderTypeCounts = {
    "dine-in": orders.filter(o => o.tableNumber !== "takeaway").length,
    "takeaway": orders.filter(o => o.tableNumber === "takeaway").length
  }

  const filteredOrders = orders.filter((order) => {
    // Quick filter
    if (quickFilter === "active" && !["pending", "paid", "preparing", "ready"].includes(order.status)) {
      return false
    }
    if (quickFilter === "completed" && !["completed", "cancelled"].includes(order.status)) {
      return false
    }
    
    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false
    }
    
    // Order type filter (Dine-in vs Takeaway)
    if (orderTypeFilter === "takeaway" && order.tableNumber !== "takeaway") {
      return false
    }
    if (orderTypeFilter === "dine-in" && order.tableNumber === "takeaway") {
      return false
    }
    
    // Table filter
    if (tableFilter !== "all" && order.tableNumber !== tableFilter) {
      return false
    }
    
    return true
  })

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) => `£${price.toFixed(2)}`

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-900 rounded-xl">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Leaf & Bean</h1>
                <p className="text-sm text-gray-500">
                  {staff?.name || "Admin"} • <span className="capitalize">{staff?.role || "admin"}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/menu" 
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <Coffee className="h-4 w-4" />
                Menu
              </Link>
              <Link 
                href="/admin/reports" 
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <DollarSign className="h-4 w-4" />
                Reports
              </Link>
              <Link 
                href="/admin/settings" 
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                View Site
              </Link>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Banknote className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Awaiting Payment</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {orders.filter((o) => o.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ChefHat className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Kitchen</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {orders.filter((o) => ["paid", "preparing"].includes(o.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Today&apos;s Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{getTodayOrders().length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatPrice(getTodayRevenue())}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kitchen Queue - Orders ready for preparation */}
        {orders.filter(o => o.status === "paid" || o.status === "preparing").length > 0 && (
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-xl">
                    <ChefHat className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Kitchen Queue</h2>
                    <p className="text-sm text-gray-500">
                      {orders.filter(o => o.status === "paid" || o.status === "preparing").length} orders to prepare
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders
                  .filter(o => o.status === "paid" || o.status === "preparing")
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map(order => {
                    const waitTime = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
                    const isUrgent = waitTime >= 15
                    const isWarning = waitTime >= 10 && waitTime < 15
                    return (
                      <div
                        key={order.id}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          order.status === "preparing" 
                            ? isUrgent
                              ? "bg-red-50 border-red-400 animate-pulse"
                              : "bg-purple-50 border-purple-300" 
                            : isUrgent 
                              ? "bg-red-50 border-red-400 animate-pulse"
                              : isWarning
                                ? "bg-orange-50 border-orange-300 animate-pulse"
                                : "bg-white border-orange-200"
                        }`}
                        style={isUrgent ? { opacity: 0.7 } : undefined}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-bold text-gray-900">
                            {order.id.split("-").slice(-1)[0]}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            order.status === "preparing" 
                              ? "bg-purple-100 text-purple-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {order.status === "preparing" ? "Preparing" : "Ready to Start"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium">
                            {order.tableNumber === "takeaway" ? "Takeaway" : 
                             order.tableNumber === "counter" ? "Counter" :
                             `Table ${order.tableNumber}`}
                          </span>
                        </div>
                        {order.pickupTime && (
                          <div className="flex items-center gap-2 text-sm text-amber-700 mb-1">
                            <Clock className="h-3 w-3" />
                            <span className="font-semibold">
                              {order.pickupTime === "asap" ? "ASAP" : order.pickupTime}
                            </span>
                          </div>
                        )}
                        <div className={`text-xs mb-3 flex items-center gap-1 ${isUrgent ? "text-red-600 font-medium" : isWarning ? "text-orange-600" : "text-gray-500"}`}>
                          {order.items.length} item{order.items.length > 1 ? "s" : ""} • 
                          {isUrgent && <AlertTriangle className="h-3 w-3" />}
                          {waitTime}min ago
                        </div>
                        {order.specialInstructions && (
                          <div className="text-xs bg-amber-100 text-amber-800 p-2 rounded-lg mb-3 flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{order.specialInstructions}</span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {order.status === "paid" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order.id, "preparing")
                              }}
                              className="flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-1"
                              style={{ backgroundColor: '#9333ea', color: 'white' }}
                            >
                              <ChefHat className="h-4 w-4" />
                              Start
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order.id, "ready")
                              }}
                              className="flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-1"
                              style={{ backgroundColor: '#16a34a', color: 'white' }}
                            >
                              <Package className="h-4 w-4" />
                              Ready
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="space-y-4 mb-6">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refresh orders"
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      </button>
                      {ordersLoading && <span className="text-sm text-gray-500">Loading...</span>}
                      <span className="text-sm text-gray-400">
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {/* Quick filters */}
                    <div className="flex gap-2">
                      {(["active", "all", "completed"] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setQuickFilter(f)
                            setStatusFilter("all") // Reset status filter when changing quick filter
                          }}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            quickFilter === f
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Status filters */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 py-1">Status:</span>
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        statusFilter === "all"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      All
                    </button>
                    {allStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                          statusFilter === status
                            ? statusColors[status].replace("border-", "ring-1 ring-")
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {statusIcons[status]}
                        {statusLabels[status]}
                        {statusCounts[status] > 0 && (
                          <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full ${
                            statusFilter === status ? "bg-white/20" : "bg-gray-200"
                          }`}>
                            {statusCounts[status]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Order Type filters (Dine-in / Takeaway) */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 py-1">Type:</span>
                    <button
                      onClick={() => {
                        setOrderTypeFilter("all")
                        setTableFilter("all")
                      }}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        orderTypeFilter === "all"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        setOrderTypeFilter("dine-in")
                        setTableFilter("all")
                      }}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                        orderTypeFilter === "dine-in"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      🍽️ Dine In
                      {orderTypeCounts["dine-in"] > 0 && (
                        <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full ${
                          orderTypeFilter === "dine-in" ? "bg-white/20" : "bg-gray-200"
                        }`}>
                          {orderTypeCounts["dine-in"]}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setOrderTypeFilter("takeaway")
                        setTableFilter("all")
                      }}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                        orderTypeFilter === "takeaway"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      🥡 Takeaway
                      {orderTypeCounts["takeaway"] > 0 && (
                        <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full ${
                          orderTypeFilter === "takeaway" ? "bg-white/20" : "bg-gray-200"
                        }`}>
                          {orderTypeCounts["takeaway"]}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  {/* Table filters - only show for dine-in orders */}
                  {orderTypeFilter !== "takeaway" && uniqueTables.filter(t => t !== "takeaway").length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500 py-1">Table:</span>
                      <button
                        onClick={() => setTableFilter("all")}
                        className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                          tableFilter === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        All Tables
                      </button>
                      {uniqueTables.filter(t => t !== "takeaway").map((table) => (
                        <button
                          key={table}
                          onClick={() => setTableFilter(table)}
                          className={`px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                            tableFilter === table
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <MapPin className="h-3 w-3" />
                          {table === "counter" ? "Counter" :
                           table === "outdoor" ? "Outdoor" :
                           `Table ${table}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                    <p className="text-sm text-gray-400 mt-1">Orders will appear here when customers place them</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const orderAge = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
                      const isLate = orderAge >= 15 && order.status !== "completed" && order.status !== "cancelled"
                      const isPending = order.status === "pending"
                      
                      return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedOrder?.id === order.id
                            ? "border-gray-900 bg-gray-50"
                            : isPending
                              ? "border-yellow-300 bg-yellow-50 animate-pulse"
                              : isLate
                                ? "border-red-300 bg-red-50 animate-pulse"
                                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                        style={isLate && !isPending ? { opacity: 0.7 } : undefined}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{order.id}</span>
                              {order.status === "pending" && (
                                <span className="flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{order.customer.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Table Number Badge */}
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-600 text-white flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {order.tableNumber === "takeaway" ? "Takeaway" : 
                               order.tableNumber === "counter" ? "Counter" :
                               order.tableNumber === "outdoor" ? "Outdoor" :
                               `Table ${order.tableNumber}`}
                            </span>
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1.5 ${
                                statusColors[order.status]
                              }`}
                            >
                              {statusIcons[order.status]}
                              {statusLabels[order.status]}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatTime(order.createdAt)}
                            </span>
                            {order.pickupTime && (
                              <span className="flex items-center gap-1 text-amber-600 font-medium">
                                ⏰ {order.pickupTime === "asap" ? "ASAP" : order.pickupTime}
                              </span>
                            )}
                            <span>{order.items.length} items</span>
                            {isLate && (
                              <span className="text-red-600 font-medium flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {orderAge}min
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            <Card className="bg-white sticky top-24">
              <CardContent className="p-6">
                {selectedOrder ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${
                          statusColors[selectedOrder.status]
                        }`}
                      >
                        {statusLabels[selectedOrder.status]}
                      </span>
                    </div>

                    {/* Order ID & Time */}
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <p className="font-mono text-sm text-gray-500 mb-1">{selectedOrder.id}</p>
                      <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
                    </div>

                    {/* Table Number & Pickup Time - Prominent */}
                    <div className="mb-6 pb-6 border-b border-gray-100 space-y-3">
                      <div className="bg-blue-600 text-white rounded-xl p-4 text-center">
                        <p className="text-xs uppercase tracking-wide opacity-80 mb-1">Deliver To</p>
                        <p className="text-2xl font-bold flex items-center justify-center gap-2">
                          <MapPin className="h-6 w-6" />
                          {selectedOrder.tableNumber === "takeaway" ? "TAKEAWAY" : 
                           selectedOrder.tableNumber === "counter" ? "COUNTER" :
                           selectedOrder.tableNumber === "outdoor" ? "OUTDOOR" :
                           `TABLE ${selectedOrder.tableNumber}`}
                        </p>
                      </div>
                      {/* Pickup Time */}
                      {selectedOrder.pickupTime && (
                        <div className="bg-amber-500 text-white rounded-xl p-4 text-center">
                          <p className="text-xs uppercase tracking-wide opacity-80 mb-1">
                            {selectedOrder.tableNumber === "takeaway" ? "Pickup Time" : "Serve At"}
                          </p>
                          <p className="text-2xl font-bold flex items-center justify-center gap-2">
                            <Clock className="h-6 w-6" />
                            {selectedOrder.pickupTime === "asap" ? "ASAP" : selectedOrder.pickupTime}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Special Instructions / Allergies - Editable */}
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <div className={`rounded-xl p-4 ${selectedOrder.specialInstructions ? "bg-amber-50 border-2 border-amber-300" : "bg-gray-50 border border-gray-200"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-amber-800">
                            <AlertTriangle className={`h-5 w-5 ${selectedOrder.specialInstructions ? "text-amber-600" : "text-gray-400"}`} />
                            <h3 className={`font-semibold ${selectedOrder.specialInstructions ? "text-amber-800" : "text-gray-600"}`}>
                              Special Instructions / Allergies
                            </h3>
                          </div>
                          {!editingNotes && selectedOrder.status !== "completed" && selectedOrder.status !== "cancelled" && (
                            <button
                              onClick={() => {
                                setEditingNotes(true)
                                setNotesValue(selectedOrder.specialInstructions || "")
                              }}
                              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        {editingNotes ? (
                          <div className="space-y-2">
                            <textarea
                              value={notesValue}
                              onChange={(e) => setNotesValue(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                              rows={3}
                              placeholder="Add special instructions, allergies, modifications..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  updateOrderNotes(selectedOrder.id, notesValue)
                                  setSelectedOrder({ ...selectedOrder, specialInstructions: notesValue })
                                  setEditingNotes(false)
                                }}
                                className="flex items-center px-3 py-1.5 text-sm rounded-lg font-medium"
                                style={{ backgroundColor: '#d97706', color: 'white' }}
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingNotes(false)}
                                className="flex items-center px-3 py-1.5 text-sm rounded-lg border font-medium"
                                style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className={`font-medium ${selectedOrder.specialInstructions ? "text-amber-900" : "text-gray-400 italic"}`}>
                            {selectedOrder.specialInstructions || "No special instructions"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{selectedOrder.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${selectedOrder.customer.phone}`} className="hover:text-gray-900 hover:underline">
                            {selectedOrder.customer.phone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <div>
                              <span className="text-gray-900">
                                {item.quantity}x {item.name}
                              </span>
                              {item.selected_size && item.selected_size !== "regular" && (
                                <span className="text-gray-500 ml-1">({item.selected_size})</span>
                              )}
                            </div>
                            <span className="text-gray-600">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Subtotal</span>
                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>Total</span>
                        <span>{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>

                    {/* Payment Warning for Pending Orders */}
                    {selectedOrder.status === "pending" && (
                      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-center gap-2 text-yellow-800 mb-2">
                          <Banknote className="h-5 w-5" />
                          <span className="font-semibold">Payment Required</span>
                        </div>
                        <p className="text-sm text-yellow-700">
                          Collect payment from customer before preparing this order.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                      {/* Collect Payment Button - Prominent for pending orders */}
                      {selectedOrder.status === "pending" && (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, "paid")
                            setSelectedOrder({ ...selectedOrder, status: "paid" })
                          }}
                          className="w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                          style={{ backgroundColor: '#059669', color: 'white' }}
                        >
                          <CreditCard className="h-6 w-6" />
                          ✓ Confirm Payment Collected
                        </button>
                      )}

                      {/* Start Preparing Button - Only after payment */}
                      {selectedOrder.status === "paid" && (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, "preparing")
                            setSelectedOrder({ ...selectedOrder, status: "preparing" })
                          }}
                          className="w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                          style={{ backgroundColor: '#9333ea', color: 'white' }}
                        >
                          <ChefHat className="h-6 w-6" />
                          Start Preparing
                        </button>
                      )}

                      {/* Mark Ready Button */}
                      {selectedOrder.status === "preparing" && (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, "ready")
                            setSelectedOrder({ ...selectedOrder, status: "ready" })
                          }}
                          className="w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                          style={{ backgroundColor: '#16a34a', color: 'white' }}
                        >
                          <Package className="h-6 w-6" />
                          Mark Ready for Pickup
                        </button>
                      )}

                      {/* Complete Order Button */}
                      {selectedOrder.status === "ready" && (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, "completed")
                            setSelectedOrder({ ...selectedOrder, status: "completed" })
                          }}
                          className="w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                          style={{ backgroundColor: '#1f2937', color: 'white' }}
                        >
                          <CheckCircle className="h-6 w-6" />
                          Complete Order
                        </button>
                      )}

                      {/* Cancel Button */}
                      {selectedOrder.status !== "cancelled" && selectedOrder.status !== "completed" && (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, "cancelled")
                            setSelectedOrder({ ...selectedOrder, status: "cancelled" })
                          }}
                          className="w-full py-2 px-4 rounded-xl font-medium border transition-colors"
                          style={{ color: '#dc2626', borderColor: '#fecaca', backgroundColor: 'white' }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select an order</p>
                    <p className="text-sm text-gray-400 mt-1">Click on an order to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
