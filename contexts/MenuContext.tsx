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

export interface MenuItem {
  id: string
  categoryId?: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  price: number
  isActive: boolean
  isSoldOut: boolean
  isFeatured: boolean
  isPopular: boolean
  sortOrder: number
}

interface MenuContextType {
  categories: MenuCategory[]
  menuItems: MenuItem[]
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
  
  // Refresh
  refreshMenu: () => Promise<void>
  
  // Helpers
  getItemsByCategory: (categorySlug: string) => MenuItem[]
  getSoldOutItems: () => MenuItem[]
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMenu = useCallback(async () => {
    if (!supabase) {
      console.error("Supabase client not initialized")
      setLoading(false)
      setError("Database not configured. Please check environment variables.")
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
        setError("Failed to load menu categories. Please run the schema SQL in Supabase.")
        setLoading(false)
        return
      }

      if (!categoriesData || categoriesData.length === 0) {
        console.error("No categories found - schema may not be initialized")
        setError("No menu categories found. Please run the schema SQL in Supabase.")
        setLoading(false)
        return
      }

      // Load menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true })

      if (itemsError) {
        console.error("Error loading menu items:", itemsError)
        setError("Failed to load menu items. Please run the schema SQL in Supabase.")
        setLoading(false)
        return
      }

      if (!itemsData || itemsData.length === 0) {
        console.error("No menu items found - schema may not be initialized")
        setError("No menu items found. Please run the schema SQL in Supabase.")
        setLoading(false)
        return
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
        isActive: item.is_active,
        isSoldOut: item.is_sold_out,
        isFeatured: item.is_featured,
        isPopular: item.is_popular,
        sortOrder: item.sort_order || 0,
      }))

      setCategories(transformedCategories)
      setMenuItems(transformedItems)
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

    // Subscribe to real-time updates
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => loadMenu()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_categories" },
        () => loadMenu()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
        is_active: item.isActive,
        is_sold_out: item.isSoldOut,
        is_featured: item.isFeatured,
        is_popular: item.isPopular,
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
    if (item.isActive !== undefined) updateData.is_active = item.isActive
    if (item.isSoldOut !== undefined) updateData.is_sold_out = item.isSoldOut
    if (item.isFeatured !== undefined) updateData.is_featured = item.isFeatured
    if (item.isPopular !== undefined) updateData.is_popular = item.isPopular
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

  return (
    <MenuContext.Provider
      value={{
        categories,
        menuItems,
        loading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleSoldOut,
        refreshMenu,
        getItemsByCategory,
        getSoldOutItems,
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
