"use client"

import { Card, CardContent } from "@/components/ui/card"

export function MenuItemSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col border border-gray-100 shadow-sm">
      {/* Image skeleton with shimmer effect */}
      <div className="h-48 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
      
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Title and price row */}
        <div className="flex items-start justify-between mb-2">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-14 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Description */}
        <div className="space-y-2 mb-3 flex-1">
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Size buttons */}
        <div className="flex gap-2 mb-3">
          <div className="h-7 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-7 w-16 bg-gray-100 rounded-full animate-pulse" />
        </div>
        
        {/* Add to cart button */}
        <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
      </CardContent>
    </Card>
  )
}

export function MenuSectionSkeleton({ itemCount = 4 }: { itemCount?: number }) {
  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-4 w-96 max-w-full ml-9 bg-gray-100 rounded animate-pulse" />
      </div>
      
      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: itemCount }).map((_, i) => (
          <MenuItemSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
