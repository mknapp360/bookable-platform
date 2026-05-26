import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TrendingDown, RotateCcw, Clock } from 'lucide-react'
import type { Property } from '../types'
import { formatPrice } from '../types'

interface Props {
  property: Property
  onClick: () => void
}

export function PropertyCard({ property, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: property.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors"
    >
      {/* Thumbnail */}
      {property.images?.[0] && (
        <img
          src={property.images[0]}
          alt=""
          className="w-full h-24 rounded object-cover mb-2"
        />
      )}

      {/* Address */}
      <p className="text-sm font-medium text-gray-900 leading-tight truncate">
        {property.address}
      </p>
      {property.postcode && (
        <p className="text-xs text-gray-400 mt-0.5">{property.postcode}</p>
      )}

      {/* Price + beds */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-bold text-gray-900">
          {formatPrice(property.price)}
        </span>
        {property.bedrooms && (
          <span className="text-xs text-gray-500">{property.bedrooms} bed</span>
        )}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {property.price_reduced && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600">
            <TrendingDown size={10} /> Reduced
          </span>
        )}
        {property.back_on_market && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600">
            <RotateCcw size={10} /> Back
          </span>
        )}
        {(property.days_listed ?? 0) >= 90 && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-600">
            <Clock size={10} /> {property.days_listed}d
          </span>
        )}
        {property.property_type && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 capitalize">
            {property.property_type}
          </span>
        )}
      </div>
    </div>
  )
}
