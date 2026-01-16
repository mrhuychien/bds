'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PROPERTY_TYPES, LISTING_TYPES, DIRECTIONS, LEGAL_STATUS, HCM_DISTRICTS } from '@/lib/constants'
import { PropertyImageUpload } from '@/components/property/property-image-upload'
import { LocationPicker } from '@/components/property/location-picker'
import { generatePropertySlug } from '@/lib/utils/slug'
import type { InsertTables } from '@/types/database'

interface PropertyImage {
  id: string
  url: string
  watermarkedUrl?: string
  isUploading?: boolean
}

export default function NewPropertyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [images, setImages] = useState<PropertyImage[]>([])
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale')
  const [propertyType, setPropertyType] = useState('nha_pho')
  const [priceUnit, setPriceUnit] = useState('Tỷ')
  const [isNegotiable, setIsNegotiable] = useState(true)
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(2)
  const [direction, setDirection] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

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
      // Convert price based on unit
      let price = parseFloat(formData.get('price') as string) || 0
      if (priceUnit === 'Tỷ') {
        price = price * 1000000000
      } else if (priceUnit === 'Triệu') {
        price = price * 1000000
      }

      // Get image URLs
      const uploadedImages = images.filter(img => !img.isUploading)
      const imageUrls = uploadedImages.map(img => img.url)
      const watermarkedUrls = uploadedImages.map(img => img.watermarkedUrl || img.url)

      const title = formData.get('title') as string
      const slug = generatePropertySlug(title)

      const propertyData: InsertTables<'properties'> = {
        owner_id: user.id,
        title: title,
        slug: slug,
        is_public: true, // Default to public so landing page is accessible
        property_type: propertyType,
        listing_type: listingType,
        price: price,
        is_negotiable: isNegotiable,
        area: formData.get('area') ? parseFloat(formData.get('area') as string) : null,
        frontage: formData.get('frontage') ? parseFloat(formData.get('frontage') as string) : null,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        floors: formData.get('floors') ? parseInt(formData.get('floors') as string) : null,
        district: formData.get('district') as string,
        ward: formData.get('ward') as string || null,
        street: formData.get('street') as string,
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        direction: direction || null,
        legal_status: formData.get('legal_status') as string || null,
        description: description || null,
        source: formData.get('source') as string || null,
        commission_rate: formData.get('commission_rate') ? parseFloat(formData.get('commission_rate') as string) : null,
        notes: formData.get('notes') as string || null,
        images: imageUrls.length > 0 ? imageUrls : null,
        watermarked_images: watermarkedUrls.length > 0 ? watermarkedUrls : null,
        thumbnail_url: watermarkedUrls[0] || null,
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
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="flex items-center px-4 h-[54px] justify-between">
          <Link
            href="/inventory"
            className="p-2 -ml-2 rounded-full active:bg-gray-100 text-slate-500"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>arrow_back_ios_new</span>
          </Link>
          <h1 className="text-[17px] font-semibold text-slate-900">Thêm Bất động sản</h1>
          <div className="w-8"></div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="pb-32">
        <main className="space-y-5 px-4 pt-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-[20px] flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Image Upload Section */}
          <PropertyImageUpload
            value={images}
            onChange={setImages}
            maxFiles={10}
          />

          {/* Basic Info Section */}
          <section className="bg-white rounded-[20px] p-5 shadow-soft space-y-5">
            {/* Listing Type Toggle */}
            <div className="bg-gray-100 p-1 rounded-xl flex font-semibold text-[13px] relative">
              <button
                type="button"
                onClick={() => setListingType('sale')}
                className={`flex-1 py-2.5 rounded-lg transition-all text-center z-10 ${
                  listingType === 'sale'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Cần bán
              </button>
              <button
                type="button"
                onClick={() => setListingType('rent')}
                className={`flex-1 py-2.5 rounded-lg transition-all text-center z-10 ${
                  listingType === 'rent'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Cho thuê
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">
                Tiêu đề tin đăng <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                type="text"
                required
                placeholder="Nhập tiêu đề..."
                className="w-full bg-gray-50 border-0 rounded-xl p-3.5 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm ring-1 ring-gray-100"
              />
            </div>

            {/* Property Type Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">Loại bất động sản</label>
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(PROPERTY_TYPES).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPropertyType(value)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                      propertyType === value
                        ? 'bg-primary text-white shadow-md shadow-primary/20 border-primary'
                        : 'bg-white text-slate-600 border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Price Section */}
          <section className="bg-white rounded-[20px] p-5 shadow-soft space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide ml-1">
              Mức giá mong muốn <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  name="price"
                  type="number"
                  step="0.1"
                  required
                  placeholder="0"
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-4 text-2xl font-bold text-primary placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all ring-1 ring-gray-100"
                />
              </div>
              <div className="relative w-32">
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  className="w-full h-full appearance-none bg-gray-50 border-0 rounded-xl pl-4 pr-10 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 ring-1 ring-gray-100"
                >
                  <option>Tỷ</option>
                  <option>Triệu</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <span className="material-symbols-outlined">expand_more</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-1">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary/20"
                />
                <label htmlFor="negotiable" className="ml-2.5 text-sm font-medium text-slate-600">
                  Có thương lượng
                </label>
              </div>
            </div>
          </section>

          {/* Specifications Section */}
          <section className="bg-white rounded-[20px] p-5 shadow-soft space-y-6">
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Thông số chi tiết</h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Diện tích</label>
                <div className="relative">
                  <input
                    name="area"
                    type="number"
                    step="0.1"
                    placeholder="--"
                    className="w-full bg-gray-50 border-0 rounded-xl px-3 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 ring-1 ring-gray-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">m²</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mặt tiền</label>
                <div className="relative">
                  <input
                    name="frontage"
                    type="number"
                    step="0.1"
                    placeholder="--"
                    className="w-full bg-gray-50 border-0 rounded-xl px-3 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 ring-1 ring-gray-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">m</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Số tầng</label>
                <input
                  name="floors"
                  type="number"
                  placeholder="1"
                  className="w-full bg-gray-50 border-0 rounded-xl px-3 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 ring-1 ring-gray-100 text-center"
                />
              </div>
            </div>

            <div className="h-px bg-gray-100"></div>

            {/* Bedrooms & Bathrooms Stepper */}
            <div className="grid grid-cols-1 gap-5">
              {/* Bedrooms */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">bed</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Phòng ngủ</span>
                </div>
                <div className="flex items-center bg-gray-50 rounded-xl p-1.5 ring-1 ring-gray-100">
                  <button
                    type="button"
                    onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-800">{bedrooms}</span>
                  <button
                    type="button"
                    onClick={() => setBedrooms(bedrooms + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20 active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">bathtub</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">Phòng tắm</span>
                </div>
                <div className="flex items-center bg-gray-50 rounded-xl p-1.5 ring-1 ring-gray-100">
                  <button
                    type="button"
                    onClick={() => setBathrooms(Math.max(0, bathrooms - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-800">{bathrooms}</span>
                  <button
                    type="button"
                    onClick={() => setBathrooms(bathrooms + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20 active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section className="bg-white rounded-[20px] p-5 shadow-soft space-y-4">
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Vị trí Bất động sản</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select
                    name="district"
                    className="w-full appearance-none bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 ring-1 ring-gray-100"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {HCM_DISTRICTS.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined text-[20px]">expand_more</span>
                </div>
                <div className="relative flex-1">
                  <input
                    name="ward"
                    type="text"
                    placeholder="Phường/Xã"
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 ring-1 ring-gray-100"
                  />
                </div>
              </div>
              <div>
                <input
                  name="street"
                  type="text"
                  placeholder="Số nhà, tên đường..."
                  className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 ring-1 ring-gray-100"
                />
              </div>
            </div>

            {/* Map Location Picker */}
            <div className="pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block">Định vị trên bản đồ</label>
              <LocationPicker
                value={location}
                onChange={setLocation}
              />
            </div>
          </section>

          {/* Other Info Section */}
          <section className="bg-white rounded-[20px] p-5 shadow-soft space-y-5">
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Thông tin khác</h3>

            {/* Direction Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Hướng nhà</label>
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 -mx-1 px-1">
                {Object.entries(DIRECTIONS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDirection(direction === value ? '' : value)}
                    className={`flex-none px-4 py-2 rounded-lg text-xs font-bold border whitespace-nowrap transition-all ${
                      direction === value
                        ? 'bg-primary/10 text-primary border-primary/50'
                        : 'bg-gray-50 text-slate-600 border-gray-200 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legal Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Pháp lý</label>
              <div className="relative">
                <select
                  name="legal_status"
                  className="w-full appearance-none bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 ring-1 ring-gray-100"
                >
                  <option value="">Chọn pháp lý</option>
                  {Object.entries(LEGAL_STATUS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section className="bg-white rounded-[20px] p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Mô tả chi tiết</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-gray-100 px-2 py-1 rounded-md">
                {description.length}/3000
              </span>
            </div>
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Tạo mô tả bằng AI
            </button>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 3000))}
              placeholder="Mô tả chi tiết về bất động sản, tiện ích xung quanh, tiềm năng đầu tư..."
              rows={5}
              className="w-full min-h-[140px] bg-gray-50 border-0 rounded-xl p-4 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 resize-none ring-1 ring-gray-100"
            />
          </section>

          {/* Private Notes Section */}
          <section className="bg-blue-50/50 border border-blue-100 rounded-[20px] p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
              <h3 className="text-sm font-bold uppercase text-primary tracking-wider">Ghi chú riêng tư</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nguồn</label>
                <input
                  name="source"
                  type="text"
                  placeholder="VD: Anh Ba"
                  className="w-full bg-white border-0 rounded-xl px-3 py-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 ring-1 ring-blue-100/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Hoa hồng (%)</label>
                <input
                  name="commission_rate"
                  type="number"
                  step="0.1"
                  placeholder="1.5"
                  className="w-full bg-white border-0 rounded-xl px-3 py-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 ring-1 ring-blue-100/50"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Ghi chú nội bộ</label>
              <textarea
                name="notes"
                placeholder="Chỉ bạn mới thấy ghi chú này..."
                rows={2}
                className="w-full bg-white border-0 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/20 resize-none ring-1 ring-blue-100/50"
              />
            </div>
          </section>
        </main>

        {/* Fixed Footer */}
        <footer className="fixed bottom-0 left-0 right-0 z-50">
          <div className="w-full max-w-[430px] mx-auto bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 pb-8 flex gap-3 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
            <Link
              href="/inventory"
              className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-slate-600 font-bold text-[15px] active:scale-95 transition-transform hover:bg-gray-200 text-center"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3.5 rounded-2xl bg-accent text-white font-bold text-[15px] shadow-lg shadow-accent/30 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Lưu BĐS
                </>
              )}
            </button>
          </div>
        </footer>
      </form>
    </div>
  )
}
