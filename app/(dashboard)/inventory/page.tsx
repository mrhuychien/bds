'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EmptyState } from '@/components/shared/empty-state'
import { PropertyCard } from '@/components/property/property-card'
import type { Property } from '@/types/database'

type FilterType = 'all' | 'sale' | 'rent'

export default function InventoryPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadProperties() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      setProperties((data as Property[]) || [])
      setLoading(false)
    }

    loadProperties()
  }, [])

  // Filter properties
  const filteredProperties = properties.filter(property => {
    // Filter by listing type
    if (filter === 'sale' && property.listing_type !== 'sale') return false
    if (filter === 'rent' && property.listing_type !== 'rent') return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        property.title.toLowerCase().includes(query) ||
        property.district?.toLowerCase().includes(query) ||
        property.street?.toLowerCase().includes(query)
      )
    }

    return true
  })

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Kho hàng</h1>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
              <div className="text-muted-foreground flex border-none bg-card items-center justify-center pl-4 rounded-l-xl">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-foreground focus:outline-none focus:ring-0 border-none bg-card h-full placeholder:text-muted-foreground px-4 rounded-l-none border-l-0 pl-2 text-base font-normal"
                placeholder="Tìm kiếm căn hộ, dự án..."
              />
              <div className="bg-card pr-3 flex items-center rounded-r-xl">
                <span className="material-symbols-outlined text-muted-foreground">tune</span>
              </div>
            </div>
          </label>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-1 rounded-full px-5 shadow-sm transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border'
            }`}
          >
            <p className="text-sm font-semibold">Tất cả</p>
          </button>
          <button
            onClick={() => setFilter('sale')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-1 rounded-full px-5 shadow-sm transition-colors ${
              filter === 'sale'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border'
            }`}
          >
            <p className="text-sm font-medium">Bán</p>
          </button>
          <button
            onClick={() => setFilter('rent')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-1 rounded-full px-5 shadow-sm transition-colors ${
              filter === 'rent'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border'
            }`}
          >
            <p className="text-sm font-medium">Cho thuê</p>
          </button>
        </div>
      </header>

      {/* Property Listings */}
      <main className="px-4 flex flex-col gap-4 mt-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        ) : (
          <EmptyState
            icon={
              <span className="material-symbols-outlined text-4xl">home_work</span>
            }
            title="Chưa có bất động sản nào"
            description="Bắt đầu thêm BĐS vào kho hàng của bạn để quản lý và chia sẻ với khách hàng"
            action={
              <Link
                href="/inventory/new"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Thêm BĐS đầu tiên
              </Link>
            }
          />
        )}
      </main>

      {/* Floating Action Button */}
      <Link
        href="/inventory/new"
        className="fixed bottom-24 right-6 w-14 h-14 bg-accent rounded-full shadow-lg flex items-center justify-center text-white z-50 transform transition-transform active:scale-95 hover:shadow-xl"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>
    </div>
  )
}
