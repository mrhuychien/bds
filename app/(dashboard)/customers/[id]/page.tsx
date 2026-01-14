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

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center h-14 px-4 gap-3">
          <Link href="/customers" className="p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 font-semibold truncate">Chi tiết khách hàng</h1>
          <button className="p-2 text-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Customer Info */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">{customer.full_name}</h2>
          <p className="text-muted-foreground">{formatPhone(customer.phone)}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.textColor}`}>
              {priorityInfo.label}
            </span>
            <span className="px-2 py-0.5 bg-muted rounded text-xs">
              {CUSTOMER_STATUS[status]}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <a
            href={`tel:${customer.phone}`}
            className="flex flex-col items-center gap-1 p-3 bg-green-50 text-green-700 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-xs font-medium">Gọi điện</span>
          </a>
          <a
            href={`https://zalo.me/${customer.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-3 bg-blue-50 text-blue-700 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium">Zalo</span>
          </a>
          <button className="flex flex-col items-center gap-1 p-3 bg-purple-50 text-purple-700 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-xs font-medium">Ghi chú</span>
          </button>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h3 className="font-semibold">Thông tin</h3>
          <div className="bg-card border rounded-lg divide-y text-sm">
            <div className="p-3 flex justify-between">
              <span className="text-muted-foreground">Loại khách</span>
              <span>{CUSTOMER_TYPES[customerType]}</span>
            </div>
            {customer.email && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{customer.email}</span>
              </div>
            )}
            {customer.source && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Nguồn</span>
                <span>{customer.source}</span>
              </div>
            )}
            <div className="p-3 flex justify-between">
              <span className="text-muted-foreground">Ngày tạo</span>
              <span>{formatDate(customer.created_at)}</span>
            </div>
            {customer.last_contact_at && (
              <div className="p-3 flex justify-between">
                <span className="text-muted-foreground">Liên hệ lần cuối</span>
                <span>{formatRelativeTime(customer.last_contact_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Demand */}
        {(demand.property_types?.length || demand.districts?.length || demand.budget_min || demand.budget_max) && (
          <div className="space-y-2">
            <h3 className="font-semibold">Nhu cầu tìm kiếm</h3>
            <div className="bg-card border rounded-lg p-3 space-y-3">
              {demand.property_types && demand.property_types.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Loại BĐS:</p>
                  <div className="flex flex-wrap gap-1">
                    {demand.property_types.map((type) => (
                      <span key={type} className="px-2 py-0.5 bg-muted rounded text-xs">
                        {PROPERTY_TYPES[type as keyof typeof PROPERTY_TYPES] || type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {demand.districts && demand.districts.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Khu vực:</p>
                  <div className="flex flex-wrap gap-1">
                    {demand.districts.map((district) => (
                      <span key={district} className="px-2 py-0.5 bg-muted rounded text-xs">
                        {district}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(demand.budget_min || demand.budget_max) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ngân sách:</p>
                  <p className="text-sm">
                    {demand.budget_min ? formatPrice(demand.budget_min) : '?'} - {demand.budget_max ? formatPrice(demand.budget_max) : '?'}
                  </p>
                </div>
              )}
              {demand.min_area && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Diện tích tối thiểu:</p>
                  <p className="text-sm">{demand.min_area} m²</p>
                </div>
              )}
              {demand.bedrooms_min && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phòng ngủ tối thiểu:</p>
                  <p className="text-sm">{demand.bedrooms_min} phòng</p>
                </div>
              )}
              {demand.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Yêu cầu khác:</p>
                  <p className="text-sm">{demand.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {customer.notes && (
          <div className="space-y-2">
            <h3 className="font-semibold">Ghi chú</h3>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              {customer.notes}
            </p>
          </div>
        )}

        {/* Interactions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Lịch sử tương tác</h3>
            <button className="text-sm text-primary">+ Thêm</button>
          </div>
          {interactions && interactions.length > 0 ? (
            <div className="space-y-2">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="bg-card border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium uppercase text-muted-foreground">
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
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có lịch sử tương tác
            </p>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-bottom">
        <div className="container max-w-lg mx-auto flex gap-3">
          <button className="flex-1 py-2.5 px-4 border rounded-md text-sm font-medium">
            Cập nhật trạng thái
          </button>
          <button className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium">
            Gợi ý BĐS phù hợp
          </button>
        </div>
      </div>
    </div>
  )
}
