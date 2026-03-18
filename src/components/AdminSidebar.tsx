import Link from 'next/link'
import { 
  Building2, 
  Users, 
  Settings, 
  LayoutDashboard,
  LogOut,
  CreditCard,
  ShieldCheck,
  Globe
} from 'lucide-react'

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Geral', href: '/admin' },
  { icon: Building2, label: 'Estabelecimentos', href: '/admin/tenants' },
  { icon: CreditCard, label: 'Assinaturas', href: '/admin/subscriptions' },
  { icon: Globe, label: 'Domínios', href: '/admin/domains' },
  { icon: ShieldCheck, label: 'Segurança', href: '/admin/security' },
  { icon: Settings, label: 'Configurações', href: '/admin/settings' },
]

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-slate-950 h-screen text-slate-200 flex flex-col fixed left-0 top-0 border-r border-white/5 shadow-2xl">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-coral rounded-lg flex items-center justify-center">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Super<span className="text-brand-coral">Admin</span>
        </h2>
      </div>
      
      <nav className="flex-1 mt-6">
        <div className="px-6 mb-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Menu Principal</p>
        </div>
        {adminMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-6 py-3.5 transition-all hover:bg-white/5 hover:text-white group relative border-l-2 border-transparent hover:border-brand-coral"
          >
            <item.icon size={18} className="text-slate-500 group-hover:text-brand-coral transition-colors" />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Admin Root</p>
            <p className="text-[10px] text-slate-500 truncate">SaaS Owner</p>
          </div>
        </div>
        <button className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors w-full px-2">
          <LogOut size={18} />
          <span className="font-medium text-sm">Sair do Painel</span>
        </button>
      </div>
    </aside>
  )
}
