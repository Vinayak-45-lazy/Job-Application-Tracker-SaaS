'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { User, Key, Trash2, Loader2, AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setFullName(user.user_metadata.full_name || '')
        setEmail(user.email || '')
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Full name is required')
      return
    }

    setProfileSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      })
      if (authError) throw authError

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)
      if (profileError) throw profileError

      toast.success('Profile updated successfully!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in password fields')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setPasswordSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error

      toast.success('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // RLS policy allows self profile deletion, cascades to all applications and interviews
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
      if (error) throw error

      await supabase.auth.signOut()
      toast.success('All application tracking data deleted successfully.')
      router.push('/login')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account data')
    } finally {
      setIsDeleting(false)
      setIsDeleteOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading user preferences...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* 1. Profile settings card */}
      <Card className="bg-slate-900/20 border-slate-900/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-violet-400" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            Manage your email contact details and full name metadata.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4 border-t border-slate-900/60 pt-6">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-slate-300">Registered Email Address</Label>
              <Input
                id="email"
                type="email"
                disabled
                value={email}
                className="bg-slate-950 border-slate-900 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-900 border-slate-800 text-slate-100"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-slate-900/60 py-4">
            <Button
              type="submit"
              disabled={profileSaving}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/20"
            >
              {profileSaving ? 'Saving...' : 'Update Details'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* 2. Security Change password card */}
      <Card className="bg-slate-900/20 border-slate-900/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-cyan-400" />
            Change Password
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            Submit a new credential to protect your active tracking session.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4 border-t border-slate-900/60 pt-6">
            <div className="space-y-1">
              <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-900 border-slate-800 text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-900 border-slate-800 text-slate-100"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-slate-900/60 py-4">
            <Button
              type="submit"
              disabled={passwordSaving}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* 3. Dangerous Area: Delete account */}
      <Card className="border-red-950 bg-red-950/5">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-red-400 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-500/70 text-xs">
            Irreversible actions regarding your career dashboard data.
          </CardDescription>
        </CardHeader>
        <CardContent className="border-t border-red-950/20 pt-6">
          <p className="text-slate-400 text-xs leading-relaxed">
            Deleting your tracking profile clears all saved applications, uploaded resumes, cover letters, and interview round dates from our databases.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-red-950/20 py-4">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            Clear Data & Account
          </Button>
        </CardFooter>
      </Card>

      {/* Delete confirm modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-slate-950 border-slate-900 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Clear profile data?
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              This will erase your database entries (applications, profiles, and scheduled events) immediately. You will be signed out.
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
              disabled={isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? 'Erasing...' : 'Erase Everything'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
