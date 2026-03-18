"use client";

import { useEffect, useState } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Settings,
  Clock
} from 'lucide-react'
import { getAdminStats, getTenants } from '@/app/actions/tenants';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState({ totalTenants: 0, activeTenants: 0, pendingTenants: 0 });
  const [recentTenants, setRecentTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const stats = await getAdminStats();
      const tenants = await getTenants();
      setStatsData(stats);
      setRecentTenants(tenants.slice(0, 5));
      setIsLoading(false);
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Estabelecimentos', value: statsData.totalTenants.toString(), icon: Building2, change: 'Total', color: 'text-blue-600' },
    { label: 'Ativos', value: statsData.activeTenants.toString(), icon: ShieldCheck, change: 'Online', color: 'text-emerald-600' },
    { label: 'Pendentes', value: statsData.pendingTenants.toString(), icon: Clock, change: 'Aguardando', color: 'text-amber-600' },
    { label: 'Uptime Sistema', value: '99.9%', icon: Activity, change: 'Estável', color: 'text-sky-500' },
  ]

  if (isLoading) {
    return <div className="p-8 animate-pulse space-y-8">
      <div className="h-20 bg-brand-neutral-50 rounded-3xl w-1/3" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-brand-neutral-50 rounded-3xl" />)}
      </div>
    </div>
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Painel de Controle</h2>
          <p className="text-brand-neutral-500 font-medium tracking-tight">Gestão global do ecossistema Atendimento Inteligente.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/tenants" className="px-6 py-3 bg-brand-navy text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-navy/20 hover:bg-brand-navy/90 transition-all active:scale-95">
             Gerenciar Tenants
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-7 rounded-[32px] border border-brand-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-center justify-between mb-5">
              <div className={`p-3 rounded-2xl bg-brand-neutral-50 ${stat.color} border border-brand-neutral-100 group-hover:bg-brand-navy group-hover:text-white transition-all`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-black bg-brand-neutral-100 px-3 py-1 rounded-full text-brand-neutral-500 flex items-center gap-1.5 uppercase tracking-widest">
                <TrendingUp size={12} />
                {stat.change}
              </span>
            </div>
            <p className="text-[10px] text-brand-neutral-400 font-black uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-3xl font-black text-brand-navy mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-brand-neutral-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-brand-neutral-50 flex items-center justify-between">
            <h3 className="font-black text-brand-navy uppercase tracking-tight">Últimos Cadastros</h3>
            <Link href="/admin/tenants" className="text-brand-coral text-[10px] font-black uppercase tracking-widest hover:underline">Ver Todos</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-neutral-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Empresa</th>
                  <th className="px-8 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Contato</th>
                  <th className="px-8 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-50">
                {recentTenants.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-cream/10 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-black text-brand-navy text-sm leading-tight">{item.nome}</p>
                      <p className="text-[10px] text-brand-neutral-400 font-mono mt-1 tracking-tighter">/{item.slug}</p>
                    </td>
                    <td className="px-8 py-5">
                        <p className="text-xs font-bold text-brand-navy">{item.proprietario_nome}</p>
                        <p className="text-[10px] text-brand-neutral-400">{item.whatsapp_numero}</p>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-inset ${item.ativo ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-amber-50 text-amber-700 ring-amber-100'}`}>
                        {item.ativo ? 'Ativo' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link href="/admin/tenants" className="p-2.5 text-brand-neutral-400 hover:text-brand-navy transition-colors inline-block">
                        <ArrowUpRight size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-navy p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <ShieldCheck size={120} />
            </div>
            <h3 className="font-black text-xl mb-6 relative z-10 uppercase tracking-tight">Infraestrutura</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">N8N Cluster</span>
                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                   RUNNING
                </span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Turso Edge</span>
                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                   STABLE
                </span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl border border-white/10 shadow-inner">
                <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Logs Global</span>
                <ArrowUpRight size={14} className="text-white/20" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-brand-neutral-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-coral/5 rounded-full -mr-16 -mt-16" />
             <h3 className="font-black text-brand-navy mb-6 uppercase tracking-tight">Segurança</h3>
             <div className="flex items-center gap-4 bg-brand-neutral-50 p-4 rounded-2xl border border-brand-neutral-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-coral shadow-sm">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-brand-navy uppercase">Modo Restrito</p>
                    <p className="text-[10px] text-brand-neutral-400 font-bold uppercase">Ativado</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

