'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, BarChart3, TrendingUp, Clock, HelpCircle, Briefcase } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { JobApplication, Interview } from '@/types'
import { format, differenceInDays, parseISO } from 'date-fns'

const COLORS = {
  saved: '#64748b',
  applied: '#3b82f6',
  interview: '#f59e0b',
  offer: '#10b981',
  rejected: '#ef4444',
}

export default function AnalyticsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [appRes, intRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/interviews'),
        ])
        if (appRes.ok && intRes.ok) {
          setApplications(await appRes.json())
          setInterviews(await intRes.json())
        }
      } catch (err) {
        console.error('Error fetching analytics data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading analytics...</span>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl max-w-xl mx-auto my-12">
        <BarChart3 className="h-12 w-12 text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-300">No Analytics Data Yet</h3>
        <p className="text-slate-500 text-xs mt-1 px-8 leading-relaxed">
          Start logging job applications and scheduling interviews to generate response metrics, timeline plots, and status funnels.
        </p>
      </div>
    )
  }

  // 1. Status breakdown for PieChart
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.toUpperCase(),
    value: count,
    color: COLORS[status as keyof typeof COLORS] || '#94a3b8',
  }))

  // 2. Applications Over Time (Grouped by Month/Year)
  const appOverTime = applications.reduce((acc, app) => {
    const date = app.applied_date || app.created_at.split('T')[0]
    const month = format(parseISO(date), 'MMM yyyy')
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const lineData = Object.entries(appOverTime)
    .map(([month, count]) => ({ month, count }))
    .reverse() // show oldest to newest

  // 3. Top Companies Success rate (Count applications & offer ratios)
  const companyStats = applications.reduce((acc, app) => {
    if (!acc[app.company_name]) {
      acc[app.company_name] = { total: 0, offers: 0 }
    }
    acc[app.company_name].total += 1
    if (app.status === 'offer') {
      acc[app.company_name].offers += 1
    }
    return acc
  }, {} as Record<string, { total: number; offers: number }>)

  const barData = Object.entries(companyStats)
    .map(([company, stats]) => ({
      company,
      applications: stats.total,
      offers: stats.offers,
      successRate: stats.total > 0 ? Math.round((stats.offers / stats.total) * 100) : 0,
    }))
    .slice(0, 8) // Limit to top 8 companies

  // 4. Response Time Calculation: Average days between Applied Date and Interview Date
  const responseDays = interviews.map((int) => {
    const appInfo = applications.find((a) => a.id === int.application_id)
    if (appInfo && appInfo.applied_date && int.interview_date) {
      const diff = differenceInDays(new Date(int.interview_date), new Date(appInfo.applied_date))
      return diff >= 0 ? diff : 0
    }
    return null
  }).filter((d) => d !== null) as number[]

  const averageResponseTime = responseDays.length > 0
    ? Math.round(responseDays.reduce((a, b) => a + b, 0) / responseDays.length)
    : null

  // 5. Best performing titles by Application count
  const titleCounts = applications.reduce((acc, app) => {
    const title = app.job_title.toLowerCase().replace(/senior|junior|lead|int|sr\.|jr\./g, '').trim()
    const cleanTitle = title.charAt(0).toUpperCase() + title.slice(1)
    acc[cleanTitle] = (acc[cleanTitle] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topTitles = Object.entries(titleCounts)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Overview stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/20 border-slate-900/60 flex items-center gap-4 p-5">
          <div className="p-3 bg-violet-600/10 text-violet-400 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">Avg. Response Time</span>
            <h4 className="text-xl font-extrabold text-white">
              {averageResponseTime !== null ? `${averageResponseTime} Days` : 'N/A'}
            </h4>
            <span className="text-[10px] text-slate-500">From application to first interview</span>
          </div>
        </Card>

        <Card className="bg-slate-900/20 border-slate-900/60 flex items-center gap-4 p-5">
          <div className="p-3 bg-cyan-600/10 text-cyan-400 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">Offer Conversion</span>
            <h4 className="text-xl font-extrabold text-white">
              {applications.length > 0
                ? `${Math.round((applications.filter(a => a.status === 'offer').length / applications.length) * 100)}%`
                : '0%'}
            </h4>
            <span className="text-[10px] text-slate-500">Total conversion efficiency</span>
          </div>
        </Card>

        <Card className="bg-slate-900/20 border-slate-900/60 flex items-center gap-4 p-5">
          <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">Active Funnel</span>
            <h4 className="text-xl font-extrabold text-white">
              {applications.filter(a => a.status === 'applied' || a.status === 'interview').length} roles
            </h4>
            <span className="text-[10px] text-slate-500">Applications currently in progress</span>
          </div>
        </Card>
      </div>

      {/* Main Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart: Apps Over Time */}
        <Card className="bg-slate-900/20 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Applications Over Time</CardTitle>
            <CardDescription className="text-xs text-slate-500">Monthly submissions history</CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="count" name="Applications" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Status Breakdown */}
        <Card className="bg-slate-900/20 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Status Distribution</CardTitle>
            <CardDescription className="text-xs text-slate-500">Pipelines current stages</CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Success rate by Company */}
        <Card className="bg-slate-900/20 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Applications & Offers by Company</CardTitle>
            <CardDescription className="text-xs text-slate-500">Engagement vs landing ratios</CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="company" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="applications" name="Applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offers" name="Offers Landed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leaderboard: Popular / Top Job Titles */}
        <Card className="bg-slate-900/20 border-slate-900/60">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white">Top Roles Target</CardTitle>
            <CardDescription className="text-xs text-slate-500">Roles with highest application logs</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              {topTitles.map((title, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{title.title}</span>
                    <span className="text-slate-500 font-bold">{title.count} Roles</span>
                  </div>
                  <Progress
                    value={(title.count / applications.length) * 100}
                    className="h-2 bg-slate-900 [&>div]:bg-gradient-to-r [&>div]:from-violet-600 [&>div]:to-cyan-400"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
