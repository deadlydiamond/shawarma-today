"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { useOrders } from "@/contexts/OrderContext"
import { useMenu } from "@/contexts/MenuContext"
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
  AlertCircle,
  DollarSign,
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
  orderCode: string // 4-digit code for easy lookup
  items: CartItem[]
  subtotal: number
  total: number
  customer: string
  tableNumber: string
  timestamp: Date
  prepTime: number // minutes until ready
  readyTime: Date // calculated ready time
}

// Generate a random 4-digit order code
const generateOrderCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Menu categories with items
const menuCategories = [
  { id: "all", name: "All Items", icon: "🍽️" },
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
  // Pizzas
  { id: "p1", name: "Margherita Pizza", price: 4.99, quantity: 0, category: "pizzas" },
  { id: "p2", name: "Chicken Pizza", price: 5.99, quantity: 0, category: "pizzas" },
  { id: "p3", name: "Lamb Pizza", price: 6.99, quantity: 0, category: "pizzas" },
  { id: "p4", name: "Meat Feast", price: 6.99, quantity: 0, category: "pizzas" },
  { id: "p5", name: "Veggie Pizza", price: 5.50, quantity: 0, category: "pizzas" },
  { id: "p6", name: "Mighty Meaty", price: 6.99, quantity: 0, category: "pizzas" },
  { id: "p7", name: "Garlic Bread w/ Cheese", price: 3.99, quantity: 0, category: "pizzas" },
  // Wraps
  { id: "w1", name: "Lamb Shawarma Wrap", price: 4.99, quantity: 0, category: "wraps" },
  { id: "w2", name: "Chicken Shawarma Wrap", price: 4.50, quantity: 0, category: "wraps" },
  { id: "w3", name: "Falafel Wrap", price: 4.99, quantity: 0, category: "wraps" },
  // Sandwiches
  { id: "s1", name: "Lamb Shawarma Sandwich", price: 4.99, quantity: 0, category: "sandwiches" },
  { id: "s2", name: "Chicken Shawarma Sandwich", price: 4.50, quantity: 0, category: "sandwiches" },
  // Grill
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
  // Meals
  { id: "m1", name: "Lamb Shawarma Meal", price: 7.99, quantity: 0, category: "meals" },
  { id: "m2", name: "Chicken Shawarma Meal", price: 6.99, quantity: 0, category: "meals" },
  { id: "m3", name: "Falafel Meal (6 pcs)", price: 5.99, quantity: 0, category: "meals" },
  // Fatayer
  { id: "f1", name: "Chicken Fatayer", price: 4.99, quantity: 0, category: "fatayer" },
  { id: "f2", name: "Lamb Fatayer", price: 5.99, quantity: 0, category: "fatayer" },
  { id: "f3", name: "Mix Fatayer", price: 5.50, quantity: 0, category: "fatayer" },
  { id: "f4", name: "Veggie Fatayer", price: 4.99, quantity: 0, category: "fatayer" },
  { id: "f5", name: "Cheese Fatayer", price: 3.99, quantity: 0, category: "fatayer" },
  // Extras
  { id: "e1", name: "Chips", price: 2.50, quantity: 0, category: "extras" },
  { id: "e2", name: "Fresh Salad", price: 2.50, quantity: 0, category: "extras" },
  { id: "e3", name: "Falafel (Side)", price: 3.99, quantity: 0, category: "extras" },
  { id: "e4", name: "Hummus", price: 3.00, quantity: 0, category: "extras" },
  { id: "e5", name: "Tub of Sauce", price: 0.50, quantity: 0, category: "extras" },
  { id: "e6", name: "Extra Toppings", price: 0.70, quantity: 0, category: "extras" },
  { id: "e7", name: "Extra Cheese", price: 1.00, quantity: 0, category: "extras" },
  // Drinks
  { id: "d1", name: "Can of Drink", price: 1.00, quantity: 0, category: "drinks" },
  { id: "d2", name: "Bottle", price: 1.50, quantity: 0, category: "drinks" },
  { id: "d3", name: "Ayran", price: 1.00, quantity: 0, category: "drinks" },
]

