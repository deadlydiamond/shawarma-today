"use client"

import { useState, useEffect, useMemo } from "react"
import { X, Tag, Percent, Sparkles, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useMenu } from "@/contexts/MenuContext"

export function FloatingPromo() {
  const { promotions, banners, getTodaySpecials } = useMenu()
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get today's specials
  const todaySpecials = useMemo(() => getTodaySpecials(), [getTodaySpecials])

  // Get active promotions and banners
  const activePromotions = promotions.filter(p => p.isActive)
  const activeBanners = banners.filter(b => b.isActive && b.position === "top")
  
  // Combine all offers
  const allOffers = [
    ...activeBanners.map(b => ({ type: "banner" as const, data: b })),
    ...activePromotions.map(p => ({ type: "promo" as const, data: p })),
    ...todaySpecials.map(s => ({ type: "special" as const, data: s })),
  ]

  // Rotate through offers
  useEffect(() => {
    if (allOffers.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % allOffers.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [allOffers.length])

  if (!isVisible || allOffers.length === 0) return null

  const currentOffer = allOffers[currentIndex]

  return (
    <div className="fixed left-4 bottom-24 z-50 max-w-xs">
      {/* Collapsed view - just a badge */}
      {!isExpanded ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="group flex items-center gap-2 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-gradient-x"
            style={{
              background: "linear-gradient(90deg, #f59e0b, #ea580c, #dc2626, #ea580c, #f59e0b)",
              backgroundSize: "200% 100%",
            }}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="font-semibold text-sm">
              {allOffers.length} Offer{allOffers.length > 1 ? "s" : ""} Available
            </span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 bg-gray-900/80 text-white rounded-full hover:bg-gray-900 transition-colors"
            title="Dismiss offers"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Expanded view - full offer card with 80% opacity */
        <div className="relative rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden animate-in slide-in-from-left-5 duration-300 backdrop-blur-sm" style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}>
          {/* Header */}
          <div className="px-4 py-2.5 flex items-center justify-between animate-gradient-x" style={{
            background: "linear-gradient(90deg, #f59e0b, #ea580c, #dc2626, #ea580c, #f59e0b)",
            backgroundSize: "200% 100%",
          }}>
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-sm">Today&apos;s Offers</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
                title="Minimize"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Offer content */}
          <div className="p-4">
            {currentOffer.type === "banner" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full">
                    <Tag className="h-4 w-4 text-amber-600" />
                  </span>
                  <span className="font-bold text-gray-900">{currentOffer.data.title}</span>
                </div>
                {currentOffer.data.subtitle && (
                  <p className="text-sm text-gray-600 pl-10">{currentOffer.data.subtitle}</p>
                )}
                {currentOffer.data.buttonText && currentOffer.data.buttonLink && (
                  <Link
                    href={currentOffer.data.buttonLink}
                    className="inline-flex items-center gap-1 ml-10 mt-2 text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    {currentOffer.data.buttonText}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            )}

            {currentOffer.type === "promo" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <Percent className="h-4 w-4 text-green-600" />
                  </span>
                  <span className="font-bold text-gray-900">{currentOffer.data.name}</span>
                </div>
                <div className="pl-10">
                  <span className="inline-flex px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    {currentOffer.data.promoType === "percentage" 
                      ? `${currentOffer.data.discountValue}% OFF` 
                      : `£${currentOffer.data.discountValue?.toFixed(2)} OFF`}
                  </span>
                </div>
                {currentOffer.data.description && (
                  <p className="text-sm text-gray-600 pl-10">{currentOffer.data.description}</p>
                )}
              </div>
            )}

            {currentOffer.type === "special" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Today&apos;s Special</span>
                    <p className="font-bold text-gray-900">{currentOffer.data.name}</p>
                  </div>
                </div>
                {currentOffer.data.price && (
                  <div className="pl-10">
                    <span className="text-lg font-bold text-purple-600">
                      £{currentOffer.data.price.toFixed(2)}
                    </span>
                    {currentOffer.data.description && (
                      <p className="text-sm text-gray-500 mt-1">{currentOffer.data.description}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Pagination dots */}
            {allOffers.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-gray-100">
                {allOffers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex 
                        ? "bg-amber-500 w-4" 
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* View all link */}
          <a
            href="/#menu"
            className="block text-center py-2.5 bg-gray-50 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors border-t border-gray-100"
          >
            View Full Menu
          </a>
        </div>
      )}
    </div>
  )
}
