"use client"

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export interface MenuCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  sortOrder: number
  isActive: boolean
}

export interface MenuVariant {
  name: string
  priceModifier: number
}

export interface MenuCustomization {
  name: string
  price: number
}

export interface MenuItem {
  id: string
  categoryId?: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  price: number
  priceLarge?: number
  priceKids?: number
  costPrice?: number
  isActive: boolean
  isSoldOut: boolean
  soldOutUntil?: string
  isFeatured: boolean
  isNew: boolean
  isPopular: boolean
  isVegan: boolean
  isVegetarian: boolean
  isGlutenFree: boolean
  isDairyFree: boolean
  variants: MenuVariant[]
  customizations: MenuCustomization[]
  sortOrder: number
}

export interface Promotion {
  id: string
  name: string
  description?: string
  promoType: "percentage" | "fixed_amount" | "buy_x_get_y" | "combo"
  discountValue?: number
  buyQuantity?: number
  getQuantity?: number
  appliesTo: "all" | "category" | "item"
  categoryId?: string
  itemIds?: string[]
  minOrderValue?: number
  maxUses?: number
  usesCount: number
  startDate: string
  endDate?: string
  isActive: boolean
  promoCode?: string
  createdAt: string
  updatedAt: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  description?: string
  imageUrl?: string
  backgroundColor: string
  textColor: string
  buttonText?: string
  buttonLink?: string
  position: "top" | "hero" | "menu"
  isActive: boolean
  startDate: string
  endDate?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface MenuContextType {
  categories: MenuCategory[]
  menuItems: MenuItem[]
  promotions: Promotion[]
  banners: Banner[]
  loading: boolean
  error: string | null
  
  // Category operations
  addCategory: (category: Omit<MenuCategory, "id">) => Promise<void>
  updateCategory: (id: string, category: Partial<MenuCategory>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  
  // Menu item operations
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>
  updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<void>
  deleteMenuItem: (id: string) => Promise<void>
  toggleSoldOut: (id: string, isSoldOut: boolean) => Promise<void>
  
  // Promotion operations
  addPromotion: (promotion: Omit<Promotion, "id" | "usesCount" | "createdAt" | "updatedAt">) => Promise<void>
  updatePromotion: (id: string, promotion: Partial<Promotion>) => Promise<void>
  deletePromotion: (id: string) => Promise<void>
  
  // Banner operations
  addBanner: (banner: Omit<Banner, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<void>
  deleteBanner: (id: string) => Promise<void>
  
  // Today's Specials
  todaySpecialIds: string[]
  setTodaySpecials: (ids: string[]) => void
  toggleTodaySpecial: (id: string) => void
  getTodaySpecials: () => MenuItem[]
  
  // Refresh
  refreshMenu: () => Promise<void>
  
  // Helpers
  getItemsByCategory: (categorySlug: string) => MenuItem[]
  getSoldOutItems: () => MenuItem[]
  getActivePromotions: () => Promotion[]
  getActiveBanners: () => Banner[]
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [todaySpecialIds, setTodaySpecialIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load today's specials from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("todaySpecials")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Check if it's from today
        if (parsed.date === new Date().toDateString()) {
          setTodaySpecialIds(parsed.ids || [])
        }
      } catch (e) {
        console.error("Error loading today's specials:", e)
      }
    }
  }, [])

