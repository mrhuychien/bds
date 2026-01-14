import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/format'
import { PROPERTY_TYPES } from '@/lib/constants'
import {
  MicrositeHero,
  PropertyQuickInfo,
  PropertyDetails,
  PropertyFeatures,
  AgentFooter,
} from '@/components/microsite'

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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <MicrositeHero
        thumbnailUrl={property.thumbnail_url}
        title={property.title}
        images={property.images}
      />

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
        <PropertyQuickInfo
          area={property.area}
          bedrooms={property.bedrooms}
          bathrooms={property.bathrooms}
          floors={property.floors}
        />

        {/* Details */}
        <PropertyDetails
          district={property.district}
          street={property.street}
          floors={property.floors}
          frontage={property.frontage}
          direction={property.direction}
          legalStatus={property.legal_status}
        />

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
        <PropertyFeatures features={property.features || []} />
      </div>

      {/* Agent Footer */}
      <AgentFooter agent={agent} />
    </div>
  )
}
