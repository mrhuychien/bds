'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { PROPERTY_TYPES, LISTING_TYPES, DIRECTIONS, LEGAL_STATUS, HCM_DISTRICTS } from '@/lib/constants'

export default function NewPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      const { error } = await supabase.from('properties').insert({
        owner_id: user.id,
        title: formData.get('title') as string,
        property_type: formData.get('property_type') as string,
        listing_type: formData.get('listing_type') as string,
        price: parseInt(formData.get('price') as string),
        area: formData.get('area') ? parseFloat(formData.get('area') as string) : null,
        bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string) : null,
        bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms') as string) : null,
        floors: formData.get('floors') ? parseInt(formData.get('floors') as string) : null,
        district: formData.get('district') as string,
        street: formData.get('street') as string,
        direction: formData.get('direction') as string || null,
        legal_status: formData.get('legal_status') as string || null,
        description: formData.get('description') as string || null,
        source: formData.get('source') as string || null,
      })

      if (error) throw error

      router.push('/inventory')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo BĐS')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Thêm BĐS mới" />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tiêu đề *</label>
          <input
            name="title"
            type="text"
            required
            placeholder="VD: Nhà phố Nguyễn Trãi, Quận 1"
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Type & Listing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Loại BĐS *</label>
            <select name="property_type" required className="w-full px-3 py-2 border rounded-md text-sm">
              {Object.entries(PROPERTY_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Hình thức</label>
            <select name="listing_type" className="w-full px-3 py-2 border rounded-md text-sm">
              {Object.entries(LISTING_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Giá (VNĐ) *</label>
          <input
            name="price"
            type="number"
            required
            placeholder="VD: 5000000000 (5 tỷ)"
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <p className="text-xs text-muted-foreground">Nhập đầy đủ số tiền (VD: 5 tỷ = 5000000000)</p>
        </div>

        {/* Area & Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Diện tích (m²)</label>
            <input
              name="area"
              type="number"
              step="0.1"
              placeholder="VD: 85"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Số tầng</label>
            <input
              name="floors"
              type="number"
              placeholder="VD: 3"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        {/* Rooms */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Phòng ngủ</label>
            <input
              name="bedrooms"
              type="number"
              placeholder="VD: 3"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Phòng tắm</label>
            <input
              name="bathrooms"
              type="number"
              placeholder="VD: 2"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Quận/Huyện</label>
            <select name="district" className="w-full px-3 py-2 border rounded-md text-sm">
              <option value="">Chọn quận/huyện</option>
              {HCM_DISTRICTS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Hướng</label>
            <select name="direction" className="w-full px-3 py-2 border rounded-md text-sm">
              <option value="">Chọn hướng</option>
              {Object.entries(DIRECTIONS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Street */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Đường</label>
          <input
            name="street"
            type="text"
            placeholder="VD: Nguyễn Trãi"
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Legal */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Pháp lý</label>
          <select name="legal_status" className="w-full px-3 py-2 border rounded-md text-sm">
            <option value="">Chọn pháp lý</option>
            {Object.entries(LEGAL_STATUS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Source */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nguồn hàng</label>
          <input
            name="source"
            type="text"
            placeholder="VD: Chính chủ, Sàn ABC..."
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Mô tả</label>
          <textarea
            name="description"
            rows={4}
            placeholder="Mô tả chi tiết về BĐS..."
            className="w-full px-3 py-2 border rounded-md text-sm resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Đang tạo...' : 'Tạo BĐS'}
        </button>
      </form>
    </div>
  )
}
