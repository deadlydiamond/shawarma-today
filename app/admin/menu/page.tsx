"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { useMenu, MenuItem } from "@/contexts/MenuContext"
import {
  Coffee,
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
  Flame,
  Leaf,
  Save,
  X,
  Cake,
  Image as ImageIcon,
  LayoutGrid,
  TrendingUp,
  Settings,
  Receipt,
  ArrowRight,
  LogOut,
  Utensils,
  Package,
  Eye,
  EyeOff,
  Star,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  Tag,
  Zap,
  Pizza,
} from "lucide-react"
import { ImageUpload } from "@/components/admin/ImageUpload"

const categoryIcons: Record<string, React.ReactNode> = {
  all: <Grid3X3 className="h-4 w-4" />,
  coffee: <Coffee className="h-4 w-4" />,
  breakfast: <UtensilsCrossed className="h-4 w-4" />,
  sandwiches: <Sandwich className="h-4 w-4" />,
  tea: <CupSoda className="h-4 w-4" />,
  pastries: <Cake className="h-4 w-4" />,
  pizzas: <Pizza className="h-4 w-4" />,
  wraps: <Package className="h-4 w-4" />,
  meals: <UtensilsCrossed className="h-4 w-4" />,
  drinks: <CupSoda className="h-4 w-4" />,
  extras: <Plus className="h-4 w-4" />,
}