  const loadMenu = useCallback(async () => {
    if (!supabase) {
      console.error("Supabase client not initialized")
      setLoading(false)
      setError("Database connection not available")
      return
    }

    try {
      setLoading(true)
      
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("menu_categories")
        .select("*")
        .order("sort_order", { ascending: true })

      if (categoriesError) {
        console.error("Error loading categories:", categoriesError)
        setError(categoriesError.message)
        return
      }

      // Load menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true })

      if (itemsError) {
        console.error("Error loading menu items:", itemsError)
        setError(itemsError.message)
        return
      }

      // Load promotions
      const { data: promotionsData, error: promotionsError } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false })

      if (promotionsError) {
        console.error("Error loading promotions:", promotionsError)
        // Don't return, just log the error - promotions are optional
      }

      // Load banners
      const { data: bannersData, error: bannersError } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order", { ascending: true })

      if (bannersError) {
        console.error("Error loading banners:", bannersError)
        // Don't return, just log the error - banners are optional
      }

      // Transform categories
      const transformedCategories: MenuCategory[] = (categoriesData || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sort_order || 0,
        isActive: cat.is_active,
      }))

      // Transform menu items
      const transformedItems: MenuItem[] = (itemsData || []).map((item: any) => ({
        id: item.id,
        categoryId: item.category_id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        imageUrl: item.image_url,
        price: parseFloat(item.price) || 0,
        priceLarge: item.price_large ? parseFloat(item.price_large) : undefined,
        priceKids: item.price_kids ? parseFloat(item.price_kids) : undefined,
        costPrice: item.cost_price ? parseFloat(item.cost_price) : undefined,
        isActive: item.is_active,
        isSoldOut: item.is_sold_out,
        soldOutUntil: item.sold_out_until,
        isFeatured: item.is_featured,
        isNew: item.is_new,
        isPopular: item.is_popular,
        isVegan: item.is_vegan,
        isVegetarian: item.is_vegetarian,
        isGlutenFree: item.is_gluten_free,
        isDairyFree: item.is_dairy_free,
        variants: item.variants || [],
        customizations: item.customizations || [],
        sortOrder: item.sort_order || 0,
      }))

      // Transform promotions
      const transformedPromotions: Promotion[] = (promotionsData || []).map((promo: any) => ({
        id: promo.id,
        name: promo.name,
        description: promo.description,
        promoType: promo.promo_type,
        discountValue: promo.discount_value ? parseFloat(promo.discount_value) : undefined,
        buyQuantity: promo.buy_quantity,
        getQuantity: promo.get_quantity,
        appliesTo: promo.applies_to || "all",
        categoryId: promo.category_id,
        itemIds: promo.item_ids,
        minOrderValue: promo.min_order_value ? parseFloat(promo.min_order_value) : undefined,
        maxUses: promo.max_uses,
        usesCount: promo.uses_count || 0,
        startDate: promo.start_date,
        endDate: promo.end_date,
        isActive: promo.is_active,
        promoCode: promo.promo_code,
        createdAt: promo.created_at,
        updatedAt: promo.updated_at,
      }))

      // Transform banners
      const transformedBanners: Banner[] = (bannersData || []).map((banner: any) => ({
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        description: banner.description,
        imageUrl: banner.image_url,
        backgroundColor: banner.background_color || "#1f2937",
        textColor: banner.text_color || "#ffffff",
        buttonText: banner.button_text,
        buttonLink: banner.button_link,
        position: banner.position || "top",
        isActive: banner.is_active,
        startDate: banner.start_date,
        endDate: banner.end_date,
        sortOrder: banner.sort_order || 0,
        createdAt: banner.created_at,
        updatedAt: banner.updated_at,
      }))

      setCategories(transformedCategories)
      setMenuItems(transformedItems)
      setPromotions(transformedPromotions)
      setBanners(transformedBanners)
      setError(null)
    } catch (err) {
      console.error("Error loading menu:", err)
      setError("Failed to load menu")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMenu()

    // Only set up real-time subscriptions if supabase is available
    if (!supabase) return

    let realtimeWorking = false

    // Subscribe to real-time updates for all tables
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        (payload) => {
          console.log("Menu items changed:", payload)
          loadMenu()
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_categories" },
        (payload) => {
          console.log("Categories changed:", payload)
          loadMenu()
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "promotions" },
        (payload) => {
          console.log("Promotions changed:", payload)
          loadMenu()
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "banners" },
        (payload) => {
          console.log("Banners changed:", payload)
          loadMenu()
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status)
        if (status === "SUBSCRIBED") {
          realtimeWorking = true
        }
      })

    // Fallback: Poll every 10 seconds if realtime doesn't connect
    // This ensures updates appear within 10 seconds even without realtime
    const pollInterval = setInterval(() => {
      if (!realtimeWorking) {
        loadMenu()
      }
    }, 10000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [loadMenu])

  // Category operations
  const addCategory = useCallback(async (category: Omit<MenuCategory, "id">) => {
    const { error: insertError } = await supabase
      .from("menu_categories")
      .insert({
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        sort_order: category.sortOrder,
        is_active: category.isActive,
      })

    if (insertError) {
      console.error("Error adding category:", insertError)
      throw insertError
    }

    await loadMenu()
  }, [loadMenu])

  const updateCategory = useCallback(async (id: string, category: Partial<MenuCategory>) => {
    const updateData: any = {}
    if (category.name !== undefined) updateData.name = category.name
    if (category.slug !== undefined) updateData.slug = category.slug
    if (category.description !== undefined) updateData.description = category.description
    if (category.icon !== undefined) updateData.icon = category.icon
    if (category.sortOrder !== undefined) updateData.sort_order = category.sortOrder
    if (category.isActive !== undefined) updateData.is_active = category.isActive

    const { error: updateError } = await supabase
      .from("menu_categories")
      .update(updateData)
      .eq("id", id)

    if (updateError) {
      console.error("Error updating category:", updateError)
      throw updateError
    }

    await loadMenu()
  }, [loadMenu])

  const deleteCategory = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting category:", deleteError)
      throw deleteError
    }

    await loadMenu()
  }, [loadMenu])

  // Menu item operations
  const addMenuItem = useCallback(async (item: Omit<MenuItem, "id">) => {
    const { error: insertError } = await supabase
      .from("menu_items")
      .insert({
        category_id: item.categoryId,
        name: item.name,
        slug: item.slug,
        description: item.description,
        image_url: item.imageUrl,
        price: item.price,
        price_large: item.priceLarge,
        price_kids: item.priceKids,
        cost_price: item.costPrice,
        is_active: item.isActive,
        is_sold_out: item.isSoldOut,
        is_featured: item.isFeatured,
        is_new: item.isNew,
        is_popular: item.isPopular,
        is_vegan: item.isVegan,
        is_vegetarian: item.isVegetarian,
        is_gluten_free: item.isGlutenFree,
        is_dairy_free: item.isDairyFree,
        variants: item.variants,
        customizations: item.customizations,
        sort_order: item.sortOrder,
      })

    if (insertError) {
      console.error("Error adding menu item:", insertError)
      throw insertError
    }

    await loadMenu()
  }, [loadMenu])

  const updateMenuItem = useCallback(async (id: string, item: Partial<MenuItem>) => {
    const updateData: any = {}
    if (item.categoryId !== undefined) updateData.category_id = item.categoryId
    if (item.name !== undefined) updateData.name = item.name
    if (item.slug !== undefined) updateData.slug = item.slug
    if (item.description !== undefined) updateData.description = item.description
    if (item.imageUrl !== undefined) updateData.image_url = item.imageUrl
    if (item.price !== undefined) updateData.price = item.price
    if (item.priceLarge !== undefined) updateData.price_large = item.priceLarge
    if (item.priceKids !== undefined) updateData.price_kids = item.priceKids
    if (item.costPrice !== undefined) updateData.cost_price = item.costPrice
    if (item.isActive !== undefined) updateData.is_active = item.isActive
    if (item.isSoldOut !== undefined) updateData.is_sold_out = item.isSoldOut
    if (item.soldOutUntil !== undefined) updateData.sold_out_until = item.soldOutUntil
    if (item.isFeatured !== undefined) updateData.is_featured = item.isFeatured
    if (item.isNew !== undefined) updateData.is_new = item.isNew
    if (item.isPopular !== undefined) updateData.is_popular = item.isPopular
    if (item.isVegan !== undefined) updateData.is_vegan = item.isVegan
    if (item.isVegetarian !== undefined) updateData.is_vegetarian = item.isVegetarian
    if (item.isGlutenFree !== undefined) updateData.is_gluten_free = item.isGlutenFree
    if (item.isDairyFree !== undefined) updateData.is_dairy_free = item.isDairyFree
    if (item.variants !== undefined) updateData.variants = item.variants
    if (item.customizations !== undefined) updateData.customizations = item.customizations
    if (item.sortOrder !== undefined) updateData.sort_order = item.sortOrder

    const { error: updateError } = await supabase
      .from("menu_items")
      .update(updateData)
      .eq("id", id)

    if (updateError) {
      console.error("Error updating menu item:", updateError)
      throw updateError
    }

    await loadMenu()
  }, [loadMenu])

  const deleteMenuItem = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting menu item:", deleteError)
      throw deleteError
    }

    await loadMenu()
  }, [loadMenu])

  const toggleSoldOut = useCallback(async (id: string, isSoldOut: boolean) => {
    const { error: updateError } = await supabase
      .from("menu_items")
      .update({ is_sold_out: isSoldOut })
      .eq("id", id)

    if (updateError) {
      console.error("Error toggling sold out:", updateError)
      throw updateError
    }

    // Update local state immediately
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSoldOut } : item
      )
    )
  }, [])

  // Promotion operations
  const addPromotion = useCallback(async (promotion: Omit<Promotion, "id" | "usesCount" | "createdAt" | "updatedAt">) => {
    const { error: insertError } = await supabase
      .from("promotions")
      .insert({
        name: promotion.name,
        description: promotion.description,
        promo_type: promotion.promoType,
        discount_value: promotion.discountValue,
        buy_quantity: promotion.buyQuantity,
        get_quantity: promotion.getQuantity,
        applies_to: promotion.appliesTo,
        category_id: promotion.categoryId,
        item_ids: promotion.itemIds,
        min_order_value: promotion.minOrderValue,
        max_uses: promotion.maxUses,
        start_date: promotion.startDate,
        end_date: promotion.endDate,
        is_active: promotion.isActive,
        promo_code: promotion.promoCode,
      })

    if (insertError) {
      console.error("Error adding promotion:", insertError)
      throw insertError
    }

    await loadMenu()
  }, [loadMenu])

  const updatePromotion = useCallback(async (id: string, promotion: Partial<Promotion>) => {
    const updateData: any = {}
    if (promotion.name !== undefined) updateData.name = promotion.name
    if (promotion.description !== undefined) updateData.description = promotion.description
    if (promotion.promoType !== undefined) updateData.promo_type = promotion.promoType
    if (promotion.discountValue !== undefined) updateData.discount_value = promotion.discountValue
    if (promotion.buyQuantity !== undefined) updateData.buy_quantity = promotion.buyQuantity
    if (promotion.getQuantity !== undefined) updateData.get_quantity = promotion.getQuantity
    if (promotion.appliesTo !== undefined) updateData.applies_to = promotion.appliesTo
    if (promotion.categoryId !== undefined) updateData.category_id = promotion.categoryId
    if (promotion.itemIds !== undefined) updateData.item_ids = promotion.itemIds
    if (promotion.minOrderValue !== undefined) updateData.min_order_value = promotion.minOrderValue
    if (promotion.maxUses !== undefined) updateData.max_uses = promotion.maxUses
    if (promotion.startDate !== undefined) updateData.start_date = promotion.startDate
    if (promotion.endDate !== undefined) updateData.end_date = promotion.endDate
    if (promotion.isActive !== undefined) updateData.is_active = promotion.isActive
    if (promotion.promoCode !== undefined) updateData.promo_code = promotion.promoCode

    const { error: updateError } = await supabase
      .from("promotions")
      .update(updateData)
      .eq("id", id)

    if (updateError) {
      console.error("Error updating promotion:", updateError)
      throw updateError
    }

    await loadMenu()
  }, [loadMenu])

  const deletePromotion = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from("promotions")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting promotion:", deleteError)
      throw deleteError
    }

    await loadMenu()
  }, [loadMenu])

  // Banner operations
  const addBanner = useCallback(async (banner: Omit<Banner, "id" | "createdAt" | "updatedAt">) => {
    const { error: insertError } = await supabase
      .from("banners")
      .insert({
        title: banner.title,
        subtitle: banner.subtitle,
        description: banner.description,
        image_url: banner.imageUrl,
        background_color: banner.backgroundColor,
        text_color: banner.textColor,
        button_text: banner.buttonText,
        button_link: banner.buttonLink,
        position: banner.position,
        is_active: banner.isActive,
        start_date: banner.startDate,
        end_date: banner.endDate,
        sort_order: banner.sortOrder,
      })

    if (insertError) {
      console.error("Error adding banner:", insertError)
      throw insertError
    }

    await loadMenu()
  }, [loadMenu])

  const updateBanner = useCallback(async (id: string, banner: Partial<Banner>) => {
    const updateData: any = {}
    if (banner.title !== undefined) updateData.title = banner.title
    if (banner.subtitle !== undefined) updateData.subtitle = banner.subtitle
    if (banner.description !== undefined) updateData.description = banner.description
    if (banner.imageUrl !== undefined) updateData.image_url = banner.imageUrl
    if (banner.backgroundColor !== undefined) updateData.background_color = banner.backgroundColor
    if (banner.textColor !== undefined) updateData.text_color = banner.textColor
    if (banner.buttonText !== undefined) updateData.button_text = banner.buttonText
    if (banner.buttonLink !== undefined) updateData.button_link = banner.buttonLink
    if (banner.position !== undefined) updateData.position = banner.position
    if (banner.isActive !== undefined) updateData.is_active = banner.isActive
    if (banner.startDate !== undefined) updateData.start_date = banner.startDate
    if (banner.endDate !== undefined) updateData.end_date = banner.endDate
    if (banner.sortOrder !== undefined) updateData.sort_order = banner.sortOrder

    const { error: updateError } = await supabase
      .from("banners")
      .update(updateData)
      .eq("id", id)

    if (updateError) {
      console.error("Error updating banner:", updateError)
      throw updateError
    }

    await loadMenu()
  }, [loadMenu])

  const deleteBanner = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from("banners")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Error deleting banner:", deleteError)
      throw deleteError
    }

    await loadMenu()
  }, [loadMenu])

  const refreshMenu = useCallback(async () => {
    await loadMenu()
  }, [loadMenu])

  // Helpers
  const getItemsByCategory = useCallback((categorySlug: string) => {
    const category = categories.find((c) => c.slug === categorySlug)
    if (!category) return []
    return menuItems.filter((item) => item.categoryId === category.id && item.isActive)
  }, [categories, menuItems])

  const getSoldOutItems = useCallback(() => {
    return menuItems.filter((item) => item.isSoldOut)
  }, [menuItems])

  const getActivePromotions = useCallback(() => {
    const now = new Date()
    return promotions.filter((promo) => {
      if (!promo.isActive) return false
      const startDate = new Date(promo.startDate)
      if (startDate > now) return false
      if (promo.endDate) {
        const endDate = new Date(promo.endDate)
        if (endDate < now) return false
      }
      if (promo.maxUses && promo.usesCount >= promo.maxUses) return false
      return true
    })
  }, [promotions])

  const getActiveBanners = useCallback(() => {
    const now = new Date()
    return banners.filter((banner) => {
      if (!banner.isActive) return false
      const startDate = new Date(banner.startDate)
      if (startDate > now) return false
      if (banner.endDate) {
        const endDate = new Date(banner.endDate)
        if (endDate < now) return false
      }
      return true
    })
  }, [banners])

  // Today's Specials functions
  const setTodaySpecials = useCallback((ids: string[]) => {
    setTodaySpecialIds(ids)
    localStorage.setItem("todaySpecials", JSON.stringify({
      date: new Date().toDateString(),
      ids
    }))
  }, [])

  const toggleTodaySpecial = useCallback((id: string) => {
    setTodaySpecialIds(prev => {
      const newIds = prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
      localStorage.setItem("todaySpecials", JSON.stringify({
        date: new Date().toDateString(),
        ids: newIds
      }))
      return newIds
    })
  }, [])

  const getTodaySpecials = useCallback(() => {
    return menuItems.filter(item => todaySpecialIds.includes(item.id) && item.isActive && !item.isSoldOut)
  }, [menuItems, todaySpecialIds])

  return (
    <MenuContext.Provider
      value={{
        categories,
        menuItems,
        promotions,
        banners,
        todaySpecialIds,
        loading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleSoldOut,
        addPromotion,
        updatePromotion,
        deletePromotion,
        addBanner,
        updateBanner,
        deleteBanner,
        setTodaySpecials,
        toggleTodaySpecial,
        getTodaySpecials,
        refreshMenu,
        getItemsByCategory,
        getSoldOutItems,
        getActivePromotions,
        getActiveBanners,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export const useMenu = () => {
  const context = useContext(MenuContext)
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider")
  }
  return context
}
