'use client'

import dynamic from 'next/dynamic'

interface PropertyMapProps {
  latitude: number
  longitude: number
  title?: string
  className?: string
}

// Lazy load the map display component
const LazyMapDisplay = dynamic(() => import('./property-map-display'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] bg-muted flex items-center justify-center rounded-t-2xl">
      <span className="material-symbols-outlined text-4xl text-muted-foreground animate-pulse">map</span>
    </div>
  ),
})

export function PropertyMap({ latitude, longitude, title, className = '' }: PropertyMapProps) {
  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')
  }

  const openDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank')
  }

  return (
    <div className={`rounded-2xl overflow-hidden border border-border ${className}`}>
      {/* Map */}
      <LazyMapDisplay latitude={latitude} longitude={longitude} title={title} />

      {/* Action buttons */}
      <div className="p-3 bg-card flex gap-2">
        <button
          onClick={openGoogleMaps}
          className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">location_on</span>
          Xem trên Google Maps
        </button>
        <button
          onClick={openDirections}
          className="py-2.5 px-4 rounded-xl bg-accent text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">directions</span>
          Chỉ đường
        </button>
      </div>
    </div>
  )
}
