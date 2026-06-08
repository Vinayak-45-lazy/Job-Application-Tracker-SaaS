import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { JobApplication, JobApplicationStatus } from '@/types'
import KanbanCard from './KanbanCard'

interface KanbanColumnProps {
  id: JobApplicationStatus
  title: string
  applications: JobApplication[]
  onCardClick: (app: JobApplication) => void
}

export default function KanbanColumn({
  id,
  title,
  applications,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  })

  const getHeaderBg = (status: JobApplicationStatus) => {
    switch (status) {
      case 'saved': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'applied': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'interview': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'offer': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getBulletBg = (status: JobApplicationStatus) => {
    switch (status) {
      case 'saved': return 'bg-slate-500'
      case 'applied': return 'bg-blue-500'
      case 'interview': return 'bg-amber-500'
      case 'offer': return 'bg-emerald-500'
      case 'rejected': return 'bg-rose-500'
      default: return 'bg-slate-500'
    }
  }

  return (
    <div className="flex flex-col flex-1 min-w-[260px] bg-slate-950/20 border border-slate-900/60 rounded-xl p-4 h-[calc(100vh-14rem)]">
      {/* Column Header */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-lg border mb-4 font-semibold text-xs capitalize ${getHeaderBg(id)}`}>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${getBulletBg(id)}`} />
          <span>{title}</span>
        </div>
        <span className="bg-slate-900/60 px-2 py-0.5 rounded-full font-bold">
          {applications.length}
        </span>
      </div>

      {/* Cards List container */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1"
      >
        <SortableContext
          items={applications.map((app) => app.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.length === 0 ? (
            <div className="border border-dashed border-slate-900/30 rounded-lg p-8 text-center text-xs text-slate-600">
              Empty column
            </div>
          ) : (
            applications.map((app) => (
              <KanbanCard
                key={app.id}
                application={app}
                onClick={onCardClick}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
