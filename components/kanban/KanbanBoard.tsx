import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from '@dnd-kit/core'
import { JobApplication, JobApplicationStatus } from '@/types'
import KanbanColumn from './KanbanColumn'
import { toast } from 'sonner'

interface KanbanBoardProps {
  applications: JobApplication[]
  onCardClick: (app: JobApplication) => void
  onUpdate: () => void
}

const COLUMNS: { id: JobApplicationStatus; title: string }[] = [
  { id: 'saved', title: 'Saved' },
  { id: 'applied', title: 'Applied' },
  { id: 'interview', title: 'Interviewing' },
  { id: 'offer', title: 'Offers' },
  { id: 'rejected', title: 'Rejected' },
]

export default function KanbanBoard({
  applications,
  onCardClick,
  onUpdate,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag starts only after moving 8 pixels (allows clicking without dragging)
      },
    })
  )

  const [localApps, setLocalApps] = useState<JobApplication[]>(applications)

  useEffect(() => {
    setLocalApps(applications)
  }, [applications])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const appId = active.id as string
    const newStatus = over.id as JobApplicationStatus

    const app = localApps.find((a) => a.id === appId)
    if (!app) return

    if (app.status === newStatus) return

    // Optimistic UI Update
    const updatedApps = localApps.map((a) =>
      a.id === appId ? { ...a, status: newStatus } : a
    )
    setLocalApps(updatedApps)

    try {
      const response = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success(`Moved ${app.company_name} to ${newStatus}`)
      onUpdate()
    } catch (err: any) {
      toast.error('Failed to update status on database')
      // Rollback
      setLocalApps(applications)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 items-start select-none">
        {COLUMNS.map((col) => {
          const colApps = localApps.filter((app) => app.status === col.id)
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              applications={colApps}
              onCardClick={onCardClick}
            />
          )
        })}
      </div>
    </DndContext>
  )
}
