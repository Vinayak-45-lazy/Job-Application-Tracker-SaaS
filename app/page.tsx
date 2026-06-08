import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import {
  BriefcaseBusiness,
  Sparkles,
  BarChart3,
  KanbanSquare,
  ArrowRight,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />

      {/* Header / Nav */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900/60 bg-slate-950/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-md shadow-violet-500/10">
            <BriefcaseBusiness className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Zentrivo</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/signup"
            className={`${buttonVariants({ variant: 'default' })} bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/20`}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-grow max-w-5xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400 mb-8 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Now Powered by llama3-8b AI Engine</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Track Applications.<br />
          Optimize Resumes.<br />
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Land the Job.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
          The ultimate AI-driven pipeline tracker built for modern job seekers. Compare resumes directly against job descriptions, track statuses, and schedule interviews.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-none">
          <Link
            href="/login"
            className={`${buttonVariants({ size: 'lg' })} h-12 px-8 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold shadow-xl shadow-violet-600/20 hover:scale-[1.02] transition-transform duration-200 flex items-center gap-2`}
          >
            Start Tracking Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#features"
            className={`${buttonVariants({ size: 'lg', variant: 'outline' })} h-12 px-8 border-slate-800 hover:bg-slate-900 bg-slate-900/10 text-slate-300`}
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-900/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Designed for High-Performance Job Hunting
          </h2>
          <p className="mt-4 text-slate-400">
            Ditch spreadsheet chaos and track your application funnel with intelligent automation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group rounded-2xl border border-slate-900/80 bg-slate-950/40 p-8 backdrop-blur-md hover:border-violet-500/30 transition-all duration-300 hover:translate-y-[-2px] shadow-lg shadow-black/45">
            <div className="p-3 w-fit rounded-xl bg-violet-600/10 text-violet-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <KanbanSquare className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Visual Kanban Board</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Drag-and-drop your applications between columns: Saved, Applied, Interview, Offer, Rejected. Track all metadata effortlessly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-2xl border border-slate-900/80 bg-slate-950/40 p-8 backdrop-blur-md hover:border-cyan-500/30 transition-all duration-300 hover:translate-y-[-2px] shadow-lg shadow-black/45">
            <div className="p-3 w-fit rounded-xl bg-cyan-600/10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Resume Scorer</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Powered by Groq & Llama-3. Instantly parse files to check ATS keyword coverage, generate suggestions, and measure job alignment.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-2xl border border-slate-900/80 bg-slate-950/40 p-8 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 hover:translate-y-[-2px] shadow-lg shadow-black/45">
            <div className="p-3 w-fit rounded-xl bg-indigo-600/10 text-indigo-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Rich Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Analyze metrics over time. View conversion rates, response timelines, and custom graphs of company success metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-950 mt-auto bg-slate-950/80 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-violet-500" />
            <span className="font-semibold text-slate-400">Zentrivo</span>
          </div>
          <p>© 2026 Zentrivo Built with Next.js 15, Supabase and Groq AI.</p>
        </div>
      </footer>
    </div>
  )
}
