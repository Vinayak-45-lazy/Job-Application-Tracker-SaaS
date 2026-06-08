import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { JobApplication } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Calendar, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface KanbanCardProps {
  application: JobApplication
  onClick: (app: JobApplication) => void
}

export default function KanbanCard({ application, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: {
      type: 'Application',
      application,
    },
  })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  // Prevent drag listeners from blocking clicks
  const handleCardClick = (e: React.MouseEvent) => {
    // If dragging didn't occur, trigger onClick
    onClick(application)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className="outline-none select-none"
    >
      <Card className="bg-slate-900/40 border-slate-900 hover:border-slate-800 cursor-grab active:cursor-grabbing shadow-md group transition-all duration-200">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
              {application.company_name}
            </span>
            <span className="text-sm font-bold text-slate-200 group-hover:text-violet-400 transition-colors truncate">
              {application.job_title}
            </span>
            {application.location && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                <MapPin className="h-3 w-3 text-slate-600 shrink-0" />
                {application.location}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-950/60">
            <span className="text-slate-500 flex items-center gap-1 shrink-0">
              <Calendar className="h-3 w-3 text-slate-600 shrink-0" />
              {application.applied_date
                ? format(new Date(application.applied_date), 'MMM d')
                : 'Saved'}
            </span>

            {application.ai_match_score !== null && (
              <Badge variant="outline" className="bg-violet-500/10 border-violet-500/20 text-violet-400 font-semibold text-[10px] gap-1 px-1.5 py-0 shrink-0">
                <Sparkles className="h-2.5 w-2.5" />
                {application.ai_match_score}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
