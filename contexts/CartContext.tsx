"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

export interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  priceLarge?: string
  priceKids?: string
  image: string
  category: string
  // Tags
  isVegan?: boolean
  isVegetarian?: boolean
  isGlutenFree?: boolean
  isDairyFree?: boolean
  isPopular?: boolean
  isNew?: boolean
}

export interface CartItem extends MenuItem {
  quantity: number
  selectedSize?: "regular" | "large" | "kids"
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: MenuItem, size?: "regular" | "large" | "kids") => void
  removeFromCart: (itemId: string, size?: "regular" | "large" | "kids") => void
  updateQuantity: (itemId: string, quantity: number, size?: "regular" | "large" | "kids") => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "leafbean_cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setCartItems(parsed)
        }
      }
    } catch (err) {
      console.error("Error loading cart from localStorage:", err)
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
      } catch (err) {
        console.error("Error saving cart to localStorage:", err)
      }
    }
  }, [cartItems, isInitialized])

  const getItemPrice = (item: MenuItem, size?: "regular" | "large" | "kids"): number => {
    if (size === "large" && item.priceLarge) {
      return parseFloat(item.priceLarge.replace("£", ""))
    }
    if (size === "kids" && item.priceKids) {
      return parseFloat(item.priceKids.replace("£", ""))
    }
    return parseFloat(item.price.replace("£", "").replace("+", ""))
  }

  const addToCart = (item: MenuItem, size: "regular" | "large" | "kids" = "regular") => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.selectedSize === size
      )

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += 1
        return updatedItems
      } else {
        return [
          ...prevItems,
          {
            ...item,
            quantity: 1,
            selectedSize: size,
          },
        ]
      }
    })
    setIsOpen(true)
  }

  const removeFromCart = (itemId: string, size?: "regular" | "large" | "kids") => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === itemId && (!size || item.selectedSize === size))
      )
    )
  }

  const updateQuantity = (itemId: string, quantity: number, size?: "regular" | "large" | "kids") => {
    if (quantity <= 0) {
      removeFromCart(itemId, size)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId && (!size || item.selectedSize === size)
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalPrice = (): number => {
    return cartItems.reduce((total, item) => {
      const price = getItemPrice(item, item.selectedSize)
      return total + price * item.quantity
    }, 0)
  }

  const getTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
