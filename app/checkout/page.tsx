"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { useOrders } from "@/contexts/OrderContext"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { ArrowLeft, Loader2, User, MapPin, MessageSquare, Clock, Minus, Plus, Trash2, ShoppingBag, CreditCard, Shield, ChefHat, Sparkles, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Checkout() {
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useCart()
  const { addOrder, orders } = useOrders()
  
  const getEstimatedWaitTime = () => {
    const activeOrders = orders.filter(o => 
      o.status === "paid" || o.status === "preparing"
    ).length
    const baseMin = 10 + (activeOrders * 3)
    const baseMax = 15 + (activeOrders * 3)
    return {
      min: Math.min(baseMin, 40),
      max: Math.min(baseMax, 45)
    }
  }

  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    tableNumber: "",
    pickupTime: "",
    specialInstructions: "",
  })
  const [errors, setErrors] = useState<{ name?: string; phone?: string; tableNumber?: string; pickupTime?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatPrice = (price: number) => `£${price.toFixed(2)}`

  const getItemPrice = (item: any) => {
    let priceStr = item.price
    if (item.selectedSize === "large" && item.priceLarge) {
      priceStr = item.priceLarge
    } else if (item.selectedSize === "kids" && item.priceKids) {
      priceStr = item.priceKids
    }
    return parseFloat(priceStr.replace("£", "").replace("+", ""))
  }

  const getPickupTimeOptions = () => {
    const options: { value: string; label: string }[] = []
    const now = new Date()
    const minutes = now.getMinutes()
    const roundedMinutes = Math.ceil((minutes + 10) / 15) * 15
    now.setMinutes(roundedMinutes, 0, 0)
    
    options.push({ value: "asap", label: "🚀 ASAP (as soon as ready)" })
    
    for (let i = 0; i < 8; i++) {
      const time = new Date(now.getTime() + i * 15 * 60 * 1000)
      const hours = time.getHours()
      const mins = time.getMinutes()
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
      const label = `${hours > 12 ? hours - 12 : hours}:${mins.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
      options.push({ value: timeStr, label })
    }
    
    return options
  }

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string; tableNumber?: string; pickupTime?: string } = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\d\s+()-]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number"
    }
    
    if (orderType === "dine-in" && !formData.tableNumber.trim()) {
      newErrors.tableNumber = "Please select your table"
    }
    
    if (!formData.pickupTime) {
      newErrors.pickupTime = "Please select a pickup time"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    const orderItems = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selected_size: item.selectedSize,
      image: item.image,
    }))

    const newOrderId = await addOrder({
      items: orderItems,
      customer: {
        name: formData.name,
        phone: formData.phone,
      },
      tableNumber: orderType === "takeaway" ? "takeaway" : formData.tableNumber,
      pickupTime: formData.pickupTime,
      specialInstructions: formData.specialInstructions,
      subtotal: getTotalPrice(),
      total: getTotalPrice(),
    })

    if (newOrderId) {
      localStorage.setItem("customer_phone", formData.phone)
      clearCart()
      router.push(`/order/${newOrderId}`)
    } else {
      alert("Failed to place order. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const isFormValid = formData.name.trim() && formData.phone.trim() && formData.pickupTime && (orderType === "takeaway" || formData.tableNumber)

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-20 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some delicious items to get started!</p>
            <Link 
              href="/#menu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-shawarma hover:bg-shawarma-600 text-white font-semibold rounded-2xl transition-all hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              Browse Menu
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/#menu" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Menu</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4 text-green-500" />
              Secure Checkout
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Order Type Selection */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-shawarma rounded-xl">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Order Type</h2>
                    <p className="text-sm text-gray-500">How would you like your order?</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setOrderType("dine-in")}
                    className={`relative p-5 rounded-2xl border-2 transition-all ${
                      orderType === "dine-in"
                        ? "border-shawarma bg-shawarma/5"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {orderType === "dine-in" && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-5 w-5 text-shawarma" />
                      </div>
                    )}
                    <div className="text-4xl mb-3">🍽️</div>
                    <p className="font-bold text-gray-900">Dine In</p>
                    <p className="text-sm text-gray-500">Eat at the restaurant</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType("takeaway")
                      setFormData({ ...formData, tableNumber: "" })
                      setErrors({ ...errors, tableNumber: undefined })
                    }}
                    className={`relative p-5 rounded-2xl border-2 transition-all ${
                      orderType === "takeaway"
                        ? "border-shawarma bg-shawarma/5"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {orderType === "takeaway" && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-5 w-5 text-shawarma" />
                      </div>
                    )}
                    <div className="text-4xl mb-3">🥡</div>
                    <p className="font-bold text-gray-900">Takeaway</p>
                    <p className="text-sm text-gray-500">Take your order to go</p>
                  </button>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-shawarma rounded-xl">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Your Details</h2>
                    <p className="text-sm text-gray-500">For order identification</p>
                  </div>
                </div>
                
                <form className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => {
                        handleChange(e)
                        if (errors.name) setErrors({ ...errors, name: undefined })
                      }}
                      placeholder="Your name"
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all ${
                        errors.name 
                          ? "border-red-300 focus:border-red-500" 
                          : "border-gray-100 focus:border-shawarma"
                      }`}
                    />
                    {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        handleChange(e)
                        if (errors.phone) setErrors({ ...errors, phone: undefined })
                      }}
                      placeholder="07123 456789"
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all ${
                        errors.phone 
                          ? "border-red-300 focus:border-red-500" 
                          : "border-gray-100 focus:border-shawarma"
                      }`}
                    />
                    {errors.phone && <p className="mt-1.5 text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  {/* Table Number - Dine In Only */}
                  {orderType === "dine-in" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Table / Location *
                      </label>
                      <select
                        name="tableNumber"
                        value={formData.tableNumber}
                        onChange={(e) => {
                          handleChange(e)
                          if (errors.tableNumber) setErrors({ ...errors, tableNumber: undefined })
                        }}
                        className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all appearance-none ${
                          errors.tableNumber 
                            ? "border-red-300 focus:border-red-500" 
                            : "border-gray-100 focus:border-shawarma"
                        }`}
                      >
                        <option value="">Select your table</option>
                        {[...Array(20)].map((_, i) => (
                          <option key={i + 1} value={`${i + 1}`}>Table {i + 1}</option>
                        ))}
                        <option value="counter">Counter Seating</option>
                        <option value="outdoor">Outdoor Area</option>
                      </select>
                      {errors.tableNumber && <p className="mt-1.5 text-sm text-red-500">{errors.tableNumber}</p>}
                    </div>
                  )}

                  {/* Pickup Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-shawarma" />
                      {orderType === "dine-in" ? "When would you like it served?" : "Pickup Time"} *
                    </label>
                    <select
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={(e) => {
                        handleChange(e)
                        if (errors.pickupTime) setErrors({ ...errors, pickupTime: undefined })
                      }}
                      className={`w-full px-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white transition-all appearance-none ${
                        errors.pickupTime 
                          ? "border-red-300 focus:border-red-500" 
                          : "border-gray-100 focus:border-shawarma"
                      }`}
                    >
                      <option value="">Select a time</option>
                      {getPickupTimeOptions().map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.pickupTime && <p className="mt-1.5 text-sm text-red-500">{errors.pickupTime}</p>}
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      Special Instructions
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleChange}
                      placeholder="Any allergies or special requests..."
                      rows={3}
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:bg-white focus:border-shawarma transition-all resize-none"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
                
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-shawarma" />
                    Order Summary
                  </h2>
                </div>

                {/* Items */}
                <div className="max-h-[300px] overflow-y-auto p-5 space-y-4">
                  {cartItems.map((item) => {
                    const itemPrice = getItemPrice(item)
                    return (
                      <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h3>
                          <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(itemPrice * item.quantity)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center bg-gray-100 rounded-full">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                              >
                                <Minus className="h-3.5 w-3.5 text-gray-600" />
                              </button>
                              <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5 text-gray-600" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id, item.selectedSize)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                            >
                              <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Totals */}
                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                  {/* Wait Time */}
                  <div className="flex items-center gap-3 p-3 bg-shawarma/10 rounded-xl mb-4">
                    <ChefHat className="h-5 w-5 text-shawarma" />
                    <div>
                      <p className="text-sm font-semibold text-shawarma-800">Ready in ~{getEstimatedWaitTime().min}-{getEstimatedWaitTime().max} min</p>
                      <p className="text-xs text-shawarma-600">We&apos;ll start preparing right away</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Service fee</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 my-4" />

                  <div className="flex justify-between items-center mb-5">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(getTotalPrice())}</span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isFormValid}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                      isFormValid
                        ? "bg-shawarma hover:bg-shawarma-600 text-white hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending Order...
                      </>
                    ) : (
                      <>
                        Send to Kitchen
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>

                  {!isFormValid && (
                    <p className="text-xs text-amber-600 text-center mt-3">
                      Please fill in all required fields
                    </p>
                  )}

                  {/* Payment Info */}
                  <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 text-green-800">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm font-medium">Pay after your meal</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Enjoy your food, pay at cashier when you&apos;re done
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
