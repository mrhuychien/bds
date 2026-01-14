interface MicrositeHeroProps {
  thumbnailUrl: string | null
  title: string
  images?: string[]
}

export function MicrositeHero({ thumbnailUrl, title, images }: MicrositeHeroProps) {
  const displayImage = thumbnailUrl || images?.[0]

  return (
    <div className="aspect-video bg-muted relative">
      {displayImage ? (
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      {images && images.length > 1 && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
          +{images.length - 1} ảnh
        </div>
      )}
    </div>
  )
}
