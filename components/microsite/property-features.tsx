// Feature icon mapping
const featureIcons: Record<string, string> = {
  'Hồ bơi': 'pool',
  'Có hồ bơi': 'pool',
  'Phòng Gym': 'fitness_center',
  'Gym': 'fitness_center',
  'Công viên': 'park',
  'Gần công viên': 'park',
  'Bệnh viện': 'local_hospital',
  'Gần bệnh viện': 'local_hospital',
  'Trường học': 'school',
  'Gần trường học': 'school',
  'Siêu thị': 'shopping_cart',
  'Gần chợ': 'storefront',
  'An ninh 24/7': 'security',
  'View sông': 'water',
  'View thành phố': 'location_city',
  'Có thang máy': 'elevator',
  'Có hầm để xe': 'garage',
  'Có sân vườn': 'yard',
  'Nội thất cao cấp': 'chair',
  'Nội thất cơ bản': 'weekend',
  'Nhà trống': 'home',
  'Hẻm xe hơi': 'directions_car',
  'Mặt tiền': 'storefront',
}

interface PropertyFeaturesProps {
  features: string[]
}

export function PropertyFeatures({ features }: PropertyFeaturesProps) {
  if (!features || features.length === 0) return null

  return (
    <section className="mb-8">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg font-bold">Tiện ích khu vực</h3>
        <button className="text-xs text-primary font-bold">Tất cả</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {features.slice(0, 8).map((feature, index) => {
          const icon = featureIcons[feature] || 'check_circle'
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="size-12 flex items-center justify-center bg-card rounded-xl shadow-sm border border-border">
                <span className="material-symbols-outlined text-primary">{icon}</span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground text-center line-clamp-2">{feature}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
