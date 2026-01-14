import Link from 'next/link'
import { formatPhone, formatRelativeTime } from '@/lib/utils/format'
import { CUSTOMER_PRIORITY, CUSTOMER_STATUS, CUSTOMER_TYPES } from '@/lib/constants'
import type { Customer } from '@/types/database'

interface CustomerCardProps {
  customer: Customer
  showDemand?: boolean
}

export function CustomerCard({ customer, showDemand = false }: CustomerCardProps) {
  const priority = customer.priority as keyof typeof CUSTOMER_PRIORITY
  const status = customer.status as keyof typeof CUSTOMER_STATUS
  const customerType = customer.customer_type as keyof typeof CUSTOMER_TYPES
  const priorityInfo = CUSTOMER_PRIORITY[priority]

  const demand = customer.demand as {
    property_types?: string[]
    districts?: string[]
    budget_min?: number
    budget_max?: number
  } | null

  return (
    <Link href={`/customers/${customer.id}`}>
      <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{customer.full_name}</h3>
              <span className={`px-1.5 py-0.5 text-xs rounded ${priorityInfo.bgColor} ${priorityInfo.textColor}`}>
                {priorityInfo.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{formatPhone(customer.phone)}</p>
            {customerType && (
              <span className="inline-block text-xs bg-muted px-2 py-0.5 rounded">
                {CUSTOMER_TYPES[customerType]}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{CUSTOMER_STATUS[status]}</span>
        </div>

        {showDemand && demand && (
          <div className="mt-3 pt-3 border-t space-y-1">
            {demand.property_types && demand.property_types.length > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Loại:</span> {demand.property_types.join(', ')}
              </p>
            )}
            {demand.districts && demand.districts.length > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Khu vực:</span> {demand.districts.join(', ')}
              </p>
            )}
            {(demand.budget_min || demand.budget_max) && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Ngân sách:</span>{' '}
                {demand.budget_min ? `${(demand.budget_min / 1_000_000_000).toFixed(1)} tỷ` : '0'} -{' '}
                {demand.budget_max ? `${(demand.budget_max / 1_000_000_000).toFixed(1)} tỷ` : 'không giới hạn'}
              </p>
            )}
          </div>
        )}

        {customer.last_contact_at && (
          <p className="text-xs text-muted-foreground mt-2">
            Liên hệ: {formatRelativeTime(customer.last_contact_at)}
          </p>
        )}
      </div>
    </Link>
  )
}
