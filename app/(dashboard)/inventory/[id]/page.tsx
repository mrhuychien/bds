import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatArea, formatDate } from '@/lib/utils/format'
import { PROPERTY_TYPES, PROPERTY_STATUS, DIRECTIONS, LEGAL_STATUS, LISTING_TYPES } from '@/lib/constants'

interface PropertyDetailPageProps {
  params: { id: string }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', user?.id)
    .single()

  if (!property) {
    notFound()
  }

  const propertyType = property.property_type as keyof typeof PROPERTY_TYPES
  const status = property.status as keyof typeof PROPERTY_STATUS
  const direction = property.direction as keyof typeof DIRECTIONS
  const legal = property.legal_status as keyof typeof LEGAL_STATUS
  const listingType = property.listing_type as keyof typeof LISTING_TYPES

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    deposited: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-gray-100 text-gray-700',
    rented: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center h-14 px-4 gap-3">
          <Link href="/inventory" className="p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 font-semibold truncate">Chi tiết BĐS</h1>
          <Link
            href={`/inventory/${property.id}/edit`}
            className="p-2 text-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        </div>
      </header>

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
        {/* Status Badge */}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {PROPERTY_STATUS[status]}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Title & Price */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
              {PROPERTY_TYPES[propertyType]}
            </span>
            <span className="px-2 py-0.5 bg-muted text-xs rounded">
              {LISTING_TYPES[listingType]}
            </span>
          </div>
          <h2 className="text-xl font-bold">{property.title}</h2>
          <p className="text-2xl font-bold text-primary mt-2">
            {formatPrice(property.price)}
            {property.is_negotiable && (
              <span className="text-sm font-normal text-muted-foreground ml-2">(thương lượng)</span>
            )}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          {property.area && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-base font-semibold">{property.area}</p>
              <p className="text-xs text-muted-foreground">m²</p>
            </div>
          )}
          {property.bedrooms && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-base font-semibold">{property.bedrooms}</p>
              <p className="text-xs text-muted-foreground">PN</p>
            </div>
          )}
          {property.bathrooms && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-base font-semibold">{property.bathrooms}</p>
              <p className="text-xs text-muted-foreground">WC</p>
            </div>
          )}
          {property.floors && (
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-base font-semibold">{property.floors}</p>
              <p className="text-xs text-muted-foreground">Tầng</p>
            </div>
          )}
        </div>

        {/* Location */}
        {(property.district || property.street) && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Vị trí
            </h3>
            <p className="text-sm text-muted-foreground">
              {[property.street, property.ward, property.district, property.province]
                .filter(Boolean)
                .join(', ')}
            </p>
            {property.address_detail && (
              <p className="text-sm bg-yellow-50 text-yellow-800 p-2 rounded">
                <span className="font-medium">Địa chỉ chi tiết (riêng tư):</span> {property.address_detail}
              </p>
            )}
          </div>
        )}

        {/* Details */}
        <div className="space-y-2">
          <h3 className="font-semibold">Thông tin chi tiết</h3>
          <div className="bg-card border rounded-lg divide-y text-sm">
            {property.frontage && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Mặt tiền</span>
                <span>{property.frontage}m</span>
              </div>
            )}
            {direction && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Hướng nhà</span>
                <span>{DIRECTIONS[direction]}</span>
              </div>
            )}
            {legal && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Pháp lý</span>
                <span>{LEGAL_STATUS[legal]}</span>
              </div>
            )}
            {property.source && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Nguồn hàng</span>
                <span>{property.source}</span>
              </div>
            )}
            {property.commission_rate && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Hoa hồng</span>
                <span>{property.commission_rate}%</span>
              </div>
            )}
            <div className="p-3 flex justify-between">
              <span className="text-muted-foreground">Ngày tạo</span>
              <span>{formatDate(property.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div className="space-y-2">
            <h3 className="font-semibold">Mô tả</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {property.description}
            </p>
          </div>
        )}

        {/* AI Description */}
        {property.ai_description && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Mô tả AI
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-purple-50 p-3 rounded-lg">
              {property.ai_description}
            </p>
          </div>
        )}

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Tiện ích & Đặc điểm</h3>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, index) => (
                <span key={index} className="px-2.5 py-1 bg-muted text-sm rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Private Notes */}
        {property.notes && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2 text-orange-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Ghi chú riêng tư
            </h3>
            <p className="text-sm bg-orange-50 text-orange-800 p-3 rounded-lg">
              {property.notes}
            </p>
          </div>
        )}

        {/* Microsite Stats */}
        <div className="space-y-2">
          <h3 className="font-semibold">Microsite</h3>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <p className="font-medium">
                  {property.is_public ? (
                    <span className="text-green-600">Đã công khai</span>
                  ) : (
                    <span className="text-gray-500">Chưa công khai</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Lượt xem</p>
                <p className="font-medium">{property.microsite_views || 0}</p>
              </div>
            </div>
            {property.is_public && property.slug && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">Link chia sẻ:</p>
                <code className="text-xs bg-muted p-2 rounded block break-all">
                  {process.env.NEXT_PUBLIC_APP_URL || ''}/p/{property.slug}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-bottom">
        <div className="container max-w-lg mx-auto flex gap-3">
          <Link
            href={`/inventory/${property.id}/edit`}
            className="flex-1 py-2.5 px-4 border rounded-md text-sm font-medium text-center hover:bg-muted"
          >
            Chỉnh sửa
          </Link>
          {property.is_public ? (
            <button className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              Chia sẻ
            </button>
          ) : (
            <button className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              Công khai
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