export default function MenuManagement() {
  const router = useRouter()
  const { staff, isAuthenticated, loading: authLoading, logout } = useAuth()
  const { 
    categories, 
    menuItems, 
    loading: menuLoading, 
    toggleSoldOut, 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem,
    refreshMenu 
  } = useMenu()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formCategory, setFormCategory] = useState<string>("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterSoldOut, setFilterSoldOut] = useState<"all" | "available" | "soldout">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Image upload state
  const [itemImageUrl, setItemImageUrl] = useState<string>("")

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshMenu()
    setIsRefreshing(false)
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
      
      // Use itemImageUrl state directly instead of hidden input
      const imageUrl = itemImageUrl || formData.get("imageUrl") as string || ""
      
      const itemData = {
        name: formData.get("name") as string,
        slug: (formData.get("name") as string).toLowerCase().replace(/\s+/g, "-"),
        categoryId: categoryId || undefined,
        price: parseFloat(formData.get("price") as string) || 0,
        description: formData.get("description") as string || "",
        imageUrl: imageUrl,
        isActive: true,
        isSoldOut: editingItem?.isSoldOut || false,
        isFeatured: formData.get("isFeatured") === "on",
        isPopular: formData.get("isPopular") === "on",
        sortOrder: editingItem?.sortOrder || 0,
      }

      console.log("Saving item with imageUrl:", imageUrl) // Debug log

      if (editingItem) {
        await updateMenuItem(editingItem.id, itemData)
      } else {
        await addMenuItem(itemData)
      }

      setEditingItem(null)
      setShowAddModal(false)
      setFormCategory("")
      setItemImageUrl("")
    } catch (error) {
      console.error("Error saving item:", error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMenuItem(itemId)
        setEditingItem(null)
        setShowAddModal(false)
      } catch (error) {
        console.error("Error deleting item:", error)
      }
    }
  }

  // Get category names for filter
  const categoryNames = [{ id: "all", name: "All Items" }, ...categories]

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory
    const matchesSoldOut = filterSoldOut === "all" || 
      (filterSoldOut === "available" && !item.isSoldOut) ||
      (filterSoldOut === "soldout" && item.isSoldOut)
    return matchesSearch && matchesCategory && matchesSoldOut && item.isActive
  })

  const soldOutCount = menuItems.filter((item) => item.isSoldOut).length
  const activeCount = menuItems.filter((item) => !item.isSoldOut && item.isActive).length
  const popularCount = menuItems.filter((item) => item.isPopular).length

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-shawarma/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-shawarma border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 text-sm font-medium">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col items-center py-6 z-50">
        {/* Logo */}
        <div className="mb-8 relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-shawarma to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
          <Image
            src="/logos/shawarma-logo.png"
            alt="Logo"
            width={48}
            height={48}
            className="rounded-xl relative z-10"
          />
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          <Link
            href="/admin"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
            title="Dashboard"
          >
            <LayoutGrid className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </Link>
          <Link
            href="/pos"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
            title="POS"
          >
            <Receipt className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </Link>
          <Link
            href="/admin/menu"
            className="p-3 rounded-xl bg-gradient-to-br from-shawarma to-orange-600 text-white shadow-lg shadow-shawarma/20 transition-all"
            title="Menu"
          >
            <Utensils className="h-6 w-6" />
          </Link>
          <Link
            href="/admin/reports"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
            title="Reports"
          >
            <TrendingUp className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </Link>
          <Link
            href="/admin/settings"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all group"
            title="Settings"
          >
            <Settings className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </Link>
        </nav>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/"
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
            title="View Website"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
              <button 
            onClick={() => { logout(); router.push("/admin/login") }}
            className="p-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
              </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-20 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
          <div className="px-8 py-4 flex items-center justify-between">
              <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">Menu Management</h1>
                {menuLoading && (
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-semibold flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Syncing
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm">
                {currentTime.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} • {staff?.name || "Admin"}
                </p>
              </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all border border-slate-700/50"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-5 py-3 bg-gradient-to-r from-shawarma to-orange-600 hover:from-shawarma/90 hover:to-orange-600/90 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-shawarma/20 transition-all"
              >
                <Plus className="h-5 w-5" />
                Add Item
              </button>
          </div>
        </div>
      </header>

        <div className="p-8">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Items", value: menuItems.length, icon: UtensilsCrossed, color: "from-shawarma to-orange-600", alert: false },
              { label: "Available", value: activeCount, icon: CheckCircle, color: "from-emerald-500 to-green-500", alert: false },
              { label: "Sold Out", value: soldOutCount, icon: XCircle, color: "from-red-500 to-rose-500", alert: soldOutCount > 0 },
              { label: "Popular", value: popularCount, icon: Flame, color: "from-amber-500 to-orange-500", alert: false },
            ].map((stat) => (
              <div 
                key={stat.label} 
                className={`relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800/50 p-5 group hover:border-slate-700/50 transition-all ${stat.alert ? "ring-1 ring-red-500/30" : ""}`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-4xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
        </div>
                </div>
              </div>
            ))}
      </div>

          {/* Search & Filters */}
          <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800/50 p-5 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                {/* Sold Out Filter */}
                <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
                  {[
                    { id: "all", label: "All" },
                    { id: "available", label: "Available" },
                    { id: "soldout", label: "Sold Out" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterSoldOut(f.id as typeof filterSoldOut)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterSoldOut === f.id 
                          ? "bg-slate-700 text-white" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* View Mode */}
                <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700/50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === "list" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categoryNames.map((cat) => (
                  <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? "bg-gradient-to-r from-shawarma to-orange-600 text-white shadow-lg shadow-shawarma/20"
                      : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 border border-slate-700/50"
                  }`}
                >
                  {categoryIcons[cat.id.toLowerCase()] || <Tag className="h-4 w-4" />}
                  {cat.name}
                  </button>
                ))}
              </div>
            </div>

          {/* Menu Items */}
            {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800/50">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="h-10 w-10 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium mb-2">No menu items found</p>
              <p className="text-sm text-slate-500 mb-6">Try adjusting your search or filters</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-shawarma to-orange-600 hover:from-shawarma/90 hover:to-orange-600/90 text-white rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg shadow-shawarma/20 transition-all"
              >
                <Plus className="h-5 w-5" />
                Add First Item
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <div
                      key={item.id}
                  onClick={() => setEditingItem(item)}
                  className={`group relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
                    item.isSoldOut 
                      ? "border-red-500/30" 
                      : "border-slate-700/50 hover:border-slate-600"
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-40 bg-slate-800">
                    {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className={`w-full h-full object-cover ${item.isSoldOut ? "grayscale opacity-50" : ""}`}
                          />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 ${item.isSoldOut ? "opacity-50" : ""}`}>
                        <UtensilsCrossed className="h-12 w-12 text-slate-700" />
                          </div>
                        )}
                    
                    {/* Sold Out Badge - positioned in corner, not blocking */}
                        {item.isSoldOut && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
                              SOLD OUT
                            </span>
                          </div>
                        )}

                    {/* Overlay on hover - highest z-index */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                          <button
                        onClick={(e) => { e.stopPropagation(); setEditingItem(item) }}
                        className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl transition-all"
                          >
                        <Edit className="h-5 w-5 text-white" />
                          </button>
                          <button
                        onClick={(e) => { e.stopPropagation(); handleToggleSoldOut(item.id, item.isSoldOut) }}
                        className={`p-3 backdrop-blur rounded-xl transition-all ${
                          item.isSoldOut 
                            ? "bg-green-500/20 hover:bg-green-500/30" 
                            : "bg-red-500/20 hover:bg-red-500/30"
                        }`}
                        title={item.isSoldOut ? "Mark as Available" : "Mark as Sold Out"}
                      >
                        {item.isSoldOut ? <Eye className="h-5 w-5 text-green-400" /> : <EyeOff className="h-5 w-5 text-red-400" />}
                          </button>
                        </div>

                    {/* Popular Badge */}
                    {item.isPopular && !item.isSoldOut && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg">
                        <Flame className="h-3 w-3" />
                        Popular
              </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur text-white text-xs font-medium rounded-lg">
                      {categories.find((c) => c.id === item.categoryId)?.name || "Uncategorized"}
                    </div>
            </div>
            
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white line-clamp-1">{item.name}</h3>
                          </div>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3 min-h-[2.5rem]">
                      {item.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-shawarma">£{item.price.toFixed(2)}</span>
                      <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                          </div>
                        </div>
                        </div>
                ))}
              </div>
          ) : (
            /* List View */
            <div className="bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800/50 overflow-hidden">
              <div className="divide-y divide-slate-800/50">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setEditingItem(item)}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-slate-800/30 ${
                      item.isSoldOut ? "opacity-60" : ""
                    }`}
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className={`w-full h-full object-cover ${item.isSoldOut ? "grayscale" : ""}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <UtensilsCrossed className="h-6 w-6 text-slate-600" />
              </div>
            )}
                      {item.isSoldOut && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <XCircle className="h-6 w-6 text-red-400" />
          </div>
              )}
            </div>
            
                    {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{item.name}</h3>
                        {item.isPopular && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded flex items-center gap-1">
                            <Flame className="h-3 w-3" /> Popular
                          </span>
                        )}
                        {item.isSoldOut && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                            Sold Out
                          </span>
                        )}
                            </div>
                      <p className="text-sm text-slate-400 truncate">{item.description || "No description"}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {categories.find((c) => c.id === item.categoryId)?.name || "Uncategorized"}
                      </p>
                          </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-shawarma">£{item.price.toFixed(2)}</p>
                        </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                        onClick={(e) => { e.stopPropagation(); handleToggleSoldOut(item.id, item.isSoldOut) }}
                        className={`p-2.5 rounded-lg transition-all ${
                          item.isSoldOut 
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" 
                            : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                        }`}
                        title={item.isSoldOut ? "Mark Available" : "Mark Sold Out"}
                      >
                        {item.isSoldOut ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingItem(item) }}
                        className="p-2.5 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
              </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
      </main>

      {/* Edit/Add Modal */}
      {(editingItem || showAddModal) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden border border-slate-700/50 shadow-2xl">
            {/* Modal Header with Gradient */}
            <div className="relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
              </div>
              
              {/* Gradient Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-shawarma/30 to-orange-500/30 blur-3xl"></div>
              
              <div className="relative p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`relative`}>
                    <div className={`absolute -inset-1 rounded-2xl blur-lg ${editingItem ? "bg-blue-500/30" : "bg-gradient-to-r from-shawarma/40 to-orange-500/40"}`}></div>
                    <div className={`relative p-3 rounded-2xl ${editingItem ? "bg-blue-500/20 border border-blue-500/30" : "bg-gradient-to-br from-shawarma to-orange-600"}`}>
                      {editingItem ? <Edit className="h-6 w-6 text-blue-400" /> : <Plus className="h-6 w-6 text-white" />}
                </div>
                      </div>
                      <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingItem ? "Edit Menu Item" : "Add New Item"}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {editingItem ? `Editing: ${editingItem.name}` : "Create a delicious new menu item"}
                    </p>
                      </div>
                      </div>
                <button 
                  onClick={() => { setEditingItem(null); setShowAddModal(false); setItemImageUrl("") }}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
                    </div>
                  </div>
            
            {/* Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                handleSaveItem(formData)
              }} 
              className="p-6 space-y-5 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-slate-700"
            >
              {/* Image Upload - Moved to top for visual impact */}
                <div>
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-shawarma" />
                  Item Photo
                  <span className="text-xs text-slate-500">(recommended)</span>
                  </label>
                  <ImageUpload
                    currentImageUrl={editingItem?.imageUrl || itemImageUrl}
                    onImageUploaded={(url) => setItemImageUrl(url)}
                    onImageRemoved={() => setItemImageUrl("")}
                    folder="menu-items"
                  />
                  <input type="hidden" name="imageUrl" value={itemImageUrl} />
                </div>
                
              {/* Name & Price Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Item Name *</label>
                  <input
                    name="name"
                    defaultValue={editingItem?.name}
                    required
                    placeholder="e.g., Lamb Shawarma Wrap"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-shawarma font-bold">£</span>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={editingItem?.price}
                      required
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all"
                    />
                  </div>
                </div>
                </div>
                
              {/* Category */}
                  <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  name="categoryId"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.25rem'
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                </div>
              
              {/* Description */}
                <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                  name="description"
                  defaultValue={editingItem?.description}
                    rows={2}
                  placeholder="Brief description of the item..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-shawarma/50 focus:border-shawarma/50 transition-all resize-none"
                  />
                </div>
                
              {/* Tags */}
                  <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Tags</label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-xl cursor-pointer group transition-all">
                    <div className="relative">
                      <input
                        type="checkbox" 
                        name="isPopular" 
                        defaultChecked={editingItem?.isPopular} 
                        className="peer sr-only" 
                      />
                      <div className="w-10 h-5 bg-slate-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 transition-all"></div>
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
                    </div>
                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors flex items-center gap-2">
                      <Flame className="h-4 w-4 text-amber-500" />
                      Popular
                    </span>
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-xl cursor-pointer group transition-all">
                    <div className="relative">
                      <input
                        type="checkbox" 
                        name="isFeatured" 
                        defaultChecked={editingItem?.isFeatured} 
                        className="peer sr-only" 
                      />
                      <div className="w-10 h-5 bg-slate-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-purple-500 transition-all"></div>
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
                    </div>
                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors flex items-center gap-2">
                      <Star className="h-4 w-4 text-violet-500" />
                      Featured
                    </span>
                  </label>
                  </div>
                </div>
            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800/50 bg-slate-900/50 flex gap-3">
              {editingItem && (
                <button 
                  type="button" 
                  onClick={() => handleDeleteItem(editingItem.id)}
                  className="p-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20 group"
                  title="Delete Item"
                >
                  <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              )}
                  <button 
                    type="button"
                onClick={() => { setEditingItem(null); setShowAddModal(false); setItemImageUrl("") }}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                form="menu-form"
                onClick={(e) => {
                  e.preventDefault()
                  const form = document.querySelector("form") as HTMLFormElement
                  if (form) {
                    const formData = new FormData(form)
                    handleSaveItem(formData)
                  }
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-shawarma to-orange-600 hover:from-shawarma/90 hover:to-orange-600/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-shawarma/30 transition-all group"
              >
                <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {editingItem ? "Save Changes" : "Add Item"}
                  </button>
                </div>
          </div>
        </div>
      )}
    </div>
  )
}
