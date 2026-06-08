'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { BriefcaseBusiness, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Registration successful! Welcome to CareerPath!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      toast.error(err.message || 'Failed to start Google sign in')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black px-4 overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md border-slate-800 bg-slate-950/40 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25">
              <BriefcaseBusiness className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Launch your visual job-tracking dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-slate-300 font-medium">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Alex Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                className="bg-slate-900/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-slate-300 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                className="bg-slate-900/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                className="bg-slate-900/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-slate-300 font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                className="bg-slate-900/60 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-violet-500/20 active:translate-y-[1px]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering...</span>
                </div>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-[#0b0f19] px-3 text-xs uppercase text-slate-500">
              Or continue with
            </span>
          </div>

          <Button
            variant="outline"
            type="button"
            disabled={isLoading || isGoogleLoading}
            onClick={handleGoogleSignup}
            className="w-full h-10 border-slate-800 hover:bg-slate-900 text-slate-300 bg-slate-900/20 font-medium"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            )}
            Sign Up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-900 pt-5 pb-6">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
