'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import type { Profile } from '@/types/database'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

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
    <div>
      <PageHeader title="Cài đặt" />

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
          </div>
        </section>

        {/* Watermark Settings */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Cài đặt Watermark
          </h2>
          <div className="bg-card border rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              Tùy chỉnh watermark mặc định cho ảnh BĐS của bạn.
            </p>
            <button className="mt-2 text-sm text-primary hover:underline">
              Chỉnh sửa watermark
            </button>
          </div>
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
    </div>
  )
}
