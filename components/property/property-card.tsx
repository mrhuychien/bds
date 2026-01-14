import Link from 'next/link'
import type { Property } from '@/types/database'
import { formatPrice, formatArea } from '@/lib/utils/format'
import { PROPERTY_TYPES, PROPERTY_STATUS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
}

const statusColors = {
  available: 'bg-green-100 text-green-700',
  deposited: 'bg-yellow-100 text-yellow-700',
  sold: 'bg-gray-100 text-gray-700',
  rented: 'bg-blue-100 text-blue-700',
}

export function PropertyCard({ property }: PropertyCardProps) {
  const status = property.status as keyof typeof PROPERTY_STATUS
  const propertyType = property.property_type as keyof typeof PROPERTY_TYPES

  return (
    <Link href={`/inventory/${property.id}`}>
      <div className="bg-card border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted relative">
          {property.thumbnail_url ? (
            <img
              src={property.thumbnail_url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Status Badge */}
          <span
            className={cn(
              'absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium',
              statusColors[status] || statusColors.available
            )}
          >
            {PROPERTY_STATUS[status] || status}
          </span>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <h3 className="font-medium text-sm line-clamp-1">{property.title}</h3>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="bg-muted px-1.5 py-0.5 rounded">
              {PROPERTY_TYPES[propertyType] || propertyType}
            </span>
            {property.district && <span>{property.district}</span>}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-primary font-semibold">
              {formatPrice(property.price)}
            </span>
            {property.area && (
              <span className="text-xs text-muted-foreground">
                {formatArea(property.area)}
              </span>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {property.bedrooms} PN
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                {property.bathrooms} WC
              </span>
            )}
            {property.floors && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
                {property.floors} tầng
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
