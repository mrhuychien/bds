'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [bio, setBio] = useState('')
  const [workingAreas, setWorkingAreas] = useState<string[]>([])
  const [zaloLink, setZaloLink] = useState('')
  const [facebookLink, setFacebookLink] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        const profileData = data as Profile
        setProfile(profileData)
        setFullName(profileData.full_name || '')
        setPhone(profileData.phone || '')
        setEmail(profileData.email || user.email || '')
        setTitle(profileData.title || 'Chuyên viên tư vấn')
        setCompanyName(profileData.company_name || '')
        setBio(profileData.bio || '')
        setWorkingAreas(profileData.working_areas || [])
        setZaloLink(profileData.zalo_link || '')
        setFacebookLink(profileData.facebook_link || '')
      } else {
        // Pre-fill with auth user info
        setEmail(user.email || '')
        setPhone(user.phone || '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!userId) return

    setSaving(true)
    const supabase = createClient()

    const profileData = {
      id: userId,
      full_name: fullName,
      phone: phone,
      email: email || null,
      title: title || 'Chuyên viên tư vấn',
      company_name: companyName || null,
      bio: bio || null,
      working_areas: workingAreas.length > 0 ? workingAreas : null,
      zalo_link: zaloLink || null,
      facebook_link: facebookLink || null,
    }

    const { error } = await (supabase.from('profiles') as any)
      .upsert(profileData, { onConflict: 'id' })

    setSaving(false)

    if (error) {
      alert('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.')
      return
    }

    router.push('/settings')
    router.refresh()
  }

  const handleAddArea = () => {
    const area = prompt('Nhập khu vực hoạt động:')
    if (area && area.trim()) {
      setWorkingAreas([...workingAreas, area.trim()])
    }
  }

  const handleRemoveArea = (index: number) => {
    setWorkingAreas(workingAreas.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center h-14 px-4 justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="size-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </Link>
            <h1 className="font-bold text-lg">Chỉnh sửa hồ sơ</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !fullName || !phone}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Avatar Section */}
        <section className="flex flex-col items-center">
          <div className="relative">
            <div className="size-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 border-primary/20">
              <span className="material-symbols-outlined text-5xl text-primary">person</span>
            </div>
            <button className="absolute bottom-0 right-0 size-8 bg-primary rounded-full border-2 border-background flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-white">photo_camera</span>
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Nhấn để thay đổi ảnh đại diện</p>
        </section>

        {/* Basic Info */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thông tin cơ bản</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Chức danh
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chuyên viên tư vấn"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Công ty
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Công ty BĐS ABC"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* Bio */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Giới thiệu bản thân</h3>
          </div>
          <div className="p-4">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Giới thiệu ngắn về bản thân và kinh nghiệm của bạn..."
              rows={4}
              className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </section>

        {/* Working Areas */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Khu vực hoạt động</h3>
            <button
              onClick={handleAddArea}
              className="text-xs text-primary font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Thêm
            </button>
          </div>
          <div className="p-4">
            {workingAreas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {workingAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full font-medium flex items-center gap-2"
                  >
                    {area}
                    <button
                      onClick={() => handleRemoveArea(index)}
                      className="hover:text-red-500"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có khu vực nào. Nhấn &quot;Thêm&quot; để thêm khu vực hoạt động.
              </p>
            )}
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Liên kết mạng xã hội</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0068ff] text-lg">chat</span>
                  Zalo
                </span>
              </label>
              <input
                type="url"
                value={zaloLink}
                onChange={(e) => setZaloLink(e.target.value)}
                placeholder="https://zalo.me/0912345678"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1877f2] text-lg">group</span>
                  Facebook
                </span>
              </label>
              <input
                type="url"
                value={facebookLink}
                onChange={(e) => setFacebookLink(e.target.value)}
                placeholder="https://facebook.com/username"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
