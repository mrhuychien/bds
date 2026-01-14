interface PropertyFeaturesProps {
  features: string[]
}

export function PropertyFeatures({ features }: PropertyFeaturesProps) {
  if (!features || features.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Tiện ích</h2>
      <div className="flex flex-wrap gap-2">
        {features.map((feature, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-muted text-sm rounded"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  )
}
