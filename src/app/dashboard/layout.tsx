import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'
import { getCurrentSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const result = await getCurrentSession();

  if (!result || !result.tenant) {
    redirect('/login');
  }

  const { tenant } = result;

  return (
    <div className="min-h-screen bg-brand-cream">
      <Sidebar />
      <div className="flex flex-col flex-1 lg:ml-64">
        <Navbar tenantName={tenant.nome} planName={tenant.plano} />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

