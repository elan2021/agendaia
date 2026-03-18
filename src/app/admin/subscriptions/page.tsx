"use client";

import { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  Calendar
} from 'lucide-react';

const mockSubscriptions = [
  { id: '1', tenant: 'Barbearia do João', plano: 'Pro', valor: 'R$ 149,90', status: 'Ativo', proxima_cobranca: '2024-04-15', gateway: 'Stripe' },
  { id: '2', tenant: 'Clínica Sorriso', plano: 'Basic', valor: 'R$ 89,90', status: 'Ativo', proxima_cobranca: '2024-04-01', gateway: 'Pagar.me' },
  { id: '3', tenant: 'Espaço Beleza', plano: 'Starter', valor: 'R$ 49,90', status: 'Atrasado', proxima_cobranca: '2024-03-10', gateway: 'Stripe' },
  { id: '4', tenant: 'Studio Fitness', plano: 'Pro', valor: 'R$ 149,90', status: 'Cancelado', proxima_cobranca: '-', gateway: 'Asaas' },
];

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assinaturas & Faturamento</h2>
          <p className="text-slate-500 font-medium">Controle global de planos, cobranças e receita recorrente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp size={20} />
             </div>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">MRR Atual</p>
          </div>
          <p className="text-2xl font-black text-slate-900">R$ 12.840,00</p>
          <p className="text-xs text-emerald-600 font-bold mt-1">+12% vs mês anterior</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Clock size={20} />
             </div>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Inadimplência</p>
          </div>
          <p className="text-2xl font-black text-slate-900">3.2%</p>
          <p className="text-xs text-amber-600 font-bold mt-1">4 estabelecimentos pendentes</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <DollarSign size={20} />
             </div>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ticket Médio</p>
          </div>
          <p className="text-2xl font-black text-slate-900">R$ 112,50</p>
          <p className="text-xs text-blue-600 font-bold mt-1">Ideal para o plano Basic</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Histórico de Cobranças</h3>
          <div className="flex items-center gap-2">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Buscar tenant..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-coral/20 w-64" />
             </div>
             <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500">
                <Filter size={14} />
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estabelecimento</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano / Valor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Próxima Cobrança</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{sub.tenant}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">ID: SUB-{sub.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{sub.plano}</p>
                    <p className="text-xs text-brand-neutral-500">{sub.valor}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                      {sub.gateway}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar size={12} />
                      <span className="text-xs font-medium">{sub.proxima_cobranca}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      sub.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 
                      sub.status === 'Atrasado' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {sub.status === 'Ativo' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-brand-coral transition-all">
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
