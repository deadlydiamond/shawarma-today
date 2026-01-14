"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useMenu, MenuItem } from "@/contexts/MenuContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Coffee,
  ArrowLeft,
  RefreshCw,
  XCircle,
  CheckCircle,
  Search,
  UtensilsCrossed,
  Sandwich,
  CupSoda,
  Plus,
  Edit,
  Trash2,
  Star,
  Flame,
  Leaf,
  Save,
  X,
  Percent,
  Megaphone,
  Cake,
  Image as ImageIcon,
} from "lucide-react"
import { ImageUpload } from "@/components/admin/ImageUpload"

const categoryIcons: Record<string, React.ReactNode> = {
  All: <UtensilsCrossed className="h-4 w-4" />,
  Coffee: <Coffee className="h-4 w-4" />,
  Breakfast: <UtensilsCrossed className="h-4 w-4" />,
  Sandwiches: <Sandwich className="h-4 w-4" />,
  Tea: <CupSoda className="h-4 w-4" />,
  Pastries: <Cake className="h-4 w-4" />,
}

export default function MenuManagement() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { 
    categories, 
    menuItems, 
    promotions,
    banners,
    todaySpecialIds,
    loading: menuLoading, 
    toggleSoldOut, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem,
    addPromotion,
    deletePromotion,
    addBanner,
    deleteBanner,
    toggleTodaySpecial,
    setTodaySpecials,
    refreshMenu 
  } = useMenu()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPromotionModal, setShowPromotionModal] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [activeTab, setActiveTab] = useState<"items" | "promotions" | "banners" | "specials">("items")
  const [formCategory, setFormCategory] = useState<string>("")
  
  // Promotion form state
  const [promotionForm, setPromotionForm] = useState({
    name: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    promoCode: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
  })
  
  // Banner form state
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    backgroundColor: "#1f2937",
    textColor: "#ffffff",
    buttonText: "",
    buttonLink: "",
    position: "top" as "top" | "hero" | "menu",
  })
  
  // Image upload state
  const [itemImageUrl, setItemImageUrl] = useState<string>("")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [authLoading, isAuthenticated, router])

  // When editing item, set the form category and image URL
  useEffect(() => {
    if (editingItem) {
      setFormCategory(editingItem.categoryId || "")
      setItemImageUrl(editingItem.imageUrl || "")
    } else {
      setFormCategory("")
      setItemImageUrl("")
    }
  }, [editingItem])

  // Determine which price fields to show based on category
  const getCategoryType = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return "other"
    const name = category.name.toLowerCase()
    if (name.includes("coffee") || name.includes("tea") || name.includes("drinks")) {
      return "drinks"
    }
    if (name.includes("breakfast") || name.includes("sandwich") || name.includes("meal") || name.includes("food")) {
      return "meals"
    }
    if (name.includes("pastries") || name.includes("dessert") || name.includes("cake")) {
      return "pastries"
    }
    return "other"
  }

  const handleToggleSoldOut = async (itemId: string, currentStatus: boolean) => {
    try {
      await toggleSoldOut(itemId, !currentStatus)
    } catch (error) {
      console.error("Error toggling sold out:", error)
    }
  }

  const handleSaveItem = async (formData: FormData) => {
    try {
      const categoryId = formData.get("categoryId") as string
      const categoryType = getCategoryType(categoryId)
      
      const itemData = {
        name: formData.get("name") as string,
        slug: (formData.get("name") as string).toLowerCase().replace(/\s+/g, "-"),
        categoryId: categoryId || undefined,
        price: parseFloat(formData.get("price") as string) || 0,
        // For drinks: small = price, medium = priceMedium (stored as price), large = priceLarge
        // For meals: regular = price, kids = priceKids
        priceLarge: categoryType === "drinks" && formData.get("priceLarge") 
          ? parseFloat(formData.get("priceLarge") as string) 
          : undefined,
        priceKids: categoryType === "meals" && formData.get("priceKids")
          ? parseFloat(formData.get("priceKids") as string)
          : undefined,
        description: formData.get("description") as string || "",
        imageUrl: formData.get("imageUrl") as string || "",
        isActive: true,
        isSoldOut: editingItem?.isSoldOut || false,
        isFeatured: formData.get("isFeatured") === "on",
        isNew: formData.get("isNew") === "on",
        isPopular: formData.get("isPopular") === "on",
        isVegan: formData.get("isVegan") === "on",
        isVegetarian: formData.get("isVegetarian") === "on",
        isGlutenFree: formData.get("isGlutenFree") === "on",
        isDairyFree: formData.get("isDairyFree") === "on",
        variants: [],
        customizations: [],
        sortOrder: editingItem?.sortOrder || 0,
      }

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData)
      } else {
        await addMenuItem(itemData)
      }

      setEditingItem(null)
      setShowAddModal(false)
      setFormCategory("")
    } catch (error) {
      console.error("Error saving item:", error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMenuItem(itemId)
      } catch (error) {
        console.error("Error deleting item:", error)
      }
    }
  }


  // Get category names for filter
  const categoryNames = ["All", ...categories.map((c) => c.name)]

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || 
      categories.find((c) => c.id === item.categoryId)?.name === selectedCategory
    return matchesSearch && matchesCategory && item.isActive
  })

  const soldOutCount = menuItems.filter((item) => item.isSoldOut).length

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push("/admin")}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Menu Management</h1>
                <p className="text-sm text-gray-500">
                  {menuItems.length} items • {soldOutCount} sold out
                  {menuLoading && " • Loading..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={refreshMenu}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors"
                style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
              >
                <RefreshCw className={`h-4 w-4 ${menuLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#1f2937', color: 'white' }}
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { key: "items", label: "Menu Items", icon: UtensilsCrossed },
              { key: "promotions", label: "Promotions", icon: Percent },
              { key: "banners", label: "Banners", icon: Megaphone },
              { key: "specials", label: "Today's Special", icon: Star },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "items" && (
          <>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white text-gray-900"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categoryNames.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                      selectedCategory === cat
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {categoryIcons[cat] || <UtensilsCrossed className="h-4 w-4" />}
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Coffee className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No menu items found</p>
                <p className="text-sm text-gray-400 mt-1">Add items to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => {
                  const isSpecial = todaySpecialIds.includes(item.id)
                  return (
                    <Card
                      key={item.id}
                      className={`overflow-hidden transition-all ${
                        item.isSoldOut ? "opacity-60" : "hover:shadow-lg"
                      } ${isSpecial ? "ring-2 ring-yellow-400" : ""}`}
                    >
                      <div className="relative h-40 bg-gray-100">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className={`w-full h-full object-cover ${item.isSoldOut ? "grayscale" : ""}`}
                          />
                        )}
                        {item.isSoldOut && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                        {isSpecial && !item.isSoldOut && (
                          <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            TODAY&apos;S SPECIAL
                          </div>
                        )}
                        {item.isNew && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                            NEW
                          </div>
                        )}
                        {item.isPopular && !item.isNew && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            POPULAR
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {categories.find((c) => c.id === item.categoryId)?.name || "Uncategorized"}
                              </span>
                              {item.isVegan && (
                                <span title="Vegan" className="text-green-600">
                                  <Leaf className="h-4 w-4" />
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-gray-900 mt-1">{item.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">£{item.price.toFixed(2)}</p>
                            {item.priceLarge && (
                              <p className="text-xs text-gray-500">Lrg: £{item.priceLarge.toFixed(2)}</p>
                            )}
                            {item.priceKids && (
                              <p className="text-xs text-gray-500">Kids: £{item.priceKids.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors"
                            style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleSoldOut(item.id, item.isSoldOut)}
                            className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
                            style={item.isSoldOut 
                              ? { backgroundColor: '#16a34a', color: 'white', borderColor: '#16a34a' }
                              : { borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }
                            }
                          >
                            {item.isSoldOut ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => toggleTodaySpecial(item.id)}
                            className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
                            style={isSpecial 
                              ? { backgroundColor: '#fef3c7', borderColor: '#facc15', color: '#374151' }
                              : { borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }
                            }
                          >
                            <Star className={`h-4 w-4 ${isSpecial ? "text-yellow-600 fill-yellow-600" : ""}`} />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "promotions" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Active Promotions ({promotions.length})</h2>
              <button 
                onClick={() => setShowPromotionModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#1f2937', color: 'white' }}
              >
                <Plus className="h-4 w-4" />
                Add Promotion
              </button>
            </div>
            
            {promotions.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <Percent className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Promotions Yet</h3>
                  <p className="text-gray-500">Create promotions to offer discounts on menu items</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {promotions.map((promo) => (
                  <Card key={promo.id} className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${promo.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Percent className={`h-6 w-6 ${promo.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{promo.name}</h3>
                            <p className="text-sm text-gray-500">
                              {promo.promoType === "percentage" ? `${promo.discountValue}% off` : `£${promo.discountValue?.toFixed(2)} off`}
                              {promo.promoCode && <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{promo.promoCode}</span>}
                            </p>
                            {promo.description && <p className="text-sm text-gray-400 mt-1">{promo.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {promo.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this promotion?')) {
                                try {
                                  await deletePromotion(promo.id)
                                } catch (error) {
                                  console.error("Error deleting promotion:", error)
                                }
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "banners" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Promotional Banners ({banners.length})</h2>
              <button 
                onClick={() => setShowBannerModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#1f2937', color: 'white' }}
              >
                <Plus className="h-4 w-4" />
                Add Banner
              </button>
            </div>
            
            {banners.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Banners Yet</h3>
                  <p className="text-gray-500">Create banners to display announcements on your website</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {banners.map((banner) => (
                  <Card key={banner.id} className="bg-white overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        {/* Banner Preview */}
                        <div 
                          className="w-48 p-4 flex items-center justify-center text-center"
                          style={{ backgroundColor: banner.backgroundColor, color: banner.textColor }}
                        >
                          <div>
                            <p className="font-semibold text-sm">{banner.title}</p>
                            {banner.subtitle && <p className="text-xs opacity-80">{banner.subtitle}</p>}
                          </div>
                        </div>
                        {/* Banner Details */}
                        <div className="flex-1 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                              <p className="text-sm text-gray-500">
                                Position: <span className="capitalize">{banner.position}</span>
                                {banner.buttonText && <span className="ml-2">• Button: {banner.buttonText}</span>}
                              </p>
                              {banner.description && <p className="text-sm text-gray-400 mt-1">{banner.description}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {banner.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <button
                                onClick={async () => {
                                  if (confirm('Delete this banner?')) {
                                    try {
                                      await deleteBanner(banner.id)
                                    } catch (error) {
                                      console.error("Error deleting banner:", error)
                                    }
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "specials" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Specials ({todaySpecialIds.length})</h2>
              {todaySpecialIds.length > 0 && (
                <button 
                  onClick={() => setTodaySpecials([])}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors"
                  style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
                >
                  <X className="h-4 w-4" />
                  Clear All Specials
                </button>
              )}
            </div>
            
            {todaySpecialIds.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {todaySpecialIds.map(specialId => {
                  const specialItem = menuItems.find(i => i.id === specialId)
                  if (!specialItem) return null
                  return (
                    <Card key={specialId} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {specialItem.imageUrl && (
                              <img src={specialItem.imageUrl} alt={specialItem.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-medium text-yellow-700">TODAY&apos;S SPECIAL</span>
                            </div>
                            <h3 className="font-bold text-gray-900 truncate">{specialItem.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-1">{specialItem.description}</p>
                            <span className="text-lg font-bold text-gray-900">£{specialItem.price.toFixed(2)}</span>
                          </div>
                          <button 
                            onClick={() => toggleTodaySpecial(specialId)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Specials Set</h3>
                  <p className="text-gray-500 mb-4">Click items below to add them as today&apos;s specials</p>
                </CardContent>
              </Card>
            )}
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select items for today&apos;s specials:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {menuItems.filter(i => i.isActive).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleTodaySpecial(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      todaySpecialIds.includes(item.id) 
                        ? "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200" 
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {todaySpecialIds.includes(item.id) && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                      <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {categories.find((c) => c.id === item.categoryId)?.name || "Uncategorized"} • £{item.price.toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {(editingItem || showAddModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingItem ? "Edit Item" : "Add New Item"}
                </h2>
                <button 
                  onClick={() => { setEditingItem(null); setShowAddModal(false); setItemImageUrl(""); }}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                handleSaveItem(formData)
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    defaultValue={editingItem?.name}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="categoryId"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Dynamic pricing based on category */}
                {getCategoryType(formCategory) === "drinks" ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      Drink Sizes & Prices
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Small (£)</label>
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={editingItem?.price}
                          required
                          placeholder="2.50"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Medium (£)</label>
                        <input
                          name="priceMedium"
                          type="number"
                          step="0.01"
                          placeholder="3.20"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Large (£)</label>
                        <input
                          name="priceLarge"
                          type="number"
                          step="0.01"
                          defaultValue={editingItem?.priceLarge}
                          placeholder="3.90"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : getCategoryType(formCategory) === "meals" ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4" />
                      Meal Portions & Prices
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Adult Portion (£)</label>
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={editingItem?.price}
                          required
                          placeholder="8.50"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Kids Portion (£)</label>
                        <input
                          name="priceKids"
                          type="number"
                          step="0.01"
                          defaultValue={editingItem?.priceKids}
                          placeholder="5.50"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (£)</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingItem?.price}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingItem?.description}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Item Image
                  </label>
                  <ImageUpload
                    currentImageUrl={editingItem?.imageUrl || itemImageUrl}
                    onImageUploaded={(url) => setItemImageUrl(url)}
                    onImageRemoved={() => setItemImageUrl("")}
                    folder="menu-items"
                  />
                  {/* Hidden input to include in form data */}
                  <input type="hidden" name="imageUrl" value={itemImageUrl} />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isPopular" defaultChecked={editingItem?.isPopular} className="rounded" />
                    <span className="text-sm text-gray-700">Popular</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isNew" defaultChecked={editingItem?.isNew} className="rounded" />
                    <span className="text-sm text-gray-700">New</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isVegan" defaultChecked={editingItem?.isVegan} className="rounded" />
                    <span className="text-sm text-gray-700">Vegan</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isVegetarian" defaultChecked={editingItem?.isVegetarian} className="rounded" />
                    <span className="text-sm text-gray-700">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isGlutenFree" defaultChecked={editingItem?.isGlutenFree} className="rounded" />
                    <span className="text-sm text-gray-700">Gluten Free</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isDairyFree" defaultChecked={editingItem?.isDairyFree} className="rounded" />
                    <span className="text-sm text-gray-700">Dairy Free</span>
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: '#1f2937', color: 'white' }}
                  >
                    <Save className="h-4 w-4" />
                    Save Item
                  </button>
                  {editingItem && (
                    <button 
                      type="button" 
                      onClick={() => handleDeleteItem(editingItem.id)}
                      className="px-4 py-2 rounded-lg border transition-colors"
                      style={{ color: '#dc2626', borderColor: '#fecaca', backgroundColor: 'white' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Promotion</h3>
                <button 
                  onClick={() => setShowPromotionModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  await addPromotion({
                    name: promotionForm.name,
                    description: promotionForm.description || undefined,
                    promoType: promotionForm.discountType === "percentage" ? "percentage" : "fixed_amount",
                    discountValue: parseFloat(promotionForm.discountValue) || 0,
                    appliesTo: "all",
                    isActive: true,
                    startDate: promotionForm.startDate || new Date().toISOString(),
                    endDate: promotionForm.endDate || undefined,
                    promoCode: promotionForm.promoCode || undefined,
                  })
                  setShowPromotionModal(false)
                  setPromotionForm({
                    name: "",
                    description: "",
                    discountType: "percentage",
                    discountValue: "",
                    promoCode: "",
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: "",
                  })
                } catch (error) {
                  console.error("Error creating promotion:", error)
                  alert("Failed to create promotion. Please try again.")
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Name *</label>
                  <input
                    required
                    value={promotionForm.name}
                    onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })}
                    placeholder="e.g. Summer Sale 20% Off"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={promotionForm.description}
                    onChange={(e) => setPromotionForm({ ...promotionForm, description: e.target.value })}
                    placeholder="Describe the promotion..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                    <select
                      value={promotionForm.discountType}
                      onChange={(e) => setPromotionForm({ ...promotionForm, discountType: e.target.value as "percentage" | "fixed" })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step={promotionForm.discountType === "percentage" ? "1" : "0.01"}
                      value={promotionForm.discountValue}
                      onChange={(e) => setPromotionForm({ ...promotionForm, discountValue: e.target.value })}
                      placeholder={promotionForm.discountType === "percentage" ? "e.g. 20" : "e.g. 2.50"}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code (optional)</label>
                  <input
                    value={promotionForm.promoCode}
                    onChange={(e) => setPromotionForm({ ...promotionForm, promoCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER20"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 uppercase"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={promotionForm.startDate}
                      onChange={(e) => setPromotionForm({ ...promotionForm, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                    <input
                      type="date"
                      value={promotionForm.endDate}
                      onChange={(e) => setPromotionForm({ ...promotionForm, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowPromotionModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg border transition-colors"
                    style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: '#1f2937', color: 'white' }}
                  >
                    <Save className="h-4 w-4" />
                    Create Promotion
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Banner</h3>
                <button 
                  onClick={() => setShowBannerModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  await addBanner({
                    title: bannerForm.title,
                    subtitle: bannerForm.subtitle || undefined,
                    description: bannerForm.description || undefined,
                    backgroundColor: bannerForm.backgroundColor,
                    textColor: bannerForm.textColor,
                    buttonText: bannerForm.buttonText || undefined,
                    buttonLink: bannerForm.buttonLink || undefined,
                    position: bannerForm.position,
                    isActive: true,
                    startDate: new Date().toISOString(),
                    sortOrder: banners.length,
                  })
                  setShowBannerModal(false)
                  setBannerForm({
                    title: "",
                    subtitle: "",
                    description: "",
                    backgroundColor: "#1f2937",
                    textColor: "#ffffff",
                    buttonText: "",
                    buttonLink: "",
                    position: "top",
                  })
                } catch (error) {
                  console.error("Error creating banner:", error)
                  alert("Failed to create banner. Please try again.")
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title *</label>
                  <input
                    required
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="e.g. Free Coffee Friday!"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    placeholder="e.g. This Friday only"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={bannerForm.description}
                    onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                    placeholder="Additional details..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bannerForm.backgroundColor}
                        onChange={(e) => setBannerForm({ ...bannerForm, backgroundColor: e.target.value })}
                        className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bannerForm.backgroundColor}
                        onChange={(e) => setBannerForm({ ...bannerForm, backgroundColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bannerForm.textColor}
                        onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })}
                        className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bannerForm.textColor}
                        onChange={(e) => setBannerForm({ ...bannerForm, textColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Banner Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                  <div 
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: bannerForm.backgroundColor, color: bannerForm.textColor }}
                  >
                    <p className="font-semibold">{bannerForm.title || "Banner Title"}</p>
                    {bannerForm.subtitle && <p className="text-sm opacity-90">{bannerForm.subtitle}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select
                    value={bannerForm.position}
                    onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value as "top" | "hero" | "menu" })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                  >
                    <option value="top">Top of Page (Announcement Bar)</option>
                    <option value="hero">Hero Section</option>
                    <option value="menu">Menu Section</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text (optional)</label>
                    <input
                      value={bannerForm.buttonText}
                      onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                      placeholder="e.g. Learn More"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                    <input
                      value={bannerForm.buttonLink}
                      onChange={(e) => setBannerForm({ ...bannerForm, buttonLink: e.target.value })}
                      placeholder="e.g. /menu"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-900"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowBannerModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg border transition-colors"
                    style={{ borderColor: '#e5e7eb', color: '#374151', backgroundColor: 'white' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: '#1f2937', color: 'white' }}
                  >
                    <Save className="h-4 w-4" />
                    Create Banner
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
