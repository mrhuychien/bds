'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CUSTOMER_TYPES, CUSTOMER_PRIORITY, PROPERTY_TYPES, HCM_DISTRICTS } from '@/lib/constants'
import type { InsertTables } from '@/types/database'

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district)
        ? prev.filter(d => d !== district)
        : [...prev, district]
    )
  }

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Vui lòng đăng nhập lại')
      setLoading(false)
      return
    }

    try {
      const demand = {
        property_types: selectedPropertyTypes,
        districts: selectedDistricts,
        budget_min: formData.get('budget_min') ? parseInt(formData.get('budget_min') as string) : null,
        budget_max: formData.get('budget_max') ? parseInt(formData.get('budget_max') as string) : null,
        min_area: formData.get('min_area') ? parseInt(formData.get('min_area') as string) : null,
        bedrooms_min: formData.get('bedrooms_min') ? parseInt(formData.get('bedrooms_min') as string) : null,
        notes: formData.get('demand_notes') as string || null,
      }

      const customerData: InsertTables<'customers'> = {
        owner_id: user.id,
        full_name: formData.get('full_name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string || null,
        customer_type: formData.get('customer_type') as string,
        priority: formData.get('priority') as string,
        source: formData.get('source') as string || null,
        notes: formData.get('notes') as string || null,
        demand: demand,
      }

      const { error } = await (supabase.from('customers') as any).insert(customerData)

      if (error) throw error

      router.push('/customers')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo khách hàng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center h-14 px-4 gap-3">
          <Link href="/customers" className="p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 font-semibold">Thêm khách hàng</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wide">
            Thông tin cơ bản
          </h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Họ tên *</label>
            <input
              name="full_name"
              type="text"
              required
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Số điện thoại *</label>
            <input
              name="phone"
              type="tel"
              required
              placeholder="0901234567"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </section>

        {/* Classification */}
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wide">
            Phân loại
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Loại khách</label>
              <select
                name="customer_type"
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                {Object.entries(CUSTOMER_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Độ ưu tiên</label>
              <select
                name="priority"
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                {Object.entries(CUSTOMER_PRIORITY).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nguồn khách</label>
            <input
              name="source"
              type="text"
              placeholder="Facebook, Zalo, Giới thiệu..."
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </section>

        {/* Demand */}
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wide">
            Nhu cầu tìm kiếm
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Loại BĐS quan tâm</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PROPERTY_TYPES).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => togglePropertyType(value)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedPropertyTypes.includes(value)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Khu vực quan tâm</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {HCM_DISTRICTS.slice(0, 12).map((district) => (
                <button
                  key={district}
                  type="button"
                  onClick={() => toggleDistrict(district)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedDistricts.includes(district)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {district}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ngân sách từ (tỷ)</label>
              <input
                name="budget_min"
                type="number"
                placeholder="VD: 3000000000"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Ngân sách đến (tỷ)</label>
              <input
                name="budget_max"
                type="number"
                placeholder="VD: 5000000000"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Diện tích tối thiểu (m²)</label>
              <input
                name="min_area"
                type="number"
                placeholder="VD: 80"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phòng ngủ tối thiểu</label>
              <input
                name="bedrooms_min"
                type="number"
                placeholder="VD: 3"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Yêu cầu khác</label>
            <textarea
              name="demand_notes"
              rows={2}
              placeholder="Gần trường học, có chỗ đậu xe..."
              className="w-full px-3 py-2 border rounded-md text-sm resize-none"
            />
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wide">
            Ghi chú
          </h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ghi chú riêng</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Ghi chú về khách hàng..."
              className="w-full px-3 py-2 border rounded-md text-sm resize-none"
            />
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Đang tạo...' : 'Thêm khách hàng'}
        </button>
      </form>
    </div>
  )
}
