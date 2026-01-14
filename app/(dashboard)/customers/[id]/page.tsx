import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPhone, formatDate, formatRelativeTime, formatPrice } from '@/lib/utils/format'
import { CUSTOMER_TYPES, CUSTOMER_STATUS, CUSTOMER_PRIORITY, PROPERTY_TYPES } from '@/lib/constants'
import type { Customer, CustomerInteraction } from '@/types/database'

interface CustomerDetailPageProps {
  params: { id: string }
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: customerData } = await supabase
    .from('customers')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single()

  const customer = customerData as Customer | null

  if (!customer) {
    notFound()
  }

  // Fetch interactions
  const { data: interactionsData } = await supabase
    .from('customer_interactions')
    .select('*')
    .eq('customer_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const interactions = interactionsData as CustomerInteraction[] | null

  const customerType = customer.customer_type as keyof typeof CUSTOMER_TYPES
  const status = customer.status as keyof typeof CUSTOMER_STATUS
  const priority = customer.priority as keyof typeof CUSTOMER_PRIORITY
  const priorityInfo = CUSTOMER_PRIORITY[priority]
  const demand = customer.demand as {
    property_types?: string[]
    districts?: string[]
    budget_min?: number
    budget_max?: number
    min_area?: number
    bedrooms_min?: number
    notes?: string
  }

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
      case 'contacted':
        return { label: 'Tiềm năng', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' }
      case 'viewing':
      case 'negotiating':
        return { label: 'Đang chăm sóc', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }
      case 'closed':
        return { label: 'Đã chốt', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
      case 'lost':
        return { label: 'Mất khách', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' }
      default:
        return { label: 'Mới', className: 'bg-orange-100 text-orange-700' }
    }
  }

  const statusBadge = getStatusBadge(customer.status || 'new')

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center h-14 px-4 justify-between">
          <div className="flex items-center gap-3">
            <Link href="/customers" className="size-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </Link>
            <h1 className="font-bold text-lg">Chi tiết khách hàng</h1>
          </div>
          <div className="flex gap-2">
            <button className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Customer Profile Card */}
        <section className="bg-card rounded-2xl border border-border shadow-sm p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="size-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto border-4 border-primary/20">
              <span className="material-symbols-outlined text-5xl text-primary">person</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full ring-2 ring-background">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">{customer.full_name}</h2>
          <p className="text-muted-foreground">{formatPhone(customer.phone)}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-xs font-semibold">
              {CUSTOMER_TYPES[customerType]}
            </span>
          </div>
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <a
            href={`tel:${customer.phone}`}
            className="flex flex-col items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800 active:scale-95 transition-transform"
          >
            <div className="size-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <span className="material-symbols-outlined">call</span>
            </div>
            <span className="text-xs font-bold">Gọi điện</span>
          </a>
          <a
            href={`https://zalo.me/${customer.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800 active:scale-95 transition-transform"
          >
            <div className="size-12 rounded-full bg-[#0068ff] text-white flex items-center justify-center">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <span className="text-xs font-bold">Zalo</span>
          </a>
          <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-2xl border border-purple-100 dark:border-purple-800 active:scale-95 transition-transform">
            <div className="size-12 rounded-full bg-purple-500 text-white flex items-center justify-center">
              <span className="material-symbols-outlined">note_add</span>
            </div>
            <span className="text-xs font-bold">Ghi chú</span>
          </button>
        </div>

        {/* Info Card */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thông tin</h3>
          </div>
          <div className="divide-y divide-border">
            {customer.email && (
              <div className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-muted-foreground text-lg">email</span>
                  <span className="text-sm text-muted-foreground">Email</span>
                </div>
                <span className="text-sm font-semibold">{customer.email}</span>
              </div>
            )}
            {customer.source && (
              <div className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-muted-foreground text-lg">campaign</span>
                  <span className="text-sm text-muted-foreground">Nguồn</span>
                </div>
                <span className="text-sm font-semibold">{customer.source}</span>
              </div>
            )}
            <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-muted-foreground text-lg">calendar_today</span>
                <span className="text-sm text-muted-foreground">Ngày tạo</span>
              </div>
              <span className="text-sm font-semibold">{formatDate(customer.created_at)}</span>
            </div>
            {customer.last_contact_at && (
              <div className="px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-muted-foreground text-lg">schedule</span>
                  <span className="text-sm text-muted-foreground">Liên hệ lần cuối</span>
                </div>
                <span className="text-sm font-semibold text-primary">{formatRelativeTime(customer.last_contact_at)}</span>
              </div>
            )}
          </div>
        </section>

        {/* Demand Card */}
        {(demand?.property_types?.length || demand?.districts?.length || demand?.budget_min || demand?.budget_max) && (
          <section className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/20 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">search</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Nhu cầu tìm kiếm</h3>
            </div>

            {demand.property_types && demand.property_types.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Loại BĐS quan tâm:</p>
                <div className="flex flex-wrap gap-2">
                  {demand.property_types.map((type) => (
                    <span key={type} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      {PROPERTY_TYPES[type as keyof typeof PROPERTY_TYPES] || type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {demand.districts && demand.districts.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Khu vực:</p>
                <div className="flex flex-wrap gap-2">
                  {demand.districts.map((district) => (
                    <span key={district} className="px-3 py-1 bg-muted rounded-full text-xs font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>
                      {district}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(demand.budget_min || demand.budget_max) && (
              <div className="bg-card rounded-xl p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Ngân sách:</p>
                <p className="text-lg font-bold text-primary">
                  {demand.budget_min ? formatPrice(demand.budget_min) : '?'} - {demand.budget_max ? formatPrice(demand.budget_max) : '?'}
                </p>
              </div>
            )}

            {demand.min_area && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-muted-foreground text-lg">square_foot</span>
                <span className="text-sm">Diện tích tối thiểu: <strong>{demand.min_area} m²</strong></span>
              </div>
            )}

            {demand.bedrooms_min && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-muted-foreground text-lg">bed</span>
                <span className="text-sm">Phòng ngủ tối thiểu: <strong>{demand.bedrooms_min} phòng</strong></span>
              </div>
            )}

            {demand.notes && (
              <div className="bg-card rounded-xl p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Yêu cầu khác:</p>
                <p className="text-sm">{demand.notes}</p>
              </div>
            )}
          </section>
        )}

        {/* Notes */}
        {customer.notes && (
          <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-amber-600">sticky_note_2</span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Ghi chú</span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200">{customer.notes}</p>
          </section>
        )}

        {/* Interactions */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Lịch sử tương tác</h3>
            <button className="text-xs text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">add</span>
              Thêm
            </button>
          </div>
          <div className="p-4">
            {interactions && interactions.length > 0 ? (
              <div className="space-y-3">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="relative pl-6 pb-3 border-l-2 border-border last:pb-0">
                    <div className="absolute left-[-5px] top-1 size-2 rounded-full bg-primary"></div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase text-muted-foreground">
                        {interaction.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(interaction.created_at)}
                      </span>
                    </div>
                    {interaction.content && (
                      <p className="text-sm">{interaction.content}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-muted-foreground/50 mb-2">history</span>
                <p className="text-sm text-muted-foreground">Chưa có lịch sử tương tác</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Actions */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border p-4 pb-8">
        <div className="max-w-lg mx-auto flex gap-3">
          <button className="flex-1 h-12 rounded-xl border-2 border-border font-bold flex items-center justify-center gap-2 hover:bg-muted transition-colors">
            <span className="material-symbols-outlined text-lg">sync</span>
            Cập nhật
          </button>
          <button className="flex-[2] h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2 transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">home</span>
            Gợi ý BĐS phù hợp
          </button>
        </div>
      </footer>
    </div>
  )
}
