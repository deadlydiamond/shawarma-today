"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, XCircle, Leaf, Flame, Sparkles, WheatOff, MilkOff } from "lucide-react"
import { useCart, MenuItem } from "@/contexts/CartContext"
import { useMenu } from "@/contexts/MenuContext"
import { useState } from "react"

interface MenuItemCardProps {
  item: MenuItem & { id: string }
  soldOut?: boolean
}

export function MenuItemCard({ item, soldOut: propSoldOut }: MenuItemCardProps) {
  const { addToCart } = useCart()
  const { menuItems } = useMenu()
  const [selectedSize, setSelectedSize] = useState<"regular" | "large" | "kids">("regular")
  const [imageLoaded, setImageLoaded] = useState(false)
  const hasSizes = !!(item.priceLarge || item.priceKids)

  // Check if item is sold out from the MenuContext
  const menuItem = menuItems.find(mi => mi.id === item.id || mi.name === item.name)
  const isSoldOut = propSoldOut || menuItem?.isSoldOut || false

  // Get tags from the item or from MenuContext
  const isVegan = item.isVegan || menuItem?.isVegan || false
  const isVegetarian = item.isVegetarian || menuItem?.isVegetarian || false
  const isGlutenFree = item.isGlutenFree || menuItem?.isGlutenFree || false
  const isDairyFree = item.isDairyFree || menuItem?.isDairyFree || false
  const isPopular = item.isPopular || menuItem?.isPopular || false
  const isNew = item.isNew || menuItem?.isNew || false

  const hasTags = isVegan || isVegetarian || isGlutenFree || isDairyFree || isPopular || isNew

  const handleAddToCart = () => {
    addToCart(item, selectedSize)
  }

  const getDisplayPrice = () => {
    if (selectedSize === "large" && item.priceLarge) {
      return item.priceLarge
    }
    if (selectedSize === "kids" && item.priceKids) {
      return item.priceKids
    }
    return item.price
  }

  return (
    <Card className={`group overflow-hidden transition-shadow duration-200 animate-fade-in flex flex-col ${
      isSoldOut ? "opacity-60" : "hover:shadow-xl"
    }`}>
      <div className="relative h-48 overflow-hidden">
        {/* Skeleton shimmer - always visible until image loads */}
        <div className={`absolute inset-0 skeleton-shimmer ${imageLoaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`} />
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className={`object-cover transition-opacity duration-500 ${isSoldOut ? "grayscale" : "group-hover:scale-105"} ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02LjY2OjY2Njo2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Njb/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQREiExBRMiQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAYEQEBAQEBAAAAAAAAAAAAAAABAgADEf/aAAwDAQACEQMRAD8AuOo3E11cQwXM8UcbFFVZCoGBgcH6KmJ7iKOVJLmaR2OcliSBVaKlJbEyGZ7n/9k="
          onLoad={() => setImageLoaded(true)}
        />
        {/* Tags overlay */}
        {!isSoldOut && hasTags && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                <Sparkles className="h-3 w-3" />
                NEW
              </span>
            )}
            {isPopular && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                <Flame className="h-3 w-3" />
                POPULAR
              </span>
            )}
            {isVegan && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full shadow-sm">
                <Leaf className="h-3 w-3" />
                VEGAN
              </span>
            )}
            {isVegetarian && !isVegan && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                <Leaf className="h-3 w-3" />
                VEG
              </span>
            )}
            {isGlutenFree && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-full shadow-sm">
                <WheatOff className="h-3 w-3" />
                GF
              </span>
            )}
            {isDairyFree && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                <MilkOff className="h-3 w-3" />
                DF
              </span>
            )}
          </div>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg flex items-center gap-2 -rotate-12">
              <XCircle className="h-5 w-5" />
              SOLD OUT
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <p className={`font-semibold text-sm ${isSoldOut ? "text-foreground/50" : "text-foreground"}`}>{item.name}</p>
          <p className={`font-semibold text-sm ml-2 ${isSoldOut ? "text-foreground/50 line-through" : "text-foreground"}`}>{getDisplayPrice()}</p>
        </div>
        <p className="text-xs text-foreground/60 leading-relaxed mb-3 flex-1">{item.description}</p>
        
        {!isSoldOut && hasSizes && (
          <div className="flex gap-2 mb-3">
            {/* For drinks with Large option: show Regular/Large */}
            {/* For meals with Kids option: show Adult/Kids */}
            {item.price && (
              <button
                onClick={() => setSelectedSize("regular")}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedSize === "regular"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.priceKids ? "Adult" : "Regular"}
              </button>
            )}
            {item.priceLarge && (
              <button
                onClick={() => setSelectedSize("large")}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedSize === "large"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Large
              </button>
            )}
            {item.priceKids && (
              <button
                onClick={() => setSelectedSize("kids")}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedSize === "kids"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Kids
              </button>
            )}
          </div>
        )}

        {isSoldOut ? (
          <Button
            size="sm"
            disabled
            className="w-full bg-gray-400 cursor-not-allowed"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Sold Out
          </Button>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={handleAddToCart}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
