'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EmptyState } from '@/components/shared/empty-state'
import { CustomerCard } from '@/components/customer'
import type { Customer } from '@/types/database'

type FilterType = 'all' | 'potential' | 'caring' | 'closed'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadCustomers() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      setCustomers((data as Customer[]) || [])
      setLoading(false)
    }

    loadCustomers()
  }, [])

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    // Filter by status category
    if (filter === 'potential') {
      if (!['new', 'contacted'].includes(customer.status || '')) return false
    }
    if (filter === 'caring') {
      if (!['viewing', 'negotiating'].includes(customer.status || '')) return false
    }
    if (filter === 'closed') {
      if (customer.status !== 'closed') return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        customer.full_name.toLowerCase().includes(query) ||
        customer.phone?.includes(query)
      )
    }

    return true
  })

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">person_search</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Khách hàng</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{customers.length} khách</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              placeholder="Tìm tên, số điện thoại..."
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-card border border-border'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('potential')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-colors ${
              filter === 'potential'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-card border border-border'
            }`}
          >
            Tiềm năng
          </button>
          <button
            onClick={() => setFilter('caring')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-colors ${
              filter === 'caring'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-card border border-border'
            }`}
          >
            Đang chăm sóc
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-colors ${
              filter === 'closed'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-card border border-border'
            }`}
          >
            Đã chốt
          </button>
        </div>
      </header>

      {/* Customer List */}
      <main className="px-4 space-y-4 mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))
        ) : (
          <EmptyState
            icon={
              <span className="material-symbols-outlined text-4xl">group</span>
            }
            title="Chưa có khách hàng nào"
            description="Thêm khách hàng để theo dõi nhu cầu và lịch sử tương tác"
            action={
              <Link
                href="/customers/new"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Thêm khách hàng đầu tiên
              </Link>
            }
          />
        )}
      </main>

      {/* Floating Action Button */}
      <Link
        href="/customers/new"
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-white z-50 transform transition-transform active:scale-95 hover:shadow-xl"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>
    </div>
  )
}
