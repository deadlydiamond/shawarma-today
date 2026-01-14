"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { useOrders } from "@/contexts/OrderContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Section } from "@/components/ui/Section"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { ArrowLeft, Loader2, User, MapPin, MessageSquare, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, X } from "lucide-react"

export default function Checkout() {
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const { addOrder, orders } = useOrders()
  
  // Calculate estimated wait time based on queue
  const getEstimatedWaitTime = () => {
    const activeOrders = orders.filter(o => 
      o.status === "paid" || o.status === "preparing"
    ).length
    // Base time: 10-15 min + 3 min per order in queue
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

  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`
  }

  const getItemPrice = (item: any) => {
    let priceStr = item.price
    if (item.selectedSize === "large" && item.priceLarge) {
      priceStr = item.priceLarge
    } else if (item.selectedSize === "kids" && item.priceKids) {
      priceStr = item.priceKids
    }
    return parseFloat(priceStr.replace("£", "").replace("+", ""))
  }

  // Generate pickup time options (next 2 hours in 15 min intervals)
  const getPickupTimeOptions = () => {
    const options: { value: string; label: string }[] = []
    const now = new Date()
    
    // Round up to next 15 minutes + add 10 min buffer for preparation
    const minutes = now.getMinutes()
    const roundedMinutes = Math.ceil((minutes + 10) / 15) * 15
    now.setMinutes(roundedMinutes, 0, 0)
    
    // Add "ASAP" option
    options.push({ value: "asap", label: "ASAP (as soon as ready)" })
    
    // Generate time slots for next 2 hours
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
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\d\s+()-]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number"
    }
    
    // Table number validation - only required for dine-in
    if (orderType === "dine-in" && !formData.tableNumber.trim()) {
      newErrors.tableNumber = "Please select your table"
    }
    
    // Pickup time validation - required for both
    if (!formData.pickupTime) {
      newErrors.pickupTime = "Please select a pickup time"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Create order
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
      // Save phone for order lookup
      localStorage.setItem("customer_phone", formData.phone)
      clearCart()
      // Redirect to order tracking page
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        <Section className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-foreground/60 mb-8">Add items from the menu to continue</p>
            <Button asChild>
              <Link href="/#menu">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Menu
              </Link>
            </Button>
          </div>
        </Section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      
      <Section>
        <div className="max-w-6xl mx-auto">
          <Link href="/#menu" className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const itemPrice = getItemPrice(item)
                      return (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 pb-4 border-b border-border/50 last:border-0">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-sm text-foreground">{item.name}</h3>
                                {item.selectedSize && item.selectedSize !== "regular" && (
                                  <p className="text-xs text-foreground/60 capitalize">{item.selectedSize}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id, item.selectedSize)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                aria-label="Remove item"
                              >
                                <X className="h-4 w-4 text-foreground/60" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-4 w-4 text-foreground/70" />
                                </button>
                                <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-4 w-4 text-foreground/70" />
                                </button>
                              </div>
                              <p className="font-semibold text-sm">{formatPrice(itemPrice * item.quantity)}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Order Type Selection */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-6 w-6" />
                    Order Type
                  </h2>
                  <p className="text-sm text-foreground/60 mb-4">How would you like your order?</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setOrderType("dine-in")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        orderType === "dine-in"
                          ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          orderType === "dine-in" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          🍽️
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Dine In</p>
                          <p className="text-xs text-foreground/60">Eat at the café</p>
                        </div>
                      </div>
                      {orderType === "dine-in" && (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                          ✓ Selected
                        </div>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setOrderType("takeaway")
                        setFormData({ ...formData, tableNumber: "" })
                        setErrors({ ...errors, tableNumber: undefined })
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        orderType === "takeaway"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          orderType === "takeaway" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          🥡
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Takeaway</p>
                          <p className="text-xs text-foreground/60">Take your order to go</p>
                        </div>
                      </div>
                      {orderType === "takeaway" && (
                        <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                          ✓ Selected
                        </div>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    <User className="h-6 w-6" />
                    Your Details
                  </h2>
                  <p className="text-sm text-foreground/60 mb-6">For order identification</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => {
                          handleChange(e)
                          if (errors.name) setErrors({ ...errors, name: undefined })
                        }}
                        placeholder="Your name"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white ${
                          errors.name 
                            ? "border-red-500 focus:ring-red-200 focus:border-red-500" 
                            : "border-foreground/20 focus:ring-foreground/20 focus:border-foreground/40"
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          handleChange(e)
                          if (errors.phone) setErrors({ ...errors, phone: undefined })
                        }}
                        placeholder="e.g. 07123 456789"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white ${
                          errors.phone 
                            ? "border-red-500 focus:ring-red-200 focus:border-red-500" 
                            : "border-foreground/20 focus:ring-foreground/20 focus:border-foreground/40"
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>
                    
                    {/* Table Number - Only for Dine In */}
                    {orderType === "dine-in" && (
                      <div>
                        <label htmlFor="tableNumber" className="block text-sm font-medium mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Table / Seating Location *
                        </label>
                        <select
                          id="tableNumber"
                          name="tableNumber"
                          value={formData.tableNumber}
                          onChange={(e) => {
                            handleChange(e)
                            if (errors.tableNumber) setErrors({ ...errors, tableNumber: undefined })
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white ${
                            errors.tableNumber 
                              ? "border-red-500 focus:ring-red-200 focus:border-red-500" 
                              : "border-foreground/20 focus:ring-foreground/20 focus:border-foreground/40"
                          }`}
                        >
                          <option value="">Select your table</option>
                          {[...Array(20)].map((_, i) => (
                            <option key={i + 1} value={`${i + 1}`}>
                              Table {i + 1}
                            </option>
                          ))}
                          <option value="counter">Counter Seating</option>
                          <option value="outdoor">Outdoor Area</option>
                        </select>
                        {errors.tableNumber && (
                          <p className="mt-1 text-sm text-red-500">{errors.tableNumber}</p>
                        )}
                      </div>
                    )}

                    {/* Pickup Time - For both Dine In and Takeaway */}
                    <div>
                      <label htmlFor="pickupTime" className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {orderType === "dine-in" ? "When would you like it served?" : "Pickup Time"} *
                      </label>
                      <select
                        id="pickupTime"
                        name="pickupTime"
                        value={formData.pickupTime}
                        onChange={(e) => {
                          handleChange(e)
                          if (errors.pickupTime) setErrors({ ...errors, pickupTime: undefined })
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white ${
                          errors.pickupTime 
                            ? "border-red-500 focus:ring-red-200 focus:border-red-500" 
                            : "border-foreground/20 focus:ring-foreground/20 focus:border-foreground/40"
                        }`}
                      >
                        <option value="">Select a time</option>
                        {getPickupTimeOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.pickupTime && (
                        <p className="mt-1 text-sm text-red-500">{errors.pickupTime}</p>
                      )}
                      <p className="mt-1 text-xs text-foreground/50">
                        {orderType === "dine-in" 
                          ? "We'll bring it to your table at the selected time" 
                          : "Your order will be ready for collection at this time"}
                      </p>
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label htmlFor="specialInstructions" className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Special Instructions / Allergies
                      </label>
                      <textarea
                        id="specialInstructions"
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleChange}
                        placeholder="e.g. No nuts, extra hot, oat milk, gluten-free..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-foreground/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40 bg-white resize-none"
                      />
                      <p className="mt-1 text-xs text-foreground/50">
                        Please mention any allergies or dietary requirements
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Total */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-6">Order Total</h2>
                  
                  {/* Estimated Wait Time */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Estimated Wait Time</p>
                        <p className="text-2xl font-bold text-blue-900">~{getEstimatedWaitTime().min}-{getEstimatedWaitTime().max} min</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">After payment confirmation</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between text-xl font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full mb-4 text-lg py-6"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting || 
                      !formData.name.trim() || 
                      !formData.phone.trim() || 
                      !formData.pickupTime ||
                      (orderType === "dine-in" && !formData.tableNumber)
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending Order...
                      </>
                    ) : (
                      <>
                        🍳 Send Order to Kitchen
                      </>
                    )}
                  </Button>

                  {(!formData.name.trim() || !formData.phone.trim() || !formData.pickupTime || (orderType === "dine-in" && !formData.tableNumber)) && (
                    <p className="text-sm text-amber-600 text-center mb-4">
                      Please fill in all required fields
                    </p>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-amber-800 text-center font-medium">
                      💳 Pay at counter to start your order
                    </p>
                    <p className="text-xs text-amber-700 text-center">
                      Your order will be prepared after payment is confirmed by staff
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
