'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PROPERTY_TYPES, LISTING_TYPES, DIRECTIONS, LEGAL_STATUS, HCM_DISTRICTS } from '@/lib/constants'
import type { InsertTables } from '@/types/database'

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
      const propertyData: InsertTables<'properties'> = {
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
      }

      const { error } = await (supabase.from('properties') as any).insert(propertyData)

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
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center h-14 px-4 justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/inventory"
              className="size-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </Link>
            <h1 className="font-bold text-lg">Thêm BĐS mới</h1>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Basic Info Section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">home</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                type="text"
                required
                placeholder="VD: Nhà phố Nguyễn Trãi, Quận 1"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Type & Listing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Loại BĐS <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="property_type"
                    required
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    {Object.entries(PROPERTY_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Hình thức</label>
                <div className="relative">
                  <select
                    name="listing_type"
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    {Object.entries(LISTING_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Price Section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent">payments</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Giá bán</h3>
            </div>
          </div>
          <div className="p-4">
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Giá (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="price"
                type="number"
                required
                placeholder="5000000000"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">VNĐ</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Nhập đầy đủ số tiền (VD: 5 tỷ = 5000000000)
            </p>
          </div>
        </section>

        {/* Specifications Section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">architecture</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thông số kỹ thuật</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Area & Floors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">square_foot</span>
                    Diện tích (m²)
                  </span>
                </label>
                <input
                  name="area"
                  type="number"
                  step="0.1"
                  placeholder="85"
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">layers</span>
                    Số tầng
                  </span>
                </label>
                <input
                  name="floors"
                  type="number"
                  placeholder="3"
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Rooms */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">bed</span>
                    Phòng ngủ
                  </span>
                </label>
                <input
                  name="bedrooms"
                  type="number"
                  placeholder="3"
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">bathtub</span>
                    Phòng tắm
                  </span>
                </label>
                <input
                  name="bathrooms"
                  type="number"
                  placeholder="2"
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">location_on</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Vị trí</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* District & Direction */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Quận/Huyện</label>
                <div className="relative">
                  <select
                    name="district"
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    <option value="">Chọn quận</option>
                    {HCM_DISTRICTS.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Hướng nhà</label>
                <div className="relative">
                  <select
                    name="direction"
                    className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                  >
                    <option value="">Chọn hướng</option>
                    {Object.entries(DIRECTIONS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Street */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Đường</label>
              <input
                name="street"
                type="text"
                placeholder="VD: Nguyễn Trãi"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </section>

        {/* Legal & Source Section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">verified</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Pháp lý & Nguồn</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Legal */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Pháp lý</label>
              <div className="relative">
                <select
                  name="legal_status"
                  className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                >
                  <option value="">Chọn pháp lý</option>
                  {Object.entries(LEGAL_STATUS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-[20px]">expand_more</span>
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Nguồn hàng</label>
              <input
                name="source"
                type="text"
                placeholder="VD: Chính chủ, Sàn ABC..."
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600">description</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Mô tả</h3>
            </div>
          </div>
          <div className="p-4">
            <textarea
              name="description"
              rows={4}
              placeholder="Mô tả chi tiết về BĐS như vị trí, tiện ích, điểm nổi bật..."
              className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 resize-none"
            />
          </div>
        </section>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">add_circle</span>
                Tạo BĐS mới
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
