"use client"

import { useEffect, useState } from "react"
import { Star, ArrowRight } from "lucide-react"

interface Review {
  author_name: string
  rating: number
  text: string
  relative_time_description: string
  profile_photo_url?: string
}

interface ReviewsData {
  reviews: Review[]
  rating: number
  totalReviews: number
  error?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function Reviews() {
  const [data, setData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews")
        const json = await res.json()
        
        if (json.error) {
          console.error("Reviews API error:", json.error)
          setData({ reviews: [], rating: 0, totalReviews: 0, error: json.error })
        } else {
          setData(json)
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
        setData({ reviews: [], rating: 0, totalReviews: 0, error: "Failed to load reviews" })
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="relative py-16 overflow-hidden">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full animate-pulse mb-4">
            <div className="w-20 h-5 bg-gray-200 rounded" />
          </div>
          <div className="w-64 h-10 bg-gray-200 rounded mx-auto" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[320px] p-5 bg-gray-100 rounded-2xl animate-pulse">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <div className="w-24 h-4 bg-gray-200 rounded mb-1" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-200 rounded" />
                <div className="w-3/4 h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // No reviews or error state
  if (!data || data.reviews.length === 0) {
    return (
      <div className="relative py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-gray-500 text-sm">Google Reviews</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
        <p className="text-gray-500">
          {data?.error || "Reviews will appear here once connected to Google Places API"}
        </p>
        <a
          href="https://www.google.com/maps/place/Today+Shawarma/@55.9573123,-3.1675541"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-shawarma hover:text-shawarma-600 font-medium transition-colors"
        >
          See reviews on Google
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    )
  }

  // Duplicate reviews for seamless marquee
  const row1Reviews = [...data.reviews, ...data.reviews]
  const row2Reviews = [...data.reviews.slice().reverse(), ...data.reviews.slice().reverse()]

  return (
    <div className="relative py-16 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-semibold text-gray-900">{data.rating.toFixed(1)}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${
                  i < Math.floor(data.rating) 
                    ? "fill-amber-400 text-amber-400" 
                    : i < data.rating 
                      ? "fill-amber-400/50 text-amber-400/50" 
                      : "fill-gray-200 text-gray-200"
                }`} 
              />
            ))}
          </div>
          <span className="text-gray-500 text-sm">{data.totalReviews} reviews</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Our Customers Say</h2>
      </div>

      {/* Marquee Row 1 */}
      <div className="relative mb-4">
        <div className="flex animate-marquee gap-4">
          {row1Reviews.map((review, index) => (
            <div
              key={`r1-${index}`}
              className="flex-shrink-0 w-[320px] p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                {review.profile_photo_url ? (
                  <img 
                    src={review.profile_photo_url} 
                    alt={review.author_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-shawarma to-shawarma-600 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(review.author_name)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{review.author_name}</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">&quot;{review.text}&quot;</p>
              <p className="text-xs text-gray-400 mt-2">{review.relative_time_description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 (reverse) */}
      {data.reviews.length > 3 && (
        <div className="relative">
          <div className="flex animate-marquee-reverse gap-4">
            {row2Reviews.map((review, index) => (
              <div
                key={`r2-${index}`}
                className="flex-shrink-0 w-[320px] p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  {review.profile_photo_url ? (
                    <img 
                      src={review.profile_photo_url} 
                      alt={review.author_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(review.author_name)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.author_name}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">&quot;{review.text}&quot;</p>
                <p className="text-xs text-gray-400 mt-2">{review.relative_time_description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

      {/* CTA */}
      <div className="text-center mt-8">
        <a
          href="https://www.google.com/maps/place/Today+Shawarma/@55.9573123,-3.1675541"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-shawarma hover:text-shawarma-600 font-medium transition-colors"
        >
          Read all reviews on Google
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
