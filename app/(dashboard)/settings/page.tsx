'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { HCM_DISTRICTS } from '@/lib/constants'
import type { Profile } from '@/types/database'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

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

        setProfile(data)
      }
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.get('full_name') as string,
          phone: formData.get('phone') as string,
          company_name: formData.get('company_name') as string || null,
          title: formData.get('title') as string || null,
          bio: formData.get('bio') as string || null,
          zalo_link: formData.get('zalo_link') as string || null,
          facebook_link: formData.get('facebook_link') as string || null,
          working_areas: formData.getAll('working_areas') as string[],
        })
        .eq('id', profile.id)

      if (error) throw error

      // Reload profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single()

      setProfile(data)
      setEditing(false)
    } catch (error) {
      console.error('Save error:', error)
      alert('Không thể lưu thông tin')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Cài đặt" />
        <div className="p-4 text-center text-muted-foreground">
          Đang tải...
        </div>
      </div>
    )
  }

  return (
    <div className="pb-6">
      <PageHeader
        title="Cài đặt"
        action={
          !editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-primary"
            >
              Chỉnh sửa
            </button>
          )
        }
      />

      {editing ? (
        <form onSubmit={handleSave} className="p-4 space-y-6">
          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Thông tin cơ bản
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Họ tên *</label>
              <input
                name="full_name"
                type="text"
                required
                defaultValue={profile?.full_name}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Số điện thoại *</label>
              <input
                name="phone"
                type="tel"
                required
                defaultValue={profile?.phone}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-3 py-2 border rounded-md text-sm bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
            </div>
          </section>

          {/* Professional Info */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Thông tin nghề nghiệp
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Công ty/Sàn</label>
              <input
                name="company_name"
                type="text"
                defaultValue={profile?.company_name || ''}
                placeholder="VD: Sàn BĐS ABC"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chức danh</label>
              <input
                name="title"
                type="text"
                defaultValue={profile?.title || ''}
                placeholder="VD: Chuyên viên tư vấn BĐS"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Giới thiệu bản thân</label>
              <textarea
                name="bio"
                rows={3}
                defaultValue={profile?.bio || ''}
                placeholder="Viết vài dòng về bạn..."
                className="w-full px-3 py-2 border rounded-md text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Khu vực hoạt động</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {HCM_DISTRICTS.slice(0, 15).map((district) => (
                  <label key={district} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      name="working_areas"
                      value={district}
                      defaultChecked={profile?.working_areas?.includes(district)}
                      className="rounded"
                    />
                    <span className="text-sm">{district}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Liên kết mạng xã hội
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zalo</label>
              <input
                name="zalo_link"
                type="url"
                defaultValue={profile?.zalo_link || ''}
                placeholder="https://zalo.me/..."
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Facebook</label>
              <input
                name="facebook_link"
                type="url"
                defaultValue={profile?.facebook_link || ''}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 py-2.5 px-4 border rounded-md text-sm font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 space-y-6">
          {/* Profile Section */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Thông tin cá nhân
            </h2>
            <div className="bg-card border rounded-lg divide-y">
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm">Họ tên</span>
                <span className="text-sm text-muted-foreground">{profile?.full_name || '-'}</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm">Số điện thoại</span>
                <span className="text-sm text-muted-foreground">{profile?.phone || '-'}</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm">Email</span>
                <span className="text-sm text-muted-foreground">{profile?.email || '-'}</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm">Công ty</span>
                <span className="text-sm text-muted-foreground">{profile?.company_name || '-'}</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm">Chức danh</span>
                <span className="text-sm text-muted-foreground">{profile?.title || '-'}</span>
              </div>
            </div>
          </section>

          {/* Working Areas */}
          {profile?.working_areas && profile.working_areas.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Khu vực hoạt động
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.working_areas.map((area) => (
                  <span key={area} className="px-2 py-1 bg-muted rounded text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Watermark Settings */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Công cụ
            </h2>
            <Link
              href="/tools/watermark"
              className="flex items-center justify-between bg-card border rounded-lg p-3 hover:bg-muted/50"
            >
              <div>
                <p className="font-medium text-sm">Watermark Tool</p>
                <p className="text-xs text-muted-foreground">
                  Đóng dấu ảnh BĐS với thông tin liên hệ
                </p>
              </div>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </section>

          {/* Account */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Tài khoản
            </h2>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 border border-destructive text-destructive rounded-md text-sm font-medium hover:bg-destructive/10"
            >
              Đăng xuất
            </button>
          </section>

          {/* App Info */}
          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>BatDongSan.Digital v0.1.0</p>
            <p>Personal OS cho Môi giới BĐS</p>
          </div>
        </div>
      )}
    </div>
  )
}
