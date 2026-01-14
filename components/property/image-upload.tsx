'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string[]
  onChange?: (urls: string[]) => void
  maxFiles?: number
  propertyId?: string
  className?: string
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  propertyId,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxFiles - value.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) return

    setUploading(true)
    const newUrls: string[] = []

    for (const file of filesToUpload) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        if (propertyId) {
          formData.append('propertyId', propertyId)
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        if (data.success && data.url) {
          newUrls.push(data.url)
        }
      } catch (error) {
        console.error('Upload error:', error)
      }
    }

    if (newUrls.length > 0) {
      onChange?.([...value, ...newUrls])
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [value, maxFiles, propertyId, onChange])

  const handleRemove = useCallback((index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange?.(newUrls)
  }, [value, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  return (
    <div className={cn('space-y-3', className)}>
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                  Ảnh đại diện
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.length < maxFiles && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'hover:border-primary',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Đang tải lên...</p>
            </div>
          ) : (
            <>
              <svg className="w-8 h-8 mx-auto text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm font-medium">Thêm ảnh</p>
              <p className="text-xs text-muted-foreground mt-1">
                {value.length}/{maxFiles} ảnh
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
