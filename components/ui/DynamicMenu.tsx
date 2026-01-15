"use client"

import { useMenu } from "@/contexts/MenuContext"
import { MenuItem, useCart } from "@/contexts/CartContext"
import { Plus, Minus, Flame, Check, ShoppingBag, Pizza, Sandwich, UtensilsCrossed, Beef, Salad, CupSoda, LayoutGrid } from "lucide-react"
import { useMemo, useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

type CategoryFilter = "all" | "pizzas" | "fatayer" | "wraps" | "meals" | "grill" | "sides" | "drinks"

const categoryConfig: { id: CategoryFilter; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <LayoutGrid className="h-5 w-5" /> },
  { id: "pizzas", label: "Pizzas", icon: <Pizza className="h-5 w-5" /> },
  { id: "fatayer", label: "Fatayer", icon: <Sandwich className="h-5 w-5" /> },
  { id: "wraps", label: "Wraps", icon: <Sandwich className="h-5 w-5" /> },
  { id: "meals", label: "Meals", icon: <UtensilsCrossed className="h-5 w-5" /> },
  { id: "grill", label: "Grill", icon: <Beef className="h-5 w-5" /> },
  { id: "sides", label: "Sides", icon: <Salad className="h-5 w-5" /> },
  { id: "drinks", label: "Drinks", icon: <CupSoda className="h-5 w-5" /> },
]

// Unsplash fallback images by category - high quality food photos (hotlink-friendly)
const categoryFallbackImages: Record<string, string[]> = {
  pizzas: [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=75",
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=75",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=75",
    "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400&q=75",
    "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&q=75",
  ],
  fatayer: [
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=75",
    "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&q=75",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=75",
    "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&q=75",
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=75",
  ],
  wraps: [
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=75",
    "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=75",
    "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&q=75",
    "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&q=75",
    "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&q=75",
  ],
  meals: [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=75",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=75",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=75",
    "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=75",
  ],
  grill: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=75",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=75",
    "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&q=75",
    "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&q=75",
    "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&q=75",
  ],
  sides: [
    "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400&q=75",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=75",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=75",
    "https://images.unsplash.com/photo-1534938665420-4193effeab64?w=400&q=75",
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=75",
  ],
  drinks: [
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=75",
    "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=75",
    "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=75",
    "https://images.unsplash.com/photo-1560526860-1f0e56046c85?w=400&q=75",
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=75",
  ],
}

// Get fallback image based on category and item index
const getFallbackImage = (categorySlug: string, itemIndex: number): string => {
  const images = categoryFallbackImages[categorySlug] || categoryFallbackImages.meals
  return images[itemIndex % images.length]
}

type ExtendedMenuItem = MenuItem & { 
  id: string
  isPopular?: boolean
  isVegan?: boolean
  isNew?: boolean
  isVegetarian?: boolean
  isGlutenFree?: boolean
  isDairyFree?: boolean
  priceLarge?: string
  priceKids?: string
}

