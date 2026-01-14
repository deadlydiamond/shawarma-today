import type { Metadata } from "next"
import { Inter, Anton } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import Loader from "@/components/ui/Loader"
import { CartProvider } from "@/contexts/CartContext"
import { OrderProvider } from "@/contexts/OrderContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { SettingsProvider } from "@/contexts/SettingsContext"
import { MenuProvider } from "@/contexts/MenuContext"
import Cart from "@/components/ui/Cart"
import { FloatingCart } from "@/components/ui/FloatingCart"
import { FloatingPromo } from "@/components/ui/FloatingPromo"
import contentData from "@/src/content/content.json"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

// Anton - condensed display font for branding (matches signage)
const anton = Anton({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: "400",
})

export const metadata: Metadata = {
  title: "Shawarma Today | Authentic Middle Eastern Food",
  description:
    "Shawarma Today serves authentic Middle Eastern cuisine including shawarma wraps, falafel, hummus, and fresh salads. Order online for pickup or delivery.",
  openGraph: {
    title: "Shawarma Today | Authentic Middle Eastern Food",
    description:
      "Shawarma Today serves authentic Middle Eastern cuisine including shawarma wraps, falafel, hummus, and fresh salads. Order online for pickup or delivery.",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shawarma Today | Authentic Middle Eastern Food",
    description:
      "Shawarma Today serves authentic Middle Eastern cuisine including shawarma wraps, falafel, hummus, and fresh salads. Order online for pickup or delivery.",
  },
}

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: contentData.name,
  image: "/logos/logo.png",
  "@id": "https://shawarmatoday.co.uk",
  url: "https://shawarmatoday.co.uk",
  telephone: contentData.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: contentData.address.line1,
    addressLocality: contentData.address.city,
    postalCode: contentData.address.postcode,
    addressCountry: "GB",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 55.9573123,
    longitude: -3.1675541,
  },
  openingHoursSpecification: contentData.hours.items.map((item) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: item.day,
    opens: item.open,
    closes: item.close,
  })),
  servesCuisine: "Middle Eastern",
  priceRange: "££",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable}`}>
      <head>
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicons/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicons/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <AuthProvider>
          <SettingsProvider>
            <MenuProvider>
              <OrderProvider>
                <CartProvider>
                  <Loader />
        <main className="flex-1">{children}</main>
                  <Cart />
                  <FloatingCart />
                  <FloatingPromo />
                </CartProvider>
              </OrderProvider>
            </MenuProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
