"use client";

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { getReportsData } from '@/app/actions/reports';

export default function TenantReportsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const reports = await getReportsData();
    setData(reports);
    setIsLoading(false);
  }

  const stats = [
    { label: 'Faturamento Total', value: `R$ ${data?.faturamentoTotal.toFixed(2) || '0,00'}`, icon: DollarSign, change: `${data?.faturamentoChange || '0'}%`, trend: (data?.faturamentoChange || 0) >= 0 ? 'up' : 'down', color: 'text-emerald-600' },
    { label: 'Novos Clientes', value: data?.newClients.toString() || '0', icon: Users, change: '+0%', trend: 'up', color: 'text-brand-coral' },
    { label: 'Ticket Médio', value: `R$ ${data?.ticketMedio || '0,00'}`, icon: TrendingUp, change: '0%', trend: 'up', color: 'text-blue-600' },
    { label: 'Ocupação', value: `${data?.ocupacao || '0'}%`, icon: Calendar, change: '+0%', trend: 'up', color: 'text-brand-navy' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-10 bg-brand-neutral-100 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-brand-neutral-50 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-brand-neutral-50 rounded-2xl" />
          <div className="h-96 bg-brand-neutral-50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-sans uppercase tracking-tight">Relatórios & Financeiro</h2>
          <p className="text-brand-neutral-500 text-sm">Acompanhe o desempenho real de <span className="font-bold text-brand-navy capitalize">{data?.currentMonthName}</span>.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-brand-neutral-200 text-brand-navy rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-cream/50 transition-all shadow-sm active:scale-95">
             <Download size={16} />
             PDF
           </button>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-navy text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all shadow-md active:scale-95">
             <Calendar size={16} />
             {data?.currentMonthName}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-brand-neutral-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-brand-neutral-50 rounded-full group-hover:bg-brand-cream transition-colors`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-brand-neutral-50 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-brand-navy mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-brand-neutral-100 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-8 border-b border-brand-neutral-50 flex items-center justify-between bg-brand-neutral-50/30">
            <div>
              <h3 className="font-black text-brand-navy uppercase tracking-tighter flex items-center gap-2">
                <Clock size={18} className="text-brand-coral" />
                Vendas Recentes
              </h3>
              <p className="text-[10px] font-bold text-brand-neutral-400 uppercase mt-1">Últimas 10 transações confirmadas</p>
            </div>
            <button className="text-[10px] font-black text-brand-coral uppercase tracking-widest hover:underline ring-1 ring-brand-coral/20 px-3 py-1 rounded-full">Histórico Completo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white">
                  <th className="px-8 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Cliente / Serviço</th>
                  <th className="px-8 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest text-center">Valor</th>
                  <th className="px-8 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest text-center">Data/Hora</th>
                  <th className="px-8 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-50">
                {data?.recentHistory && data.recentHistory.length > 0 ? data.recentHistory.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-brand-cream/10 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-brand-navy group-hover:text-brand-coral transition-colors">{tx.cliente?.nome || 'Cliente não identificado'}</p>
                      <p className="text-[10px] text-brand-neutral-500 uppercase font-black tracking-tighter mt-0.5">{tx.servico?.nome || 'Serviço Personalizado'}</p>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-brand-navy text-center">R$ {tx.servico?.preco ? tx.servico.preco.toFixed(2) : '---'}</td>
                    <td className="px-8 py-5 text-[10px] font-extrabold text-brand-neutral-500 uppercase text-center">
                      {new Date(tx.inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {new Date(tx.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-inset ${
                        tx.status === 'pago' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-brand-coral/5 text-brand-coral ring-brand-coral/20'
                      }`}>
                        {tx.status === 'pago' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-brand-neutral-400 font-bold text-sm">Nenhuma venda registrada este mês.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upgrade / Goals Card */}
        <div className="bg-brand-navy p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 -mr-40 -mt-40 bg-brand-coral/20 rounded-full blur-[80px] group-hover:bg-brand-coral/30 transition-all duration-700"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="mb-10 inline-flex p-3 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-md">
                 <CheckCircle2 className="text-brand-coral" size={24} />
              </div>
              <h3 className="text-2xl font-black mb-3 tracking-tighter uppercase">Minha Gestão <span className="text-brand-coral">Turbo</span></h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">Sua assinatura Premium Pro está ativa. Aproveite todos os recursos de IA e automação.</p>
              
              <div className="space-y-6">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Seu Plano</p>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-white text-lg tracking-tight">PREMIUM <span className="text-brand-coral">PRO</span></span>
                  </div>
                </div>
                
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WhatsApp IA</p>
                    <span className="text-xs font-black text-brand-coral">24%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-coral h-full rounded-full shadow-[0_0_10px_rgba(255,107,107,0.5)]" style={{ width: '24%' }}></div>
                  </div>
                   <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-tight">1.240 de 5.000 mensagens</p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-10 py-5 bg-white text-brand-navy rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-coral hover:text-white transition-all shadow-xl active:scale-95 group/btn overflow-hidden relative">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Financeiro Detalhado 
                <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
