'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      // Use env variable for production, fallback to window.location.origin for dev
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Kiểm tra email</h1>
          <p className="text-sm text-muted-foreground">
            Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p>Không nhận được email?</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Kiểm tra thư mục spam</li>
            <li>Đảm bảo email đã đăng ký đúng</li>
            <li>
              <button
                onClick={() => setSuccess(false)}
                className="text-primary hover:underline"
              >
                Thử lại với email khác
              </button>
            </li>
          </ul>
        </div>

        <Link
          href="/login"
          className="block w-full py-2.5 px-4 text-center border rounded-md text-sm font-medium hover:bg-muted transition-colors"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
        <p className="text-sm text-muted-foreground">
          Nhập email để nhận link đặt lại mật khẩu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Nhớ mật khẩu?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
