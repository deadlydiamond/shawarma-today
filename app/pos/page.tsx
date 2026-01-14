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
  Banknote,
  RefreshCw,
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
  isPaid: boolean // payment status
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
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<OrderReceipt | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReceiptPaymentOptions, setShowReceiptPaymentOptions] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)
  
  // Industry-standard POS features
  const [heldOrders, setHeldOrders] = useState<Array<{ id: string; name: string; items: CartItem[]; table: string; time: Date }>>([])
  const [showHeldOrders, setShowHeldOrders] = useState(false)
  const [discount, setDiscount] = useState(0) // Percentage discount
  const [showDiscount, setShowDiscount] = useState(false)
  const [cashTendered, setCashTendered] = useState(0)
  const [showCashDrawer, setShowCashDrawer] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")
  
  // Payment lookup
  const [showPaymentLookup, setShowPaymentLookup] = useState(false)
  const [paymentSearchCode, setPaymentSearchCode] = useState("")
  const [foundOrder, setFoundOrder] = useState<typeof orders[0] | null>(null)
  
  // Get order code from order
  // Get order code helper
  const getOrderCode = (order: typeof orders[0]) => {
    const codeMatch = order.specialInstructions?.match(/#(\d{4})/)
    return codeMatch ? codeMatch[1] : order.id.slice(-4)
  }

  // Get unpaid orders
  const unpaidOrders = orders.filter(o => 
    o.specialInstructions?.includes("💰 UNPAID") && 
    !["completed", "cancelled"].includes(o.status)
  )

  // Filter unpaid orders based on search
  const filteredUnpaidOrders = paymentSearchCode.trim() 
    ? unpaidOrders.filter(o => {
        const code = getOrderCode(o)
        const searchTerm = paymentSearchCode.trim().replace("#", "").toLowerCase()
        return code.includes(searchTerm) || 
               o.customer.name.toLowerCase().includes(searchTerm)
      })
    : unpaidOrders

  // Search for exact order by code
  const searchOrderByCode = () => {
    const code = paymentSearchCode.trim().replace("#", "")
    if (!code) return
    
    // Search in special instructions, customer name, or order ID
    const order = orders.find(o => {
      const orderCode = getOrderCode(o)
      return orderCode === code ||
        o.specialInstructions?.includes(`#${code}`) || 
        o.customer.name.includes(`#${code}`) ||
        o.id.toLowerCase().includes(code.toLowerCase())
    })
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

  // Hold/Park current order
  const holdOrder = () => {
    if (cart.length === 0) return
    const heldOrder = {
      id: `held-${Date.now()}`,
      name: customerName || `Table ${tableNumber}`,
      items: [...cart],
      table: tableNumber,
      time: new Date()
    }
    setHeldOrders(prev => [...prev, heldOrder])
    clearCart()
  }

  // Recall held order
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

  // Delete held order
  const deleteHeldOrder = (heldId: string) => {
    setHeldOrders(prev => prev.filter(h => h.id !== heldId))
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setCustomerName("")
    setTableNumber("counter")
    setDiscount(0)
    setOrderNotes("")
  }

  // Apply discount
  const applyDiscount = (percent: number) => {
    setDiscount(percent)
    setShowDiscount(false)
  }

  // Calculate totals with discount
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = subtotal * (discount / 100)
  const total = subtotal - discountAmount

  // Calculate change
  const changeDue = cashTendered > 0 ? cashTendered - total : 0

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

      // Build special instructions
      let instructions = `#${orderCode} | Ready ${readyTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
      if (discount > 0) {
        instructions += ` | ${discount}% OFF (-£${discountAmount.toFixed(2)})`
      }
      if (orderNotes.trim()) {
        instructions += ` | Note: ${orderNotes.trim()}`
      }
      instructions += " | 💰 UNPAID"

      const orderId = await addOrder({
        items: orderItems,
        customer: { name: displayName, phone: "" },
        subtotal,
        total,
        tableNumber,
        specialInstructions: instructions,
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
        isPaid: false, // Payment collected after order via receipt popup
      }

      setLastReceipt(receipt)
      setShowReceipt(true)
      clearCart() // Use clearCart to reset all states
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Current Order
            </h2>
            <div className="flex items-center gap-2">
              {heldOrders.length > 0 && (
                <button
                  onClick={() => setShowHeldOrders(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {heldOrders.length} Held
                </button>
              )}
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Buttons - Industry Standard */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button
              onClick={holdOrder}
              disabled={cart.length === 0}
              className="py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              HOLD
            </button>
            <button
              onClick={() => setShowDiscount(true)}
              disabled={cart.length === 0}
              className="py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              {discount > 0 ? `${discount}% OFF` : "DISC"}
            </button>
            <button
              onClick={() => setShowHeldOrders(true)}
              className="py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors relative"
            >
              RECALL
              {heldOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                  {heldOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowPaymentLookup(true)}
              className="py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors relative"
            >
              LOOKUP
              {unpaidOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                  {unpaidOrders.length}
                </span>
              )}
            </button>
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
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-shawarma text-sm"
              />
            </div>
            <div className="flex gap-1.5">
              {["counter", "1", "2", "3", "4", "5", "takeaway"].map(t => (
                <button
                  key={t}
                  onClick={() => setTableNumber(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    tableNumber === t
                      ? "bg-shawarma text-white"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  {t === "counter" ? "CNT" : t === "takeaway" ? "T/A" : `T${t}`}
                </button>
              ))}
            </div>
            {/* Prep Time Selector */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" /> Ready:
              </span>
              <div className="flex gap-1 flex-1">
                {[5, 10, 15, 20, 30].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setPrepTime(mins)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
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

        {/* Cart Footer - Industry Standard Totals */}
        <div className="p-4 border-t border-gray-700 bg-gray-900">
          {/* Totals Breakdown */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Subtotal ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-400 text-sm">
                <span className="flex items-center gap-1">
                  Discount ({discount}%)
                  <button onClick={() => setDiscount(0)} className="text-red-400 hover:text-red-300">
                    <X className="h-3 w-3" />
                  </button>
                </span>
                <span>-£{discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          {/* Total - Large & Prominent */}
          <div className="flex justify-between items-center text-white text-2xl font-bold mb-4 py-2 border-t border-gray-700">
            <span>TOTAL</span>
            <span className="text-green-400">£{total.toFixed(2)}</span>
          </div>
          
          {/* Place Order Button - Large & Prominent */}
          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-5 bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                <Receipt className="h-6 w-6" />
                PLACE ORDER
              </>
            )}
          </button>
        </div>
      </div>

      {/* Receipt Modal - Modern Industry Design */}
      {showReceipt && lastReceipt && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-700">
            {/* Header with Close */}
            <div className="relative p-6 pb-0">
              <button
                onClick={() => { setShowReceipt(false); setShowReceiptPaymentOptions(false) }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              {/* Order Number - Hero Style */}
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm font-medium tracking-wider uppercase mb-2">Order Placed</p>
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-shawarma to-orange-600 shadow-lg shadow-orange-500/30">
                  <span className="text-white text-5xl font-black">{lastReceipt.orderCode}</span>
                </div>
              </div>

              {/* Ready Time Card */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-center shadow-lg shadow-green-500/20 mb-4">
                <div className="flex items-center justify-center gap-2 text-white/80 text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Ready in ~{lastReceipt.prepTime} min</span>
                </div>
                <p className="text-white text-4xl font-black">
                  {lastReceipt.readyTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {/* Customer & Location */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Customer</p>
                  <p className="text-white font-semibold truncate">{lastReceipt.customer || "Walk-in"}</p>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Location</p>
                  <p className="text-white font-semibold">
                    {lastReceipt.tableNumber === "counter" ? "Counter" : 
                     lastReceipt.tableNumber === "takeaway" ? "Takeaway" :
                     `Table ${lastReceipt.tableNumber}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Items */}
            <div ref={receiptRef} className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
              <div className="space-y-2">
                {lastReceipt.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                        {item.quantity}
                      </span>
                      <span className="text-white">{item.name}</span>
                    </div>
                    <span className="text-gray-300 font-medium">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total & Payment Status */}
            <div className="px-6 py-4 bg-black/30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-lg">Total</span>
                <span className="text-white text-3xl font-black">£{lastReceipt.total.toFixed(2)}</span>
              </div>
              
              {/* Payment Status Badge */}
              <div className={`rounded-xl p-3 text-center font-bold ${
                lastReceipt.isPaid 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                  : "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
              }`}>
                {lastReceipt.isPaid ? "✓ PAYMENT COLLECTED" : "PAYMENT PENDING"}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-black/50 space-y-3">
              {/* Payment Options */}
              {!lastReceipt.isPaid && !showReceiptPaymentOptions && (
                <button
                  onClick={() => setShowReceiptPaymentOptions(true)}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-500/30"
                >
                  <Banknote className="h-6 w-6" />
                  Collect Payment
                </button>
              )}

              {!lastReceipt.isPaid && showReceiptPaymentOptions && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={async () => {
                      const order = orders.find(o => o.specialInstructions?.includes(`#${lastReceipt.orderCode}`))
                      if (order) {
                        await updateOrderNotes(order.id, order.specialInstructions?.replace("💰 UNPAID", "✅ PAID (Cash)") || "✅ PAID (Cash)")
                      }
                      setLastReceipt({ ...lastReceipt, isPaid: true })
                      setShowReceiptPaymentOptions(false)
                    }}
                    className="py-5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <Banknote className="h-8 w-8" />
                    <span>CASH</span>
                  </button>
                  <button
                    onClick={async () => {
                      const order = orders.find(o => o.specialInstructions?.includes(`#${lastReceipt.orderCode}`))
                      if (order) {
                        await updateOrderNotes(order.id, order.specialInstructions?.replace("💰 UNPAID", "✅ PAID (Card)") || "✅ PAID (Card)")
                      }
                      setLastReceipt({ ...lastReceipt, isPaid: true })
                      setShowReceiptPaymentOptions(false)
                    }}
                    className="py-5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <CreditCard className="h-8 w-8" />
                    <span>CARD</span>
                  </button>
                </div>
              )}
              
              {/* Main Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePrintReceipt}
                  className="py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border border-white/10"
                >
                  <Printer className="h-5 w-5" />
                  Print
                </button>
                <button
                  onClick={() => { setShowReceipt(false); setShowReceiptPaymentOptions(false) }}
                  className="py-3 bg-shawarma hover:bg-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                  Done
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setCart(lastReceipt.items)
                    setCustomerName(lastReceipt.customer)
                    setTableNumber(lastReceipt.tableNumber)
                    const order = orders.find(o => o.specialInstructions?.includes(`#${lastReceipt.orderCode}`))
                    if (order) updateOrderStatus(order.id, "cancelled")
                    setShowReceipt(false)
                    setShowReceiptPaymentOptions(false)
                  }}
                  className="py-2.5 text-amber-400 hover:bg-amber-500/10 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Modify
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Cancel this order?")) {
                      const order = orders.find(o => o.specialInstructions?.includes(`#${lastReceipt.orderCode}`))
                      if (order) await updateOrderStatus(order.id, "cancelled")
                      setShowReceipt(false)
                      setShowReceiptPaymentOptions(false)
                    }
                  }}
                  className="py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Lookup Modal - Modern Design */}
      {showPaymentLookup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Payment Lookup</h2>
                    <p className="text-gray-400 text-sm">Search by order code</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowPaymentLookup(false); setPaymentSearchCode(""); setFoundOrder(null) }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Search Input - Real-time filtering */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={paymentSearchCode}
                  onChange={(e) => {
                    setPaymentSearchCode(e.target.value)
                    setFoundOrder(null) // Clear selected order when typing
                  }}
                  placeholder="Search by order code or name..."
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                {paymentSearchCode && (
                  <button
                    onClick={() => { setPaymentSearchCode(""); setFoundOrder(null) }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Selected Order Detail */}
              {foundOrder && (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-4">
                  {/* Order Info */}
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Order #{getOrderCode(foundOrder)}</p>
                      <p className="text-white font-bold text-lg">{foundOrder.customer.name.split("#")[0].trim() || "Walk-in"}</p>
                      <p className="text-gray-500 text-sm">
                        {foundOrder.tableNumber === "counter" ? "Counter" : 
                         foundOrder.tableNumber === "takeaway" ? "Takeaway" : 
                         `Table ${foundOrder.tableNumber}`}
                      </p>
                    </div>
                    <p className="text-3xl font-black text-white">£{foundOrder.total.toFixed(2)}</p>
                  </div>

                  {/* Payment Status */}
                  <div className="p-4 border-t border-white/10">
                    {foundOrder.specialInstructions?.includes("💰 UNPAID") ? (
                      <>
                        <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl mb-4">
                          <div className="w-12 h-12 rounded-full bg-red-500/30 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-400" />
                          </div>
                          <div>
                            <p className="font-bold text-red-400">UNPAID</p>
                            <p className="text-red-400/70 text-sm">Collect payment before handover</p>
                          </div>
                        </div>
                        <button
                          onClick={markAsPaid}
                          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/30"
                        >
                          <CheckCircle className="h-6 w-6" />
                          Mark as Paid
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <p className="font-bold text-green-400">PAID</p>
                          <p className="text-green-400/70 text-sm">Ready for handover</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Back Button */}
                  <button
                    onClick={() => setFoundOrder(null)}
                    className="w-full py-3 text-gray-400 hover:text-white hover:bg-white/5 border-t border-white/10 transition-colors text-sm"
                  >
                    ← Back to list
                  </button>
                </div>
              )}

              {/* Unpaid Orders List - Always visible unless viewing specific order */}
              {!foundOrder && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>
                      {paymentSearchCode.trim() ? "Matching Orders" : "Unpaid Orders"} 
                      ({filteredUnpaidOrders.length})
                    </span>
                    {paymentSearchCode.trim() && filteredUnpaidOrders.length === 0 && (
                      <span className="text-red-400 normal-case font-normal">No matches</span>
                    )}
                  </h3>
                  
                  {filteredUnpaidOrders.length === 0 && !paymentSearchCode.trim() ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="text-white font-medium">All caught up!</p>
                      <p className="text-gray-500 text-sm">No unpaid orders</p>
                    </div>
                  ) : filteredUnpaidOrders.length === 0 && paymentSearchCode.trim() ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                        <Search className="h-6 w-6 text-gray-600" />
                      </div>
                      <p className="text-gray-400 text-sm">No orders match &quot;{paymentSearchCode}&quot;</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                      {filteredUnpaidOrders.map(order => {
                        const code = getOrderCode(order)
                        return (
                          <button
                            key={order.id}
                            onClick={() => { setPaymentSearchCode(code); setFoundOrder(order) }}
                            className="w-full p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl flex items-center justify-between transition-colors text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center font-mono font-bold text-red-400 text-lg group-hover:bg-red-500/30 transition-colors">{code}</span>
                              <div>
                                <p className="text-white font-medium">{order.customer.name.split("#")[0].trim() || "Walk-in"}</p>
                                <p className="text-gray-500 text-sm">
                                  {order.tableNumber === "counter" ? "Counter" : 
                                   order.tableNumber === "takeaway" ? "Takeaway" : 
                                   `Table ${order.tableNumber}`}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-white text-lg">£{order.total.toFixed(2)}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Held Orders Modal - Modern Design */}
      {showHeldOrders && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Held Orders</h2>
                    <p className="text-gray-400 text-sm">{heldOrders.length} parked orders</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHeldOrders(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {heldOrders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-10 w-10 text-gray-600" />
                  </div>
                  <p className="text-white font-medium mb-1">No held orders</p>
                  <p className="text-gray-500 text-sm">Tap HOLD to park an order for later</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {heldOrders.map(held => (
                    <div key={held.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-white text-lg">{held.name || "Walk-in"}</p>
                          <p className="text-gray-400 text-sm flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {held.table === "counter" ? "Counter" : held.table === "takeaway" ? "Takeaway" : `Table ${held.table}`}
                            <span className="text-gray-600">•</span>
                            <Clock className="h-3 w-3" />
                            {held.time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <p className="text-2xl font-black text-green-400">
                          £{held.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {held.items.map(i => `${i.quantity}× ${i.name}`).join(" • ")}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => recallOrder(held.id)}
                          className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
                        >
                          Recall Order
                        </button>
                        <button
                          onClick={() => deleteHeldOrder(held.id)}
                          className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal - Modern Design */}
      {showDiscount && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="p-6 text-center border-b border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Apply Discount</h2>
              <p className="text-gray-400 mt-1">Select a percentage off</p>
              <button
                onClick={() => setShowDiscount(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Discount Options */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[5, 10, 15, 20, 25, 50].map(percent => (
                  <button
                    key={percent}
                    onClick={() => applyDiscount(percent)}
                    className={`py-5 rounded-2xl text-xl font-black transition-all ${
                      discount === percent
                        ? "bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">£{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <>
                    <div className="flex justify-between items-center mb-2 text-green-400">
                      <span>Discount ({discount}%)</span>
                      <span>-£{(subtotal * discount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-white font-bold">New Total</span>
                      <span className="text-2xl font-black text-green-400">£{(subtotal - subtotal * discount / 100).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                {discount > 0 && (
                  <button
                    onClick={() => setDiscount(0)}
                    className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setShowDiscount(false)}
                  className={`${discount > 0 ? 'flex-1' : 'w-full'} py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg`}
                >
                  Apply & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
