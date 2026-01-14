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

// Fallback menu items - TODAY SHAWARMA ACTUAL MENU
const fallbackMenuItems: Record<string, ExtendedMenuItem[]> = {
  pizzas: [
    { id: "pz1", name: "Margherita", description: "Cheese & tomato", price: "£4.99", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=75", category: "Pizzas", isVegetarian: true },
    { id: "pz2", name: "Chicken Pizza", description: "Chicken, mushroom & sweetcorn", price: "£5.99", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=75", category: "Pizzas", isPopular: true },
    { id: "pz3", name: "Lamb Pizza", description: "Lamb, green chilli & onions", price: "£6.99", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=75", category: "Pizzas" },
    { id: "pz4", name: "Meat Feast", description: "Chicken, lamb & pepperoni", price: "£6.99", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=75", category: "Pizzas", isPopular: true },
    { id: "pz5", name: "Veggie Pizza", description: "Mushrooms, onions, sweetcorn & green peppers", price: "£5.50", image: "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400&q=75", category: "Pizzas", isVegetarian: true },
    { id: "pz6", name: "Mighty Meaty", description: "Chicken, lamb, donner, spicy beef", price: "£6.99", image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&q=75", category: "Pizzas", isPopular: true, isNew: true },
    { id: "pz7", name: "Garlic Bread", description: "10\" garlic bread with cheese", price: "£3.99", image: "https://images.unsplash.com/photo-1619531040576-f9416740661b?w=400&q=75", category: "Pizzas", isVegetarian: true },
  ],
  fatayer: [
    { id: "ft1", name: "Chicken Fatayer", description: "10\" flatbread with chicken", price: "£4.99", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75", category: "Fatayer", isPopular: true },
    { id: "ft2", name: "Lamb Fatayer", description: "10\" flatbread with lamb", price: "£5.99", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75", category: "Fatayer" },
    { id: "ft3", name: "Mix Fatayer", description: "10\" flatbread with mix filling", price: "£5.50", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75", category: "Fatayer" },
    { id: "ft4", name: "Veggie Fatayer", description: "10\" flatbread with vegetables", price: "£4.99", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75", category: "Fatayer", isVegetarian: true },
    { id: "ft5", name: "Cheese Fatayer", description: "10\" flatbread with cheese", price: "£3.99", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75", category: "Fatayer", isVegetarian: true },
  ],
  wraps: [
    { id: "wr1", name: "Lamb Shawarma Wrap", description: "Tender lamb in wrap", price: "£4.99", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=75", category: "Wraps", isPopular: true },
    { id: "wr2", name: "Chicken Shawarma Wrap", description: "Marinated chicken in wrap", price: "£4.50", image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&q=75", category: "Wraps", isPopular: true },
    { id: "wr3", name: "Falafel Wrap", description: "Crispy falafel with salad", price: "£4.99", image: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=400&q=75", category: "Wraps", isVegan: true },
    { id: "wr4", name: "Lamb Sandwich", description: "Tender lamb in bread", price: "£4.99", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=75", category: "Wraps" },
    { id: "wr5", name: "Chicken Sandwich", description: "Marinated chicken in bread", price: "£4.50", image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&q=75", category: "Wraps" },
  ],
  meals: [
    { id: "ml1", name: "Lamb Shawarma Meal", description: "With chips & salad", price: "£7.99", image: "https://images.unsplash.com/photo-1547424850-2bef379d8159?w=400&q=75", category: "Meals", isPopular: true },
    { id: "ml2", name: "Chicken Shawarma Meal", description: "With chips & salad", price: "£6.99", image: "https://images.unsplash.com/photo-1547424850-2bef379d8159?w=400&q=75", category: "Meals", isPopular: true },
    { id: "ml3", name: "Falafel Meal", description: "6 pcs with naan & salad", price: "£5.99", image: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=400&q=75", category: "Meals", isVegan: true },
  ],
  grill: [
    { id: "gr1", name: "Mix Platter", description: "The ultimate feast for sharing", price: "£60.00", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=75", category: "Grill", isPopular: true },
    { id: "gr2", name: "Mix Kebab Full", description: "2 Kebabs, Tikka, Naan & Salad", price: "£17.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=75", category: "Grill" },
    { id: "gr3", name: "Mix Kebab Half", description: "Kebab, Tikka & Salad", price: "£14.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=75", category: "Grill" },
    { id: "gr4", name: "Lamb Chops", description: "5 pcs with salad & naan", price: "£13.00", priceLarge: "£16.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=75", category: "Grill" },
    { id: "gr5", name: "Lamb Kebab", description: "2 pcs with salad & naan", price: "£11.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=75", category: "Grill" },
    { id: "gr6", name: "Lamb Tikka", description: "2 pcs with salad & naan", price: "£13.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=75", category: "Grill" },
    { id: "gr7", name: "Chicken Tikka", description: "2 pcs with salad & naan", price: "£10.00", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=75", category: "Grill" },
    { id: "gr8", name: "Chicken Wings", description: "10 pcs with salad & naan", price: "£9.00", image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=75", category: "Grill", isPopular: true },
    { id: "gr9", name: "Dolma", description: "Saturday special", price: "£12.00", image: "https://images.unsplash.com/photo-1621532074858-a7e5a99a4e9e?w=400&q=75", category: "Grill", isNew: true },
  ],
  sides: [
    { id: "sd1", name: "Chips", description: "Crispy golden chips", price: "£2.50", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=75", category: "Sides", isVegan: true },
    { id: "sd2", name: "Fresh Salad", description: "Mixed fresh salad", price: "£2.50", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=75", category: "Sides", isVegan: true, isGlutenFree: true },
    { id: "sd3", name: "Falafel", description: "Crispy chickpea falafel", price: "£3.99", image: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=400&q=75", category: "Sides", isVegan: true, isPopular: true },
    { id: "sd4", name: "Hummus", description: "Classic chickpea dip", price: "£3.00", image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&q=75", category: "Sides", isVegan: true, isGlutenFree: true },
    { id: "sd5", name: "Tub of Sauce", description: "Garlic, chilli or tahini", price: "£0.50", image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&q=75", category: "Sides", isVegetarian: true },
  ],
  drinks: [
    { id: "dr1", name: "Can of Drink", description: "Coke, Fanta, Sprite", price: "£1.00", image: "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&q=75", category: "Drinks", isVegan: true },
    { id: "dr2", name: "Bottle", description: "500ml soft drink", price: "£1.50", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=75", category: "Drinks", isVegan: true },
    { id: "dr3", name: "Ayran", description: "Traditional yogurt drink", price: "£1.00", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=75", category: "Drinks", isVegetarian: true, isPopular: true },
  ],
}

const defaultCategories = [
  { id: "1", slug: "pizzas", name: "Pizzas", sortOrder: 1, isActive: true },
  { id: "2", slug: "fatayer", name: "Fatayer", sortOrder: 2, isActive: true },
  { id: "3", slug: "wraps", name: "Wraps & Sandwiches", sortOrder: 3, isActive: true },
  { id: "4", slug: "meals", name: "Meals", sortOrder: 4, isActive: true },
  { id: "5", slug: "grill", name: "Grill & Platters", sortOrder: 5, isActive: true },
  { id: "6", slug: "sides", name: "Sides", sortOrder: 6, isActive: true },
  { id: "7", slug: "drinks", name: "Drinks", sortOrder: 7, isActive: true },
]

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
      <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn("object-cover transition-transform duration-300 group-hover:scale-105", imageLoaded ? "opacity-100" : "opacity-0")}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setImageLoaded(true)}
          />
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
    <div className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden bg-gray-100 flex-shrink-0">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn("object-cover transition-transform duration-300 group-hover:scale-105", imageLoaded ? "opacity-100" : "opacity-0")}
            sizes="(max-width: 640px) 100vw, 200px"
            onLoad={() => setImageLoaded(true)}
          />
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
  const { categories, menuItems, loading } = useMenu()
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
        .map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: `£${item.price.toFixed(2)}`,
          priceLarge: item.priceLarge ? `£${item.priceLarge.toFixed(2)}` : undefined,
          priceKids: item.priceKids ? `£${item.priceKids.toFixed(2)}` : undefined,
          image: item.imageUrl || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=75",
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

  const hasSupabaseData = transformedItems && Object.values(transformedItems).some(items => items.length > 0)
  const displayItems = hasSupabaseData ? transformedItems : fallbackMenuItems
  const displayCategories = categories.length > 0 ? categories : defaultCategories

  const filteredCategories = showCategories 
    ? displayCategories.filter(cat => showCategories.includes(cat.slug))
    : displayCategories.filter(cat => cat.isActive)

  // Get all items for "all" category view
  const allItems = useMemo(() => {
    return Object.values(displayItems).flat()
  }, [displayItems])

  // Get popular items
  const popularItems = useMemo(() => {
    return allItems.filter(item => item.isPopular).slice(0, 4)
  }, [allItems])

  // Scroll to category
  const scrollToCategory = (categorySlug: string) => {
    setActiveCategory(categorySlug as CategoryFilter)
    if (categorySlug === "all") return
    const ref = categoryRefs.current[categorySlug]
    if (ref) {
      const offset = 120
      const top = ref.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Skeleton tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex-shrink-0 w-24 h-12 bg-gray-100 rounded-full animate-pulse" />
          ))}
        </div>
        {/* Skeleton grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-gray-100 rounded-2xl animate-pulse">
              <div className="aspect-[4/3]" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-full" />
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
        className="sticky top-16 z-40 bg-white/95 backdrop-blur-lg py-4 -mx-6 px-6 border-b border-gray-100"
      >
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide md:justify-center">
          {categoryConfig.map((cat) => {
            const isActive = activeCategory === cat.id
            const itemCount = cat.id === "all" 
              ? allItems.length 
              : (displayItems[cat.id] || []).length
            
            if (cat.id !== "all" && itemCount === 0) return null
            
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1.5 transition-all duration-200",
                )}
              >
                {/* Icon Circle */}
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200",
                  isActive
                    ? "bg-shawarma text-white shadow-lg shadow-shawarma/30 scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}>
                  {cat.icon}
                </div>
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-shawarma" : "text-gray-600"
                )}>
                  {cat.label}
                </span>
                {/* Count badge */}
                {itemCount > 0 && (
                  <span className={cn(
                    "text-[10px] font-medium -mt-1",
                    isActive ? "text-shawarma" : "text-gray-400"
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
            const items = displayItems[category.slug] || []
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
      {filteredCategories.filter(cat => activeCategory === "all" || cat.slug === activeCategory).every(cat => (displayItems[cat.slug] || []).length === 0) && (
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
