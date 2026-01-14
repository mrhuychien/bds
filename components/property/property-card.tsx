import Link from 'next/link'
import type { Property } from '@/types/database'
import { formatPrice, formatArea } from '@/lib/utils/format'
import { PROPERTY_STATUS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
}

// Badge colors based on status and listing type
const getBadgeStyle = (property: Property) => {
  if (property.listing_type === 'rent') {
    return { label: 'Thuê', className: 'bg-blue-500' }
  }
  switch (property.status) {
    case 'available':
      return { label: 'Hot', className: 'bg-accent' }
    case 'deposited':
      return { label: 'Đã cọc', className: 'bg-yellow-500' }
    case 'sold':
      return { label: 'Đã bán', className: 'bg-gray-500' }
    case 'rented':
      return { label: 'Đã thuê', className: 'bg-gray-500' }
    default:
      return { label: 'Mới', className: 'bg-emerald-500' }
  }
}

// Format time ago
const formatTimeAgo = (date: string) => {
  const now = new Date()
  const created = new Date(date)
  const diffMs = now.getTime() - created.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Vừa đăng'
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  return created.toLocaleDateString('vi-VN')
}

export function PropertyCard({ property }: PropertyCardProps) {
  const badge = getBadgeStyle(property)

  return (
    <Link href={`/inventory/${property.id}`}>
      <div className="flex flex-col gap-3 p-3 rounded-xl bg-card shadow-md border border-border/50 hover:shadow-lg transition-shadow">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-muted">
            {/* Status Badge */}
            <div className="absolute top-2 left-2 z-10">
              <span className={cn(
                'px-2 py-0.5 text-white text-[10px] font-bold rounded uppercase',
                badge.className
              )}>
                {badge.label}
              </span>
            </div>
            {property.thumbnail_url ? (
              <img
                src={property.thumbnail_url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="material-symbols-outlined text-3xl">home</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between flex-1 py-0.5">
            <div>
              <h3 className="text-primary font-bold text-base leading-tight line-clamp-2">
                {property.title}
              </h3>
              {property.district && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">location_on</span>
                  {property.district}, HCM
                </p>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-accent text-lg font-bold">
                {formatPrice(property.price)}
              </span>
              {property.area && (
                <span className="text-xs text-muted-foreground">
                  • {formatArea(property.area)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border w-full" />

        {/* Footer */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground">
            {formatTimeAgo(property.created_at)}
          </span>
          <span className="flex items-center gap-1 text-primary text-sm font-semibold">
            Chi tiết
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
