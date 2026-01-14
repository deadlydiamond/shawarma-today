"use client"

import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, isOpen, setIsOpen } = useCart()

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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-foreground" strokeWidth={2} />
            <h2 className="text-2xl font-semibold">Your Order</h2>
            {getTotalItems() > 0 && (
              <span className="px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                {getTotalItems()}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-foreground/20 mb-4" strokeWidth={1.5} />
              <p className="text-lg font-medium text-foreground/60 mb-2">Your cart is empty</p>
              <p className="text-sm text-foreground/50">Add items from the menu to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemPrice = getItemPrice(item)
                return (
                  <Card key={`${item.id}-${item.selectedSize}`} className="p-4">
                    <div className="flex gap-4">
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
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            <Button
              asChild
              size="lg"
              variant="primary"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              <Link href="/checkout">🛒 Proceed to Checkout</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>

    </>
  )
}
