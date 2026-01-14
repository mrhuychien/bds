'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import type { Profile } from '@/types/database'

interface WatermarkSettings {
  text: string
  phone: string
  position: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center'
  opacity: number
  showPhone: boolean
}

export default function WatermarkPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  const [settings, setSettings] = useState<WatermarkSettings>({
    text: 'Môi giới BĐS',
    phone: '0901234567',
    position: 'bottom_right',
    opacity: 0.9,
    showPhone: true,
  })

  // Load profile for default settings
  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) {
          setProfile(data)
          setSettings(prev => ({
            ...prev,
            text: data.full_name || prev.text,
            phone: data.phone || prev.phone,
          }))
        }
      }
    }
    loadProfile()
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setWatermarkedUrl(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setWatermarkedUrl(null)
    }
  }, [])

  const handlePreview = async () => {
    if (!selectedFile) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('options', JSON.stringify({
        text: settings.text,
        phone: settings.showPhone ? settings.phone : undefined,
        position: settings.position,
        opacity: settings.opacity,
      }))

      const response = await fetch('/api/watermark', {
        method: 'PUT',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setWatermarkedUrl(data.preview)
      }
    } catch (error) {
      console.error('Preview error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async () => {
    if (!selectedFile) return

    setProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('options', JSON.stringify({
        text: settings.text,
        phone: settings.showPhone ? settings.phone : undefined,
        position: settings.position,
        opacity: settings.opacity,
      }))

      const response = await fetch('/api/watermark', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setWatermarkedUrl(data.url)
        // Auto download
        const link = document.createElement('a')
        link.href = data.url
        link.download = `watermarked-${Date.now()}.jpg`
        link.click()
      }
    } catch (error) {
      console.error('Process error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setWatermarkedUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="pb-6">
      <PageHeader
        title="Watermark Tool"
        description="Đóng dấu ảnh BĐS"
      />

      <div className="p-4 space-y-6">
        {/* Upload Area */}
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-medium mb-1">Chọn hoặc kéo thả ảnh</p>
            <p className="text-sm text-muted-foreground">JPEG, PNG, WebP - Tối đa 10MB</p>
          </div>
        ) : (
          <>
            {/* Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Xem trước</h3>
                <button
                  onClick={handleReset}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Chọn ảnh khác
                </button>
              </div>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                <img
                  src={watermarkedUrl || previewUrl || ''}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Cài đặt Watermark</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tên hiển thị</label>
                <input
                  type="text"
                  value={settings.text}
                  onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="Tên môi giới"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showPhone}
                    onChange={(e) => setSettings({ ...settings, showPhone: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Hiển thị số điện thoại</span>
                </label>
                {settings.showPhone && (
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="0901234567"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Vị trí</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'top_left', label: 'Trên trái' },
                    { value: 'top_right', label: 'Trên phải' },
                    { value: 'center', label: 'Giữa' },
                    { value: 'bottom_left', label: 'Dưới trái' },
                    { value: 'bottom_right', label: 'Dưới phải' },
                  ].map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => setSettings({ ...settings, position: pos.value as WatermarkSettings['position'] })}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        settings.position === pos.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Độ đậm: {Math.round(settings.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1"
                  step="0.1"
                  value={settings.opacity}
                  onChange={(e) => setSettings({ ...settings, opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handlePreview}
                disabled={loading}
                className="w-full py-2.5 px-4 border rounded-md text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Xem trước'}
              </button>

              <button
                onClick={handleProcess}
                disabled={processing || !watermarkedUrl}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {processing ? 'Đang lưu...' : 'Lưu & Tải về'}
              </button>
            </div>
          </>
        )}

        {/* Tips */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">Mẹo sử dụng</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Chọn vị trí watermark phù hợp với bố cục ảnh</li>
            <li>• Điều chỉnh độ đậm để không che quá nhiều nội dung</li>
            <li>• Nên thêm số điện thoại để khách dễ liên hệ</li>
            <li>• Nhấn "Xem trước" trước khi lưu để kiểm tra</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
