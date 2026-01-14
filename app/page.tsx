import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">
          BatDongSan.Digital
        </h1>
        <p className="text-muted-foreground">
          Personal OS cho Môi giới BĐS Việt Nam
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </div>
    </main>
  )
}
