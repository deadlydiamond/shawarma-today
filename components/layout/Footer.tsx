"use client"

import { MapPin, Phone, Clock, UtensilsCrossed, Heart } from "lucide-react"
import contentData from "@/src/content/content.json"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-shawarma rounded-xl">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Today Shawarma</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {contentData.tagline}
            </p>
            <div className="flex items-center gap-2 text-shawarma">
              <Heart className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">Made with love in Edinburgh</span>
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
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contentData.address.line1 + ', ' + contentData.address.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-shawarma transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p>{contentData.address.line1}</p>
                  <p className="text-gray-500">{contentData.address.city} {contentData.address.postcode}</p>
                </div>
              </a>
              <a 
                href={`tel:${contentData.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-shawarma transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm">{contentData.phone}</span>
              </a>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">Opening Hours</h3>
            <div className="space-y-2">
              {contentData.hours.items.slice(0, 3).map((item) => (
                <div key={item.day} className="flex justify-between text-sm">
                  <span className="text-gray-400">{item.day}</span>
                  <span className="text-gray-300">{item.open} - {item.close}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-shawarma text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Open now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {currentYear} Today Shawarma. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span>Edinburgh, UK</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>Fresh • Fast • Halal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
