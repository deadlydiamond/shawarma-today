"use client"

import { useEffect, useState } from "react"
import Lottie from "lottie-react"

export default function Loader() {
  const [loading, setLoading] = useState(true)
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    // Load animation from public folder
    fetch("/coffee-cup.json")
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data)
      })
      .catch((error) => {
        console.error("Error loading Lottie animation:", error)
      })

    // Simulate page load
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        {/* Lottie Animation */}
        {animationData ? (
          <div className="w-64 h-64 md:w-80 md:h-80">
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
          </div>
        )}
        
      </div>
    </div>
  )
}
