"use client"

import { useMenu } from "@/contexts/MenuContext"
import { MenuItem, useCart } from "@/contexts/CartContext"
import { Beef, UtensilsCrossed, Salad, CupSoda, Cookie, Plus, Flame, Leaf, Sparkles, WheatOff, MilkOff } from "lucide-react"
import { useMemo, useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

type CategoryFilter = "all" | "pizzas" | "fatayer" | "wraps" | "meals" | "grill" | "sides" | "drinks"

const categoryConfig: { id: CategoryFilter; label: string; icon: React.ReactNode; emoji: string }[] = [
  { id: "all", label: "All", icon: <UtensilsCrossed className="h-5 w-5" />, emoji: "🍽️" },
  { id: "pizzas", label: "Pizzas", icon: <UtensilsCrossed className="h-5 w-5" />, emoji: "🍕" },
  { id: "fatayer", label: "Fatayer", icon: <UtensilsCrossed className="h-5 w-5" />, emoji: "🫓" },
  { id: "wraps", label: "Wraps", icon: <Beef className="h-5 w-5" />, emoji: "🌯" },
  { id: "meals", label: "Meals", icon: <UtensilsCrossed className="h-5 w-5" />, emoji: "🍽️" },
  { id: "grill", label: "Grill", icon: <Beef className="h-5 w-5" />, emoji: "🍢" },
  { id: "sides", label: "Sides", icon: <Salad className="h-5 w-5" />, emoji: "🍟" },
  { id: "drinks", label: "Drinks", icon: <CupSoda className="h-5 w-5" />, emoji: "🥤" },
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
    { id: "pz7", name: "Garlic Bread with Cheese", description: "10\" garlic bread topped with cheese", price: "£3.99", image: "https://images.unsplash.com/photo-1619531040576-f9416740661b?w=400&q=75", category: "Pizzas", isVegetarian: true },
  ],
  fatayer: [
    { id: "ft1", name: "Chicken Fatayer", description: "10\" flatbread with chicken filling", price: "£4.99", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75", category: "Fatayer", isPopular: true },
    { id: "ft2", name: "Lamb Fatayer", description: "10\" flatbread with lamb filling", price: "£5.99", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75", category: "Fatayer" },
    { id: "ft3", name: "Mix Fatayer", description: "10\" flatbread with mixed filling", price: "£5.50", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75", category: "Fatayer" },
    { id: "ft4", name: "Veggie Fatayer", description: "10\" flatbread with vegetable filling", price: "£4.99", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75", category: "Fatayer", isVegetarian: true },
    { id: "ft5", name: "Cheese Fatayer", description: "10\" flatbread with cheese filling", price: "£3.99", image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=75", category: "Fatayer", isVegetarian: true },
  ],
  wraps: [
    { id: "wr1", name: "Lamb Shawarma Wrap", description: "Tender lamb shawarma in wrap", price: "£4.99", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=75", category: "Wraps", isPopular: true },
    { id: "wr2", name: "Chicken Shawarma Wrap", description: "Marinated chicken shawarma in wrap", price: "£4.50", image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&q=75", category: "Wraps", isPopular: true },
    { id: "wr3", name: "Falafel Wrap", description: "Crispy falafel with salad", price: "£4.99", image: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=400&q=75", category: "Wraps", isVegan: true },
    { id: "wr4", name: "Lamb Shawarma Sandwich", description: "Tender lamb shawarma in bread", price: "£4.99", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=75", category: "Wraps" },
    { id: "wr5", name: "Chicken Shawarma Sandwich", description: "Marinated chicken shawarma in bread", price: "£4.50", image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&q=75", category: "Wraps" },
  ],
  meals: [
    { id: "ml1", name: "Lamb Shawarma Meal", description: "With chips & salad", price: "£7.99", image: "https://images.unsplash.com/photo-1547424850-2bef379d8159?w=400&q=75", category: "Meals", isPopular: true },
    { id: "ml2", name: "Chicken Shawarma Meal", description: "With chips & salad", price: "£6.99", image: "https://images.unsplash.com/photo-1547424850-2bef379d8159?w=400&q=75", category: "Meals", isPopular: true },
    { id: "ml3", name: "Falafel Meal", description: "6 pcs with naan & salad", price: "£5.99", image: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=400&q=75", category: "Meals", isVegan: true },
  ],
  grill: [
    { id: "gr1", name: "Mix Platter", description: "2 Chicken Tikka, 2 Lamb Tikka, 4 Kebabs, 5 Lamb Chops, 6 Wings, Rice & Salad", price: "£60.00", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=75", category: "Grill", isPopular: true },
    { id: "gr2", name: "Mix Kebab Full", description: "2 Kebabs, Chicken Tikka, Lamb Tikka, 2 Naan & Salad", price: "£17.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=75", category: "Grill" },
    { id: "gr3", name: "Mix Kebab Half", description: "Lamb Kebab, Chicken Tikka, Lamb Tikka & Salad", price: "£14.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=75", category: "Grill" },
    { id: "gr4", name: "Lamb Chops (5)", description: "With salad & naan", price: "£13.00", priceLarge: "£16.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=75", category: "Grill" },
    { id: "gr5", name: "Lamb Kebab (2)", description: "With salad & naan", price: "£11.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=75", category: "Grill" },
    { id: "gr6", name: "Lamb Tikka (2)", description: "With salad & naan", price: "£13.00", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=75", category: "Grill" },
    { id: "gr7", name: "Chicken Tikka (2)", description: "With salad & naan", price: "£10.00", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=75", category: "Grill" },
    { id: "gr8", name: "Chicken Wings (10)", description: "With salad & naan", price: "£9.00", image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=75", category: "Grill", isPopular: true },
    { id: "gr9", name: "Dolma", description: "Available Saturday only", price: "£12.00", image: "https://images.unsplash.com/photo-1621532074858-a7e5a99a4e9e?w=400&q=75", category: "Grill", isNew: true },
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
  { id: "1", slug: "pizzas", name: "Pizzas (10\")", sortOrder: 1, isActive: true },
  { id: "2", slug: "fatayer", name: "Fatayer (10\")", sortOrder: 2, isActive: true },
  { id: "3", slug: "wraps", name: "Sandwiches & Wraps", sortOrder: 3, isActive: true },
  { id: "4", slug: "meals", name: "Meals", sortOrder: 4, isActive: true },
  { id: "5", slug: "grill", name: "Grill & Platters", sortOrder: 5, isActive: true },
  { id: "6", slug: "sides", name: "Extras", sortOrder: 6, isActive: true },
  { id: "7", slug: "drinks", name: "Drinks", sortOrder: 7, isActive: true },
]

// Extended MenuItem type with all tags and sizes
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

// Compact Menu Item Component
function CompactMenuItem({ item }: { item: ExtendedMenuItem }) {
  const { addToCart } = useCart()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [selectedSize, setSelectedSize] = useState<"regular" | "large" | "kids">("regular")
  
  const hasSizes = !!(item.priceLarge || item.priceKids)
  
  const getDisplayPrice = () => {
    if (selectedSize === "large" && item.priceLarge) return item.priceLarge
    if (selectedSize === "kids" && item.priceKids) return item.priceKids
    return item.price
  }
  
  const handleAdd = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: getDisplayPrice(),
      priceLarge: item.priceLarge,
      priceKids: item.priceKids,
      image: item.image,
      category: item.category,
      description: item.description,
    }, selectedSize)
  }

  // Collect all tags
  const tags = []
  if (item.isNew) tags.push({ label: "NEW", icon: Sparkles, bg: "bg-blue-500" })
  if (item.isPopular) tags.push({ label: "HOT", icon: Flame, bg: "bg-orange-500" })
  if (item.isVegan) tags.push({ label: "V", icon: Leaf, bg: "bg-green-600" })
  if (item.isVegetarian && !item.isVegan) tags.push({ label: "VG", icon: Leaf, bg: "bg-green-500" })
  if (item.isGlutenFree) tags.push({ label: "GF", icon: WheatOff, bg: "bg-amber-600" })
  if (item.isDairyFree) tags.push({ label: "DF", icon: MilkOff, bg: "bg-purple-500" })

  return (
    <div className="w-full">
      <div className="relative">
        {/* Image */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn("object-cover", imageLoaded ? "opacity-100" : "opacity-0")}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 15vw"
            onLoad={() => setImageLoaded(true)}
          />
          {/* Tags - show up to 3 */}
          {tags.length > 0 && (
            <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, i) => (
                <span key={i} className={cn("px-1.5 py-0.5 text-white text-[9px] font-bold rounded-full flex items-center gap-0.5", tag.bg)}>
                  <tag.icon className="h-2.5 w-2.5" />
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="absolute -bottom-2 right-2 w-7 h-7 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
      {/* Info */}
      <div className="mt-3 px-0.5">
        <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
        <p className="text-[11px] text-gray-500 truncate">{item.description}</p>
        
        {/* Size selector */}
        {hasSizes && (
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => setSelectedSize("regular")}
              className={cn(
                "px-2 py-0.5 text-[10px] rounded-full transition-colors",
                selectedSize === "regular" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
              )}
            >
              {item.priceKids ? "Reg" : "Reg"}
            </button>
            {item.priceLarge && (
              <button
                onClick={() => setSelectedSize("large")}
                className={cn(
                  "px-2 py-0.5 text-[10px] rounded-full transition-colors",
                  selectedSize === "large" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                )}
              >
                Lrg
              </button>
            )}
            {item.priceKids && (
              <button
                onClick={() => setSelectedSize("kids")}
                className={cn(
                  "px-2 py-0.5 text-[10px] rounded-full transition-colors",
                  selectedSize === "kids" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                )}
              >
                Kids
              </button>
            )}
          </div>
        )}
        
        <p className="text-sm font-bold text-gray-900 mt-1">{getDisplayPrice()}</p>
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

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash.startsWith("menu-")) {
        const category = hash.replace("menu-", "") as CategoryFilter
        if (["wraps", "plates", "sides", "drinks", "desserts"].includes(category)) {
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

  // Scroll to category
  const scrollToCategory = (categorySlug: string) => {
    setActiveCategory(categorySlug as CategoryFilter)
    if (categorySlug === "all") return
    const ref = categoryRefs.current[categorySlug]
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        {/* Skeleton items - 2 rows */}
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <div className="grid gap-3 grid-flow-col" style={{ gridTemplateRows: 'repeat(2, auto)', width: 'max-content' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-[140px]">
                <div className="w-full h-[100px] bg-gray-100 rounded-xl animate-pulse" />
                <div className="mt-2 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="mt-1 h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs - Food Panda Style */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md py-3 -mx-6 px-6">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {categoryConfig.map((cat) => {
            const isActive = activeCategory === cat.id
            const itemCount = cat.id === "all" 
              ? Object.values(displayItems).flat().length 
              : (displayItems[cat.id] || []).length
            
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[72px] rounded-2xl transition-all duration-200",
                  isActive
                    ? "bg-gray-900 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <span className="text-2xl mb-0.5">{cat.emoji}</span>
                <span className="text-xs font-medium">{cat.label}</span>
                {itemCount > 0 && (
                  <span className={cn(
                    "text-[10px] mt-0.5",
                    isActive ? "text-white/80" : "text-gray-400"
                  )}>
                    {itemCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Menu Sections - Horizontal Scroll */}
      <div className="space-y-8">
        {filteredCategories
          .filter(category => activeCategory === "all" || category.slug === activeCategory)
          .map((category) => {
            const items = displayItems[category.slug] || []
            if (items.length === 0) return null

            const categoryConf = categoryConfig.find(c => c.id === category.slug)

            return (
              <div 
                key={category.slug} 
                ref={el => { categoryRefs.current[category.slug] = el }}
                className="scroll-mt-40"
              >
                {/* Category Header */}
                {showCategoryHeaders && (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{categoryConf?.emoji || "🍽️"}</span>
                      <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                      <span className="text-sm text-gray-400">({items.length})</span>
                    </div>
                    <button 
                      onClick={() => setActiveCategory(category.slug as CategoryFilter)}
                      className="text-sm text-gray-900 font-medium hover:underline"
                    >
                      See all →
                    </button>
                  </div>
                )}

                {/* Responsive Grid - fills screen width, minimal scrolling */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-4">
                  {items.map((item) => (
                    <CompactMenuItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )
          })}
      </div>

      {/* Empty State */}
      {filteredCategories.filter(cat => activeCategory === "all" || cat.slug === activeCategory).every(cat => (displayItems[cat.slug] || []).length === 0) && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🍽️</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No items found</h3>
          <button
            onClick={() => setActiveCategory("all")}
            className="text-gray-900 font-medium hover:underline"
          >
            View all items
          </button>
        </div>
      )}
    </div>
  )
}
