"use client"

import { useState, useEffect } from "react"
import { Cookie, X } from "lucide-react"

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem("cookie_consent")
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "accepted")
    localStorage.setItem("cookie_consent_date", new Date().toISOString())
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem("cookie_consent", "declined")
    localStorage.setItem("cookie_consent_date", new Date().toISOString())
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:flex md:items-center md:justify-between gap-6">
          {/* Icon & Text */}
          <div className="flex items-start gap-4 mb-4 md:mb-0">
            <div className="p-3 bg-shawarma/10 rounded-xl flex-shrink-0">
              <Cookie className="h-6 w-6 text-shawarma" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">We use cookies 🍪</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We use cookies to remember your cart, track your orders, and improve your experience. 
                By continuing, you agree to our use of cookies.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={declineCookies}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Decline
            </button>
            <button
              onClick={acceptCookies}
              className="px-6 py-2.5 bg-shawarma hover:bg-shawarma-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg text-sm"
            >
              Accept All
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={declineCookies}
            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 transition-colors md:hidden"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
