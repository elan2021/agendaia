import { AdminSidebar } from '@/components/AdminSidebar'
import { AdminNavbar } from '@/components/AdminNavbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminNavbar />
        <main className="ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
