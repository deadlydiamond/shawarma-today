"use client"

import { MapPin, Phone, Clock, Heart } from "lucide-react"
import Link from "next/link"
import { useSettings } from "@/contexts/SettingsContext"

export default function Footer() {
  const { settings } = useSettings()
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">{settings.restaurantName || "Today Shawarma"}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Authentic Middle Eastern flavours made fresh daily with traditional recipes.
            </p>
            <div className="flex items-center gap-2 text-shawarma">
              <Heart className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">Made with love</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#menu" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Our Menu
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Visit Us
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">Contact</h3>
            <div className="space-y-4">
              {settings.restaurantAddress && (
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.restaurantAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors group"
                >
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-shawarma transition-colors">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <p>{settings.restaurantAddress}</p>
                  </div>
                </a>
              )}
              {settings.restaurantPhone && (
                <a 
                  href={`tel:${settings.restaurantPhone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
                >
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-shawarma transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm">{settings.restaurantPhone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">Status</h3>
            <div className={`flex items-center gap-2 text-sm ${settings.acceptingOrders ? "text-green-400" : "text-red-400"}`}>
              <Clock className="h-4 w-4" />
              <span className="font-medium">{settings.acceptingOrders ? "Open for orders" : "Currently closed"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {currentYear} {settings.restaurantName || "Today Shawarma"}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span>UK</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>Fresh • Fast • Halal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
