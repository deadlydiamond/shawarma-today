"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Section } from "@/components/ui/Section"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Beef, UtensilsCrossed, Salad, Heart, MapPin, Phone, Clock, Star, ArrowRight, Users, Award, Flame } from "lucide-react"
import Reviews from "@/components/ui/Reviews"
import contentData from "@/src/content/content.json"
import PopularTimes from "@/components/ui/PopularTimes"
import { DynamicMenu } from "@/components/ui/DynamicMenu"
import { AnimatedSection, AnimatedCounter } from "@/components/ui/AnimatedSection"
import { useSettings } from "@/contexts/SettingsContext"

export default function Home() {
  const { settings } = useSettings()
  // Google reviews data for About Us stats
  const [googleStats, setGoogleStats] = useState({ rating: 4.8, totalReviews: 100 })
  
  useEffect(() => {
    // Fetch Google rating and review count
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (data.rating && data.totalReviews) {
          setGoogleStats({ rating: data.rating, totalReviews: data.totalReviews })
        }
      })
      .catch(() => {
        // Keep default values on error
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt="Today Shawarma Restaurant"
            fill
            className="object-cover object-[center_20%]"
            priority
          />
          {/* Black 85% opacity overlay */}
          <div className="absolute inset-0 bg-black/85" />
        </div>

        {/* Floating Decorative Food Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating spice particles */}
          <div className="absolute top-20 left-[10%] w-3 h-3 bg-shawarma/60 rounded-full animate-float-slow" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-[15%] w-2 h-2 bg-yellow-500/50 rounded-full animate-float-medium" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-[20%] w-4 h-4 bg-shawarma/40 rounded-full animate-float-fast" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-60 right-[25%] w-2 h-2 bg-orange-400/50 rounded-full animate-float-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-60 right-[10%] w-3 h-3 bg-red-500/40 rounded-full animate-float-medium" style={{ animationDelay: '1.5s' }} />
          
          {/* Large decorative blurs */}
          <div className="absolute top-1/4 left-0 w-72 h-72 bg-shawarma/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Trust Badges */}
            <div className="animate-slide-up flex flex-wrap justify-center gap-3" style={{ animationDelay: '0.2s' }}>
              {/* Halal Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-md rounded-full border border-emerald-400/40 text-white text-sm shadow-lg shadow-emerald-500/20">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  ☪
                </div>
                <span className="font-bold text-emerald-300">100% HALAL</span>
              </div>
              
              {/* Customer Love Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white/90 text-sm">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-shawarma flex items-center justify-center text-xs">⭐</div>
                  <div className="w-6 h-6 rounded-full bg-shawarma-600 flex items-center justify-center text-xs">⭐</div>
                  <div className="w-6 h-6 rounded-full bg-shawarma-700 flex items-center justify-center text-xs">⭐</div>
                </div>
                <span className="font-medium">Loved by 500+ customers</span>
              </div>
            </div>

            {/* Main Heading with Staggered Animation */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading tracking-wide text-white text-balance drop-shadow-2xl uppercase">
              <span className="inline-block animate-slide-up text-shawarma drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" style={{ animationDelay: '0.3s' }}>
                Authentic Shawarma
              </span>
              <br />
              <span className="inline-block animate-slide-up text-white font-heading" style={{ animationDelay: '0.5s' }}>
                made fresh daily
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md animate-slide-up" style={{ animationDelay: '0.7s' }}>
              Traditional Middle Eastern flavours, served fast and fresh
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.9s' }}>
              <a href="#menu" className="group inline-flex items-center justify-center gap-3 px-8 py-3 bg-shawarma-50 text-shawarma-800 hover:bg-shawarma-100 border-2 border-shawarma-100 min-w-[160px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold rounded-lg press-effect">
                <UtensilsCrossed className="h-5 w-5 group-hover:rotate-12 transition-transform" /> View Menu
              </a>
              <a href="#contact" className="group inline-flex items-center justify-center gap-3 px-8 py-3 bg-shawarma border-2 border-shawarma text-white hover:bg-[#d95a1e] min-w-[160px] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold rounded-lg press-effect ripple">
                <MapPin className="h-5 w-5 group-hover:bounce transition-transform" /> Visit Us
              </a>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 animate-slide-up" style={{ animationDelay: '1.1s' }}>
              <div className="flex items-center gap-2 text-white/80">
                <Flame className="h-5 w-5 text-shawarma" />
                <span className="text-sm font-medium">Fresh Daily</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium">Fast Service</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Users className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium">Family Owned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>


      {/* Features Section - Trendy Bento Grid */}
      <Section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50" />
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <AnimatedSection animation="fade-up" className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 bg-shawarma/10 text-shawarma font-semibold text-sm rounded-full mb-4">
              🔥 What We Serve
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-gray-900">
              Our Offerings
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Authentic Middle Eastern flavors, crafted fresh daily
            </p>
          </AnimatedSection>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Large Featured Card - Shawarma */}
            <AnimatedSection animation="slide-left" className="col-span-2 row-span-2">
              <button
                onClick={() => {
                  const menuSection = document.getElementById('menu')
                  if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' })
                  setTimeout(() => { window.location.hash = 'menu-wraps' }, 100)
                }}
                className="relative w-full h-full min-h-[400px] md:min-h-[500px] rounded-3xl overflow-hidden group cursor-pointer"
              >
                <Image
                  src="https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80"
                  alt="Shawarma & Wraps"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                    <span className="inline-block px-3 py-1 bg-shawarma text-white text-xs font-bold rounded-full mb-3 animate-glow-pulse">
                      ⭐ BESTSELLER
                    </span>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Shawarma & Wraps</h3>
                    <p className="text-white/80 text-sm md:text-base mb-4 max-w-sm">
                      Tender lamb & chicken, marinated for 24 hours in our secret spice blend
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-shawarma">From £4.50</span>
                      <span className="flex items-center gap-2 text-white/90 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full group-hover:bg-shawarma transition-colors">
                        Order Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </AnimatedSection>

            {/* Pizza Card */}
            <AnimatedSection animation="zoom" delay={100} className="col-span-1 row-span-1">
              <button
                onClick={() => {
                  const menuSection = document.getElementById('menu')
                  if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' })
                  setTimeout(() => { window.location.hash = 'menu-pizzas' }, 100)
                }}
                className="relative w-full h-full min-h-[190px] md:min-h-[240px] rounded-3xl overflow-hidden group cursor-pointer"
              >
                <Image
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=75"
                  alt="10 inch Pizzas"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-shawarma flex items-center justify-center">
                      <UtensilsCrossed className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">10&quot; Pizzas</h3>
                  <p className="text-white/70 text-xs md:text-sm">From £4.99</p>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-shawarma/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-bold flex items-center gap-2">
                    View Menu <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
              </button>
            </AnimatedSection>

            {/* Grill Card */}
            <AnimatedSection animation="zoom" delay={200} className="col-span-1 row-span-1">
              <button
                onClick={() => {
                  const menuSection = document.getElementById('menu')
                  if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' })
                  setTimeout(() => { window.location.hash = 'menu-grill' }, 100)
                }}
                className="relative w-full h-full min-h-[190px] md:min-h-[240px] rounded-3xl overflow-hidden group cursor-pointer"
              >
                <Image
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=75"
                  alt="Grill & Platters"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-shawarma flex items-center justify-center">
                      <Beef className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">Grill & Platters</h3>
                  <p className="text-white/70 text-xs md:text-sm">Kebabs & Tikka</p>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-shawarma/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-bold flex items-center gap-2">
                    View Menu <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
              </button>
            </AnimatedSection>

            {/* Fatayer Card */}
            <AnimatedSection animation="zoom" delay={300} className="col-span-1 row-span-1">
              <button
                onClick={() => {
                  const menuSection = document.getElementById('menu')
                  if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' })
                  setTimeout(() => { window.location.hash = 'menu-fatayer' }, 100)
                }}
                className="relative w-full h-full min-h-[190px] md:min-h-[240px] rounded-3xl overflow-hidden group cursor-pointer"
              >
                <Image
                  src="https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=75"
                  alt="Fatayer"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-shawarma flex items-center justify-center">
                      <Salad className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">Fatayer</h3>
                  <p className="text-white/70 text-xs md:text-sm">10&quot; Flatbreads</p>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-shawarma/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-bold flex items-center gap-2">
                    View Menu <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
              </button>
            </AnimatedSection>

            {/* Meals Card - Wide */}
            <AnimatedSection animation="slide-right" delay={400} className="col-span-1 row-span-1">
              <button
                onClick={() => {
                  const menuSection = document.getElementById('menu')
                  if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' })
                  setTimeout(() => { window.location.hash = 'menu-meals' }, 100)
                }}
                className="relative w-full h-full min-h-[190px] md:min-h-[240px] rounded-3xl overflow-hidden group cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800"
              >
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-shawarma flex items-center justify-center">
                    <UtensilsCrossed className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Full Meals</h3>
                    <p className="text-white/60 text-sm mb-3">With chips & salad</p>
                    <span className="inline-flex items-center gap-2 text-shawarma font-semibold text-sm group-hover:gap-3 transition-all">
                      From £5.99 <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-shawarma/20 rounded-full blur-2xl" />
                <div className="absolute bottom-10 right-10 w-16 h-16 bg-shawarma/10 rounded-full blur-xl" />
              </button>
            </AnimatedSection>
          </div>

          {/* View Full Menu CTA */}
          <AnimatedSection animation="fade-up" delay={500} className="text-center mt-10 md:mt-14">
            <a
              href="#menu"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-xl hover:shadow-2xl press-effect group"
            >
              <span>View Full Menu</span>
              <div className="w-8 h-8 rounded-full bg-shawarma flex items-center justify-center group-hover:rotate-12 transition-transform">
                <ArrowRight className="h-4 w-4" />
              </div>
            </a>
          </AnimatedSection>
        </div>
      </Section>

      {/* Menu Preview with Images */}
      <Section id="menu" className="relative">
        {/* Liquid background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-gray-50/60 to-white/80 backdrop-blur-3xl" />
        <div className="relative z-10">
          <AnimatedSection animation="fade-up" className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4 md:mb-6 pb-1 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Our Menu
            </h2>
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              A selection of our most popular items
            </p>
          </AnimatedSection>

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
            <AnimatedSection animation="slide-left" className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-shawarma shadow-sm animate-pulse-slow">
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
              
              {/* Stats from Google */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100 hover-scale">
                  <div className="text-3xl font-bold text-shawarma flex items-center justify-center gap-1">
                    {googleStats.rating}
                  </div>
                  <div className="text-sm text-gray-600">Google Rating</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100 hover-scale">
                  <div className="text-3xl font-bold text-shawarma">{googleStats.totalReviews}+</div>
                  <div className="text-sm text-gray-600">Google Reviews</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100 hover-scale">
                  <div className="text-3xl font-bold text-shawarma">40+</div>
                  <div className="text-sm text-gray-600">Menu Items</div>
                </div>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="slide-right" className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50 group">
              <Image
                src="https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800&q=75"
                alt="Fresh shawarma"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Floating badge on image */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-shawarma animate-badge-bounce">
                      <Star className="h-5 w-5 text-white fill-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{googleStats.rating} Rating</div>
                      <div className="text-sm text-gray-600">Based on Google Reviews</div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
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
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-shawarma/10 text-shawarma font-semibold text-sm rounded-full mb-4 animate-badge-bounce">
              📍 Find Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Visit Our Restaurant
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Fresh shawarma, warm hospitality, and the best Middle Eastern flavors in Edinburgh
            </p>
          </AnimatedSection>

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
                      <h4 className="font-bold text-gray-900">{settings.restaurantName || "Today Shawarma"}</h4>
                      <p className="text-sm text-gray-600">{settings.restaurantAddress || contentData.address.line1}</p>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.restaurantAddress || contentData.address.line1)}`}
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
              
              {/* Order Status Card */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 rounded-xl ${settings.acceptingOrders ? "bg-green-500" : "bg-red-500"}`}>
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Order Status</h3>
                </div>
                <div className="text-center py-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    settings.acceptingOrders 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${settings.acceptingOrders ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                    {settings.acceptingOrders ? "Open for Orders" : "Currently Closed"}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  {settings.acceptingOrders 
                    ? "We're ready to take your order!" 
                    : "Please check back later"}
                </p>
              </div>

              {/* Contact Card */}
              <div className="bg-shawarma rounded-3xl p-6 shadow-lg text-white">
                <h3 className="text-lg font-bold mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <a
                    href={`tel:${(settings.restaurantPhone || contentData.phone).replace(/\s/g, "")}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-white">
                      <Phone className="h-4 w-4 text-shawarma" />
                    </div>
                    <div>
                      <p className="text-xs text-white/70">Call to order</p>
                      <p className="font-semibold">{settings.restaurantPhone || contentData.phone}</p>
                    </div>
                  </a>
                  
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.restaurantAddress || contentData.address.line1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-shawarma hover:bg-white/90 rounded-xl font-semibold transition-colors"
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
