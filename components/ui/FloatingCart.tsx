"use client"

import { ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function FloatingCart() {
  const { getTotalItems, getTotalPrice, setIsOpen } = useCart()
  const pathname = usePathname()
  
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  
  // Don't show on checkout or admin pages
  const hiddenPaths = ["/checkout", "/admin", "/order"]
  const isHidden = hiddenPaths.some(path => pathname?.startsWith(path))
  
  if (isHidden || totalItems === 0) return null

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={cn(
        "fixed bottom-6 right-6 z-40",
        "flex items-center gap-3 px-5 py-3",
        "bg-gray-900 text-white",
        "rounded-full shadow-2xl",
        "hover:scale-105 active:scale-95",
        "transition-all duration-200",
        "animate-in slide-in-from-bottom-4 fade-in"
      )}
    >
      {/* Pulse animation for attention */}
      <span className="absolute inset-0 rounded-full bg-gray-900 animate-ping opacity-20" />
      
      <div className="relative">
        <ShoppingBag className="h-5 w-5" />
        {/* Item count badge */}
        <span className="absolute -top-2 -right-2 h-5 w-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      </div>
      
      <div className="flex flex-col items-start leading-tight">
        <span className="text-xs opacity-80">View Cart</span>
        <span className="font-bold">£{totalPrice.toFixed(2)}</span>
      </div>
    </button>
  )
}
