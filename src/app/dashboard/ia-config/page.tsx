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
  Loader2,
  QrCode,
  Smartphone,
  Link2,
  Unlink
} from 'lucide-react';
import { getIAConfig, updateIAConfig } from '@/app/actions/ia-config';
import { getWuzapiConnectionStatus, getWuzapiQR, connectWuzapiPhone, logoutWuzapi } from '@/app/actions/wuzapi';

export default function IAConfigPage() {
  const [active, setActive] = useState(true);
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // WuzAPI States
  const [wuzapiStatus, setWuzapiStatus] = useState<any>(null);
  const [isLoadingWuzapi, setIsLoadingWuzapi] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [phoneToPair, setPhoneToPair] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const loadWuzapiStatus = async () => {
    const status = await getWuzapiConnectionStatus();
    setWuzapiStatus(status);
    setIsLoadingWuzapi(false);
  };

  useEffect(() => {
    async function loadData() {
      const data = await getIAConfig();
      if (data) {
        setActive(data.ia_ativo ?? true);
        setContext(data.ia_persona || "");
      }
      setIsLoading(false);
      await loadWuzapiStatus();
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

  const handleConnectQR = async () => {
    setIsConnecting(true);
    const res = await getWuzapiQR();
    if (res?.success) {
      setQrCode(res.qr);
      setPairingCode(null);
    } else {
      alert(res?.error || "Erro ao buscar QR");
    }
    setIsConnecting(false);
  };

  const handleConnectPair = async () => {
    if (!phoneToPair) return alert("Digite o número do telefone com DDD (apenas números)");
    setIsConnecting(true);
    const res = await connectWuzapiPhone(phoneToPair.replace(/\D/g, ''));
    if (res?.success && res.pairingCode) {
      setPairingCode(res.pairingCode);
      setQrCode(null);
    } else {
      alert(res?.error || "Erro ao parear por código. A API pode não suportar pareamento.");
    }
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    if (!confirm("Tem certeza que deseja desconectar o WhatsApp?")) return;
    setIsLoadingWuzapi(true);
    await logoutWuzapi();
    setQrCode(null);
    setPairingCode(null);
    await loadWuzapiStatus();
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

          <div className="bg-white p-8 rounded-[32px] border border-brand-neutral-100 shadow-sm relative overflow-hidden">
             
             <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl flex items-center justify-center ${wuzapiStatus?.data?.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {wuzapiStatus?.data?.connected ? <Link2 size={24} /> : <Unlink size={24} />}
                </div>
                <div>
                   <h3 className="font-black text-brand-navy uppercase tracking-tight">Conexão WhatsApp</h3>
                   <div className="text-[10px] font-bold uppercase tracking-widest text-brand-neutral-500 mt-0.5">
                     {isLoadingWuzapi ? 'Verificando...' : 
                      wuzapiStatus?.data?.connected ? 'API Ativa e Conectada' : 'Aguardando Pareamento'}
                   </div>
                </div>
             </div>

             {isLoadingWuzapi ? (
                <div className="h-32 flex items-center justify-center">
                  <Loader2 className="animate-spin text-brand-neutral-300" size={32} />
                </div>
             ) : (wuzapiStatus?.data?.connected || wuzapiStatus?.data?.loggedIn) ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                       <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-emerald-700">Seu WhatsApp está pareado!</p>
                      <p className="text-xs text-emerald-600/80 font-medium">A IA já está habilitada para usar seu número.</p>
                    </div>
                  </div>
                  <button onClick={handleDisconnect} className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                    <Unlink size={16} /> Desconectar Celular
                  </button>
                </div>
             ) : (
                <div className="space-y-4">
                  
                  {qrCode ? (
                    <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                      <div className="p-4 bg-white border-2 border-brand-neutral-100 rounded-2xl shadow-sm">
                        <img src={qrCode} alt="QR Code" className="w-48 h-48 object-contain" />
                      </div>
                      <p className="text-xs text-center text-brand-neutral-500 font-medium">Escaneie o QR Code com<br/>Aparelhos Conectados no WhatsApp</p>
                      <button onClick={() => setQrCode(null)} className="text-[10px] font-bold text-brand-coral uppercase tracking-widest">Voltar</button>
                    </div>
                  ) : pairingCode ? (
                    <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                       <p className="text-xs text-center text-brand-neutral-500 font-medium">Insira este código no seu WhatsApp:</p>
                       <div className="text-3xl font-black text-brand-navy tracking-[0.2em] bg-brand-neutral-50 px-6 py-4 rounded-2xl border border-brand-neutral-200">
                         {pairingCode}
                       </div>
                       <button onClick={() => setPairingCode(null)} className="text-[10px] font-bold text-brand-coral uppercase tracking-widest">Voltar</button>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-brand-neutral-50 rounded-2xl border border-brand-neutral-100 space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-brand-neutral-500">Pareamento por Código (Novo)</label>
                         <div className="flex gap-2">
                            <input type="text" placeholder="DDD + Número" value={phoneToPair} onChange={e => setPhoneToPair(e.target.value)} className="w-[180px] px-3 text-sm font-bold bg-white border border-brand-neutral-200 rounded-xl outline-none focus:border-brand-navy" />
                            <button disabled={isConnecting} onClick={handleConnectPair} className="flex-1 bg-brand-navy hover:bg-brand-navy/90 text-white flex items-center justify-center p-3 rounded-xl disabled:opacity-50 transition-colors">
                              {isConnecting ? <Loader2 size={18} className="animate-spin" /> : 'Avançar'}
                            </button>
                         </div>
                      </div>
                      
                      <div className="relative flex items-center justify-center py-2">
                        <div className="absolute w-full h-[1px] bg-brand-neutral-100"></div>
                        <span className="relative bg-white px-2 text-[10px] text-brand-neutral-400 font-black tracking-widest uppercase">Ou</span>
                      </div>

                      <button disabled={isConnecting} onClick={handleConnectQR} className="w-full py-3 bg-brand-neutral-50 hover:bg-brand-neutral-100 border border-brand-neutral-200 text-brand-navy rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                         {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
                         Exibir QR Code
                      </button>
                    </>
                  )}
                  
                </div>
             )}
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
