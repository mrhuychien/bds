'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils/format'
import { PROPERTY_STATUS } from '@/lib/constants'

interface MicrositeHeroProps {
  thumbnailUrl: string | null
  title: string
  images?: string[]
  price: number
  status?: string
}

export function MicrositeHero({ thumbnailUrl, title, images, price, status = 'available' }: MicrositeHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const allImages = images && images.length > 0 ? images : (thumbnailUrl ? [thumbnailUrl] : [])
  const displayImage = allImages[currentIndex]
  const statusLabel = status as keyof typeof PROPERTY_STATUS

  return (
    <div className="relative w-full aspect-[4/3] px-4 mt-2">
      <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-xl">
        {displayImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 30%), url('${displayImage}')`
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-muted-foreground">image</span>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">payments</span>
          {formatPrice(price)}
        </div>

        {/* Status Badge */}
        <div className={`absolute top-4 right-4 text-white px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 shadow-md ${
          status === 'available' ? 'bg-emerald-500' :
          status === 'deposited' ? 'bg-yellow-500' :
          status === 'sold' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          <span className="size-2 bg-white rounded-full animate-pulse"></span>
          {PROPERTY_STATUS[statusLabel] || 'Đang bán'}
        </div>

        {/* Gallery Indicators */}
        {allImages.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
            {allImages.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`size-1.5 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
            <span className="text-[10px] text-white font-medium ml-1">
              {currentIndex + 1}/{allImages.length}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
