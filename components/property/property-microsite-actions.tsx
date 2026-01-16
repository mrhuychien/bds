'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface PropertyMicrositeActionsProps {
  propertyId: string
  slug: string | null
  isPublic: boolean
  views: number
}

export function PropertyMicrositeActions({
  propertyId,
  slug,
  isPublic: initialIsPublic,
  views,
}: PropertyMicrositeActionsProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const micrositeUrl = slug ? `${appUrl}/p/${slug}` : null

  const handleTogglePublic = async () => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await (supabase.from('properties') as any)
      .update({ is_public: !isPublic })
      .eq('id', propertyId)

    if (!error) {
      setIsPublic(!isPublic)
    }
    setLoading(false)
  }

  const handleCopyLink = async () => {
    if (!micrositeUrl) return

    try {
      await navigator.clipboard.writeText(micrositeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    if (!micrositeUrl) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bất động sản',
          url: micrositeUrl,
        })
      } catch (err) {
        // User cancelled or error
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Landing Page</h3>
        <button
          onClick={handleTogglePublic}
          disabled={loading}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            isPublic
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          } ${loading ? 'opacity-50' : 'cursor-pointer hover:opacity-80'}`}
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              Đang xử lý...
            </span>
          ) : isPublic ? (
            '✓ Đã công khai'
          ) : (
            'Chưa công khai'
          )}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">visibility</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{views}</p>
              <p className="text-xs text-muted-foreground">Lượt xem</p>
            </div>
          </div>
        </div>

        {/* Link */}
        {slug && (
          <div className="bg-muted rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Link landing page:</p>
            <code className="text-xs break-all text-primary">{micrositeUrl}</code>
          </div>
        )}

        {/* Action Buttons */}
        {isPublic && slug && (
          <div className="flex gap-2">
            <Link
              href={`/p/${slug}`}
              target="_blank"
              className="flex-1 h-11 rounded-xl bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">open_in_new</span>
              Xem trang
            </Link>
            <button
              onClick={handleShare}
              className="flex-1 h-11 rounded-xl bg-accent text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">
                {copied ? 'check' : 'share'}
              </span>
              {copied ? 'Đã sao chép!' : 'Chia sẻ'}
            </button>
          </div>
        )}

        {!isPublic && (
          <p className="text-xs text-muted-foreground text-center">
            Bật công khai để chia sẻ landing page với khách hàng
          </p>
        )}
      </div>
    </section>
  )
}
