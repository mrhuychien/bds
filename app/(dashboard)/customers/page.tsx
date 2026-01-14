import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { formatPhone, formatRelativeTime } from '@/lib/utils/format'
import { CUSTOMER_PRIORITY, CUSTOMER_STATUS } from '@/lib/constants'
import type { Customer } from '@/types/database'

function CustomerCard({ customer }: { customer: Customer }) {
  const priority = customer.priority as keyof typeof CUSTOMER_PRIORITY
  const status = customer.status as keyof typeof CUSTOMER_STATUS
  const priorityInfo = CUSTOMER_PRIORITY[priority]

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
          </div>
          <span className="text-xs text-muted-foreground">{CUSTOMER_STATUS[status]}</span>
        </div>
        {customer.last_contact_at && (
          <p className="text-xs text-muted-foreground mt-2">
            Liên hệ: {formatRelativeTime(customer.last_contact_at)}
          </p>
        )}
      </div>
    </Link>
  )
}

export default async function CustomersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('owner_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title="Khách hàng"
        description={`${customers?.length || 0} khách hàng`}
        action={
          <Link
            href="/customers/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Thêm mới
          </Link>
        }
      />

      <div className="p-4">
        {customers && customers.length > 0 ? (
          <div className="space-y-3">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title="Chưa có khách hàng nào"
            description="Thêm khách hàng để theo dõi nhu cầu và lịch sử tương tác"
            action={
              <Link
                href="/customers/new"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Thêm khách hàng đầu tiên
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}
