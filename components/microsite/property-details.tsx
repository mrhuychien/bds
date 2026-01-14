import { DIRECTIONS, LEGAL_STATUS } from '@/lib/constants'

interface PropertyDetailsProps {
  district?: string | null
  street?: string | null
  floors?: number | null
  frontage?: number | null
  direction?: string | null
  legalStatus?: string | null
}

export function PropertyDetails({
  district,
  street,
  floors,
  frontage,
  direction,
  legalStatus,
}: PropertyDetailsProps) {
  const directionLabel = direction ? DIRECTIONS[direction as keyof typeof DIRECTIONS] : null
  const legalLabel = legalStatus ? LEGAL_STATUS[legalStatus as keyof typeof LEGAL_STATUS] : null

  const details = [
    district ? { label: 'Khu vực', value: `${district}${street ? `, ${street}` : ''}` } : null,
    floors ? { label: 'Số tầng', value: `${floors} tầng` } : null,
    frontage ? { label: 'Mặt tiền', value: `${frontage}m` } : null,
    directionLabel ? { label: 'Hướng', value: directionLabel } : null,
    legalLabel ? { label: 'Pháp lý', value: legalLabel } : null,
  ].filter(Boolean)

  if (details.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Thông tin chi tiết</h2>
      <div className="bg-card border rounded-lg divide-y text-sm">
        {details.map((detail) => (
          detail && (
            <div key={detail.label} className="p-3 flex justify-between">
              <span className="text-muted-foreground">{detail.label}</span>
              <span>{detail.value}</span>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
