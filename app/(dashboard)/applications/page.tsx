'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import ApplicationForm from '@/components/applications/ApplicationForm'
import { JobApplication } from '@/types'

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (err) {
      console.error('Error fetching applications', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleCardClick = (app: JobApplication) => {
    router.push(`/applications/${app.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Applications Board</h2>
          <p className="text-slate-400 text-sm mt-1">
            Drag-and-drop to adjust statuses or click to inspect details.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/25 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </DialogTrigger>
          <DialogContent className="bg-slate-950 border-slate-900 text-slate-100 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                New Application
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Log the position details to start tracking.
              </DialogDescription>
            </DialogHeader>
            <ApplicationForm
              onSuccess={() => {
                setIsDialogOpen(false)
                setLoading(true)
                fetchApplications()
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-900/40 animate-pulse rounded-xl h-[calc(100vh-14rem)]" />
          ))}
        </div>
      ) : (
        <KanbanBoard
          applications={applications}
          onCardClick={handleCardClick}
          onUpdate={fetchApplications}
        />
      )}
    </div>
  )
}
