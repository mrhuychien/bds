import { formatArea } from '@/lib/utils/format'

interface PropertyQuickInfoProps {
  area?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  floors?: number | null
}

export function PropertyQuickInfo({ area, bedrooms, bathrooms, floors }: PropertyQuickInfoProps) {
  const items = [
    area ? { value: formatArea(area), label: 'Diện tích' } : null,
    bedrooms ? { value: `0${bedrooms}`, label: 'Phòng ngủ' } : null,
    floors ? { value: `0${floors} Tầng`, label: 'Tầng cao' } : null,
  ].filter(Boolean).slice(0, 3)

  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        item && (
          <div key={item.label} className="bg-card p-3 rounded-xl border border-border shadow-sm">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
            <p className="font-bold">{item.value}</p>
          </div>
        )
      ))}
    </div>
  )
}
