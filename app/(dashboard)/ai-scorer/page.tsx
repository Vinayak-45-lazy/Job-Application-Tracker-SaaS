'use client'

import { useState } from 'react'
import {
  Sparkles,
  FileUp,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Zap,
  BookOpen,
  X,
  FileCheck,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface AnalysisResult {
  matchScore: number
  missingKeywords: string[]
  foundKeywords: string[]
  suggestions: string[]
  atsRating: 'Poor' | 'Fair' | 'Good' | 'Excellent'
}

export default function AIScorerPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [fileName, setFileName] = useState('')
  
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setFileName(file.name)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('applicationId', 'general-scorer')

      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      })

      const resData = await response.json()
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to extract text from resume')
      }

      setResumeText(resData.text)
      toast.success('Resume parsed successfully! Extracted text content.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload and read file')
      setFileName('')
      setResumeText('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!resumeText) {
      toast.error('Please upload your resume first')
      return
    }
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description to score against')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/score-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume')
      }

      setResult(data)
      toast.success('ATS resume scoring analysis complete!')
    } catch (err: any) {
      toast.error(err.message || 'Error running resume scorer')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetScorer = () => {
    setResult(null)
    setFileName('')
    setResumeText('')
    setJobDescription('')
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
      case 'Good': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25'
      case 'Fair': return 'text-amber-400 bg-amber-500/10 border-amber-500/25'
      case 'Poor': return 'text-rose-400 bg-rose-500/10 border-rose-500/25'
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/25'
    }
  }

  // Circular progress math
  const score = result?.matchScore || 0
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Resume Scorer</h2>
        <p className="text-slate-400 text-sm mt-1">
          Measure how well your resume matches any job description and optimize keyword coverage.
        </p>
      </div>

      {!result ? (
        /* Form Entry view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Step 1: Upload Resume */}
          <Card className="bg-slate-900/20 border-slate-900/60 backdrop-blur-sm flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <FileUp className="h-5 w-5 text-violet-400" />
                1. Upload Resume
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">
                Upload your latest PDF or DOCX format resume.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 border-t border-slate-900/60">
              {fileName ? (
                <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-950 border border-slate-900 rounded-xl w-full relative">
                  <button
                    onClick={() => {
                      setFileName('')
                      setResumeText('')
                    }}
                    className="absolute top-2 right-2 text-slate-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <FileCheck className="h-12 w-12 text-violet-500 mb-3" />
                  <span className="text-sm font-semibold text-slate-200 truncate max-w-[200px]">
                    {fileName}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold mt-1">Ready for analysis ✓</span>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('scorer-file')?.click()}
                  className="flex flex-col items-center justify-center text-center p-10 border border-dashed border-slate-800 rounded-xl w-full cursor-pointer hover:border-violet-500/40 hover:bg-slate-900/10 transition-all duration-300"
                >
                  <input
                    id="scorer-file"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="space-y-2">
                      <Loader2 className="h-10 w-10 text-violet-500 animate-spin mx-auto" />
                      <p className="text-xs text-slate-400">Parsing document...</p>
                    </div>
                  ) : (
                    <>
                      <FileUp className="h-10 w-10 text-slate-600 mb-4" />
                      <p className="text-sm font-semibold text-slate-300">Click to upload document</p>
                      <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX formats</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Paste Job Description */}
          <Card className="bg-slate-900/20 border-slate-900/60 backdrop-blur-sm flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-400" />
                2. Paste Job Description
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">
                Copy and paste the full job posting description text.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4 p-6 border-t border-slate-900/60">
              <Textarea
                placeholder="Paste requirements, skills, role duties here..."
                className="flex-grow bg-slate-950 border-slate-900 resize-none min-h-[160px] text-slate-100 focus-visible:ring-cyan-500"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || isUploading || !resumeText || !jobDescription}
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-violet-600/25"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Analyzing Alignment...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Analyze Resume Compatibility</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Results dashboard */
        <div className="space-y-6">
          {/* Main Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Ring Card */}
            <Card className="bg-slate-900/20 border-slate-900/60 flex flex-col items-center justify-center py-8">
              <div className="relative flex items-center justify-center mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    className="text-slate-800"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-violet-500 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="64"
                    cy="64"
                  />
                </svg>
                <span className="absolute text-2xl font-extrabold text-white">{score}%</span>
              </div>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Overall Match Score</span>
            </Card>

            {/* ATS Rating Card */}
            <Card className="bg-slate-900/20 border-slate-900/60 flex flex-col items-center justify-center py-8">
              <Badge variant="outline" className={`text-sm font-extrabold px-4 py-1.5 rounded-full capitalize mb-3 ${getRatingColor(result.atsRating)}`}>
                {result.atsRating} Rating
              </Badge>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">ATS Compatibility</span>
              <p className="text-[11px] text-slate-400 text-center px-6 mt-2">
                {result.matchScore >= 80
                  ? 'Your resume is highly optimized for this role. Proceed to apply!'
                  : 'We recommend incorporating missing keywords to score above 80%.'}
              </p>
            </Card>

            {/* Actions Card */}
            <Card className="bg-slate-900/20 border-slate-900/60 flex flex-col items-center justify-center py-8 px-6 text-center">
              <Zap className="h-8 w-8 text-cyan-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-200">Re-Optimize</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Adjust your file, add keywords, and run another scan.
              </p>
              <Button onClick={resetScorer} variant="outline" className="border-slate-800 hover:bg-slate-900 text-slate-300 w-full">
                Scan Another Resume
              </Button>
            </Card>
          </div>

          {/* Keywords Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Missing Keywords */}
            <Card className="bg-slate-900/20 border-slate-900/60">
              <CardHeader className="pb-3 border-b border-slate-900">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                  Missing Critical Keywords ({result.missingKeywords.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {result.missingKeywords.length === 0 ? (
                  <p className="text-xs text-emerald-400 italic">Excellent! No missing key skills found.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw, idx) => (
                      <Badge key={idx} variant="outline" className="bg-rose-500/10 border-rose-500/20 text-rose-400 text-xs font-semibold capitalize px-2 py-0.5">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Found Keywords */}
            <Card className="bg-slate-900/20 border-slate-900/60">
              <CardHeader className="pb-3 border-b border-slate-900">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  Strong Keywords Found ({result.foundKeywords.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {result.foundKeywords.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">No matching keywords detected.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {result.foundKeywords.map((kw, idx) => (
                      <Badge key={idx} variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs font-semibold capitalize px-2 py-0.5">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestions Card */}
          <Card className="bg-slate-900/20 border-slate-900/60">
            <CardHeader className="border-b border-slate-900">
              <CardTitle className="text-base font-bold text-white">5 Recommended Optimization Steps</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {result.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-300 leading-relaxed items-start">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-violet-600/20 text-violet-400 font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
