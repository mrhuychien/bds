import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatArea } from '@/lib/utils/format'
import { PROPERTY_TYPES, DIRECTIONS, LEGAL_STATUS } from '@/lib/constants'

interface MicrositePageProps {
  params: { slug: string }
}

export default async function MicrositePage({ params }: MicrositePageProps) {
  const supabase = createClient()

  const { data: property } = await supabase
    .from('properties')
    .select(`
      *,
      profiles (
        full_name,
        phone,
        avatar_url,
        company_name,
        title,
        zalo_link,
        facebook_link
      )
    `)
    .eq('slug', params.slug)
    .eq('is_public', true)
    .single()

  if (!property) {
    notFound()
  }

  const agent = property.profiles as {
    full_name: string
    phone: string
    avatar_url: string | null
    company_name: string | null
    title: string
    zalo_link: string | null
    facebook_link: string | null
  }

  const propertyType = property.property_type as keyof typeof PROPERTY_TYPES
  const direction = property.direction as keyof typeof DIRECTIONS
  const legal = property.legal_status as keyof typeof LEGAL_STATUS

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="aspect-video bg-muted relative">
        {property.thumbnail_url ? (
          <img
            src={property.thumbnail_url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Title & Price */}
        <div>
          <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded mb-2">
            {PROPERTY_TYPES[propertyType] || propertyType}
          </span>
          <h1 className="text-xl font-bold">{property.title}</h1>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatPrice(property.price)}
            {property.is_negotiable && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (thương lượng)
              </span>
            )}
          </p>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3">
          {property.area && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-lg font-semibold">{formatArea(property.area)}</p>
              <p className="text-xs text-muted-foreground">Diện tích</p>
            </div>
          )}
          {property.bedrooms && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-lg font-semibold">{property.bedrooms}</p>
              <p className="text-xs text-muted-foreground">Phòng ngủ</p>
            </div>
          )}
          {property.bathrooms && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-lg font-semibold">{property.bathrooms}</p>
              <p className="text-xs text-muted-foreground">Phòng tắm</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3">
          <h2 className="font-semibold">Thông tin chi tiết</h2>
          <div className="bg-card border rounded-lg divide-y text-sm">
            {property.district && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Khu vực</span>
                <span>{property.district}{property.street && `, ${property.street}`}</span>
              </div>
            )}
            {property.floors && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Số tầng</span>
                <span>{property.floors} tầng</span>
              </div>
            )}
            {property.frontage && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Mặt tiền</span>
                <span>{property.frontage}m</span>
              </div>
            )}
            {direction && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Hướng</span>
                <span>{DIRECTIONS[direction]}</span>
              </div>
            )}
            {legal && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Pháp lý</span>
                <span>{LEGAL_STATUS[legal]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div className="space-y-3">
            <h2 className="font-semibold">Mô tả</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {property.description}
            </p>
          </div>
        )}

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold">Tiện ích</h2>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted text-sm rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Agent Footer */}
      <div className="sticky bottom-0 bg-background border-t p-4 safe-bottom">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {agent.avatar_url ? (
              <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{agent.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {agent.title}{agent.company_name && ` - ${agent.company_name}`}
            </p>
          </div>
          <a
            href={`tel:${agent.phone}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
