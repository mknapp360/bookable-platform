import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Trash2 } from 'lucide-react'
import type { Property, PropertyStatus } from '../types'
import { PropertyCard } from './PropertyCard'

interface Props {
  status: PropertyStatus
  label: string
  properties: Property[]
  onCardClick: (id: string) => void
  onArchive: (id: string) => void
  onPurge?: () => void
}

const STATUS_COLORS: Record<PropertyStatus, string> = {
  sourced:           'bg-gray-500',
  under_review:      'bg-blue-500',
  deal_packaged:     'bg-amber-500',
  sent_to_investor:  'bg-green-500',
  completed:         'bg-emerald-600',
  archived:          'bg-slate-400',
}

export function PipelineColumn({ status, label, properties, onCardClick, onArchive, onPurge }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[260px] max-w-[260px] rounded-xl transition-colors ${
        isOver ? 'bg-blue-50' : 'bg-gray-50'
      }`}
    >
      {/* Header */}
      <div className="px-3 py-3 flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="ml-auto text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">
          {properties.length}
        </span>
        {onPurge && properties.length > 0 && (
          <button
            onClick={onPurge}
            className="text-[10px] font-medium text-red-400 hover:text-red-600 inline-flex items-center gap-0.5 transition-colors"
            title="Delete all archived properties"
          >
            <Trash2 size={10} /> Purge
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
        <SortableContext items={properties.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {properties.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              onClick={() => onCardClick(p.id)}
              onArchive={() => onArchive(p.id)}
            />
          ))}
        </SortableContext>

        {properties.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-400">
            Drop properties here
          </div>
        )}
      </div>
    </div>
  )
}
