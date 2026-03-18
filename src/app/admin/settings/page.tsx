"use client";

import { 
  Shield, 
  Globe, 
  Settings, 
  Mail, 
  Bell, 
  Zap,
  HardDrive,
  Cpu,
  Database,
  Cloud
} from 'lucide-react';

const systemCards = [
  { label: 'Uptime Sistema', value: '99.98%', icon: Zap, status: 'Ideal' },
  { label: 'Memory Usage', value: '1.2GB / 4GB', icon: Cpu, status: 'Normal' },
  { label: 'Storage (Turso)', value: '14MB / 1GB', icon: Database, status: 'Normal' },
  { label: 'API Latency', value: '24ms', icon: Globe, status: 'Ideal' },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configurações Globais</h2>
        <p className="text-slate-500 font-medium">Controle técnico e administrativo do ecossistema Atendimento Inteligente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemCards.map((card, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <card.icon size={64} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
              <h4 className="text-xl font-bold mb-4">{card.value}</h4>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                card.status === 'Ideal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {card.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
             <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Shield size={20} className="text-brand-coral" />
               Parâmetros de Segurança
             </h3>
             <div className="space-y-6">
                {[
                  { label: 'Autenticação em Dois Fatores (Obrigatório Admin)', active: true },
                  { label: 'Log de Acesso Global (CloudWatch)', active: true }, // Assuming this was the intended line to modify/keep
                  { label: 'Backup Automático Diário (Turso)', active: true },
                  { label: 'Prevenção de Brute Force', active: true },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${item.active ? 'bg-brand-coral' : 'bg-slate-200'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.active ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
             <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Settings size={20} className="text-brand-coral" />
               Configurações de API & Infra
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase">Provider IA Padrão</label>
                   <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-coral/20">
                      <option>OpenAI (GPT-4o)</option>
                      <option>Anthropic (Claude 3)</option>
                      <option>Groq (Llama 3)</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase">Gateway WhatsApp</label>
                   <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-coral/20">
                      <option>WuzAPI (Self-hosted)</option>
                      <option>Evolution API</option>
                      <option>Meta Cloud API</option>
                   </select>
                </div>
             </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
               <HardDrive size={18} className="text-brand-coral" />
               Versão do Sistema
             </h3>
             <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Versão Atual</span>
                  <span className="text-brand-coral font-bold italic">v2.1.0-stable</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Último Deploy</span>
                  <span className="text-slate-900 font-bold tracking-tight">14 de Março, 2024</span>
                </div>
                <button className="w-full mt-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase hover:bg-slate-50 transition-colors">
                  Checar Atualizações
                </button>
             </div>
           </div>

           <div className="bg-brand-coral p-6 rounded-2xl text-white shadow-xl shadow-brand-coral/20 group cursor-pointer hover:bg-brand-coral/90 transition-all">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-white/20 rounded-lg">
                    <Zap size={20} />
                 </div>
                 <h3 className="font-bold">Modo de Manutenção</h3>
              </div>
              <p className="text-xs text-white/80 leading-relaxed mb-4">Ative para bloquear acesso de todos os estabelecimentos durante atualizações críticas.</p>
              <div className="flex justify-center">
                 <span className="text-[10px] font-black border border-white/50 px-4 py-1.5 rounded-full uppercase tracking-widest group-hover:bg-white group-hover:text-brand-coral transition-all">Ativar Agora</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
