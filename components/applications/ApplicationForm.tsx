'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { applicationSchema, ApplicationFormValues } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { FileUp, Loader2, Sparkles } from 'lucide-react'

interface ApplicationFormProps {
  initialValues?: Partial<ApplicationFormValues> & { id?: string }
  onSuccess: () => void
  onCancel?: () => void
}

export default function ApplicationForm({
  initialValues,
  onSuccess,
  onCancel,
}: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  
  // Storing extracted text temporarily if uploaded
  const [extractedResumeText, setExtractedResumeText] = useState('')

  const defaultValues: Partial<ApplicationFormValues> = {
    company_name: initialValues?.company_name || '',
    job_title: initialValues?.job_title || '',
    job_description: initialValues?.job_description || '',
    job_url: initialValues?.job_url || '',
    location: initialValues?.location || '',
    salary_range: initialValues?.salary_range || '',
    status: initialValues?.status || 'saved',
    applied_date: initialValues?.applied_date || new Date().toISOString().split('T')[0],
    notes: initialValues?.notes || '',
    resume_url: initialValues?.resume_url || '',
    cover_letter_url: initialValues?.cover_letter_url || '',
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
  })

  const currentStatus = watch('status')
  const resumeUrl = watch('resume_url')
  const coverUrl = watch('cover_letter_url')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'resume_url' | 'cover_letter_url') => {
    const file = e.target.files?.[0]
    if (!file) return

    const isResume = field === 'resume_url'
    if (isResume) setResumeUploading(true)
    else setCoverUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (initialValues?.id) {
        formData.append('applicationId', initialValues.id)
      }

      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file')
      }

      setValue(field, result.url)
      if (isResume && result.text) {
        setExtractedResumeText(result.text)
      }
      toast.success(`${isResume ? 'Resume' : 'Cover letter'} uploaded successfully!`)
    } catch (err: any) {
      toast.error(err.message || 'Error uploading file')
    } finally {
      if (isResume) setResumeUploading(false)
      else setCoverUploading(false)
    }
  }

  const onSubmit = async (values: ApplicationFormValues) => {
    setIsSubmitting(true)
    try {
      const isEdit = !!initialValues?.id
      const url = isEdit ? `/api/applications/${initialValues.id}` : '/api/applications'
      const method = isEdit ? 'PUT' : 'POST'

      // If we uploaded a resume and it's a new application, check if we should run an initial auto-analysis
      let payload: any = { ...values }
      if (!isEdit && extractedResumeText && values.job_description) {
        try {
          toast.info('Running background AI match score...')
          const aiResponse = await fetch('/api/ai/score-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resumeText: extractedResumeText,
              jobDescription: values.job_description,
            }),
          })
          const aiResult = await aiResponse.json()
          if (aiResponse.ok && aiResult.matchScore !== undefined) {
            payload.ai_match_score = aiResult.matchScore
            payload.ai_missing_keywords = aiResult.missingKeywords || []
            payload.ai_suggestions = aiResult.suggestions || []
          }
        } catch (aiErr) {
          console.error('AI background run failed', aiErr)
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save application')
      }

      toast.success(`Application ${isEdit ? 'updated' : 'created'} successfully!`)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        {/* Company Name */}
        <div className="space-y-1">
          <Label htmlFor="company_name" className="text-slate-300">Company Name *</Label>
          <Input
            id="company_name"
            placeholder="e.g. Google"
            {...register('company_name')}
            className="bg-slate-900 border-slate-800 focus-visible:ring-violet-500"
          />
          {errors.company_name && (
            <span className="text-xs text-red-500">{errors.company_name.message}</span>
          )}
        </div>

        {/* Job Title */}
        <div className="space-y-1">
          <Label htmlFor="job_title" className="text-slate-300">Job Title *</Label>
          <Input
            id="job_title"
            placeholder="e.g. Frontend Engineer"
            {...register('job_title')}
            className="bg-slate-900 border-slate-800 focus-visible:ring-violet-500"
          />
          {errors.job_title && (
            <span className="text-xs text-red-500">{errors.job_title.message}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Location */}
        <div className="space-y-1">
          <Label htmlFor="location" className="text-slate-300">Location</Label>
          <Input
            id="location"
            placeholder="e.g. Mountain View, CA / Remote"
            {...register('location')}
            className="bg-slate-900 border-slate-800"
          />
        </div>

        {/* Salary Range */}
        <div className="space-y-1">
          <Label htmlFor="salary_range" className="text-slate-300">Salary Range</Label>
          <Input
            id="salary_range"
            placeholder="e.g. $120k - $150k"
            {...register('salary_range')}
            className="bg-slate-900 border-slate-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Status */}
        <div className="space-y-1">
          <Label htmlFor="status" className="text-slate-300">Status</Label>
          <Select
            value={currentStatus}
            onValueChange={(val) => setValue('status', val as any)}
          >
            <SelectTrigger className="bg-slate-900 border-slate-800">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
              <SelectItem value="saved">Saved</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applied Date */}
        <div className="space-y-1">
          <Label htmlFor="applied_date" className="text-slate-300">Applied Date</Label>
          <Input
            id="applied_date"
            type="date"
            {...register('applied_date')}
            className="bg-slate-900 border-slate-800 text-slate-100"
          />
        </div>
      </div>

      {/* Job URL */}
      <div className="space-y-1">
        <Label htmlFor="job_url" className="text-slate-300">Job Posting URL</Label>
        <Input
          id="job_url"
          type="text"
          placeholder="https://..."
          {...register('job_url')}
          className="bg-slate-900 border-slate-800"
        />
        {errors.job_url && (
          <span className="text-xs text-red-500">{errors.job_url.message}</span>
        )}
      </div>

      {/* Job Description */}
      <div className="space-y-1">
        <Label htmlFor="job_description" className="text-slate-300 flex items-center gap-1.5">
          Job Description
          {extractedResumeText && (
            <span className="text-xs text-violet-400 font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Auto AI Scoring Ready
            </span>
          )}
        </Label>
        <Textarea
          id="job_description"
          placeholder="Paste the job description here to enable ATS AI compatibility matching..."
          rows={4}
          {...register('job_description')}
          className="bg-slate-900 border-slate-800 resize-none placeholder:text-slate-600"
        />
      </div>

      {/* Files Section */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-3">
        {/* Resume upload */}
        <div className="space-y-2">
          <Label className="text-slate-300">Resume (PDF or DOCX)</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={resumeUploading}
              className="bg-slate-900 border-slate-800 relative hover:bg-slate-800 text-slate-300"
              onClick={() => document.getElementById('resume-file')?.click()}
            >
              {resumeUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileUp className="h-4 w-4 mr-2 text-violet-500" />
              )}
              {resumeUrl ? 'Change Resume' : 'Upload Resume'}
            </Button>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileUpload(e, 'resume_url')}
              className="hidden"
            />
            {resumeUrl && (
              <span className="text-xs text-emerald-400 font-semibold truncate max-w-[120px]">
                Uploaded ✓
              </span>
            )}
          </div>
        </div>

        {/* Cover letter upload */}
        <div className="space-y-2">
          <Label className="text-slate-300">Cover Letter (PDF or DOCX)</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={coverUploading}
              className="bg-slate-900 border-slate-800 relative hover:bg-slate-800 text-slate-300"
              onClick={() => document.getElementById('cover-file')?.click()}
            >
              {coverUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileUp className="h-4 w-4 mr-2 text-cyan-400" />
              )}
              {coverUrl ? 'Change Cover Letter' : 'Upload Cover Letter'}
            </Button>
            <input
              id="cover-file"
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileUpload(e, 'cover_letter_url')}
              className="hidden"
            />
            {coverUrl && (
              <span className="text-xs text-emerald-400 font-semibold truncate max-w-[120px]">
                Uploaded ✓
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <Label htmlFor="notes" className="text-slate-300">Notes / Reminders</Label>
        <Textarea
          id="notes"
          placeholder="Personal notes, referrals, contacts..."
          rows={3}
          {...register('notes')}
          className="bg-slate-900 border-slate-800 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-900 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-slate-800 hover:bg-slate-900 text-slate-400"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || resumeUploading || coverUploading}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/20"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            'Save Application'
          )}
        </Button>
      </div>
    </form>
  )
}
