'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  Calendar,
  MapPin,
  ExternalLink,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  FileText,
  Loader2,
  Clock,
  CheckCircle,
  HelpCircle,
  FileCheck,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ApplicationForm from '@/components/applications/ApplicationForm'
import { JobApplication, Interview, InterviewType } from '@/types'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)

  const [app, setApp] = useState<JobApplication | null>(null)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)

  // Dialog configurations
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isInterviewOpen, setIsInterviewOpen] = useState(false)
  const openInterviewDialog = () => {
    setIntDate(getDefaultDateTime())
    setIntNotes('')
    setIntType('phone')
    setIsInterviewOpen(true)
  }
  // Interview form state
  const getDefaultDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }
  const [intDate, setIntDate] = useState(getDefaultDateTime)
  const [intType, setIntType] = useState<InterviewType>('phone')
  const [intNotes, setIntNotes] = useState('')
  const [intSaving, setIntSaving] = useState(false)

  const fetchApplicationData = async () => {
    try {
      const [appRes, intRes] = await Promise.all([
        fetch(`/api/applications/${id}`),
        fetch(`/api/interviews?applicationId=${id}`),
      ])

      if (appRes.ok && intRes.ok) {
        const appData = await appRes.json()
        const intData = await intRes.json()
        setApp(appData)
        setInterviews(intData)
      } else {
        toast.error('Failed to load application details')
        router.push('/applications')
      }
    } catch (err) {
      console.error('Error fetching details', err)
      toast.error('Server error fetching details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplicationData()
  }, [id])

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Application deleted successfully')
        router.push('/applications')
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete application')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete application')
    } finally {
      setIsDeleteOpen(false)
    }
  }

  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!intDate) {
      toast.error('Please pick a date & time')
      return
    }

    setIntSaving(true)
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: id,
          interview_date: intDate,
          interview_type: intType,
          notes: intNotes,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || 'Failed to add interview')
      }

      toast.success('Interview scheduled successfully!')
      setIsInterviewOpen(false)
      setIntDate('')
      setIntNotes('')
      fetchApplicationData() // refresh application & interviews
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule interview')
    } finally {
      setIntSaving(false)
    }
  }

  const runAiAnalysis = async () => {
    if (!app?.resume_url) {
      toast.error('Please upload a resume first by editing the application.')
      return
    }
    if (!app?.job_description) {
      toast.error('Please add a job description first by editing the application.')
      return
    }

    setAiLoading(true)
    try {
      toast.info('Running resume parser and Groq matching AI...')
      const res = await fetch(`/api/applications/${id}`, {
        method: 'POST', // Trigger server-side analysis
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || 'Failed to analyze resume')
      }

      toast.success('AI resume analysis complete!')
      setApp(result)
    } catch (err: any) {
      toast.error(err.message || 'Error running AI analysis')
    } finally {
      setAiLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        <span className="text-sm text-slate-400">Fetching application info...</span>
      </div>
    )
  }

  if (!app) return null

  // Circular progress calculations for AI Match Score
  const score = app.ai_match_score || 0
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="space-y-6">
      {/* Header breadcrumb & actions */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/applications"
            className={`${buttonVariants({ variant: 'ghost', size: 'icon' })} text-slate-400 hover:text-white flex items-center justify-center`}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">{app.job_title}</h2>
              <Badge variant="outline" className={cn("text-xs font-semibold capitalize", getStatusColor(app.status))}>
                {app.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1">{app.company_name} {app.location && `• ${app.location}`}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-slate-800 hover:bg-slate-900 text-slate-300"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Grid: Details (Left) & AI Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Details & Interview Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/20 border-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-white">Application Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 block">Salary Range</span>
                  <span className="text-slate-300 font-medium">{app.salary_range || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Applied Date</span>
                  <span className="text-slate-300 font-medium">
                    {app.applied_date ? format(new Date(app.applied_date), 'MMMM dd, yyyy') : 'Saved (Not submitted)'}
                  </span>
                </div>
              </div>

              {app.job_url && (
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Listing Link</span>
                  <a
                    href={app.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 hover:underline"
                  >
                    View Job Posting
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* Uploaded File Assets */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-900/60 pt-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-2">Resume Document</span>
                  {app.resume_url ? (
                    <a
                      href={app.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-900 text-slate-300 hover:bg-slate-900/40 hover:text-white transition-colors"
                    >
                      <FileCheck className="h-4 w-4 text-violet-500 shrink-0" />
                      <span className="text-xs font-medium truncate">View Resume</span>
                    </a>
                  ) : (
                    <span className="text-slate-600 text-xs italic">No resume uploaded</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-2">Cover Letter</span>
                  {app.cover_letter_url ? (
                    <a
                      href={app.cover_letter_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-900 text-slate-300 hover:bg-slate-900/40 hover:text-white transition-colors"
                    >
                      <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span className="text-xs font-medium truncate">View Cover Letter</span>
                    </a>
                  ) : (
                    <span className="text-slate-600 text-xs italic">No cover letter uploaded</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description Summary */}
          {app.job_description && (
            <Card className="bg-slate-900/20 border-slate-900/60">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-1">
                  {app.job_description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes summary */}
          {app.notes && (
            <Card className="bg-slate-900/20 border-slate-900/60">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {app.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Interviews Schedule Timeline */}
          <Card className="bg-slate-900/20 border-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900/60 pb-4">
              <div>
                <CardTitle className="text-lg font-bold text-white">Interview Timeline</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Steps and logs for scheduled rounds</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 hover:bg-slate-900 text-slate-300"
                onClick={() => openInterviewDialog()}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Round
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {interviews.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">No rounds scheduled yet.</p>
                </div>
              ) : (
                <div className="relative border-l border-slate-900/80 pl-6 space-y-6">
                  {interviews.map((int) => (
                    <div key={int.id} className="relative group">
                      {/* Timeline node */}
                      <span className="absolute -left-[31px] top-1 p-1 bg-slate-950 rounded-full border border-violet-500">
                        <CheckCircle className="h-3.5 w-3.5 text-violet-500" />
                      </span>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-200 capitalize">
                            {int.interview_type} Interview
                          </span>
                          <span className="text-xs text-slate-500">
                            {int.interview_date ? format(new Date(int.interview_date), 'PPP p') : 'TBD'}
                          </span>
                        </div>
                        {int.notes && (
                          <p className="text-xs text-slate-400 mt-1 whitespace-pre-wrap bg-slate-900/30 p-2.5 rounded-lg border border-slate-900/60">
                            {int.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Analysis Scorecard */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-slate-900/40 to-slate-900/10 border-slate-900/60">
            <CardHeader className="border-b border-slate-900 pb-4">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                ATS AI Scorecard
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">Groq-powered resume compatibility check</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {app.ai_match_score !== null ? (
                <div className="space-y-6">
                  {/* Score circle */}
                  <div className="flex items-center justify-center gap-6">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          className="text-slate-800"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r={radius}
                          cx="48"
                          cy="48"
                        />
                        <circle
                          className="text-violet-500 transition-all duration-1000 ease-out"
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r={radius}
                          cx="48"
                          cy="48"
                        />
                      </svg>
                      <span className="absolute text-xl font-extrabold text-white">{score}%</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">ATS Alignment</span>
                      <h4 className="text-lg font-extrabold text-slate-200 mt-0.5">
                        {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">Target 80%+ match rate</p>
                    </div>
                  </div>

                  <Separator className="bg-slate-900" />

                  {/* Missing keywords */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Missing Keywords</span>
                    {(app.ai_missing_keywords ?? []).length === 0 ? (
                      <p className="text-xs text-emerald-400 italic">No missing critical keywords found! Excellent job.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(app.ai_missing_keywords ?? []).map((kw, i) => (
                          <Badge key={i} variant="outline" className="bg-rose-500/10 border-rose-500/25 text-rose-400 font-medium text-[10px] capitalize">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator className="bg-slate-900" />

                  {/* Improvement suggestions */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">AI Suggestions</span>
                    {(app.ai_suggestions ?? []).length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No custom suggestions available yet.</p>
                    ) : (
                      <ul className="space-y-2.5 text-xs text-slate-300">
                        {(app.ai_suggestions ?? []).map((suggestion, idx) => (
                          <li key={idx} className="flex gap-2 leading-relaxed">
                            <span className="text-violet-400 shrink-0 font-bold">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <Button
                    onClick={runAiAnalysis}
                    disabled={aiLoading}
                    variant="outline"
                    className="w-full border-slate-800 text-slate-300 hover:bg-slate-900 bg-slate-900/10"
                  >
                    {aiLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Re-analyzing...</span>
                      </div>
                    ) : (
                      'Recalculate Score'
                    )}
                  </Button>
                </div>
              ) : (
                /* Empty / No score state */
                <div className="text-center py-8 space-y-4">
                  <HelpCircle className="h-10 w-10 text-slate-700 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-300">Resume Not Analyzed</h4>
                    <p className="text-xs text-slate-500 px-6">
                      Upload your resume and provide a job description to extract the match score.
                    </p>
                  </div>
                  <Button
                    onClick={runAiAnalysis}
                    disabled={aiLoading || !app.resume_url || !app.job_description}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20"
                  >
                    {aiLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      'Run AI Analysis'
                    )}
                  </Button>
                  {(!app.resume_url || !app.job_description) && (
                    <p className="text-[10px] text-slate-600">
                      * Upload resume and add job description to enable button
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-950 border-slate-900 text-slate-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Edit Job Application
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the details, status or upload a new resume.
            </DialogDescription>
          </DialogHeader>
          <ApplicationForm
            initialValues={app}
            onSuccess={() => {
              setIsEditDialogOpen(false)
              setLoading(true)
              fetchApplicationData()
            }}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-slate-950 border-slate-900 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              This action cannot be undone. It will permanently delete this job application and all scheduled interviews.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              className="border-slate-800 hover:bg-slate-900 text-slate-400"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Interview Dialog */}
      <Dialog open={isInterviewOpen} onOpenChange={setIsInterviewOpen}>
        <DialogContent className="bg-slate-950 border-slate-900 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Schedule Interview
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Select date, round type and additional context.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddInterview} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="interview_date" className="text-slate-300">Date & Time *</Label>
              <Input
                id="interview_date"
                type="datetime-local"
                value={intDate}
                onChange={(e) => setIntDate(e.target.value)}
                className="bg-slate-900 border-slate-800 text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="interview_type" className="text-slate-300">Round Type</Label>
              <Select
                value={intType}
                onValueChange={(val) => setIntType(val as InterviewType)}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="phone">Phone Screening</SelectItem>
                  <SelectItem value="technical">Technical Interview</SelectItem>
                  <SelectItem value="behavioral">Behavioral Round</SelectItem>
                  <SelectItem value="onsite">Onsite Interview</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="interview_notes" className="text-slate-300">Preparation / Notes</Label>
              <Textarea
                id="interview_notes"
                placeholder="Key talking points, panel names, format..."
                rows={3}
                value={intNotes}
                onChange={(e) => setIntNotes(e.target.value)}
                className="bg-slate-900 border-slate-800 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-900 pt-4">
              <Button
                type="button"
                variant="outline"
                className="border-slate-800 hover:bg-slate-900 text-slate-400"
                onClick={() => setIsInterviewOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={intSaving}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold"
              >
                {intSaving ? 'Scheduling...' : 'Schedule'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
