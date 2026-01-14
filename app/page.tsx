"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Section } from "@/components/ui/Section"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Beef, UtensilsCrossed, Salad, Heart, MapPin, Phone, Clock, Star, Percent, Tag, ArrowRight } from "lucide-react"
import Reviews from "@/components/ui/Reviews"
import contentData from "@/src/content/content.json"
import PopularTimes from "@/components/ui/PopularTimes"
import { DynamicMenu } from "@/components/ui/DynamicMenu"
import { useMenu } from "@/contexts/MenuContext"

export default function Home() {
  const { promotions, banners, getTodaySpecials } = useMenu()
  
  // Get today's specials
  const todaySpecials = getTodaySpecials()
  
  // Show all active promotions (admin controls what's active)
  const activePromotions = promotions.filter(p => p.isActive)
  // Show all active banners
  const activeBanners = banners.filter(b => b.isActive)
  const topBanners = activeBanners.filter(b => b.position === "top")
  const heroBanners = activeBanners.filter(b => b.position === "hero")
  const menuBanners = activeBanners.filter(b => b.position === "menu")

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=1200&q=75"
            alt="Shawarma Today"
            fill
            className="object-cover"
            priority
          />
          {/* Black 70% opacity overlay */}
          <div className="absolute inset-0 bg-black/70" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading tracking-wide mb-8 text-white text-balance drop-shadow-2xl uppercase">
              <span className="text-shawarma drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">Authentic Shawarma</span>
              <br />
              <span className="text-white font-heading">made fresh daily</span>
          </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Traditional Middle Eastern flavours, served fast and fresh
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#menu" className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-shawarma-50 text-shawarma-800 hover:bg-shawarma-100 border-2 border-shawarma-100 min-w-[160px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold rounded-lg">
                <UtensilsCrossed className="h-5 w-5" /> View Menu
              </a>
              <a href="#contact" className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-shawarma border-2 border-shawarma text-white hover:bg-[#d95a1e] min-w-[160px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold rounded-lg">
                <MapPin className="h-5 w-5" /> Visit Us
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </section>

      {/* Hero Position Banners */}
      {heroBanners.length > 0 && (
        <section className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
            {heroBanners.map((banner) => (
              <div 
                key={banner.id}
                className="rounded-2xl p-8 md:p-12 text-center shadow-2xl overflow-hidden"
                style={{ backgroundColor: banner.backgroundColor, color: banner.textColor }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                {banner.subtitle && <p className="text-xl opacity-90 mb-2">{banner.subtitle}</p>}
                {banner.description && <p className="opacity-80 max-w-2xl mx-auto">{banner.description}</p>}
                {banner.buttonText && banner.buttonLink && (
                  <Link 
                    href={banner.buttonLink}
                    className="inline-block mt-6 px-8 py-3 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg"
                    style={{ backgroundColor: banner.textColor, color: banner.backgroundColor }}
                  >
                    {banner.buttonText}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <Section className="relative">
        {/* Liquid background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-white/90" />
        <div className="relative z-10">
          <div className="text-center mb-20 animate-slide-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 pb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Our Offerings
          </h2>
            <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed font-light">
            Discover our authentic Middle Eastern cuisine
          </p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide snap-x snap-mandatory">
          {[
            {
              icon: UtensilsCrossed,
              title: "10\" Pizzas",
              description: "Fresh baked pizzas from £4.99",
              image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=75",
              filter: "pizzas",
            },
            {
              icon: Beef,
              title: "Shawarma & Wraps",
              description: "Lamb & chicken wraps from £4.50",
              image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=75",
              filter: "wraps",
            },
            {
              icon: Beef,
              title: "Grill & Platters",
              description: "Kebabs, tikka & mix platters",
              image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=75",
              filter: "grill",
            },
          ].map((feature, index) => (
            <button
              key={feature.title}
              onClick={() => {
                // Scroll to menu section first
                const menuSection = document.getElementById('menu')
                if (menuSection) {
                  menuSection.scrollIntoView({ behavior: 'smooth' })
                }
                // Set hash after a small delay to ensure scroll completes
                setTimeout(() => {
                  window.location.hash = `menu-${feature.filter}`
                }, 100)
              }}
              className="block flex-shrink-0 w-[280px] md:w-auto snap-start text-left"
            >
              <Card
                className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer h-full"
              >
                <div className="relative h-40 md:h-48 overflow-hidden rounded-t-xl bg-gray-100">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                    sizes="(max-width: 768px) 280px, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 mb-1">
                      <feature.icon className="h-4 w-4 text-white" strokeWidth={2} />
                      <span className="text-white font-semibold text-base drop-shadow-md">{feature.title}</span>
                    </div>
                    <p className="text-white/80 text-xs line-clamp-1">{feature.description}</p>
                  </div>
                </div>
                <CardContent className="p-3">
                  <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900 transition-colors flex items-center gap-2">
                    <UtensilsCrossed className="h-3 w-3" /> View Menu
                  </span>
                </CardContent>
              </Card>
            </button>
          ))}
          </div>
        </div>
      </Section>

      {/* Menu Preview with Images */}
      <Section id="menu" className="relative">
        {/* Liquid background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-gray-50/60 to-white/80 backdrop-blur-3xl" />
        <div className="relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4 md:mb-6 pb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Our Menu
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            A selection of our most popular items
          </p>
        </div>

        {/* Active Promotions Banner */}
        {activePromotions.length > 0 && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-shawarma to-shawarma-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-full">
                  <Percent className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">Special Offers</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activePromotions.map((promo) => (
                  <div key={promo.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <h4 className="font-semibold text-lg">{promo.name}</h4>
                    <p className="text-white/90 text-2xl font-bold mt-1">
                      {promo.promoType === "percentage" ? `${promo.discountValue}% OFF` : `£${promo.discountValue?.toFixed(2)} OFF`}
                    </p>
                    {promo.description && <p className="text-white/80 text-sm mt-2">{promo.description}</p>}
                    {promo.promoCode && (
                      <div className="mt-3 inline-block px-3 py-1 bg-white/20 rounded-lg text-sm font-mono">
                        Code: {promo.promoCode}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu Section Banners */}
        {menuBanners.map((banner) => (
          <div 
            key={banner.id}
            className="mb-8 rounded-2xl p-6 text-center shadow-lg"
            style={{ backgroundColor: banner.backgroundColor, color: banner.textColor }}
          >
            <h3 className="text-xl font-bold">{banner.title}</h3>
            {banner.subtitle && <p className="opacity-90 mt-1">{banner.subtitle}</p>}
            {banner.description && <p className="opacity-80 text-sm mt-2">{banner.description}</p>}
            {banner.buttonText && banner.buttonLink && (
              <Link 
                href={banner.buttonLink}
                className="inline-block mt-4 px-6 py-2 rounded-full font-medium transition-opacity hover:opacity-80"
                style={{ backgroundColor: banner.textColor, color: banner.backgroundColor }}
              >
                {banner.buttonText}
              </Link>
            )}
          </div>
        ))}

        {/* Today's Specials - Horizontal scroll */}
        {todaySpecials.length > 0 && (
          <div className="mb-8 -mx-6 px-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h3 className="text-lg font-bold text-gray-900">Today&apos;s Specials</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
              {todaySpecials.map((item) => (
                <div 
                  key={item.id} 
                  className="flex-shrink-0 w-[200px] bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3 snap-start"
                >
                  {item.imageUrl && (
                    <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-gray-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={200}
                        height={96}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                  <p className="text-lg font-bold text-yellow-600">£{item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Menu from Supabase */}
        <div className="min-h-[600px]">
          <DynamicMenu />
        </div>
        </div>
      </Section>

      {/* About Section */}
      <Section id="about" className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/95 via-white/85 to-gray-100/95" />
        <div className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="animate-slide-up space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-shawarma shadow-sm">
                  <Heart className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  About Us
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-8 pb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Authentic Flavours
              </h2>
              <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
                Today Shawarma brings the authentic taste of Middle Eastern street food to Edinburgh. Our recipes have been passed down through generations, using traditional spices and cooking methods.
              </p>
              <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
                Every wrap is made fresh to order with premium halal meat, house-made sauces, and crisp vegetables. Experience the real taste of shawarma, just like it&apos;s meant to be.
              </p>
            </div>
            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl animate-scale-in ring-1 ring-border/50">
              <Image
                src="https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800&q=75"
                alt="Fresh shawarma"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </Section>

      {/* Decorative Divider */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Reviews Section - Live from Google API */}
      <Section id="reviews" className="relative overflow-hidden">
        <Reviews />
      </Section>

      {/* Visit Us Section - Trendy Layout */}
      <Section id="contact" className="relative py-16 bg-gray-50">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shawarma/10 text-shawarma font-semibold text-sm rounded-full mb-4">
              📍 Find Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Visit Our Restaurant
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Fresh shawarma, warm hospitality, and the best Middle Eastern flavors in Edinburgh
            </p>
          </div>

          {/* Main Content - Bento Grid Style */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Map - Takes 2 columns on large screens */}
            <div className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-2xl group h-[400px] lg:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2233.5!2d-3.1675541!3d55.9573123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4887b9001f5acead%3A0x388a5a0797201ff0!2sToday%20Shawarma!5e0!3m2!1sen!2suk!4v1234567890123"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[400px]"
              ></iframe>
              
              {/* Floating Address Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-shawarma flex-shrink-0">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Today Shawarma</h4>
                      <p className="text-sm text-gray-600">{contentData.address.line1}</p>
                      <p className="text-sm text-gray-600">{contentData.address.city} {contentData.address.postcode}</p>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contentData.address.line1 + ', ' + contentData.address.city + ' ' + contentData.address.postcode)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-shawarma hover:text-shawarma-600 font-medium text-sm mt-2 transition-colors"
                      >
                        Get Directions <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Info Cards */}
            <div className="flex flex-col gap-6">
              
              {/* Opening Hours Card */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-shawarma">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Opening Hours</h3>
                </div>
                <div className="space-y-2.5">
                  {contentData.hours.items.map((item) => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
                    const isToday = item.day.toLowerCase().includes(today.toLowerCase().slice(0, 3))
                    return (
                      <div 
                        key={item.day} 
                        className={`flex justify-between items-center py-1.5 px-3 rounded-lg transition-colors ${isToday ? 'bg-shawarma/10 text-shawarma font-semibold' : 'text-gray-600'}`}
                      >
                        <span className="text-sm">{item.day}</span>
                        <span className="text-sm font-medium">{item.open} - {item.close}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  {contentData.hours.note}
                </p>
              </div>

              {/* Contact Card */}
              <div className="bg-gray-900 rounded-3xl p-6 shadow-lg text-white">
                <h3 className="text-lg font-bold mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <a
                    href={`tel:${contentData.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-shawarma">
                      <Phone className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Call to order</p>
                      <p className="font-semibold">{contentData.phone}</p>
                    </div>
                  </a>
                  
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contentData.address.line1 + ', ' + contentData.address.city + ' ' + contentData.address.postcode)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-shawarma hover:bg-shawarma-600 rounded-xl font-semibold transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Times - Full Width Below */}
          <div className="mt-6">
            <PopularTimes />
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  )
}
