'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

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

        setProfile(data as Profile | null)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center size-10 rounded-full hover:bg-muted transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Cá nhân & Cài đặt</h1>
        </div>
        <button className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="px-4 space-y-6">
        {/* Profile Header */}
        <section className="mt-4 p-5 bg-card rounded-xl shadow-sm border border-border flex items-center gap-4">
          <div className="relative">
            <div className="size-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/20">
              <span className="material-symbols-outlined text-4xl text-primary">person</span>
            </div>
            <Link
              href="/settings/edit"
              className="absolute bottom-0 right-0 size-6 bg-primary rounded-full border-2 border-background flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[14px] text-white">edit</span>
            </Link>
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-tight">{profile?.full_name || 'Chưa cập nhật'}</h2>
            <p className="text-sm text-muted-foreground font-medium">{profile?.title || 'Chuyên viên tư vấn'}</p>
            <div className="flex items-center mt-1 gap-1">
              <span className="material-symbols-outlined text-sm text-primary">verified</span>
              <span className="text-xs text-primary font-semibold">Batdongsan.digital</span>
            </div>
          </div>
        </section>

        {/* Account & Brand Section */}
        <div className="space-y-2">
          <h3 className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tài khoản & Thương hiệu</h3>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Microsite Config */}
            <Link
              href="/settings/microsite"
              className="flex items-center gap-4 px-4 min-h-[64px] hover:bg-muted/50 transition-colors group"
            >
              <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">public</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold">Cấu hình Microsite</p>
                <p className="text-xs text-muted-foreground">Quản lý trang cá nhân của bạn</p>
              </div>
              <span className="material-symbols-outlined text-muted-foreground/50 group-hover:text-primary transition-colors">chevron_right</span>
            </Link>

            <div className="h-px bg-border mx-4"></div>

            {/* Member Pack */}
            <Link
              href="/settings/membership"
              className="flex items-center gap-4 px-4 min-h-[64px] hover:bg-muted/50 transition-colors group"
            >
              <div className="size-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined">workspace_premium</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold">Gói thành viên</p>
                <p className="text-xs text-amber-600/80 font-medium">Gói Free - Nâng cấp ngay</p>
              </div>
              <span className="material-symbols-outlined text-muted-foreground/50 group-hover:text-amber-600 transition-colors">chevron_right</span>
            </Link>
          </div>
        </div>

        {/* System Settings Section */}
        <div className="space-y-2">
          <h3 className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Cài đặt hệ thống</h3>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-4 px-4 min-h-[64px]">
              <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined">dark_mode</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold">Chế độ tối</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="h-px bg-border mx-4"></div>

            {/* Watermark Tool */}
            <Link
              href="/tools/watermark"
              className="flex items-center gap-4 px-4 min-h-[64px] hover:bg-muted/50 transition-colors group"
            >
              <div className="size-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-accent flex items-center justify-center">
                <span className="material-symbols-outlined">photo_camera</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold">Đóng dấu ảnh</p>
                <p className="text-xs text-muted-foreground">Thêm watermark cho ảnh BĐS</p>
              </div>
              <span className="material-symbols-outlined text-muted-foreground/50 group-hover:text-accent transition-colors">chevron_right</span>
            </Link>

            <div className="h-px bg-border mx-4"></div>

            {/* Instructions */}
            <Link
              href="/settings/guide"
              className="flex items-center gap-4 px-4 min-h-[64px] hover:bg-muted/50 transition-colors group"
            >
              <div className="size-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold">Hướng dẫn sử dụng</p>
              </div>
              <span className="material-symbols-outlined text-muted-foreground/50 group-hover:text-emerald-600 transition-colors">chevron_right</span>
            </Link>

            <div className="h-px bg-border mx-4"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 min-h-[64px] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <div className="size-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px] font-semibold text-red-500">Đăng xuất</p>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="pt-4 pb-8 text-center">
          <p className="text-xs text-muted-foreground font-medium tracking-wide">BATDONGSAN.DIGITAL VERSION 2.4.0</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase">Made for Real Estate Professionals</p>
        </div>
      </main>
    </div>
  )
}
