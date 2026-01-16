import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils/format'
import { PROPERTY_TYPES, PROPERTY_STATUS, DIRECTIONS, LEGAL_STATUS, LISTING_TYPES } from '@/lib/constants'
import { PropertyMicrositeActions } from '@/components/property/property-microsite-actions'
import { PropertyMap } from '@/components/property/property-map'
import type { Property } from '@/types/database'

interface PropertyDetailPageProps {
  params: { id: string }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single()

  const property = data as Property | null

  if (!property) {
    notFound()
  }

  const propertyType = property.property_type as keyof typeof PROPERTY_TYPES
  const status = property.status as keyof typeof PROPERTY_STATUS
  const direction = property.direction as keyof typeof DIRECTIONS
  const legal = property.legal_status as keyof typeof LEGAL_STATUS
  const listingType = property.listing_type as keyof typeof LISTING_TYPES

  const statusColors: Record<string, string> = {
    available: 'bg-emerald-500',
    deposited: 'bg-yellow-500',
    sold: 'bg-red-500',
    rented: 'bg-blue-500',
  }

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center h-14 px-4 justify-between">
          <div className="flex items-center gap-3">
            <Link href="/inventory" className="size-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </Link>
            <h1 className="font-bold text-lg">Chi tiết BĐS</h1>
          </div>
          <div className="flex gap-2">
            <button className="size-10 flex items-center justify-center rounded-full bg-muted">
              <span className="material-symbols-outlined">share</span>
            </button>
            <Link
              href={`/inventory/${property.id}/edit`}
              className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <span className="material-symbols-outlined">edit</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative aspect-[4/3] mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl">
        {property.thumbnail_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 40%), url('${property.thumbnail_url}')`
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
          {formatPrice(property.price)}
        </div>

        {/* Status Badge */}
        <div className={`absolute top-4 right-4 text-white px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 shadow-md ${statusColors[status] || 'bg-gray-500'}`}>
          <span className="size-2 bg-white rounded-full animate-pulse"></span>
          {PROPERTY_STATUS[status]}
        </div>

        {/* Image Count */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">photo_library</span>
            {property.images.length} ảnh
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {PROPERTY_TYPES[propertyType]}
          </span>
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
            {LISTING_TYPES[listingType]}
          </span>
          {property.is_negotiable && (
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
              Thương lượng
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold leading-tight">{property.title}</h2>

        {/* Location */}
        {(property.district || property.street) && (
          <div className="flex items-center text-muted-foreground text-sm">
            <span className="material-symbols-outlined text-base mr-1">location_on</span>
            {[property.street, property.ward, property.district, property.province]
              .filter(Boolean)
              .join(', ')}
          </div>
        )}

        {/* Map */}
        {property.latitude && property.longitude && (
          <PropertyMap
            latitude={property.latitude}
            longitude={property.longitude}
            title={property.title}
          />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          {property.area && (
            <div className="bg-card p-3 rounded-xl border border-border shadow-sm text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Diện tích</p>
              <p className="font-bold">{property.area}m²</p>
            </div>
          )}
          {property.bedrooms && (
            <div className="bg-card p-3 rounded-xl border border-border shadow-sm text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Phòng ngủ</p>
              <p className="font-bold">{property.bedrooms}</p>
            </div>
          )}
          {property.bathrooms && (
            <div className="bg-card p-3 rounded-xl border border-border shadow-sm text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Phòng tắm</p>
              <p className="font-bold">{property.bathrooms}</p>
            </div>
          )}
          {property.floors && (
            <div className="bg-card p-3 rounded-xl border border-border shadow-sm text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Số tầng</p>
              <p className="font-bold">{property.floors}</p>
            </div>
          )}
        </div>

        {/* Private Address */}
        {property.address_detail && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">lock</span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Địa chỉ chi tiết (riêng tư)</span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200">{property.address_detail}</p>
          </div>
        )}

        {/* Details Card */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thông tin chi tiết</h3>
          </div>
          <div className="divide-y divide-border">
            {property.frontage && (
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mặt tiền</span>
                <span className="text-sm font-semibold">{property.frontage}m</span>
              </div>
            )}
            {direction && (
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hướng nhà</span>
                <span className="text-sm font-semibold">{DIRECTIONS[direction]}</span>
              </div>
            )}
            {legal && (
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pháp lý</span>
                <span className="text-sm font-semibold">{LEGAL_STATUS[legal]}</span>
              </div>
            )}
            {property.source && (
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nguồn hàng</span>
                <span className="text-sm font-semibold">{property.source}</span>
              </div>
            )}
            {property.commission_rate && (
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hoa hồng</span>
                <span className="text-sm font-semibold text-accent">{property.commission_rate}%</span>
              </div>
            )}
            <div className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ngày tạo</span>
              <span className="text-sm font-semibold">{formatDate(property.created_at)}</span>
            </div>
          </div>
        </section>

        {/* Description */}
        {property.description && (
          <section>
            <h3 className="text-lg font-bold mb-3">Mô tả chi tiết</h3>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </section>
        )}

        {/* AI Description */}
        {property.ai_description && (
          <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-indigo-600">auto_awesome</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600">Mô tả AI</h3>
            </div>
            <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed whitespace-pre-wrap">
              {property.ai_description}
            </p>
          </section>
        )}

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-3">Tiện ích & Đặc điểm</h3>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, index) => (
                <span key={index} className="px-3 py-1.5 bg-muted text-sm rounded-full font-medium">
                  {feature}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Private Notes */}
        {property.notes && (
          <section className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-orange-600">lock</span>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Ghi chú riêng tư</span>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200">{property.notes}</p>
          </section>
        )}

        {/* Landing Page / Microsite */}
        <PropertyMicrositeActions
          propertyId={property.id}
          slug={property.slug}
          isPublic={property.is_public || false}
          views={property.microsite_views || 0}
        />
      </div>

      {/* Bottom Actions */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border p-4 pb-8">
        <div className="max-w-lg mx-auto flex gap-3">
          <Link
            href={`/inventory/${property.id}/edit`}
            className="flex-1 h-12 rounded-xl border-2 border-border font-bold flex items-center justify-center gap-2 hover:bg-muted transition-colors"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Chỉnh sửa
          </Link>
          {property.is_public ? (
            <button className="flex-[2] h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2 transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">share</span>
              Chia sẻ
            </button>
          ) : (
            <button className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95">
              <span className="material-symbols-outlined text-lg">public</span>
              Công khai
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
