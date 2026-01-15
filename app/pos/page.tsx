"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { useOrders } from "@/contexts/OrderContext"
import { useSettings } from "@/contexts/SettingsContext"
import LockScreen from "@/components/admin/LockScreen"
import CashCalculator from "@/components/admin/CashCalculator"
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  MapPin,
  Printer,
  ShoppingBag,
  ArrowLeft,
  X,
  CheckCircle,
  LayoutGrid,
  Clock,
  Receipt,
  CreditCard,
  Banknote,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Pause,
  Play,
  Lock,
  Percent,
  ChefHat,
  Package,
  Zap,
} from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
}

interface OrderReceipt {
  orderId: string
  orderCode: string
  items: CartItem[]
  subtotal: number
  total: number
  customer: string
  tableNumber: string
  timestamp: Date
  prepTime: number
  readyTime: Date
  isPaid: boolean
}

const generateOrderCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

const menuCategories = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "pizzas", name: "Pizzas", icon: "🍕" },
  { id: "wraps", name: "Wraps", icon: "🌯" },
  { id: "sandwiches", name: "Sandwiches", icon: "🥪" },
  { id: "grill", name: "Grill", icon: "🍢" },
  { id: "meals", name: "Meals", icon: "🍽️" },
  { id: "fatayer", name: "Fatayer", icon: "🫓" },
  { id: "extras", name: "Extras", icon: "🍟" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
]

const menuItems: CartItem[] = [
  { id: "p1", name: "Margherita Pizza", price: 4.99, quantity: 0, category: "pizzas" },
  { id: "p2", name: "Chicken Pizza", price: 5.99, quantity: 0, category: "pizzas" },
  { id: "p3", name: "Lamb Pizza", price: 6.99, quantity: 0, category: "pizzas" },
  { id: "p4", name: "Meat Feast", price: 6.99, quantity: 0, category: "pizzas" },
  { id: "p5", name: "Veggie Pizza", price: 5.50, quantity: 0, category: "pizzas" },
  { id: "p6", name: "Mighty Meaty", price: 6.99, quantity: 0, category: "pizzas" },
  { id: "p7", name: "Garlic Bread w/ Cheese", price: 3.99, quantity: 0, category: "pizzas" },
  { id: "w1", name: "Lamb Shawarma Wrap", price: 4.99, quantity: 0, category: "wraps" },
  { id: "w2", name: "Chicken Shawarma Wrap", price: 4.50, quantity: 0, category: "wraps" },
  { id: "w3", name: "Falafel Wrap", price: 4.99, quantity: 0, category: "wraps" },
  { id: "s1", name: "Lamb Shawarma Sandwich", price: 4.99, quantity: 0, category: "sandwiches" },
  { id: "s2", name: "Chicken Shawarma Sandwich", price: 4.50, quantity: 0, category: "sandwiches" },
  { id: "g1", name: "Mix Platter", price: 60.00, quantity: 0, category: "grill" },
  { id: "g2", name: "Mix Kebab Full", price: 17.00, quantity: 0, category: "grill" },
  { id: "g3", name: "Mix Kebab Half", price: 14.00, quantity: 0, category: "grill" },
  { id: "g4", name: "Lamb Chops (5) + Salad & Naan", price: 13.00, quantity: 0, category: "grill" },
  { id: "g5", name: "Lamb Chops (5) + Rice & Soup", price: 16.00, quantity: 0, category: "grill" },
  { id: "g6", name: "Lamb Kebab (2)", price: 11.00, quantity: 0, category: "grill" },
  { id: "g7", name: "Lamb Tikka (2)", price: 13.00, quantity: 0, category: "grill" },
  { id: "g8", name: "Chicken Tikka (2)", price: 10.00, quantity: 0, category: "grill" },
  { id: "g9", name: "Chicken Wings (10)", price: 9.00, quantity: 0, category: "grill" },
  { id: "g10", name: "Dolma (Sat Only)", price: 12.00, quantity: 0, category: "grill" },
  { id: "m1", name: "Lamb Shawarma Meal", price: 7.99, quantity: 0, category: "meals" },
  { id: "m2", name: "Chicken Shawarma Meal", price: 6.99, quantity: 0, category: "meals" },
  { id: "m3", name: "Falafel Meal (6 pcs)", price: 5.99, quantity: 0, category: "meals" },
  { id: "f1", name: "Chicken Fatayer", price: 4.99, quantity: 0, category: "fatayer" },
  { id: "f2", name: "Lamb Fatayer", price: 5.99, quantity: 0, category: "fatayer" },
  { id: "f3", name: "Mix Fatayer", price: 5.50, quantity: 0, category: "fatayer" },
  { id: "f4", name: "Veggie Fatayer", price: 4.99, quantity: 0, category: "fatayer" },
  { id: "f5", name: "Cheese Fatayer", price: 3.99, quantity: 0, category: "fatayer" },
  { id: "e1", name: "Chips", price: 2.50, quantity: 0, category: "extras" },
  { id: "e2", name: "Fresh Salad", price: 2.50, quantity: 0, category: "extras" },
  { id: "e3", name: "Falafel (Side)", price: 3.99, quantity: 0, category: "extras" },
  { id: "e4", name: "Hummus", price: 3.00, quantity: 0, category: "extras" },
  { id: "e5", name: "Tub of Sauce", price: 0.50, quantity: 0, category: "extras" },
  { id: "e6", name: "Extra Toppings", price: 0.70, quantity: 0, category: "extras" },
  { id: "e7", name: "Extra Cheese", price: 1.00, quantity: 0, category: "extras" },
  { id: "d1", name: "Can of Drink", price: 1.00, quantity: 0, category: "drinks" },
  { id: "d2", name: "Bottle", price: 1.50, quantity: 0, category: "drinks" },
  { id: "d3", name: "Ayran", price: 1.00, quantity: 0, category: "drinks" },
]

