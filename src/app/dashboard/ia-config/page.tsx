"use client";

import { useState } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Settings2, 
  Play, 
  Pause, 
  Save,
  Wand2,
  RefreshCw,
  Eye
} from 'lucide-react';

export default function IAConfigPage() {
  const [active, setActive] = useState(true);
  const [context, setContext] = useState(
    "Você é a Júlia, a assistente virtual da Barbearia do João, operando através da plataforma Atendimento Inteligente. Você é simpática, profissional e usa uma linguagem moderna, mas respeitosa. Seu objetivo é ajudar os clientes a agendar serviços, tirar dúvidas sobre preços e horários, e confirmar agendamentos."
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-sans">Configuração da IA</h2>
          <p className="text-brand-neutral-500">Customize a personalidade e as diretrizes da sua assistente virtual.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActive(!active)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${
              active 
                ? 'bg-brand-green-light text-brand-green-dark border border-brand-green/20' 
                : 'bg-brand-neutral-100 text-brand-neutral-500 border border-brand-neutral-200'
            }`}
          >
            {active ? <Pause size={18} /> : <Play size={18} />}
            {active ? 'Atendente Online' : 'Atendente Offline'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-xl font-bold hover:bg-brand-navy/90 transition-colors">
            <Save size={18} />
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-brand-neutral-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-coral/10 rounded-lg text-brand-coral">
                  <Bot size={20} />
                </div>
                <h3 className="font-bold text-brand-navy">Personalidade e Contexto</h3>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-bold text-brand-coral hover:bg-brand-coral/5 px-2 py-1 rounded-md transition-colors">
                <Wand2 size={14} />
                Melhorar com IA
              </button>
            </div>
            <textarea 
              className="w-full h-48 p-4 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm text-brand-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all resize-none"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Descreva como a IA deve se comportar e o que ela deve saber sobre o seu negócio..."
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-brand-neutral-50 text-brand-neutral-500 text-[10px] font-bold rounded-full border border-brand-neutral-100">Simpática</span>
              <span className="px-3 py-1 bg-brand-neutral-50 text-brand-neutral-500 text-[10px] font-bold rounded-full border border-brand-neutral-100">Responde em Português</span>
              <span className="px-3 py-1 bg-brand-neutral-50 text-brand-neutral-500 text-[10px] font-bold rounded-full border border-brand-neutral-100">Não dá descontos</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-neutral-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-navy/10 rounded-lg text-brand-navy">
                  <MessageSquare size={20} />
                </div>
                <h3 className="font-bold text-brand-navy">Logs Recentes</h3>
              </div>
              <button className="text-xs font-bold text-brand-neutral-500 hover:text-brand-navy flex items-center gap-1">
                <RefreshCw size={14} />
                Atualizar
              </button>
            </div>

            <div className="space-y-4">
              {[
                { user: 'Elan Melo', msg: 'Quais horários disponíveis para amanhã?', time: '2m atrás', status: 'Agendamento em curso' },
                { user: 'Ana Paula', msg: 'Ola, gostaria de desmarcar meu horário das 14h', time: '15m atrás', status: 'Cancelado' },
                { user: 'Carlos Silva', msg: 'Quanto custa o corte + barba?', time: '1h atrás', status: 'Respondido' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-brand-cream/10 rounded-xl border border-brand-neutral-50 group hover:border-brand-coral/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy font-bold text-xs uppercase">
                      {log.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-navy">{log.user}</p>
                      <p className="text-xs text-brand-neutral-500 truncate max-w-[200px]">{log.msg}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-brand-neutral-400 mb-1 uppercase tracking-wider">{log.time}</p>
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-bold uppercase transition-colors ${
                         log.status.includes('curso') ? 'text-brand-coral' : 
                         log.status.includes('Cancelado') ? 'text-red-500' : 'text-brand-green'
                       }`}>
                         {log.status}
                       </span>
                       <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-brand-neutral-400 hover:text-brand-navy">
                         <Eye size={14} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-navy p-6 rounded-2xl text-white shadow-xl">
             <div className="flex items-center gap-2 mb-4">
               <Settings2 size={20} className="text-brand-coral" />
               <h3 className="font-bold">Capacidades da IA</h3>
             </div>
             <div className="space-y-3">
               {[
                 { label: 'Agendamento Direto', active: true },
                 { label: 'Cancelamento via Texto', active: true },
                 { label: 'Consulta de Preços', active: true },
                 { label: 'Sugestão de Horários', active: true },
                 { label: 'Integração com Agenda', active: true },
                 { label: 'Lembretes Automáticos', active: false },
               ].map((cap, i) => (
                 <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                   <span className="text-xs font-medium text-slate-300">{cap.label}</span>
                   <div className={`w-3 h-3 rounded-full ${cap.active ? 'bg-brand-green border-2 border-brand-green/30' : 'bg-slate-700'}`}></div>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-neutral-100 shadow-sm">
             <h3 className="font-bold text-brand-navy mb-4">Métricas Assistente</h3>
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tight">
                    <span className="text-brand-neutral-500">Confiança Resposta</span>
                    <span className="text-brand-navy">94%</span>
                  </div>
                  <div className="w-full bg-brand-cream h-1.5 rounded-full">
                    <div className="bg-brand-green h-full rounded-full" style={{ width: '94%' }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tight">
                    <span className="text-brand-neutral-500">Taxa de Sucesso</span>
                    <span className="text-brand-navy">82%</span>
                  </div>
                  <div className="w-full bg-brand-cream h-1.5 rounded-full">
                    <div className="bg-brand-coral h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
