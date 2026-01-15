'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils/format'
import type { Property, Profile } from '@/types/database'

export default function MicrositeConfigPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData as Profile)
      }

      // Load properties
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (propertiesData) {
        setProperties(propertiesData as Property[])
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const togglePublic = async (propertyId: string, currentStatus: boolean) => {
    const supabase = createClient()

    const { error } = await (supabase.from('properties') as any)
      .update({ is_public: !currentStatus })
      .eq('id', propertyId)

    if (!error) {
      setProperties(properties.map(p =>
        p.id === propertyId ? { ...p, is_public: !currentStatus } : p
      ))
    }
  }

  const copyLink = async (slug: string) => {
    const link = `${baseUrl}/p/${slug}`
    await navigator.clipboard.writeText(link)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const publicProperties = properties.filter(p => p.is_public)
  const totalViews = properties.reduce((sum, p) => sum + (p.microsite_views || 0), 0)

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
            <h1 className="font-bold text-lg">Cấu hình Microsite</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">public</span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Đã công khai</span>
            </div>
            <p className="text-3xl font-bold text-primary">{publicProperties.length}</p>
            <p className="text-xs text-muted-foreground">/ {properties.length} BĐS</p>
          </div>

          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-4 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-accent">visibility</span>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Tổng lượt xem</span>
            </div>
            <p className="text-3xl font-bold text-accent">{totalViews}</p>
            <p className="text-xs text-muted-foreground">lượt truy cập</p>
          </div>
        </section>

        {/* Profile Preview */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thông tin môi giới</h3>
            <Link href="/settings/edit" className="text-xs text-primary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">edit</span>
              Sửa
            </Link>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/20">
                <span className="material-symbols-outlined text-3xl text-primary">person</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">{profile?.full_name || 'Chưa cập nhật'}</h4>
                <p className="text-sm text-muted-foreground">{profile?.title || 'Chuyên viên tư vấn'}</p>
                <p className="text-sm text-primary font-medium">{profile?.phone || 'Chưa có SĐT'}</p>
              </div>
            </div>
            {(!profile?.full_name || !profile?.phone) && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  Vui lòng cập nhật đầy đủ thông tin cá nhân để hiển thị trên microsite
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Properties List */}
        <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quản lý BĐS công khai</h3>
          </div>

          {properties.length > 0 ? (
            <div className="divide-y divide-border">
              {properties.map((property) => (
                <div key={property.id} className="p-4">
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {property.thumbnail_url ? (
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url('${property.thumbnail_url}')` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-muted-foreground">image</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1">{property.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {property.district || 'Chưa có địa chỉ'}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {formatPrice(property.price)}
                      </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex flex-col items-end gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={property.is_public}
                          onChange={() => togglePublic(property.id, property.is_public)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <span className={`text-[10px] font-semibold ${property.is_public ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {property.is_public ? 'Công khai' : 'Riêng tư'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {property.is_public && property.slug && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => copyLink(property.slug!)}
                        className="flex-1 h-9 rounded-lg bg-muted text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {copiedSlug === property.slug ? 'check' : 'content_copy'}
                        </span>
                        {copiedSlug === property.slug ? 'Đã sao chép!' : 'Sao chép link'}
                      </button>
                      <Link
                        href={`/p/${property.slug}`}
                        target="_blank"
                        className="h-9 px-4 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        Xem
                      </Link>
                    </div>
                  )}

                  {/* Views count */}
                  {property.is_public && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      <span>{property.microsite_views || 0} lượt xem</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-muted-foreground/50 mb-3">home</span>
              <p className="text-muted-foreground">Chưa có BĐS nào</p>
              <Link
                href="/inventory/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm BĐS mới
              </Link>
            </div>
          )}
        </section>

        {/* Tips */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-indigo-600">tips_and_updates</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600">Mẹo sử dụng</h3>
          </div>
          <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[14px] mt-0.5">check_circle</span>
              Công khai BĐS để tạo link chia sẻ chuyên nghiệp
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[14px] mt-0.5">check_circle</span>
              Thông tin của bạn sẽ hiển thị ở cuối trang microsite
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[14px] mt-0.5">check_circle</span>
              Thêm hình ảnh chất lượng cao để thu hút khách hàng
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
