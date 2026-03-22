"use client";

import { useState, useEffect, useTransition } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Settings2, 
  Play, 
  Pause, 
  Save,
  Wand2,
  RefreshCw,
  Eye,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { getIAConfig, updateIAConfig } from '@/app/actions/ia-config';

export default function IAConfigPage() {
  const [active, setActive] = useState(true);
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getIAConfig();
      if (data) {
        setActive(data.ia_ativo ?? true);
        setContext(data.ia_persona || "");
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async () => {
    startTransition(async () => {
      const res = await updateIAConfig({
        ia_persona: context,
        ia_ativo: active
      });
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(res.error || 'Erro ao salvar configurações');
      }
    });
  };

  const toggleActive = async () => {
    const newState = !active;
    setActive(newState);
    // Auto-save status change
    await updateIAConfig({ ia_ativo: newState });
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse space-y-4">
      <div className="h-10 bg-brand-neutral-50 rounded-xl w-1/4" />
      <div className="h-64 bg-brand-neutral-50 rounded-3xl" />
    </div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight uppercase">Configuração da IA</h2>
          <p className="text-brand-neutral-500 text-sm font-medium uppercase tracking-wider">Customize a personalidade e as diretrizes da sua assistente virtual.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleActive}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all shadow-sm ${
              active 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : 'bg-brand-neutral-50 text-brand-neutral-500 border border-brand-neutral-100'
            }`}
          >
            {active ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
            <span className="uppercase text-[10px] tracking-widest">{active ? 'Assistente Online' : 'Assistente Offline'}</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-navy text-white rounded-2xl font-bold hover:bg-brand-navy/90 transition-all shadow-lg shadow-brand-navy/20 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span className="uppercase text-[10px] tracking-widest">Salvar Alterações</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-brand-neutral-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-coral/10 rounded-xl text-brand-coral">
                  <Bot size={22} />
                </div>
                <h3 className="font-black text-brand-navy uppercase tracking-tight">Persona da Assistente</h3>
              </div>
              <button className="flex items-center gap-1.5 text-[10px] font-black text-brand-coral hover:bg-brand-coral/5 px-3 py-1.5 rounded-xl transition-colors border border-brand-coral/20 uppercase tracking-widest">
                <Wand2 size={14} />
                Melhorar com IA
              </button>
            </div>
            <textarea 
              className="w-full h-64 p-6 bg-brand-neutral-50 border-2 border-transparent rounded-[24px] text-sm font-bold text-brand-navy focus:border-brand-coral focus:bg-white outline-none transition-all resize-none leading-relaxed"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ex: Você é a Júlia, assistente virtual da Barbearia X. Atenda os clientes com simpatia e agende serviços..."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-brand-neutral-50 text-brand-neutral-500 text-[10px] font-black rounded-full border border-brand-neutral-100 uppercase tracking-tight">Simpática</span>
              <span className="px-3 py-1.5 bg-brand-neutral-50 text-brand-neutral-500 text-[10px] font-black rounded-full border border-brand-neutral-100 uppercase tracking-tight">Profissional</span>
              <span className="px-3 py-1.5 bg-brand-neutral-50 text-brand-neutral-500 text-[10px] font-black rounded-full border border-brand-neutral-100 uppercase tracking-tight">Direta ao ponto</span>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-brand-neutral-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-navy/5 rounded-xl text-brand-navy">
                  <MessageSquare size={22} />
                </div>
                <h3 className="font-black text-brand-navy uppercase tracking-tight">Logs Recentes</h3>
              </div>
              <button className="text-[10px] font-black text-brand-neutral-400 hover:text-brand-navy flex items-center gap-2 uppercase tracking-widest transition-colors">
                <RefreshCw size={14} />
                Atualizar
              </button>
            </div>

            <div className="space-y-4">
              {[
                { user: 'Elan Melo', msg: 'Quais horários disponíveis para amanhã?', time: '2m atrás', status: 'Agendamento em curso' },
                { user: 'Ana Paula', msg: 'Ola, gostaria de desmarcar meu horário das 14h', time: '15m atrás', status: 'Cancelado' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-brand-neutral-50/50 rounded-2xl border border-transparent group hover:border-brand-coral/20 hover:bg-white transition-all shadow-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-navy/5 flex items-center justify-center text-brand-navy font-black text-sm uppercase">
                      {log.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-black text-brand-navy mb-0.5">{log.user}</p>
                      <p className="text-xs text-brand-neutral-500 font-medium truncate max-w-[200px]">{log.msg}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-brand-neutral-400 mb-1.5 uppercase tracking-widest">{log.time}</p>
                    <div className="flex items-center gap-3">
                       <span className={`text-[10px] font-black uppercase tracking-tight px-3 py-1 rounded-full ${
                         log.status.includes('curso') ? 'bg-brand-coral/10 text-brand-coral' : 
                         log.status.includes('Cancelado') ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                       }`}>
                         {log.status}
                       </span>
                       <button className="p-2 opacity-0 group-hover:opacity-100 transition-all text-brand-neutral-300 hover:text-brand-navy hover:bg-brand-neutral-50 rounded-xl">
                         <Eye size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-navy p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-coral/20 rounded-full blur-[80px] group-hover:bg-brand-coral/40 transition-all duration-700" />
             <div className="flex items-center gap-3 mb-8 relative z-10">
               <div className="p-2 bg-brand-coral/20 rounded-xl">
                 <Settings2 size={24} className="text-brand-coral" />
               </div>
               <h3 className="font-black uppercase tracking-tight">Capacidades</h3>
             </div>
             <div className="space-y-4 relative z-10">
               {[
                 { label: 'Agendamento Direto', active: true },
                 { label: 'Cancelamento via Texto', active: true },
                 { label: 'Consulta de Preços', active: true },
                 { label: 'Sugestão de Horários', active: true },
                 { label: 'Lembretes Automáticos', active: false },
               ].map((cap, i) => (
                 <div key={i} className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                   <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">{cap.label}</span>
                   <div className={`w-3 h-3 rounded-full ${cap.active ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'bg-slate-700'}`}></div>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-brand-neutral-100 shadow-sm space-y-8">
             <h3 className="font-black text-brand-navy uppercase tracking-tight text-center">Estatísticas da IA</h3>
             <div className="space-y-6">
               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black mb-1 uppercase tracking-widest text-brand-neutral-400">
                    <span>Confiança</span>
                    <span className="text-brand-navy">94%</span>
                  </div>
                  <div className="w-full bg-brand-neutral-50 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full w-[94%]" />
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black mb-1 uppercase tracking-widest text-brand-neutral-400">
                    <span>Sucesso</span>
                    <span className="text-brand-navy">82%</span>
                  </div>
                  <div className="w-full bg-brand-neutral-50 h-3 rounded-full overflow-hidden">
                    <div className="bg-brand-coral h-full rounded-full w-[82%]" />
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Toast de Sucesso */}
      {saveSuccess && (
        <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 z-50">
          <div className="bg-white/20 p-2 rounded-xl">
             <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="font-black uppercase text-xs tracking-widest">Sucesso!</p>
            <p className="text-[10px] font-bold opacity-90 uppercase">Persona da IA atualizada no banco.</p>
          </div>
        </div>
      )}
    </div>
  );
}
