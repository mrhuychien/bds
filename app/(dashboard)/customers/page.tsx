import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { CustomerCard } from '@/components/customer'
import type { Customer } from '@/types/database'

export default async function CustomersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customersData } = await supabase
    .from('customers')
    .select('*')
    .eq('owner_id', user?.id ?? '')
    .order('created_at', { ascending: false })

  const customers = customersData as Customer[] | null

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
