import { NextResponse } from "next/server"

interface GoogleReview {
  author_name: string
  rating: number
  text: string
  relative_time_description: string
  profile_photo_url?: string
  time: number
}

interface PlaceDetailsResponse {
  result?: {
    reviews?: GoogleReview[]
    rating?: number
    user_ratings_total?: number
  }
  status: string
  error_message?: string
}

// Cache reviews for 1 hour to avoid hitting API limits
let cachedData: {
  reviews: GoogleReview[]
  rating: number
  totalReviews: number
  timestamp: number
} | null = null

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function GET() {
  try {
    // Return cached data if still valid
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        reviews: cachedData.reviews,
        rating: cachedData.rating,
        totalReviews: cachedData.totalReviews,
        cached: true,
      })
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    const placeId = process.env.GOOGLE_PLACE_ID

    if (!apiKey || !placeId) {
      return NextResponse.json(
        { error: "Google Places API not configured. Add GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID to env." },
        { status: 500 }
      )
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error("Failed to fetch from Google Places API")
    }

    const data: PlaceDetailsResponse = await response.json()

    if (data.status !== "OK") {
      throw new Error(data.error_message || `Google API error: ${data.status}`)
    }

    if (!data.result?.reviews) {
      return NextResponse.json({
        reviews: [],
        rating: data.result?.rating || 0,
        totalReviews: data.result?.user_ratings_total || 0,
      })
    }

    // Filter for 4+ star reviews only, sorted by most recent
    const filteredReviews = data.result.reviews
      .filter((review) => review.rating >= 4)
      .sort((a, b) => b.time - a.time)

    // Cache the data
    cachedData = {
      reviews: filteredReviews,
      rating: data.result.rating || 0,
      totalReviews: data.result.user_ratings_total || 0,
      timestamp: Date.now(),
    }

    return NextResponse.json({
      reviews: filteredReviews,
      rating: data.result.rating,
      totalReviews: data.result.user_ratings_total,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}
