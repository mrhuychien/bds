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
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale')
  const [bedrooms, setBedrooms] = useState(0)
  const [bathrooms, setBathrooms] = useState(0)

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
      setListingType(data.listing_type === 'rent' ? 'rent' : 'sale')
      setBedrooms(data.bedrooms || 0)
      setBathrooms(data.bathrooms || 0)
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
        listing_type: listingType,
        price: parseInt(formData.get('price') as string),
        is_negotiable: formData.get('is_negotiable') === 'on',
        area: formData.get('area') ? parseFloat(formData.get('area') as string) : null,
        frontage: formData.get('frontage') ? parseFloat(formData.get('frontage') as string) : null,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
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
        <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!property) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center h-14 px-4 justify-between">
          <Link href={`/inventory/${params.id}`} className="p-2 -ml-2 rounded-full active:bg-muted">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </Link>
          <h1 className="text-[17px] font-semibold">Sửa Bất động sản</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="pb-32 space-y-5 px-4 pt-5">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Image Section */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
              Hình ảnh ({property.images?.length || 0})
            </h3>
            <button type="button" className="text-xs font-semibold text-primary">Sắp xếp</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button type="button" className="aspect-square rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center text-primary active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-3xl mb-1">add_a_photo</span>
              <span className="text-[10px] font-bold uppercase">Thêm ảnh</span>
            </button>
            {property.thumbnail_url && (
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm bg-card">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${property.thumbnail_url}')` }}
                />
                <button type="button" className="absolute top-1 right-1 bg-black/40 text-white rounded-full p-1 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
                <div className="absolute bottom-1 left-1 bg-primary/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  Cover
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Basic Info Card */}
        <section className="bg-card rounded-[20px] p-5 shadow-sm border border-border space-y-5">
          {/* Listing Type Toggle */}
          <div className="bg-muted p-1 rounded-xl flex font-semibold text-[13px]">
            <button
              type="button"
              onClick={() => setListingType('sale')}
              className={`flex-1 py-2.5 rounded-lg transition-all text-center ${
                listingType === 'sale'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cần bán
            </button>
            <button
              type="button"
              onClick={() => setListingType('rent')}
              className={`flex-1 py-2.5 rounded-lg transition-all text-center ${
                listingType === 'rent'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cho thuê
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Tiêu đề tin đăng</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={property.title}
              className="w-full bg-muted/50 border-0 rounded-xl p-3.5 text-[15px] font-medium placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
              placeholder="Nhập tiêu đề..."
            />
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Loại bất động sản</label>
            <div className="flex flex-wrap gap-2.5">
              {Object.entries(PROPERTY_TYPES).map(([value, label]) => (
                <label key={value} className="cursor-pointer">
                  <input type="radio" name="property_type" value={value} defaultChecked={property.property_type === value} className="sr-only peer" />
                  <span className="px-4 py-2 rounded-full text-xs font-bold border border-border peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary peer-checked:shadow-md hover:border-primary/50 transition-all block">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Trạng thái</label>
            <select
              name="status"
              defaultValue={property.status}
              className="w-full appearance-none bg-muted/50 border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(PROPERTY_STATUS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Price Card */}
        <section className="bg-card rounded-[20px] p-5 shadow-sm border border-border space-y-4">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide ml-1">Mức giá mong muốn</label>
          <div className="flex gap-3">
            <input
              name="price"
              type="number"
              required
              defaultValue={property.price ? property.price / 1_000_000_000 : ''}
              step="0.1"
              className="flex-1 bg-muted/50 border-0 rounded-xl px-4 py-4 text-2xl font-bold text-primary placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
            />
            <div className="w-28 bg-muted/50 rounded-xl px-4 flex items-center justify-center text-sm font-bold text-muted-foreground">
              Tỷ VNĐ
            </div>
          </div>
          <label className="flex items-center gap-3 pl-1">
            <input
              type="checkbox"
              name="is_negotiable"
              defaultChecked={property.is_negotiable}
              className="w-5 h-5 text-primary rounded border-border focus:ring-primary/20"
            />
            <span className="text-sm font-medium">Có thương lượng</span>
          </label>
        </section>

        {/* Specs Card */}
        <section className="bg-card rounded-[20px] p-5 shadow-sm border border-border space-y-6">
          <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Thông số chi tiết</h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Diện tích</label>
              <div className="relative">
                <input
                  name="area"
                  type="number"
                  step="0.1"
                  defaultValue={property.area || ''}
                  className="w-full bg-muted/50 border-0 rounded-xl px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">m²</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Mặt tiền</label>
              <div className="relative">
                <input
                  name="frontage"
                  type="number"
                  step="0.1"
                  defaultValue={property.frontage || ''}
                  className="w-full bg-muted/50 border-0 rounded-xl px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                  placeholder="--"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">m</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Số tầng</label>
              <input
                name="floors"
                type="number"
                defaultValue={property.floors || ''}
                className="w-full bg-muted/50 border-0 rounded-xl px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 text-center"
                placeholder="1"
              />
            </div>
          </div>

          <div className="h-px bg-border"></div>

          {/* Bedrooms Counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined">bed</span>
              </div>
              <span className="text-sm font-medium">Phòng ngủ</span>
            </div>
            <div className="flex items-center bg-muted/50 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card shadow-sm active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="w-10 text-center text-sm font-bold">{bedrooms}</span>
              <button
                type="button"
                onClick={() => setBedrooms(bedrooms + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white shadow-md active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>

          {/* Bathrooms Counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined">bathtub</span>
              </div>
              <span className="text-sm font-medium">Phòng tắm</span>
            </div>
            <div className="flex items-center bg-muted/50 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setBathrooms(Math.max(0, bathrooms - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card shadow-sm active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="w-10 text-center text-sm font-bold">{bathrooms}</span>
              <button
                type="button"
                onClick={() => setBathrooms(bathrooms + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white shadow-md active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>
        </section>

        {/* Location Card */}
        <section className="bg-card rounded-[20px] p-5 shadow-sm border border-border space-y-4">
          <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Vị trí Bất động sản</h3>
          <div className="space-y-3">
            <select
              name="district"
              defaultValue={property.district || ''}
              className="w-full appearance-none bg-muted/50 border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Chọn Quận/Huyện</option>
              {HCM_DISTRICTS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            <input
              name="street"
              type="text"
              defaultValue={property.street || ''}
              className="w-full bg-muted/50 border-0 rounded-xl px-4 py-3.5 text-sm font-medium placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
              placeholder="Số nhà, tên đường..."
            />
            <input
              name="address_detail"
              type="text"
              defaultValue={property.address_detail || ''}
              className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3.5 text-sm font-medium placeholder:text-amber-600/50 focus:ring-2 focus:ring-amber-500/20"
              placeholder="Địa chỉ chi tiết (riêng tư)..."
            />
          </div>
        </section>

        {/* Other Info Card */}
        <section className="bg-card rounded-[20px] p-5 shadow-sm border border-border space-y-5">
          <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Thông tin khác</h3>

          {/* Direction */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground ml-1">Hướng nhà</label>
            <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 px-1 no-scrollbar">
              {Object.entries(DIRECTIONS).map(([value, label]) => (
                <label key={value} className="flex-none cursor-pointer">
                  <input type="radio" name="direction" value={value} defaultChecked={property.direction === value} className="sr-only peer" />
                  <span className="px-4 py-2 rounded-lg bg-muted/50 text-xs font-bold border border-border peer-checked:bg-primary/10 peer-checked:text-primary peer-checked:border-primary/50 whitespace-nowrap block">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Legal Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground ml-1">Pháp lý</label>
            <select
              name="legal_status"
              defaultValue={property.legal_status || ''}
              className="w-full appearance-none bg-muted/50 border-0 rounded-xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Chọn pháp lý</option>
              {Object.entries(LEGAL_STATUS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Description Card */}
        <section className="bg-card rounded-[20px] p-5 shadow-sm border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Mô tả chi tiết</h3>
          </div>
          <button
            type="button"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            Tạo mô tả bằng AI
          </button>
          <textarea
            name="description"
            rows={5}
            defaultValue={property.description || ''}
            className="w-full min-h-[140px] bg-muted/50 border-0 rounded-xl p-4 text-sm leading-relaxed placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Mô tả chi tiết về bất động sản, tiện ích xung quanh, tiềm năng đầu tư..."
          />
        </section>

        {/* Features */}
        <section className="bg-card rounded-[20px] p-5 shadow-sm border border-border space-y-4">
          <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Tiện ích & Đặc điểm</h3>
          <div className="flex flex-wrap gap-2">
            {COMMON_FEATURES.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  selectedFeatures.includes(feature)
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-muted/50 border-border hover:border-primary/50'
                }`}
              >
                {feature}
              </button>
            ))}
          </div>
        </section>

        {/* Private Notes Card */}
        <section className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-[20px] p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
            <h3 className="text-sm font-bold uppercase text-primary tracking-wider">Ghi chú riêng tư</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Nguồn</label>
              <input
                name="source"
                type="text"
                defaultValue={property.source || ''}
                className="w-full bg-card border-0 rounded-xl px-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                placeholder="VD: Anh Ba"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Hoa hồng (%)</label>
              <input
                name="commission_rate"
                type="number"
                step="0.1"
                defaultValue={property.commission_rate || ''}
                className="w-full bg-card border-0 rounded-xl px-3 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                placeholder="1.5"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Ghi chú nội bộ</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={property.notes || ''}
              className="w-full bg-card border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Chỉ bạn mới thấy ghi chú này..."
            />
          </div>
        </section>

        {/* Publish Toggle */}
        <section className="bg-card rounded-[20px] p-5 shadow-sm border border-border">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              name="is_public"
              defaultChecked={property.is_public}
              className="w-6 h-6 text-primary rounded-lg border-border focus:ring-primary/20"
            />
            <div className="flex-1">
              <p className="font-semibold">Công khai Microsite</p>
              <p className="text-xs text-muted-foreground">Cho phép khách hàng xem qua link chia sẻ</p>
            </div>
            <span className="material-symbols-outlined text-muted-foreground">public</span>
          </label>
        </section>

        {/* Delete Button */}
        <button
          type="button"
          onClick={handleDelete}
          className="w-full py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span className="material-symbols-outlined">delete</span>
          Xóa bất động sản
        </button>
      </form>

      {/* Fixed Bottom Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border p-4 pb-8">
        <div className="max-w-lg mx-auto flex gap-3">
          <Link
            href={`/inventory/${params.id}`}
            className="flex-1 py-3.5 rounded-2xl bg-muted font-bold text-center active:scale-95 transition-transform"
          >
            Hủy
          </Link>
          <button
            type="submit"
            form="edit-form"
            disabled={saving}
            onClick={(e) => {
              e.preventDefault()
              const form = document.querySelector('form')
              if (form) form.requestSubmit()
            }}
            className="flex-[2] py-3.5 rounded-2xl bg-accent text-white font-bold shadow-lg shadow-accent/30 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            {saving ? 'Đang lưu...' : 'Lưu BĐS'}
          </button>
        </div>
      </footer>
    </div>
  )
}
