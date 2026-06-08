import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow p-8 bg-slate-950/80 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