export default function POSPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { addOrder, orders, updateOrderStatus, updateOrderNotes, updatePaymentMethod } = useOrders()
  const { settings } = useSettings()
  
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [tableNumber, setTableNumber] = useState("counter")
  const [prepTime, setPrepTime] = useState(10)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<OrderReceipt | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)
  
  const [heldOrders, setHeldOrders] = useState<Array<{ id: string; name: string; items: CartItem[]; table: string; time: Date }>>([])
  const [showHeldOrders, setShowHeldOrders] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [showDiscount, setShowDiscount] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")
  
  const [showPaymentLookup, setShowPaymentLookup] = useState(false)
  const [paymentSearchCode, setPaymentSearchCode] = useState("")
  const [foundOrder, setFoundOrder] = useState<typeof orders[0] | null>(null)
  const [showActiveOrders, setShowActiveOrders] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cash" | "card" | "later">("later")
  const [isLocked, setIsLocked] = useState(false)
  const [showCashCalculator, setShowCashCalculator] = useState(false)
  const [cashCalculatorOrder, setCashCalculatorOrder] = useState<{ total: number; orderCode: string; order?: typeof orders[0] } | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getOrderCode = (order: typeof orders[0]) => {
    const codeMatch = order.specialInstructions?.match(/#(\d{4})/)
    return codeMatch ? codeMatch[1] : order.id.slice(-4)
  }

  const activeOrders = orders.filter(o => 
    !["completed", "cancelled"].includes(o.status)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const unpaidOrders = orders.filter(o => 
    o.specialInstructions?.includes("💰 UNPAID") && 
    !["completed", "cancelled"].includes(o.status)
  )

  const filteredUnpaidOrders = paymentSearchCode.trim() 
    ? unpaidOrders.filter(o => {
        const code = getOrderCode(o)
        const searchTerm = paymentSearchCode.trim().replace("#", "").toLowerCase()
        return code.includes(searchTerm) || o.customer.name.toLowerCase().includes(searchTerm)
      })
    : unpaidOrders

  const searchOrderByCode = () => {
    const code = paymentSearchCode.trim().replace("#", "")
    if (!code) return
    const order = orders.find(o => {
      const orderCode = getOrderCode(o)
      return orderCode === code || o.specialInstructions?.includes(`#${code}`) || o.customer.name.includes(`#${code}`)
    })
    setFoundOrder(order || null)
  }
  
  const markAsPaid = async (order?: typeof orders[0], paymentMethod?: "cash" | "card") => {
    const targetOrder = order || foundOrder
    if (!targetOrder) return
    const newInstructions = targetOrder.specialInstructions?.replace("💰 UNPAID", "✅ PAID") || "✅ PAID"
    await updateOrderNotes(targetOrder.id, newInstructions)
    if (paymentMethod) {
      await updatePaymentMethod(targetOrder.id, paymentMethod)
    }
    if (foundOrder && foundOrder.id === targetOrder.id) {
      setFoundOrder({ ...foundOrder, specialInstructions: newInstructions, paymentMethod })
    }
  }

  const markAsReady = async (orderId: string) => await updateOrderStatus(orderId, "ready")
  const markAsComplete = async (orderId: string) => await updateOrderStatus(orderId, "completed")

  const holdOrder = () => {
    if (cart.length === 0) return
    setHeldOrders(prev => [...prev, {
      id: `held-${Date.now()}`,
      name: customerName || `Table ${tableNumber}`,
      items: [...cart],
      table: tableNumber,
      time: new Date()
    }])
    clearCart()
  }

  const recallOrder = (heldId: string) => {
    const held = heldOrders.find(h => h.id === heldId)
    if (held) {
      setCart(held.items)
      setTableNumber(held.table)
      setCustomerName(held.name)
      setHeldOrders(prev => prev.filter(h => h.id !== heldId))
      setShowHeldOrders(false)
    }
  }

  const clearCart = () => {
    setCart([])
    setCustomerName("")
    setTableNumber("counter")
    setDiscount(0)
    setOrderNotes("")
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = subtotal * (discount / 100)
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * ((settings.taxRate || 0) / 100)
  const total = afterDiscount + taxAmount

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [authLoading, isAuthenticated, router])

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id))

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return
    setIsProcessing(true)
    
    const orderCode = generateOrderCode()
    const displayName = customerName.trim() || `Order #${orderCode}`
    const now = new Date()
    const readyTime = new Date(now.getTime() + prepTime * 60000)
    
    try {
      const orderItems = cart.map(item => ({
        id: item.id, name: item.name, price: `£${item.price.toFixed(2)}`,
        quantity: item.quantity, category: item.category, image: "", description: "",
      }))

      let instructions = `#${orderCode} | Ready ${readyTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
      if (discount > 0) instructions += ` | ${discount}% OFF (-£${discountAmount.toFixed(2)})`
      if (orderNotes.trim()) instructions += ` | Note: ${orderNotes.trim()}`
      instructions += " | 💰 UNPAID"

      const orderId = await addOrder({
        items: orderItems,
        customer: { name: displayName, phone: "" },
        subtotal, total, tableNumber,
        specialInstructions: instructions,
        status: "preparing",
      })

      setLastReceipt({
        orderId: orderId || `WI-${Date.now().toString(36).toUpperCase()}`,
        orderCode, items: cart, subtotal, total,
        customer: customerName.trim() || "",
        tableNumber, timestamp: now, prepTime, readyTime, isPaid: false,
      })
      setShowReceipt(true)
      clearCart()
    } catch (error) {
      console.error("Failed to place order:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html><head><title>Receipt</title>
          <style>body{font-family:'Courier New',monospace;padding:20px;max-width:300px;margin:0 auto}.header{text-align:center;border-bottom:2px dashed #000;padding-bottom:10px;margin-bottom:10px}.logo{font-size:24px;font-weight:bold}.item{display:flex;justify-content:space-between;margin:5px 0}.divider{border-top:1px dashed #000;margin:10px 0}.total{font-weight:bold;font-size:18px}.footer{text-align:center;margin-top:20px;font-size:12px}</style>
          </head><body>${receiptRef.current.innerHTML}<script>window.onload=function(){window.print();window.close()}</script></body></html>
        `)
        printWindow.document.close()
      }
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-shawarma/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-shawarma border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 text-sm font-medium">Loading POS...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all border border-slate-700/50">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-shawarma to-orange-500 rounded-xl opacity-20 blur"></div>
                <Image src="/logos/shawarma-logo.png" alt="Logo" width={44} height={44} className="rounded-xl relative" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Point of Sale</h1>
                <p className="text-slate-500 text-sm">Walk-in Orders</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowActiveOrders(true)}
              className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              <LayoutGrid className="h-5 w-5" />
              <span>Orders</span>
              {activeOrders.length > 0 && (
                <span className="absolute -top-2 -right-2 h-6 w-6 bg-white text-emerald-600 text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowPaymentLookup(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20"
            >
              <DollarSign className="h-5 w-5" />
              {unpaidOrders.length > 0 && (
                <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unpaidOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsLocked(true)}
              className="p-2.5 bg-slate-800/50 hover:bg-amber-500/20 rounded-xl text-slate-400 hover:text-amber-400 transition-all border border-slate-700/50"
              title="Lock Screen"
            >
              <Lock className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-slate-400 text-sm bg-slate-800/50 px-4 py-2.5 rounded-xl border border-slate-700/50">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{currentTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
          </div>
        </header>

        {/* Lock Screen */}
        {isLocked && (
          <LockScreen onUnlock={() => setIsLocked(false)} />
        )}

        {/* Categories */}
        <div className="bg-slate-900/30 px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-b border-slate-800/30">
          {menuCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-shawarma to-orange-600 text-white shadow-lg shadow-shawarma/20"
                  : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700/50"
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all"
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
          <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-shawarma/50 rounded-xl p-4 text-left transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-shawarma/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="text-2xl">{menuCategories.find(c => c.id === item.category)?.icon}</span>
                  <div className="p-1.5 rounded-lg bg-slate-700/50 group-hover:bg-shawarma/20 transition-colors">
                    <Plus className="h-4 w-4 text-slate-400 group-hover:text-shawarma transition-colors" />
                  </div>
                </div>
                <h3 className="font-medium text-white text-sm mb-1 line-clamp-2 relative z-10">{item.name}</h3>
                <p className="text-shawarma font-bold relative z-10">£{item.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-[420px] bg-slate-900/50 backdrop-blur-xl flex flex-col h-full border-l border-slate-800/50">
        {/* Cart Header */}
        <div className="p-5 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-shawarma" />
              Current Order
            </h2>
            <div className="flex items-center gap-2">
              {heldOrders.length > 0 && (
                <button
                  onClick={() => setShowHeldOrders(true)}
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1 border border-amber-500/30"
                >
                  <Pause className="h-3 w-3" />
                  {heldOrders.length} Held
                </button>
              )}
              {cart.length > 0 && (
                <>
                  <button
                    onClick={holdOrder}
                    className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-700/50"
                    title="Hold Order"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowDiscount(true)}
                    className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-700/50"
                    title="Apply Discount"
                  >
                    <Percent className="h-4 w-4" />
                  </button>
                  <button
                    onClick={clearCart}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20"
                    title="Clear Cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Table Selection */}
          <div className="flex gap-2">
            {["counter", "1", "2", "3", "4", "5", "takeaway"].map(t => (
              <button
                key={t}
                onClick={() => setTableNumber(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  tableNumber === t
                    ? "bg-gradient-to-r from-shawarma to-orange-600 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50"
                }`}
              >
                {t === "counter" ? "Counter" : t === "takeaway" ? "T/A" : `T${t}`}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">Cart is empty</p>
              <p className="text-slate-500 text-sm mt-1">Tap items to add</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">{item.name}</h4>
                    <p className="text-shawarma font-semibold">£{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-all"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-white text-lg">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-2 bg-shawarma hover:bg-shawarma/80 text-white rounded-lg transition-all"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-800/50 space-y-4">
            {/* Prep Time */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Prep Time</p>
              <div className="flex gap-2">
                {[5, 10, 15, 20, 30].map(t => (
                  <button
                    key={t}
                    onClick={() => setPrepTime(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      prepTime === t
                        ? "bg-violet-500 text-white"
                        : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50"
                    }`}
                  >
                    {t}m
                  </button>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 py-3 border-y border-slate-800/50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">£{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Discount ({discount}%)</span>
                  <span>-£{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {settings.taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">VAT ({settings.taxRate}%)</span>
                  <span className="text-white">£{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold">
                <span className="text-white">Total</span>
                <span className="text-shawarma">£{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-shawarma to-orange-600 hover:from-shawarma/90 hover:to-orange-600/90 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-shawarma/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Place Order
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Order Created!</h3>
                <p className="text-slate-400 text-sm">#{lastReceipt.orderCode}</p>
              </div>
              <button
                onClick={() => setShowReceipt(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]" ref={receiptRef}>
              <div className="text-center mb-6">
                <p className="text-6xl font-bold text-shawarma mb-2">#{lastReceipt.orderCode}</p>
                <p className="text-slate-400">
                  Ready at {lastReceipt.readyTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-4 text-center">
                <MapPin className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                <p className="text-lg font-bold text-white">
                  {lastReceipt.tableNumber === "takeaway" ? "TAKEAWAY" : 
                   lastReceipt.tableNumber === "counter" ? "COUNTER" : 
                   `TABLE ${lastReceipt.tableNumber}`}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                {lastReceipt.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-300">{item.quantity}x {item.name}</span>
                    <span className="text-white">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-shawarma">£{lastReceipt.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 space-y-4">
              <p className="text-center text-slate-400 text-sm font-medium">
                Payment Status
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    if (lastReceipt) {
                      const order = orders.find(o => getOrderCode(o) === lastReceipt.orderCode)
                      setCashCalculatorOrder({ total: lastReceipt.total, orderCode: lastReceipt.orderCode, order })
                      setShowCashCalculator(true)
                    }
                  }}
                  className={`py-3.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedPaymentMethod === "cash"
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                      : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  <Banknote className="h-5 w-5" />
                  <span className="text-xs">Cash</span>
                </button>
                <button
                  onClick={async () => {
                    setSelectedPaymentMethod("card")
                    if (lastReceipt) {
                      const order = orders.find(o => getOrderCode(o) === lastReceipt.orderCode)
                      if (order) await markAsPaid(order, "card")
                      setLastReceipt({ ...lastReceipt, isPaid: true })
                    }
                  }}
                  className={`py-3.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedPaymentMethod === "card"
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                      : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Card</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedPaymentMethod("later")
                    if (lastReceipt) setLastReceipt({ ...lastReceipt, isPaid: false })
                  }}
                  className={`py-3.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedPaymentMethod === "later"
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" 
                      : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                  <span className="text-xs">Pay Later</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={handlePrintReceipt}
                  className="py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
                <button
                  onClick={() => {
                    setShowReceipt(false)
                    setSelectedPaymentMethod("later") // Reset for next order
                  }}
                  className="py-3.5 bg-gradient-to-r from-shawarma to-orange-600 hover:from-shawarma/90 hover:to-orange-600/90 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-shawarma/20"
                >
                  <CheckCircle className="h-4 w-4" /> Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Orders Modal */}
      {showActiveOrders && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20">
                  <LayoutGrid className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Active Orders</h3>
                  <p className="text-slate-400 text-sm">{activeOrders.length} orders in progress</p>
                </div>
              </div>
              <button
                onClick={() => setShowActiveOrders(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {activeOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-medium">No active orders</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeOrders.map(order => {
                    const code = getOrderCode(order)
                    const isPaid = !order.specialInstructions?.includes("💰 UNPAID")
                    return (
                      <div key={order.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-white font-mono">#{code}</span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            order.status === "preparing" ? "bg-violet-500/20 text-violet-400" :
                            order.status === "ready" ? "bg-green-500/20 text-green-400" :
                            "bg-amber-500/20 text-amber-400"
                          }`}>
                            {order.status === "preparing" ? "Cooking" : order.status === "ready" ? "Ready" : "New"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                          <MapPin className="h-4 w-4" />
                          {order.tableNumber === "takeaway" ? "Takeaway" : 
                           order.tableNumber === "counter" ? "Counter" : `Table ${order.tableNumber}`}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-bold text-white">£{order.total.toFixed(2)}</span>
                          <div className="flex items-center gap-2">
                            {isPaid && order.paymentMethod && (
                              <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                                order.paymentMethod === "cash" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                              }`}>
                                {order.paymentMethod === "cash" ? <Banknote className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                                {order.paymentMethod === "cash" ? "Cash" : "Card"}
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${isPaid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                              {isPaid ? "✓ Paid" : "Unpaid"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.status === "preparing" && (
                            <button
                              onClick={() => markAsReady(order.id)}
                              className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                            >
                              <CheckCircle className="h-4 w-4" /> Mark Ready
                            </button>
                          )}
                          {order.status === "ready" && (
                            <>
                              {!isPaid && (
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <button
                                    onClick={() => {
                                      setCashCalculatorOrder({ total: order.total, orderCode: code, order })
                                      setShowCashCalculator(true)
                                    }}
                                    className="py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition-all text-sm"
                                  >
                                    <Banknote className="h-4 w-4" /> Cash
                                  </button>
                                  <button
                                    onClick={() => markAsPaid(order, "card")}
                                    className="py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition-all text-sm"
                                  >
                                    <CreditCard className="h-4 w-4" /> Card
                                  </button>
                                </div>
                              )}
                              <button
                                onClick={() => isPaid && markAsComplete(order.id)}
                                disabled={!isPaid}
                                className={`w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                                  isPaid 
                                    ? "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                }`}
                              >
                                <CheckCircle className="h-4 w-4" /> Complete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Lookup Modal */}
      {showPaymentLookup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20">
                  <DollarSign className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Payment Lookup</h3>
                  <p className="text-slate-400 text-sm">{unpaidOrders.length} unpaid orders</p>
                </div>
              </div>
              <button
                onClick={() => { setShowPaymentLookup(false); setPaymentSearchCode(""); setFoundOrder(null) }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={paymentSearchCode}
                  onChange={(e) => { setPaymentSearchCode(e.target.value); setFoundOrder(null) }}
                  onKeyDown={(e) => e.key === "Enter" && searchOrderByCode()}
                  placeholder="Enter order code..."
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-lg"
                />
                <button
                  onClick={searchOrderByCode}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {foundOrder ? (
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-white font-mono">#{getOrderCode(foundOrder)}</span>
                    <div className="flex items-center gap-2">
                      {foundOrder.specialInstructions?.includes("✅ PAID") && foundOrder.paymentMethod && (
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1 ${
                          foundOrder.paymentMethod === "cash" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {foundOrder.paymentMethod === "cash" ? <Banknote className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                          {foundOrder.paymentMethod === "cash" ? "Cash" : "Card"}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        foundOrder.specialInstructions?.includes("✅ PAID") 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {foundOrder.specialInstructions?.includes("✅ PAID") ? "✓ Paid" : "Unpaid"}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm mb-4">
                    {foundOrder.tableNumber === "takeaway" ? "Takeaway" : `Table ${foundOrder.tableNumber}`} • £{foundOrder.total.toFixed(2)}
                  </div>
                  {!foundOrder.specialInstructions?.includes("✅ PAID") && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setCashCalculatorOrder({ total: foundOrder.total, orderCode: getOrderCode(foundOrder), order: foundOrder })
                          setShowCashCalculator(true)
                        }}
                        className="py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <Banknote className="h-5 w-5" /> Cash
                      </button>
                      <button
                        onClick={() => markAsPaid(foundOrder, "card")}
                        className="py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <CreditCard className="h-5 w-5" /> Card
                      </button>
                    </div>
                  )}
                </div>
              ) : paymentSearchCode && (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No order found</p>
                </div>
              )}

              {!paymentSearchCode && filteredUnpaidOrders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Unpaid Orders</p>
                  {filteredUnpaidOrders.slice(0, 5).map(order => (
                    <button
                      key={order.id}
                      onClick={() => { setPaymentSearchCode(getOrderCode(order)); setFoundOrder(order) }}
                      className="w-full p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-slate-700/50 text-left transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-white">#{getOrderCode(order)}</span>
                        <span className="text-slate-400 text-sm ml-3">{order.tableNumber === "takeaway" ? "T/A" : `T${order.tableNumber}`}</span>
                      </div>
                      <span className="text-white font-semibold">£{order.total.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Held Orders Modal */}
      {showHeldOrders && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20">
                  <Pause className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Held Orders ({heldOrders.length})</h3>
              </div>
              <button
                onClick={() => setShowHeldOrders(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {heldOrders.map(held => (
                <div key={held.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white">{held.name}</p>
                      <p className="text-slate-400 text-sm">{held.items.length} items • Table {held.table}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => recallOrder(held.id)}
                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setHeldOrders(prev => prev.filter(h => h.id !== held.id))}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscount && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Apply Discount</h3>
              <button
                onClick={() => setShowDiscount(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-3 gap-3">
              {[5, 10, 15, 20, 25, 50].map(p => (
                <button
                  key={p}
                  onClick={() => { setDiscount(p); setShowDiscount(false) }}
                  className="py-4 bg-slate-800/50 hover:bg-shawarma/20 border border-slate-700/50 hover:border-shawarma/50 rounded-xl font-bold text-white transition-all"
                >
                  {p}%
                </button>
              ))}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => { setDiscount(0); setShowDiscount(false) }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all"
              >
                Remove Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Calculator Modal */}
      {showCashCalculator && cashCalculatorOrder && (
        <CashCalculator
          total={cashCalculatorOrder.total}
          orderCode={cashCalculatorOrder.orderCode}
          onConfirm={async () => {
            if (cashCalculatorOrder.order) {
              await markAsPaid(cashCalculatorOrder.order, "cash")
            }
            setSelectedPaymentMethod("cash")
            if (lastReceipt && cashCalculatorOrder.orderCode === lastReceipt.orderCode) {
              setLastReceipt({ ...lastReceipt, isPaid: true })
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
