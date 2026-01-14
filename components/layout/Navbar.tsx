"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingBag, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/CartContext"
import Link from "next/link"
import Image from "next/image"

const navigation = [
  { name: "Menu", href: "/#menu" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { setIsOpen, getTotalItems } = useCart()
  const pathname = usePathname()
  
  // Pages with light backgrounds that need dark navbar
  const lightBackgroundPages = ["/checkout", "/contact", "/visit", "/about", "/menu", "/orders", "/order"]
  const isLightBackground = lightBackgroundPages.some(page => pathname?.startsWith(page))

  useEffect(() => {
    // On light background pages, always show dark navbar
    if (isLightBackground) {
      setScrolled(true)
      return
    }
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isLightBackground])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isLightBackground
          ? "bg-white border-b border-gray-200 shadow-sm"
          : scrolled
            ? "glass-strong border-b border-white/30 shadow-lg"
            : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Using Anton font to match signage */}
          <a href="/" className="flex items-center">
            <Image
              src="/logos/shawarma-logo.png"
              alt="Today Shawarma Logo"
              width={100}
              height={100}
              className="h-[100px] w-[100px] object-contain"
            />
            <span className={cn(
              "font-heading text-2xl tracking-wide transition-colors uppercase -ml-2",
              (scrolled || isLightBackground) 
                ? "text-shawarma-orange" 
                : "text-shawarma-orange drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            )}>
              TODAY SHAWARMA
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navigation.map((item) => {
              // Internal routes use Link, anchor links use <a>
              const isInternalRoute = item.href.startsWith("/")
              const href = isInternalRoute 
                ? item.href 
                : (isLightBackground ? `/${item.href}` : item.href)
              
              if (isInternalRoute) {
                return (
                  <Link
                    key={item.name}
                    href={href}
                    className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      (scrolled || isLightBackground)
                        ? "text-foreground/70 hover:text-foreground" 
                        : "text-white/90 hover:text-white drop-shadow-sm"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              }
              
              return (
                <a
                  key={item.name}
                  href={href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    (scrolled || isLightBackground)
                      ? "text-foreground/70 hover:text-foreground" 
                      : "text-white/90 hover:text-white drop-shadow-sm"
                  )}
                >
                  {item.name}
                </a>
              )
            })}
            {/* My Orders */}
            <Link
              href="/orders"
              className={cn(
                "p-2 transition-colors duration-200",
                (scrolled || isLightBackground)
                  ? "text-foreground/70 hover:text-foreground" 
                  : "text-white/90 hover:text-white drop-shadow-sm"
              )}
              aria-label="My Orders"
              title="My Orders"
            >
              <ClipboardList className="h-5 w-5" />
            </Link>
            {/* Cart Icon */}
            <button
              onClick={() => setIsOpen(true)}
              className={cn(
                "relative p-2 transition-colors duration-200",
                (scrolled || isLightBackground)
                  ? "text-foreground/70 hover:text-foreground" 
                  : "text-white/90 hover:text-white drop-shadow-sm"
              )}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-shawarma-orange text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className={cn(
              "md:hidden -m-2.5 p-2.5 transition-colors",
              (scrolled || isLightBackground) ? "text-foreground" : "text-white"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-white/95 backdrop-blur-md">
          <div className="px-6 py-6 space-y-4">
            {navigation.map((item) => {
              const isInternalRoute = item.href.startsWith("/")
              
              if (isInternalRoute) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block text-base font-medium text-foreground hover:text-foreground/70 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              }
              
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-base font-medium text-foreground hover:text-foreground/70 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              )
            })}
            {/* Mobile My Orders Link */}
            <Link
              href="/orders"
              className="flex items-center gap-2 text-base font-medium text-foreground hover:text-foreground/70 transition-colors w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ClipboardList className="h-5 w-5" />
              My Orders
            </Link>
            {/* Mobile Cart Button */}
            <button
              onClick={() => {
                setIsOpen(true)
                setMobileMenuOpen(false)
              }}
              className="flex items-center gap-2 text-base font-medium text-foreground hover:text-foreground/70 transition-colors w-full"
            >
              <ShoppingBag className="h-5 w-5" />
              Cart
              {getTotalItems() > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-shawarma-orange text-white text-xs font-medium rounded-full">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
