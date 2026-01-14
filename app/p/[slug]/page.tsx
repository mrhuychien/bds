import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PROPERTY_TYPES, DIRECTIONS, LEGAL_STATUS } from '@/lib/constants'
import {
  MicrositeHero,
  PropertyQuickInfo,
  PropertyFeatures,
  AgentFooter,
} from '@/components/microsite'
import type { Property } from '@/types/database'

interface AgentProfile {
  full_name: string
  phone: string
  avatar_url: string | null
  company_name: string | null
  title: string
  zalo_link: string | null
  facebook_link: string | null
}

interface PropertyWithProfile extends Property {
  profiles: AgentProfile
}

interface MicrositePageProps {
  params: { slug: string }
}

export default async function MicrositePage({ params }: MicrositePageProps) {
  const supabase = createClient()

  const { data: propertyData } = await supabase
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

  const property = propertyData as PropertyWithProfile | null

  if (!property) {
    notFound()
  }

  const agent = property.profiles as AgentProfile
  const propertyType = property.property_type as keyof typeof PROPERTY_TYPES
  const direction = property.direction as keyof typeof DIRECTIONS
  const legalStatus = property.legal_status as keyof typeof LEGAL_STATUS

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 flex items-center bg-background/80 backdrop-blur-md p-4 justify-between border-b border-border">
        <div className="flex items-center gap-3">
          <div className="size-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors cursor-pointer">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </div>
          <h2 className="text-base font-bold leading-tight">Chi tiết bất động sản</h2>
        </div>
        <div className="flex gap-2">
          <button className="flex size-10 items-center justify-center rounded-full bg-muted">
            <span className="material-symbols-outlined">share</span>
          </button>
          <button className="flex size-10 items-center justify-center rounded-full bg-muted">
            <span className="material-symbols-outlined">favorite</span>
          </button>
        </div>
      </div>

      {/* Hero Image Gallery */}
      <MicrositeHero
        thumbnailUrl={property.thumbnail_url}
        title={property.title}
        images={property.images ?? undefined}
        price={property.price}
        status={property.status}
      />

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {legalStatus && (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {LEGAL_STATUS[legalStatus]}
            </span>
          )}
          {direction && (
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
              Hướng {DIRECTIONS[direction]}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold leading-tight mb-2">{property.title}</h1>

        {/* Location */}
        <div className="flex items-center text-muted-foreground text-sm mb-6">
          <span className="material-symbols-outlined text-base mr-1">location_on</span>
          {property.district}, {property.street && `${property.street} • `}
          {property.area && `${property.area}m² sàn`}
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <PropertyQuickInfo
            area={property.area}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            floors={property.floors}
          />
        </div>

        {/* Description Section */}
        {property.description && (
          <section className="mb-8">
            <h3 className="text-lg font-bold mb-3">Mô tả chi tiết</h3>
            <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">
              {property.description.slice(0, 200)}
              {property.description.length > 200 && (
                <>
                  ...
                  <button className="text-primary font-semibold ml-1">Xem thêm</button>
                </>
              )}
            </p>
          </section>
        )}

        {/* Amenities Section */}
        <PropertyFeatures features={property.features || []} />
      </div>

      {/* Agent Footer */}
      <AgentFooter agent={agent} />
    </div>
  )
}