export default function POSPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { addOrder, orders, updateOrderStatus, updateOrderNotes } = useOrders()
  
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [tableNumber, setTableNumber] = useState("counter")
  const [prepTime, setPrepTime] = useState(10) // default 10 minutes
  const [paidNow, setPaidNow] = useState(false) // Payment collected at order time
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<OrderReceipt | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)
  
  // Payment lookup
  const [showPaymentLookup, setShowPaymentLookup] = useState(false)
  const [paymentSearchCode, setPaymentSearchCode] = useState("")
  const [foundOrder, setFoundOrder] = useState<typeof orders[0] | null>(null)
  
  // Search for order by code
  const searchOrderByCode = () => {
    const code = paymentSearchCode.trim()
    if (!code) return
    
    // Search in special instructions for the order code
    const order = orders.find(o => 
      o.specialInstructions?.includes(`#${code}`) || 
      o.customer.name.includes(`#${code}`) ||
      o.id.includes(code)
    )
    setFoundOrder(order || null)
  }
  
  // Mark order as paid
  const markAsPaid = async () => {
    if (!foundOrder) return
    
    // Update special instructions to show PAID
    const newInstructions = foundOrder.specialInstructions?.replace("💰 UNPAID", "✅ PAID") || "✅ PAID"
    await updateOrderNotes(foundOrder.id, newInstructions)
    
    // Refresh search to show updated status
    setFoundOrder({ ...foundOrder, specialInstructions: newInstructions })
  }
  
  // Get unpaid orders count
  const unpaidOrders = orders.filter(o => 
    o.specialInstructions?.includes("💰 UNPAID") && 
    !["completed", "cancelled"].includes(o.status)
  )

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
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : item
        }
        return item
      }).filter(item => item.quantity > 0)
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setCustomerName("")
    setTableNumber("counter")
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return
    
    setIsProcessing(true)
    
    // Generate 4-digit order code
    const orderCode = generateOrderCode()
    const displayName = customerName.trim() || `Order #${orderCode}`
    const now = new Date()
    const readyTime = new Date(now.getTime() + prepTime * 60000)
    
    try {
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: `£${item.price.toFixed(2)}`,
        quantity: item.quantity,
        category: item.category,
        image: "",
        description: "",
      }))

      const paymentStatus = paidNow ? "✅ PAID" : "💰 UNPAID"
      
      const orderId = await addOrder({
        items: orderItems,
        customer: { name: displayName, phone: "" },
        subtotal,
        total,
        tableNumber,
        specialInstructions: `#${orderCode} | Ready ${readyTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} | ${paymentStatus}`,
        status: "preparing", // Start preparing immediately
      })

      // Create receipt
      const receipt: OrderReceipt = {
        orderId: orderId || `WI-${Date.now().toString(36).toUpperCase()}`,
        orderCode,
        items: cart,
        subtotal,
        total,
        customer: customerName.trim() || "",
        tableNumber,
        timestamp: now,
        prepTime,
        readyTime,
      }

      setLastReceipt(receipt)
      setShowReceipt(true)
      setCart([])
      setCustomerName("")
      setTableNumber("counter")
      setPrepTime(10) // Reset to default
      setPaidNow(false) // Reset payment toggle
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
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                .logo { font-size: 24px; font-weight: bold; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                .divider { border-top: 1px dashed #000; margin: 10px 0; }
                .total { font-weight: bold; font-size: 18px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
              <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Image src="/logos/shawarma-logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-white">POS System</h1>
                <p className="text-gray-400 text-sm">Walk-in Orders</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Payment Lookup Button */}
            <button
              onClick={() => setShowPaymentLookup(true)}
              className="relative flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors"
            >
              <DollarSign className="h-5 w-5" />
              <span>Payments</span>
              {unpaidOrders.length > 0 && (
                <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unpaidOrders.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </header>

        {/* Categories */}
        <div className="bg-gray-800/50 px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {menuCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-shawarma text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-shawarma"
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
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-shawarma rounded-xl p-4 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{menuCategories.find(c => c.id === item.category)?.icon}</span>
                  <Plus className="h-5 w-5 text-gray-500 group-hover:text-shawarma transition-colors" />
                </div>
                <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">{item.name}</h3>
                <p className="text-shawarma font-bold">£{item.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-[400px] bg-gray-800 flex flex-col h-full border-l border-gray-700">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Current Order
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Customer & Table */}
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name (optional)"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-shawarma"
              />
            </div>
            <div className="flex gap-2">
              {["counter", "1", "2", "3", "4", "5", "takeaway"].map(t => (
                <button
                  key={t}
                  onClick={() => setTableNumber(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tableNumber === t
                      ? "bg-shawarma text-white"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  {t === "counter" ? "Cntr" : t === "takeaway" ? "T/A" : `T${t}`}
                </button>
              ))}
            </div>
            {/* Prep Time Selector */}
            <div>
              <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Ready in
              </p>
              <div className="flex gap-2">
                {[5, 10, 15, 20, 30].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setPrepTime(mins)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                      prepTime === mins
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
              <p>No items in cart</p>
              <p className="text-sm">Tap items to add them</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-700 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{item.name}</h4>
                      <p className="text-shawarma text-sm">£{item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-white font-bold">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex justify-between text-gray-400 text-sm mb-2">
            <span>Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white text-xl font-bold mb-3">
            <span>Total</span>
            <span>£{total.toFixed(2)}</span>
          </div>
          
          {/* Payment Toggle */}
          <button
            onClick={() => setPaidNow(!paidNow)}
            className={`w-full py-3 mb-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              paidNow 
                ? "bg-green-500 text-white" 
                : "bg-gray-700 text-gray-300 border-2 border-dashed border-gray-500"
            }`}
          >
            {paidNow ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Payment Collected ✓
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Tap if Payment Collected
              </>
            )}
          </button>
          
          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-4 bg-shawarma hover:bg-shawarma-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Receipt className="h-5 w-5" />
                Place Order • £{total.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastReceipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            {/* Receipt Content */}
            <div ref={receiptRef} className="p-6">
              <div className="header text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <div className="logo text-2xl font-bold">TODAY SHAWARMA</div>
                <p className="text-gray-500 text-sm">203 Dalry Road, Edinburgh</p>
                <p className="text-gray-500 text-sm">Tel: 0131 XXX XXXX</p>
              </div>

              {/* Large Order Code */}
              <div className="text-center mb-4 p-4 bg-shawarma rounded-xl">
                <p className="text-white/80 text-sm font-medium">ORDER NUMBER</p>
                <p className="text-white text-5xl font-bold tracking-wider">{lastReceipt.orderCode}</p>
              </div>

              {/* Ready Time - Prominent */}
              <div className="text-center mb-4 p-4 bg-green-500 rounded-xl">
                <p className="text-white/80 text-sm font-medium">READY AT</p>
                <p className="text-white text-3xl font-bold">
                  {lastReceipt.readyTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-white/80 text-sm">~{lastReceipt.prepTime} minutes</p>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">
                  Ordered: {lastReceipt.timestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <p className="font-semibold">{lastReceipt.customer || "Walk-in Customer"}</p>
                <p className="text-sm text-gray-600">
                  {lastReceipt.tableNumber === "counter" ? "Counter" : 
                   lastReceipt.tableNumber === "takeaway" ? "Takeaway" :
                   `Table ${lastReceipt.tableNumber}`}
                </p>
              </div>

              <div className="divider border-t border-dashed border-gray-300 my-4" />

              <div className="space-y-2 mb-4">
                {lastReceipt.items.map(item => (
                  <div key={item.id} className="item flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="divider border-t border-dashed border-gray-300 my-4" />

              <div className="flex justify-between font-bold text-lg mb-2">
                <span>TOTAL</span>
                <span>£{lastReceipt.total.toFixed(2)}</span>
              </div>

              <div className="footer text-center mt-6 text-sm text-gray-500">
                <p>Thank you for your order!</p>
                <p>100% Halal • Fresh Daily</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 flex gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Printer className="h-5 w-5" />
                Print Receipt
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-3 bg-shawarma hover:bg-shawarma-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Lookup Modal */}
      {showPaymentLookup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-amber-500 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <DollarSign className="h-6 w-6" />
                <h2 className="text-xl font-bold">Payment Lookup</h2>
              </div>
              <button
                onClick={() => {
                  setShowPaymentLookup(false)
                  setPaymentSearchCode("")
                  setFoundOrder(null)
                }}
                className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Search */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={paymentSearchCode}
                    onChange={(e) => setPaymentSearchCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchOrderByCode()}
                    placeholder="Enter 4-digit order code"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength={4}
                  />
                </div>
                <button
                  onClick={searchOrderByCode}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Result */}
              {foundOrder ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Order Header */}
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Order</p>
                      <p className="text-xl font-bold text-gray-900">{foundOrder.customer.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">£{foundOrder.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        {foundOrder.tableNumber === "counter" ? "Counter" : 
                         foundOrder.tableNumber === "takeaway" ? "Takeaway" : 
                         `Table ${foundOrder.tableNumber}`}
                      </p>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="p-4">
                    {foundOrder.specialInstructions?.includes("💰 UNPAID") ? (
                      <div className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-8 w-8 text-red-500" />
                          <div>
                            <p className="font-bold text-red-700">PAYMENT NOT COLLECTED</p>
                            <p className="text-sm text-red-600">Please collect payment before handover</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-xl mb-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                          <div>
                            <p className="font-bold text-green-700">PAYMENT COLLECTED</p>
                            <p className="text-sm text-green-600">Order is ready for handover</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">{foundOrder.items.length} items</p>
                      <div className="text-sm text-gray-600">
                        {foundOrder.items.slice(0, 3).map((item, i) => (
                          <span key={i}>{item.quantity}x {item.name}{i < 2 && foundOrder.items.length > 1 ? ", " : ""}</span>
                        ))}
                        {foundOrder.items.length > 3 && <span> +{foundOrder.items.length - 3} more</span>}
                      </div>
                    </div>

                    {/* Mark as Paid Button */}
                    {foundOrder.specialInstructions?.includes("💰 UNPAID") && (
                      <button
                        onClick={markAsPaid}
                        className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <CreditCard className="h-6 w-6" />
                        Mark Payment Collected
                      </button>
                    )}
                  </div>
                </div>
              ) : paymentSearchCode && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No order found with code &quot;{paymentSearchCode}&quot;</p>
                </div>
              )}

              {/* Unpaid Orders List */}
              {unpaidOrders.length > 0 && !foundOrder && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Unpaid Orders ({unpaidOrders.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {unpaidOrders.map(order => {
                      // Extract order code from special instructions
                      const codeMatch = order.specialInstructions?.match(/#(\d{4})/)
                      const code = codeMatch ? codeMatch[1] : order.id.slice(-4)
                      return (
                        <button
                          key={order.id}
                          onClick={() => {
                            setPaymentSearchCode(code)
                            setFoundOrder(order)
                          }}
                          className="w-full p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex items-center justify-between transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-red-700">#{code}</span>
                            <span className="text-gray-700">{order.customer.name.split("#")[0].trim()}</span>
                          </div>
                          <span className="font-bold text-gray-900">£{order.total.toFixed(2)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
