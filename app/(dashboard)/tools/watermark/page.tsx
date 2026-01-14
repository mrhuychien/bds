'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

type Position = 'top_left' | 'top_center' | 'top_right' | 'center_left' | 'center' | 'center_right' | 'bottom_left' | 'bottom_center' | 'bottom_right'

interface WatermarkSettings {
  text: string
  phone: string
  position: Position
  opacity: number
  size: number
  showPhone: boolean
}

const POSITION_GRID: Position[] = [
  'top_left', 'top_center', 'top_right',
  'center_left', 'center', 'center_right',
  'bottom_left', 'bottom_center', 'bottom_right'
]

export default function WatermarkPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<'logo' | 'phone'>('phone')

  const [settings, setSettings] = useState<WatermarkSettings>({
    text: 'Môi giới BĐS',
    phone: '0901 234 567',
    position: 'bottom_right',
    opacity: 85,
    size: 24,
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
        const profileData = data as Profile | null
        if (profileData) {
          setSettings(prev => ({
            ...prev,
            text: profileData.full_name || prev.text,
            phone: profileData.phone || prev.phone,
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

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setWatermarkedUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
        opacity: settings.opacity / 100,
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
        opacity: settings.opacity / 100,
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

  return (
    <div className="min-h-screen flex flex-col pb-32">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()}>
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
        </div>
        <h1 className="text-lg font-bold tracking-tight">Đóng dấu ảnh</h1>
        <button onClick={handleReset} className="text-primary font-semibold text-sm">
          Làm mới
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto">
        {/* Main Workspace / Canvas */}
        <div className="p-4">
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[4/3] w-full bg-card rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3">add_a_photo</span>
              <p className="font-medium text-muted-foreground">Chọn ảnh để đóng dấu</p>
              <p className="text-sm text-muted-foreground/60 mt-1">JPEG, PNG, WebP - Tối đa 10MB</p>
            </div>
          ) : (
            <div className="relative aspect-[4/3] w-full bg-muted rounded-xl overflow-hidden shadow-sm">
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
              {/* Watermark Preview Overlay */}
              {!watermarkedUrl && (
                <div className={`absolute ${getPositionClasses(settings.position)} bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 shadow-lg flex items-center gap-2`}>
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[14px]">home</span>
                  </div>
                  <span className="text-[12px] font-bold text-foreground">{settings.phone}</span>
                </div>
              )}
            </div>
          )}
          {selectedFile && (
            <p className="text-center text-xs text-muted-foreground mt-2 italic">Chạm và kéo để di chuyển vị trí dấu</p>
          )}
        </div>

        {selectedFile && (
          <>
            {/* Tool Tabs */}
            <div className="px-4">
              <div className="flex bg-muted p-1 rounded-xl mb-6">
                <button
                  onClick={() => setActiveTab('logo')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                    activeTab === 'logo'
                      ? 'bg-card shadow-sm text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  Thêm Logo
                </button>
                <button
                  onClick={() => setActiveTab('phone')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                    activeTab === 'phone'
                      ? 'bg-card shadow-sm text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  Số điện thoại
                </button>
              </div>
            </div>

            {/* Adjustment Controls */}
            <div className="px-4 space-y-6">
              {/* Input Field for Phone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold ml-1">Nội dung hiển thị</label>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full h-14 bg-card border border-border rounded-xl px-4 text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="Nhập số điện thoại..."
                  />
                  <span className="material-symbols-outlined absolute right-4 top-4 text-muted-foreground">edit</span>
                </div>
              </div>

              {/* Position Grid */}
              <div className="space-y-3">
                <p className="text-sm font-semibold ml-1">Vị trí dấu</p>
                <div className="grid grid-cols-3 gap-2 w-48">
                  {POSITION_GRID.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSettings({ ...settings, position: pos })}
                      className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer border-2 transition-colors ${
                        settings.position === pos
                          ? 'bg-primary/10 border-primary'
                          : 'bg-muted border-transparent hover:bg-muted/80'
                      }`}
                    >
                      {settings.position === pos && (
                        <div className="size-2 bg-primary rounded-full shadow-[0_0_0_4px_rgba(30,63,174,0.2)]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders Container */}
              <div className="bg-card p-4 rounded-2xl shadow-sm border border-border space-y-6">
                {/* Opacity Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Độ mờ</span>
                    <span className="text-sm font-bold text-primary">{settings.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={settings.opacity}
                    onChange={(e) => setSettings({ ...settings, opacity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Size Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Kích thước</span>
                    <span className="text-sm font-bold text-primary">{settings.size}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={settings.size}
                    onChange={(e) => setSettings({ ...settings, size: parseInt(e.target.value) })}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Fixed Bottom Footer */}
      {selectedFile && (
        <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-8">
          <div className="max-w-md mx-auto flex gap-3">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="flex-1 h-14 rounded-xl border-2 border-border font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">visibility</span>
              Xem thử
            </button>
            <button
              onClick={handleProcess}
              disabled={processing}
              className="flex-[2] h-14 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-lg shadow-lg shadow-accent/20 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">download</span>
              {processing ? 'Đang xử lý...' : 'Xuất ảnh & Lưu'}
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}

function getPositionClasses(position: Position): string {
  const positionMap: Record<Position, string> = {
    top_left: 'top-4 left-4',
    top_center: 'top-4 left-1/2 -translate-x-1/2',
    top_right: 'top-4 right-4',
    center_left: 'top-1/2 left-4 -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    center_right: 'top-1/2 right-4 -translate-y-1/2',
    bottom_left: 'bottom-4 left-4',
    bottom_center: 'bottom-4 left-1/2 -translate-x-1/2',
    bottom_right: 'bottom-4 right-4',
  }
  return positionMap[position]
}
