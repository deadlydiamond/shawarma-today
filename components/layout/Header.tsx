"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Menu", href: "/menu" },
  { name: "Visit", href: "/visit" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-coffee-dark">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1 lg:gap-x-8">
          {navigation.slice(0, 3).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="hidden lg:block text-sm font-body text-white/90 transition-colors hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-1 justify-center">
          <Link href="/" className="text-2xl md:text-3xl font-heading font-light text-white tracking-wider">
            LEAF & BEAN
          </Link>
        </div>
        <div className="flex items-center gap-4 lg:flex-1 lg:justify-end">
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.slice(3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-body text-white/90 transition-colors hover:text-white"
              >
                {item.name}
              </Link>
            ))}
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
              className="-m-2.5 inline-flex items-center justify-center p-2.5 text-white"
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
      </nav>
      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden border-t border-white/10 bg-coffee-dark",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 px-6 pb-6 pt-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block py-3 text-base font-body text-white/90 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
