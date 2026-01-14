import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BatDongSan.Digital - Personal OS cho Môi giới BĐS',
  description: 'Quản lý kho hàng, khách hàng và tạo microsite chuyên nghiệp cho môi giới bất động sản Việt Nam',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BDS Digital',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  )
}
