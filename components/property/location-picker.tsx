'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

interface LocationPickerProps {
  value: { lat: number; lng: number } | null
  onChange: (location: { lat: number; lng: number } | null) => void
  address?: string
}

// Default center: Ho Chi Minh City
const DEFAULT_CENTER = { lat: 10.8231, lng: 106.6297 }
const DEFAULT_ZOOM = 13

// Lazy load the entire map component
const LazyMap = dynamic(() => import('./location-picker-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[50vh] bg-gray-100 flex items-center justify-center">
      <span className="material-symbols-outlined text-4xl text-gray-400 animate-pulse">map</span>
    </div>
  ),
})

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(value)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      // Use Nominatim for geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=vn&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newLocation = { lat: parseFloat(lat), lng: parseFloat(lon) }
        setTempLocation(newLocation)
      } else {
        alert('Không tìm thấy địa chỉ')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleConfirm = () => {
    onChange(tempLocation)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setTempLocation(null)
  }

  const openGoogleMaps = () => {
    if (value) {
      window.open(`https://www.google.com/maps?q=${value.lat},${value.lng}`, '_blank')
    }
  }

  return (
    <div className="space-y-3">
      {/* Current location display */}
      {value ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">location_on</span>
              <div>
                <p className="text-xs text-emerald-600 font-semibold">Đã định vị</p>
                <p className="text-xs text-emerald-700">{value.lat.toFixed(6)}, {value.lng.toFixed(6)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={openGoogleMaps}
                className="p-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">open_in_new</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 ml-1">Chưa định vị vị trí bất động sản</p>
      )}

      {/* Open map button */}
      <button
        type="button"
        onClick={() => {
          setTempLocation(value)
          setIsOpen(true)
        }}
        className="w-full py-3 rounded-xl bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">map</span>
        {value ? 'Thay đổi vị trí' : 'Chọn vị trí trên bản đồ'}
      </button>

      {/* Map Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center">
          <div className="bg-white w-full max-w-[430px] rounded-t-3xl overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Chọn vị trí</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Tìm địa chỉ..."
                  className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-50"
                >
                  {searching ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  ) : (
                    <span className="material-symbols-outlined text-lg">search</span>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Nhấn vào bản đồ để chọn vị trí hoặc tìm kiếm địa chỉ</p>
            </div>

            {/* Map */}
            <LazyMap
              center={tempLocation || DEFAULT_CENTER}
              marker={tempLocation}
              onLocationSelect={setTempLocation}
            />

            {/* Coordinates display */}
            {tempLocation && (
              <div className="px-4 py-3 bg-gray-50 border-t">
                <p className="text-xs text-slate-600 text-center">
                  Tọa độ: <span className="font-mono font-semibold">{tempLocation.lat.toFixed(6)}, {tempLocation.lng.toFixed(6)}</span>
                </p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 border-t flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-slate-600 font-semibold text-sm"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!tempLocation}
                className="flex-[2] py-3 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">check</span>
                Xác nhận vị trí
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
