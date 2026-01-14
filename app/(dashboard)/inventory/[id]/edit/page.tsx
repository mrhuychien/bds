'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PROPERTY_TYPES, PROPERTY_STATUS, LISTING_TYPES, DIRECTIONS, LEGAL_STATUS, HCM_DISTRICTS, COMMON_FEATURES } from '@/lib/constants'
import type { Property, UpdateTables } from '@/types/database'

interface EditPropertyPageProps {
  params: { id: string }
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  useEffect(() => {
    async function loadProperty() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: propertyData, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', params.id)
        .eq('owner_id', user.id)
        .single()

      const data = propertyData as Property | null

      if (error || !data) {
        router.push('/inventory')
        return
      }

      setProperty(data)
      setSelectedFeatures(data.features || [])
      setLoading(false)
    }

    loadProperty()
  }, [params.id, router])

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const updateData: UpdateTables<'properties'> = {
        title: formData.get('title') as string,
        property_type: formData.get('property_type') as string,
        status: formData.get('status') as string,
        listing_type: formData.get('listing_type') as string,
        price: parseInt(formData.get('price') as string),
        is_negotiable: formData.get('is_negotiable') === 'on',
        area: formData.get('area') ? parseFloat(formData.get('area') as string) : null,
        frontage: formData.get('frontage') ? parseFloat(formData.get('frontage') as string) : null,
        bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string) : null,
        bathrooms: formData.get('bathrooms') ? parseInt(formData.get('bathrooms') as string) : null,
        floors: formData.get('floors') ? parseInt(formData.get('floors') as string) : null,
        district: formData.get('district') as string || null,
        street: formData.get('street') as string || null,
        address_detail: formData.get('address_detail') as string || null,
        direction: formData.get('direction') as string || null,
        legal_status: formData.get('legal_status') as string || null,
        description: formData.get('description') as string || null,
        source: formData.get('source') as string || null,
        commission_rate: formData.get('commission_rate') ? parseFloat(formData.get('commission_rate') as string) : null,
        notes: formData.get('notes') as string || null,
        features: selectedFeatures.length > 0 ? selectedFeatures : null,
        is_public: formData.get('is_public') === 'on',
      }

      const { error } = await (supabase.from('properties') as any)
        .update(updateData)
        .eq('id', params.id)

      if (error) throw error

      router.push(`/inventory/${params.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật BĐS')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa BĐS này?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', params.id)

    if (error) {
      alert('Không thể xóa BĐS')
      return
    }

    router.push('/inventory')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (!property) return null

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center h-14 px-4 gap-3">
          <Link href={`/inventory/${params.id}`} className="p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="flex-1 font-semibold">Chỉnh sửa BĐS</h1>
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
            <label className="text-sm font-medium">Tiêu đề *</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={property.title}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Loại BĐS</label>
              <select
                name="property_type"
                defaultValue={property.property_type}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                {Object.entries(PROPERTY_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Trạng thái</label>
              <select
                name="status"
                defaultValue={property.status}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                {Object.entries(PROPERTY_STATUS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Hình thức</label>
              <select
                name="listing_type"
                defaultValue={property.listing_type}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                {Object.entries(LISTING_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Giá (VNĐ) *</label>
              <input
                name="price"
                type="number"
                required
                defaultValue={property.price}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_negotiable"
              defaultChecked={property.is_negotiable}
              className="rounded"
            />
            <span className="text-sm">Có thể thương lượng</span>
          </label>
        </section>

        {/* Dimensions */}
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wide">
            Diện tích & Quy mô
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Diện tích (m²)</label>
              <input
                name="area"
                type="number"
                step="0.1"
                defaultValue={property.area || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mặt tiền (m)</label>
              <input
                name="frontage"
                type="number"
                step="0.1"
                defaultValue={property.frontage || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phòng ngủ</label>
              <input
                name="bedrooms"
                type="number"
                defaultValue={property.bedrooms || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phòng tắm</label>
              <input
                name="bathrooms"
                type="number"
                defaultValue={property.bathrooms || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Số tầng</label>
              <input
                name="floors"
                type="number"
                defaultValue={property.floors || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wide">
            Vị trí
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Quận/Huyện</label>
              <select
                name="district"
                defaultValue={property.district || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Chọn quận/huyện</option>
                {HCM_DISTRICTS.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Đường</label>
              <input
                name="street"
                type="text"
                defaultValue={property.street || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Địa chỉ chi tiết (riêng tư)</label>
            <input
              name="address_detail"
              type="text"
              defaultValue={property.address_detail || ''}
              placeholder="Số nhà, hẻm..."
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </section>

        {/* Details */}
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wide">
            Chi tiết
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Hướng</label>
              <select
                name="direction"
                defaultValue={property.direction || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Chọn hướng</option>
                {Object.entries(DIRECTIONS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pháp lý</label>
              <select
                name="legal_status"
                defaultValue={property.legal_status || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Chọn pháp lý</option>
                {Object.entries(LEGAL_STATUS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={property.description || ''}
              className="w-full px-3 py-2 border rounded-md text-sm resize-none"
            />
          </div>
        </section>

        {/* Features */}
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wide">
            Tiện ích & Đặc điểm
          </h2>
          <div className="flex flex-wrap gap-2">
            {COMMON_FEATURES.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedFeatures.includes(feature)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                {feature}
              </button>
            ))}
          </div>
        </section>

        {/* Source & Commission */}
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wide">
            Nguồn hàng
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nguồn</label>
              <input
                name="source"
                type="text"
                defaultValue={property.source || ''}
                placeholder="Chính chủ, Sàn..."
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Hoa hồng (%)</label>
              <input
                name="commission_rate"
                type="number"
                step="0.1"
                defaultValue={property.commission_rate || ''}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ghi chú riêng tư</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={property.notes || ''}
              className="w-full px-3 py-2 border rounded-md text-sm resize-none"
            />
          </div>
        </section>

        {/* Publish */}
        <section className="space-y-4">
          <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wide">
            Công khai
          </h2>
          <label className="flex items-center gap-3 p-3 border rounded-lg">
            <input
              type="checkbox"
              name="is_public"
              defaultChecked={property.is_public}
              className="rounded w-5 h-5"
            />
            <div>
              <p className="font-medium text-sm">Công khai Microsite</p>
              <p className="text-xs text-muted-foreground">
                Cho phép khách hàng xem qua link chia sẻ
              </p>
            </div>
          </label>
        </section>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-2.5 px-4 border border-red-500 text-red-500 rounded-md text-sm font-medium hover:bg-red-50"
          >
            Xóa BĐS
          </button>
        </div>
      </form>
    </div>
  )
}
