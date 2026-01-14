"use client"

import { X, Plus, Minus, ShoppingBag, Trash2, Clock, ArrowRight, Sparkles } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, isOpen, setIsOpen } = useCart()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

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

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => setIsOpen(false), 300)
  }

  if (!isOpen) return null

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Cart Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-[420px] bg-gray-50 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-shawarma rounded-xl">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
                <p className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Estimated Time Banner */}
        {cartItems.length > 0 && (
          <div className="bg-shawarma-50 px-6 py-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-shawarma" />
            <span className="text-sm font-medium text-shawarma-800">Ready in 15-20 mins</span>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
              {/* Animated empty cart illustration */}
              <div className="relative w-32 h-32 mb-6">
                {/* Background rings */}
                <div className="absolute inset-0 bg-shawarma/5 rounded-full animate-pulse-slow" />
                <div className="absolute inset-4 bg-shawarma/10 rounded-full animate-pulse-slow" style={{ animationDelay: '0.3s' }} />
                
                {/* Main icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner animate-empty-bounce">
                    <ShoppingBag className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
                  </div>
                </div>
                
                {/* Floating food elements */}
                <div className="absolute -top-1 right-2 text-2xl animate-float-slow">🍕</div>
                <div className="absolute bottom-2 -left-1 text-xl animate-float-medium" style={{ animationDelay: '0.5s' }}>🥙</div>
                <div className="absolute top-1/2 -right-2 text-lg animate-float-fast" style={{ animationDelay: '1s' }}>🔥</div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-8 max-w-[250px]">
                Craving something delicious? Browse our menu and add your favorites!
              </p>
              <Button 
                variant="primary" 
                onClick={handleClose}
                className="gap-2 press-effect group"
              >
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item, index) => {
                const itemPrice = getItemPrice(item)
                return (
                  <div 
                    key={`${item.id}-${item.selectedSize}`} 
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                          </button>
                        </div>
                        
                        {item.selectedSize && item.selectedSize !== "regular" && (
                          <p className="text-xs text-gray-500 capitalize mb-2">{item.selectedSize} size</p>
                        )}
                        
                        {/* Price & Quantity */}
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-bold text-gray-900">{formatPrice(itemPrice * item.quantity)}</p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer - Sticky Checkout */}
        {cartItems.length > 0 && (
          <div className="bg-white border-t border-gray-100 p-6 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            {/* Subtotal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Service fee</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600 pt-1">
                <span>💚</span>
                <span>Pay after your meal at cashier</span>
              </div>
            </div>
            
            {/* Divider */}
            <div className="h-px bg-gray-100" />
            
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
            </div>

            {/* Checkout Button */}
            <Link 
              href="/checkout" 
              onClick={handleClose}
              className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-shawarma hover:bg-shawarma-600 text-white font-bold text-lg rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              <span>Checkout</span>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <span className="text-sm">{formatPrice(totalPrice)}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
            
            {/* Continue Shopping */}
            <button
              onClick={handleClose}
              className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
