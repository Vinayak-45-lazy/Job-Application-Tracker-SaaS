'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BriefcaseBusiness,
  CalendarDays,
  Sparkles,
  Trophy,
  Plus,
  TrendingUp,
  MapPin,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import ApplicationForm from '@/components/applications/ApplicationForm'
import { JobApplication, Interview } from '@/types'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchData = async () => {
    try {
      const [appRes, intRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/interviews'),
      ])
      if (appRes.ok && intRes.ok) {
        const appData = await appRes.json()
        const intData = await intRes.json()
        setApplications(appData)
        setInterviews(intData)
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const totalApps = applications.length
  const scheduledInterviews = interviews.filter(
    (i) => i.interview_date && new Date(i.interview_date) >= new Date()
  ).length
  const offersCount = applications.filter((a) => a.status === 'offer').length
  const successRate = totalApps > 0 ? Math.round((offersCount / totalApps) * 100) : 0
  const recentApps = applications.slice(0, 5)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saved': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'applied': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'interview': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'offer': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Overview</h2>
          <p className="text-slate-400 text-sm mt-1">Quick summaries of active applications and interviews.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/25 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add Job
          </DialogTrigger>
          <DialogContent className="bg-slate-950 border-slate-900 text-slate-100 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Job Application</DialogTitle>
              <DialogDescription className="text-slate-400">Log the company, role, status and uploads.</DialogDescription>
            </DialogHeader>
            <ApplicationForm
              onSuccess={() => { setIsDialogOpen(false); setLoading(true); fetchData() }}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900/20 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Applications</span>
            <BriefcaseBusiness className="h-4 w-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{totalApps}</div>
            <p className="text-xs text-slate-500 mt-1">Submitted in total</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/20 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Interviews Scheduled</span>
            <CalendarDays className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{scheduledInterviews}</div>
            <p className="text-xs text-slate-500 mt-1">Upcoming events</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/20 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Offers Received</span>
            <Trophy className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{offersCount}</div>
            <p className="text-xs text-slate-500 mt-1">Landed roles</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/20 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Success Rate</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white">{successRate}%</div>
            <p className="text-xs text-slate-500 mt-1">Offers / Total apps</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-slate-900/20 border-slate-900/60">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900/60 pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-white">Recent Applications</CardTitle>
              <CardDescription className="text-slate-400 text-xs">Your last 5 logged roles</CardDescription>
            </div>
            <Link href="/applications" className={`${buttonVariants({ variant: 'ghost', size: 'sm' })} text-xs text-violet-400`}>
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            {recentApps.length === 0 ? (
              <div className="text-center py-12 px-6">
                <BriefcaseBusiness className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-medium text-sm">No applications found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900">
                {recentApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-900/20 group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-800">
                        {app.company_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <Link href={`/applications/${app.id}`} className="text-sm font-semibold text-slate-200 hover:text-violet-400">
                          {app.job_title}
                        </Link>
                        <span className="text-xs text-slate-500">{app.company_name}{app.location && ` • ${app.location}`}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {app.ai_match_score !== null && (
                        <span className="text-xs text-violet-400 font-semibold bg-violet-500/10 px-2 py-0.5 rounded">
                          {app.ai_match_score}% Match
                        </span>
                      )}
                      <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(app.status))}>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-900/20 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                AI Optimization Tip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>Use the <strong>AI Resume Scorer</strong> to check which keywords you are missing.</p>
              <Link href="/ai-scorer" className={`${buttonVariants({ variant: 'outline', size: 'sm' })} w-full flex items-center justify-center gap-2`}>
                Analyze Resume <ExternalLink className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/20 border-slate-900/60">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {interviews.filter(i => i.interview_date && new Date(i.interview_date) >= new Date()).length === 0 ? (
                <div className="text-center py-6">
                  <CalendarDays className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">No upcoming interviews scheduled.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {interviews
                    .filter(i => i.interview_date && new Date(i.interview_date) >= new Date())
                    .slice(0, 3)
                    .map((int) => {
                      const app = applications.find(a => a.id === int.application_id)
                      return (
                        <div key={int.id} className="p-3 bg-slate-950/60 border border-slate-900 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-200 text-xs capitalize">{int.interview_type} Round</span>
                            <span className="text-[10px] text-slate-500">
                              {int.interview_date ? new Date(int.interview_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                            </span>
                          </div>
                          <span className="text-slate-400 text-sm">{app?.job_title || 'Role'}</span>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
