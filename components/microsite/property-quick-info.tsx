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
    bedrooms ? { value: bedrooms.toString(), label: 'Phòng ngủ' } : null,
    bathrooms ? { value: bathrooms.toString(), label: 'Phòng tắm' } : null,
    floors ? { value: `${floors} tầng`, label: 'Số tầng' } : null,
  ].filter(Boolean).slice(0, 4)

  if (items.length === 0) return null

  return (
    <div className={`grid gap-3 ${items.length === 4 ? 'grid-cols-4' : items.length === 3 ? 'grid-cols-3' : items.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {items.map((item) => (
        item && (
          <div key={item.label} className="text-center p-3 bg-muted rounded-lg">
            <p className="text-lg font-semibold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        )
      ))}
    </div>
  )
}
