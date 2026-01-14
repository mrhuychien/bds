import { PageHeader } from '@/components/shared/page-header'

export default function WatermarkPage() {
  return (
    <div>
      <PageHeader
        title="Watermark Tool"
        description="Đóng dấu ảnh BĐS"
      />

      <div className="p-4">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">Công cụ Watermark</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Tính năng đang được phát triển. Bạn sẽ có thể tải ảnh lên và thêm watermark với thông tin liên hệ của mình.
          </p>
        </div>
      </div>
    </div>
  )
}
