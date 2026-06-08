'use client'

import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default function Header() {
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview'
    if (pathname.startsWith('/applications')) return 'Applications Kanban'
    if (pathname.startsWith('/ai-scorer')) return 'AI Resume Scorer'
    if (pathname.startsWith('/analytics')) return 'Analytics Insights'
    if (pathname.startsWith('/settings')) return 'Settings'
    return 'CareerPath'
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-900 bg-slate-950/80 px-8 backdrop-blur-md">
      <h1 className="text-xl font-bold tracking-tight text-slate-100">{getPageTitle()}</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400 border border-violet-500/20">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          <span>Groq Llama-3 Active</span>
        </div>
      </div>
    </header>
  )
}
