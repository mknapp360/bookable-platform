import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useProperties } from './hooks/useProperties'
import { PIPELINE_COLUMNS } from './types'
import type { PropertyStatus } from './types'
import { PipelineColumn } from './components/PipelineColumn'
import { PropertyCard } from './components/PropertyCard'

export function DealsPipelinePage() {
  const navigate = useNavigate()
  const { properties, loading, updateStatus, refetch } = useProperties()
  const [activeId, setActiveId] = useState<string | null>(null)

  const handlePurgeArchived = async () => {
    if (!confirm('Delete all archived properties? This cannot be undone.')) return
    const archivedIds = properties.filter(p => p.status === 'archived').map(p => p.id)
    if (archivedIds.length === 0) return
    await supabase.from('properties').delete().in('id', archivedIds)
    refetch()
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const grouped = PIPELINE_COLUMNS.map(col => ({
    ...col,
    properties: properties.filter(p => p.status === col.status),
  }))

  const activeProperty = activeId ? properties.find(p => p.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const propertyId = String(active.id)
    const newStatus = String(over.id) as PropertyStatus

    // Only update if dropping on a column (not another card)
    if (PIPELINE_COLUMNS.some(c => c.status === newStatus)) {
      const current = properties.find(p => p.id === propertyId)
      if (current && current.status !== newStatus) {
        updateStatus(propertyId, newStatus)
      }
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-gray-400">Loading pipeline...</div>
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Deals Pipeline</h1>
        <p className="text-sm text-gray-500">Drag properties between stages to update their status.</p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-3 overflow-x-auto pb-4">
          {grouped.map(col => (
            <PipelineColumn
              key={col.status}
              status={col.status}
              label={col.label}
              properties={col.properties}
              onCardClick={(id) => navigate(`/property-analysis/${id}`)}
              onArchive={(id) => updateStatus(id, 'archived')}
              onPurge={col.status === 'archived' ? handlePurgeArchived : undefined}
            />
          ))}
        </div>

        <DragOverlay>
          {activeProperty && (
            <div className="rotate-2 shadow-xl">
              <PropertyCard
                property={activeProperty}
                onClick={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
