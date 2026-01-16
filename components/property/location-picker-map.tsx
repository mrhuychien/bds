'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LocationPickerMapProps {
  center: { lat: number; lng: number }
  marker: { lat: number; lng: number } | null
  onLocationSelect: (location: { lat: number; lng: number }) => void
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (location: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function MapCenterUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap()

  useEffect(() => {
    map.setView([center.lat, center.lng], 16)
  }, [map, center])

  return null
}

export default function LocationPickerMap({ center, marker, onLocationSelect }: LocationPickerMapProps) {
  return (
    <div className="h-[50vh]">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={marker ? 16 : 13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {marker && (
          <>
            <Marker position={[marker.lat, marker.lng]} />
            <MapCenterUpdater center={marker} />
          </>
        )}
        <MapClickHandler onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  )
}