// Modern Menu Item Card
function MenuItemCard({ item, isCompact = false }: { item: ExtendedMenuItem; isCompact?: boolean }) {
  const { addToCart, cartItems, updateQuantity } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  
  const cartItem = cartItems.find((i) => i.id === item.id)
  const quantity = cartItem?.quantity || 0
  
  const handleAdd = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      description: item.description,
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1000)
  }

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, quantity + 1)
    } else {
      handleAdd()
    }
  }

  const handleDecrement = () => {
    if (cartItem && quantity > 0) {
      updateQuantity(cartItem.id, quantity - 1)
    }
  }

  if (isCompact) {
    // Compact card for grid view
    return (
      <div className={cn(
        "group relative bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        item.isPopular ? "border-shawarma/30 ring-2 ring-shawarma/10" : "border-gray-100"
      )}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton-brand" />
          )}
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn("object-cover transition-transform duration-500 group-hover:scale-110", imageLoaded ? "opacity-100" : "opacity-0")}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setImageLoaded(true)}
          />
          {/* Popular badge with glow */}
          {item.isPopular && (
            <div className="absolute top-2 left-2 bg-shawarma text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-glow-pulse">
              🔥 Popular
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-3">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">{item.name}</h4>
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.description}</p>

          {/* Price & Add */}
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-900">{item.price}</span>
            
            {quantity > 0 ? (
              <div className="flex items-center gap-1 bg-gray-900 rounded-full">
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-white font-semibold text-sm">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-8 h-8 flex items-center justify-center text-white hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={cn(
                  "h-9 px-4 rounded-full font-semibold text-sm flex items-center gap-1.5 transition-all duration-200",
                  justAdded 
                    ? "bg-green-500 text-white" 
                    : "bg-shawarma hover:bg-shawarma-600 text-white hover:scale-105"
                )}
              >
                {justAdded ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Large featured card
  return (
    <div className={cn(
      "group relative bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1",
      item.isPopular ? "border-shawarma/30 ring-2 ring-shawarma/10" : "border-gray-100"
    )}>
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden bg-gray-100 flex-shrink-0">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton-brand" />
          )}
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn("object-cover transition-transform duration-500 group-hover:scale-110", imageLoaded ? "opacity-100" : "opacity-0")}
            sizes="(max-width: 640px) 100vw, 200px"
            onLoad={() => setImageLoaded(true)}
          />
          {/* Popular badge with glow */}
          {item.isPopular && (
            <div className="absolute top-3 left-3 bg-shawarma text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-glow-pulse">
              🔥 Popular
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h4>
            <p className="text-sm text-gray-500 mb-3">{item.description}</p>
          </div>

          {/* Price & Add */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-bold text-gray-900">{item.price}</span>
            
            {quantity > 0 ? (
              <div className="flex items-center gap-2 bg-gray-900 rounded-full px-1">
                <button
                  onClick={handleDecrement}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="w-8 text-center text-white font-bold">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className={cn(
                  "h-11 px-6 rounded-full font-semibold flex items-center gap-2 transition-all duration-200",
                  justAdded 
                    ? "bg-green-500 text-white" 
                    : "bg-shawarma hover:bg-shawarma-600 text-white hover:scale-105 shadow-lg"
                )}
              >
                {justAdded ? (
                  <>
                    <Check className="h-5 w-5" />
                    Added!
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Add to Order
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface DynamicMenuProps {
  showCategories?: string[]
  maxItemsPerCategory?: number
  showCategoryHeaders?: boolean
}

export function DynamicMenu({ 
  showCategories, 
  maxItemsPerCategory,
  showCategoryHeaders = true 
}: DynamicMenuProps) {
  const { categories, menuItems, loading, error } = useMenu()
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all")
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const tabsRef = useRef<HTMLDivElement>(null)

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash.startsWith("menu-")) {
        const category = hash.replace("menu-", "") as CategoryFilter
        if (["pizzas", "fatayer", "wraps", "meals", "grill", "sides", "drinks"].includes(category)) {
          setActiveCategory(category)
        }
      } else if (hash === "menu") {
        setActiveCategory("all")
      }
    }
    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  // Transform items
  const transformedItems = useMemo(() => {
    if (!menuItems || menuItems.length === 0 || !categories || categories.length === 0) {
      return null
    }
    const itemsByCategory: Record<string, ExtendedMenuItem[]> = {}
    categories.forEach(cat => {
      const categoryItems = menuItems
        .filter(item => item.categoryId === cat.id && item.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item, index) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: `£${item.price.toFixed(2)}`,
          priceLarge: item.priceLarge ? `£${item.priceLarge.toFixed(2)}` : undefined,
          priceKids: item.priceKids ? `£${item.priceKids.toFixed(2)}` : undefined,
          image: item.imageUrl || getFallbackImage(cat.slug, index),
          category: cat.name,
          isVegan: item.isVegan,
          isVegetarian: item.isVegetarian,
          isGlutenFree: item.isGlutenFree,
          isDairyFree: item.isDairyFree,
          isPopular: item.isPopular,
          isNew: item.isNew,
        }))
      itemsByCategory[cat.slug] = maxItemsPerCategory ? categoryItems.slice(0, maxItemsPerCategory) : categoryItems
    })
    return itemsByCategory
  }, [categories, menuItems, maxItemsPerCategory])

  // All data must come from Supabase - no fallbacks
  const hasData = transformedItems && Object.values(transformedItems).some(items => items.length > 0)
  const displayItems = transformedItems
  const displayCategories = categories

  const filteredCategories = showCategories 
    ? displayCategories.filter(cat => showCategories.includes(cat.slug))
    : displayCategories.filter(cat => cat.isActive)

  // Get all items for "all" category view
  const allItems = useMemo(() => {
    if (!displayItems) return []
    return Object.values(displayItems).flat()
  }, [displayItems])

  // Get popular items
  const popularItems = useMemo(() => {
    return allItems.filter(item => item.isPopular).slice(0, 4)
  }, [allItems])

  // Change category filter (no scroll)
  const selectCategory = (categorySlug: string) => {
    setActiveCategory(categorySlug as CategoryFilter)
  }

  // Show error if no data loaded from Supabase
  if (!loading && error) {
    return (
      <div className="py-12 text-center">
        <div className="max-w-md mx-auto p-6 bg-red-50 rounded-2xl border border-red-200">
          <h3 className="text-lg font-bold text-red-800 mb-2">Database Not Connected</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <p className="text-red-500 text-xs">Please run the SQL schema in Supabase SQL Editor.</p>
        </div>
      </div>
    )
  }

  // Show message if no menu items
  if (!loading && !hasData) {
    return (
      <div className="py-12 text-center">
        <div className="max-w-md mx-auto p-6 bg-amber-50 rounded-2xl border border-amber-200">
          <h3 className="text-lg font-bold text-amber-800 mb-2">No Menu Items</h3>
          <p className="text-amber-600 text-sm">Please run the SQL schema in Supabase to populate the menu.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Skeleton tabs with staggered animation */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:justify-center">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div 
              key={i} 
              className="flex-shrink-0 flex flex-col items-center gap-2"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 skeleton-brand rounded-2xl" />
              <div className="w-10 h-3 skeleton-brand rounded" />
            </div>
          ))}
        </div>
        {/* Skeleton grid with staggered animation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl overflow-hidden border border-gray-100"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="aspect-[4/3] skeleton-brand" />
              <div className="p-3 space-y-2.5">
                <div className="h-4 skeleton-brand rounded w-4/5" />
                <div className="h-3 skeleton-brand rounded w-3/5" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 skeleton-brand rounded w-16" />
                  <div className="h-9 w-20 skeleton-brand rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Pills - Sticky */}
      <div 
        ref={tabsRef}
        className="sticky top-20 z-40 bg-white/95 backdrop-blur-lg py-4 -mx-6 px-6 border-b border-gray-100 shadow-sm"
      >
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide md:justify-center">
          {categoryConfig.map((cat, index) => {
            const isActive = activeCategory === cat.id
            const itemCount = cat.id === "all" 
              ? allItems.length 
              : (displayItems?.[cat.id] || []).length
            
            if (cat.id !== "all" && itemCount === 0) return null
            
            return (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1.5 transition-all duration-300 group press-effect",
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon Circle with animation */}
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-shawarma text-white shadow-lg shadow-shawarma/30 scale-110"
                    : "bg-gray-100 text-gray-600 hover:bg-shawarma/10 hover:text-shawarma group-hover:scale-105"
                )}>
                  {/* Animated background for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-shawarma to-shawarma-600 animate-pulse-slow" />
                  )}
                  <span className="relative z-10">{cat.icon}</span>
                </div>
                {/* Label with underline animation */}
                <div className="relative">
                  <span className={cn(
                    "text-xs font-medium transition-colors duration-200",
                    isActive ? "text-shawarma font-semibold" : "text-gray-600 group-hover:text-shawarma"
                  )}>
                    {cat.label}
                  </span>
                  {/* Animated underline */}
                  <div className={cn(
                    "absolute -bottom-0.5 left-0 h-0.5 bg-shawarma rounded-full transition-all duration-300",
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                </div>
                {/* Count badge */}
                {itemCount > 0 && (
                  <span className={cn(
                    "text-[10px] font-medium -mt-1 transition-all duration-200",
                    isActive ? "text-shawarma scale-110" : "text-gray-400 group-hover:text-shawarma"
                  )}>
                    {itemCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Popular Items - Featured Section */}
      {activeCategory === "all" && popularItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-shawarma" />
            <h3 className="text-xl font-bold text-gray-900">Most Popular</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {popularItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Menu Sections */}
      <div className="space-y-10">
        {filteredCategories
          .filter(category => activeCategory === "all" || category.slug === activeCategory)
          .map((category) => {
            const items = displayItems?.[category.slug] || []
            if (items.length === 0) return null

            const categoryConf = categoryConfig.find(c => c.id === category.slug)
            const showFeatured = activeCategory === "all" && items.some(i => i.isPopular)

            return (
              <div 
                key={category.slug} 
                ref={el => { categoryRefs.current[category.slug] = el }}
                className="scroll-mt-32"
              >
                {/* Category Header */}
                {showCategoryHeaders && (
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-shawarma flex items-center justify-center text-white">
                        {categoryConf?.icon || <UtensilsCrossed className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">{items.length} items</p>
                      </div>
                    </div>
                    {activeCategory === "all" && (
                      <button 
                        onClick={() => setActiveCategory(category.slug as CategoryFilter)}
                        className="text-sm text-shawarma font-semibold hover:underline flex items-center gap-1"
                      >
                        View all
                        <span>→</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {(activeCategory === "all" ? items.slice(0, 5) : items).map((item) => (
                    <MenuItemCard key={item.id} item={item} isCompact />
                  ))}
                </div>
              </div>
            )
          })}
      </div>

      {/* Empty State */}
      {filteredCategories.filter(cat => activeCategory === "all" || cat.slug === activeCategory).every(cat => (displayItems?.[cat.slug] || []).length === 0) && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No items found</h3>
          <p className="text-gray-500 mb-4">Try selecting a different category</p>
          <button
            onClick={() => setActiveCategory("all")}
            className="text-shawarma font-semibold hover:underline"
          >
            View all items →
          </button>
        </div>
      )}
    </div>
  )
}
