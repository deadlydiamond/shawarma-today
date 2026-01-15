"use client"

import { usePathname } from "next/navigation"
import CookieConsent from "./CookieConsent"

export default function CustomerCookieConsent() {
  const pathname = usePathname()
  
  // Don't show on admin or POS pages
  const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/pos")
  
  if (isAdminPage) return null
  
  return <CookieConsent />
}
