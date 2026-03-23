"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowUpRight,
  DollarSign,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { getDashboardStats } from '@/app/actions/dashboard';
import Link from 'next/link';

export default function DashboardPage() {
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const data = await getDashboardStats();
    setStatsData(data);
    setIsLoading(false);
  }

  const kpis = [
    { 
      label: 'Faturamento Mensal', 
      value: `R$ ${statsData?.monthlyRevenue.toFixed(2) || '0,00'}`, 
      icon: DollarSign, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Clientes Ativos', 
      value: statsData?.activeClients.toString() || '0', 
      icon: Users, 
      color: 'text-brand-navy',
      bg: 'bg-brand-cream'
    },
    { 
      label: 'Novos este Mês', 
      value: statsData?.newClientsMonth.toString() || '0', 
      icon: UserCheck, 
      color: 'text-brand-coral',
      bg: 'bg-brand-coral/5'
    },
    { 
      label: 'Agendamentos Hoje', 
      value: statsData?.todayAppointments.toString() || '0', 
      icon: Calendar, 
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-brand-neutral-100 rounded-xl w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-brand-neutral-50 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-64 bg-brand-neutral-50 rounded-2xl" />
          <div className="h-64 bg-brand-neutral-50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-sans">Bem-vindo de volta! 👋</h2>
          <p className="text-brand-neutral-500 mt-1">Veja como está seu negócio hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', timeZone: 'America/Sao_Paulo' })}.</p>
        </div>
        <Link 
          href="/dashboard/agenda"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
        >
          Ir para Agenda
          <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 rounded-2xl border border-brand-neutral-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                <kpi.icon size={24} />
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-neutral-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} className="text-brand-neutral-400" />
              </div>
            </div>
            <p className="text-xs text-brand-neutral-400 font-black uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-black text-brand-navy mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Appointments */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-brand-neutral-100 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-brand-navy uppercase tracking-tight flex items-center gap-2">
              <Clock size={20} className="text-brand-coral" />
              Próximos Agendamentos
            </h3>
            <Link href="/dashboard/agenda" className="text-xs font-bold text-brand-coral hover:underline">Ver todos</Link>
          </div>
          
          <div className="space-y-4">
            {statsData?.nextAppointments && statsData.nextAppointments.length > 0 ? (
              statsData.nextAppointments.map((app: any) => (
                <div key={app.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-brand-neutral-50 transition-colors group relative overflow-hidden ring-1 ring-brand-neutral-100/50">
                  <div className="w-14 h-14 bg-brand-cream rounded-xl flex flex-col items-center justify-center text-brand-navy flex-shrink-0">
                    <span className="text-sm font-black">{new Date(app.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-navy truncate">{app.cliente?.nome || 'Cliente não identificado'}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-brand-neutral-400 font-extrabold uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(app.inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' })}
                      </span>
                      <span className="w-1 h-1 bg-brand-neutral-200 rounded-full" />
                      <span className="text-brand-coral">{app.servico?.nome || 'Serviço Padrão'}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-neutral-100 rounded-full">
                      <Users size={12} className="text-brand-neutral-400" />
                      <span className="text-[10px] font-bold text-brand-navy uppercase truncate max-w-[80px]">
                        {app.profissional?.nome || 'Equipe'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-brand-neutral-400 animate-in fade-in zoom-in-95">
                <div className="p-6 bg-brand-neutral-50 rounded-full mb-4">
                   <Calendar size={48} className="opacity-20" />
                </div>
                <p className="font-black text-xs uppercase tracking-widest">Nenhum agendamento pendente</p>
                <p className="text-[10px] mt-1">Sua agenda está livre para os próximos horários.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Section / Mini Reports */}
        <div className="space-y-8">
           <div className="bg-brand-navy p-8 rounded-[40px] text-white shadow-xl shadow-brand-navy/20 relative overflow-hidden group">
            {/* Decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-coral/10 rounded-full blur-3xl group-hover:bg-brand-coral/20 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-coral rounded-xl">
                  <MessageSquare size={20} />
                </div>
                <h3 className="font-bold tracking-tight">Status da IA</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse ring-4 ring-brand-green/20" />
                  <p className="text-sm font-semibold text-white">Atendente Online</p>
                </div>
                <p className="text-xs text-white/60 leading-relaxed font-medium">
                  Júlia está respondendo e agendando clientes no seu WhatsApp agora mesmo.
                </p>
              </div>
              
              <Link 
                href="/dashboard/ia-config"
                className="w-full mt-8 py-4 px-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
              >
                Configurações da IA
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-brand-neutral-100 shadow-sm">
            <h4 className="text-xs font-black text-brand-neutral-400 uppercase tracking-widest mb-4">Desempenho Rápido</h4>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-black text-brand-navy uppercase tracking-tighter">Ocupação da Semana</span>
                   <span className="text-[10px] font-black text-brand-coral">82%</span>
                </div>
                <div className="w-full h-1.5 bg-brand-neutral-50 rounded-full overflow-hidden">
                   <div className="h-full bg-brand-coral w-[82%]" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-brand-cream/30 rounded-2xl">
                 <div className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-black text-brand-neutral-400 uppercase lh-0">Conversão</p>
                      <p className="text-sm font-black text-brand-navy">94%</p>
                    </div>
                 </div>
                 <ArrowUpRight size={16} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
