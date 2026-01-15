'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PropertyImage {
  id: string
  url: string
  watermarkedUrl?: string
  isUploading?: boolean
}

interface PropertyImageUploadProps {
  value: PropertyImage[]
  onChange: (images: PropertyImage[]) => void
  maxFiles?: number
}

export function PropertyImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
}: PropertyImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  // Get user profile for watermark settings
  const getWatermarkOptions = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await (supabase.from('profiles') as any)
      .select('full_name, phone')
      .eq('id', user.id)
      .single()

    if (profile) {
      return {
        text: profile.full_name || 'BatDongSan.Digital',
        phone: profile.phone || '',
        position: 'bottom_right' as const,
        opacity: 0.85,
      }
    }

    return {
      text: 'BatDongSan.Digital',
      position: 'bottom_right' as const,
      opacity: 0.85,
    }
  }

  const uploadWithWatermark = async (file: File): Promise<PropertyImage | null> => {
    try {
      // Get watermark options
      const watermarkOptions = await getWatermarkOptions()

      // Create form data for watermark API
      const formData = new FormData()
      formData.append('file', file)
      if (watermarkOptions) {
        formData.append('options', JSON.stringify(watermarkOptions))
      }

      // Upload with watermark
      const response = await fetch('/api/watermark', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.url) {
        return {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          url: data.url,
          watermarkedUrl: data.url,
        }
      }

      return null
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxFiles - value.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) return

    setUploading(true)

    // Create temporary placeholders
    const placeholders: PropertyImage[] = filesToUpload.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      isUploading: true,
    }))

    onChange([...value, ...placeholders])

    // Upload files
    const uploadedImages: PropertyImage[] = []
    for (const file of filesToUpload) {
      const result = await uploadWithWatermark(file)
      if (result) {
        uploadedImages.push(result)
      }
    }

    // Replace placeholders with uploaded images
    const finalImages = value.filter(img => !img.isUploading)
    onChange([...finalImages, ...uploadedImages])

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [value, maxFiles, onChange])

  const handleRemove = useCallback((id: string) => {
    onChange(value.filter(img => img.id !== id))
  }, [value, onChange])

  const setCover = useCallback((id: string) => {
    const image = value.find(img => img.id === id)
    if (!image) return

    const others = value.filter(img => img.id !== id)
    onChange([image, ...others])
  }, [value, onChange])

  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">
          Hình ảnh ({value.filter(v => !v.isUploading).length})
        </h3>
        {value.length > 1 && (
          <button type="button" className="text-xs font-semibold text-primary">
            Sắp xếp
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Add Photo Button */}
        {value.length < maxFiles && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center text-primary active:scale-95 transition-transform disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-3xl mb-1">add_a_photo</span>
            <span className="text-[10px] font-bold uppercase">Thêm ảnh</span>
          </button>
        )}

        {/* Image Grid */}
        {value.map((image, index) => (
          <div
            key={image.id}
            className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm bg-white"
          >
            {image.isUploading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${image.url}')` }}
                />
                <div className="absolute inset-0 bg-black/10" />

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  className="absolute top-1 right-1 bg-black/40 text-white rounded-full p-1 backdrop-blur-sm hover:bg-black/60 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px] leading-none">close</span>
                </button>

                {/* Cover Badge / Set Cover Button */}
                {index === 0 ? (
                  <div className="absolute bottom-1 left-1 bg-primary/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-md shadow-sm">
                    Cover
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCover(image.id)}
                    className="absolute bottom-1 left-1 bg-black/40 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Đặt làm cover
                  </button>
                )}

                {/* Watermark indicator */}
                {image.watermarkedUrl && (
                  <div className="absolute bottom-1 right-1 bg-emerald-500/90 text-white rounded-md p-0.5 backdrop-blur-md">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-2 px-1 text-center">
        Ảnh sẽ được tự động đóng dấu watermark
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </section>
  )
}
