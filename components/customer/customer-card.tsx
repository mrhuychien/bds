'use client'

import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils/format'
import type { Customer } from '@/types/database'

interface CustomerCardProps {
  customer: Customer
  showDemand?: boolean
}

// Map status to design badge styles
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'new':
    case 'contacted':
      return {
        label: 'Tiềm năng',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      }
    case 'viewing':
    case 'negotiating':
      return {
        label: 'Đang chăm sóc',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      }
    case 'closed':
      return {
        label: 'Đã chốt',
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      }
    case 'lost':
      return {
        label: 'Mất khách',
        className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
      }
    default:
      return {
        label: 'Mới',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      }
  }
}

export function CustomerCard({ customer, showDemand = true }: CustomerCardProps) {
  const statusBadge = getStatusBadge(customer.status || 'new')

  const demand = customer.demand as {
    property_types?: string[]
    districts?: string[]
    budget_min?: number
    budget_max?: number
    notes?: string
  } | null

  // Format demand text
  const getDemandText = () => {
    if (!demand) return null
    const parts: string[] = []
    if (demand.property_types && demand.property_types.length > 0) {
      parts.push(`Tìm ${demand.property_types.join(', ')}`)
    }
    if (demand.budget_max) {
      parts.push(`< ${(demand.budget_max / 1_000_000_000).toFixed(0)} Tỷ`)
    }
    if (demand.districts && demand.districts.length > 0) {
      parts.push(`khu vực ${demand.districts.join(', ')}`)
    }
    if (demand.notes) {
      parts.push(demand.notes)
    }
    return parts.join(', ') || null
  }

  const demandText = getDemandText()
  const isClosed = customer.status === 'closed'

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.location.href = `tel:${customer.phone}`
  }

  const handleZalo = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(`https://zalo.me/${customer.phone}`, '_blank')
  }

  return (
    <Link href={`/customers/${customer.id}`}>
      <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-base font-bold">{customer.full_name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {customer.last_contact_at ? formatRelativeTime(customer.last_contact_at) : formatRelativeTime(customer.created_at)}
            </p>
          </div>

          {/* Demand section */}
          {showDemand && demandText && (
            <div className="bg-muted/50 rounded-lg p-3 mt-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Nhu cầu</p>
              <p className="text-sm text-foreground/80 leading-snug">{demandText}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCall}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold active:scale-95 transition-transform ${
                isClosed
                  ? 'bg-primary/10 text-primary'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              {isClosed ? 'Gọi lại' : 'Gọi điện'}
            </button>
            <button
              onClick={handleZalo}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold active:scale-95 transition-transform ${
                isClosed
                  ? 'bg-[#0068ff]/10 text-[#0068ff]'
                  : 'bg-[#0068ff] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              {isClosed ? 'Nhắn tin' : 'Zalo'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
