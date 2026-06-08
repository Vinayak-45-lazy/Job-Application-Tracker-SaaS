'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  KanbanSquare,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  BriefcaseBusiness,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Profile {
  full_name: string | null
  email: string | null
  avatar_url: string | null
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('id', user.id)
          .single()
        if (data) {
          setProfile(data)
        } else {
          setProfile({
            full_name: user.user_metadata.full_name || 'User',
            email: user.email || '',
            avatar_url: user.user_metadata.avatar_url || null,
          })
        }
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to logout')
    }
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/applications', label: 'Applications', icon: KanbanSquare },
    { href: '/ai-scorer', label: 'AI Resume Scorer', icon: Sparkles },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-900 bg-slate-950 px-4 py-6 text-slate-400">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-md shadow-violet-500/10 text-white">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Zentrivo
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-slate-900 text-white shadow-inner font-semibold border-l-2 border-violet-500 rounded-l-none"
                  : "hover:bg-slate-900/60 hover:text-slate-100"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 transition-colors duration-200",
                isActive ? "text-violet-500" : "text-slate-500 group-hover:text-slate-300"
              )} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="mt-auto border-t border-slate-900 pt-5">
        <div className="flex items-center gap-3 px-3 mb-4">
          <Avatar className="h-10 w-10 border border-slate-800 shadow-inner bg-slate-900">
            <AvatarImage src={profile?.avatar_url || ''} alt="User Avatar" />
            <AvatarFallback className="bg-slate-800 text-slate-100 font-semibold uppercase">
              {profile?.full_name?.substring(0, 2) || 'US'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold text-slate-200 truncate">
              {profile?.full_name || 'Loading user...'}
            </span>
            <span className="text-xs text-slate-500 truncate">
              {profile?.email || ''}
            </span>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full flex items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
