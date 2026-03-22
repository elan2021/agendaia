"use client";

import { useState, useEffect, useTransition } from 'react';
import { 
  User, 
  Building, 
  Lock, 
  Bell, 
  Smartphone, 
  Globe,
  CreditCard,
  Target,
  Palette,
  Terminal,
  Copy,
  RefreshCw,
  CheckCircle2,
  Code2
} from 'lucide-react';
import { getCurrentTenant, regenerateApiKey, updateTenantTemplate } from '@/app/actions/tenants';

export default function TenantSettingsPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [updatingTemplate, setUpdatingTemplate] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('https://atendimentointeligente.com.br');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
    async function loadData() {
      const data = await getCurrentTenant();
      setTenant(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleCopy = () => {
    if (!tenant?.api_key) return;
    navigator.clipboard.writeText(tenant.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm('Tem certeza? Suas integrações atuais pararão de funcionar até você atualizar a chave.')) return;
    
    startTransition(async () => {
      const result = await regenerateApiKey();
      if (result.success) {
        setTenant({ ...tenant, api_key: result.apiKey });
      }
    });
  };

  if (isLoading || !tenant) {
    return (
      <div className="space-y-8 animate-pulse p-8">
        <div className="h-10 bg-brand-neutral-50 rounded-xl w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-brand-neutral-50 rounded-[32px]" />)}
        </div>
      </div>
    );
  }

  const sections = [
    { icon: Building, label: 'Informações do Negócio', description: 'Nome, logo, endereço e horários de funcionamento.', href: '/dashboard/configuracoes/negocio' },
    { icon: User, label: 'Perfil do Administrador', description: 'Seus dados pessoais e credenciais de acesso.' },
    { icon: Palette, label: 'Identidade Visual', description: 'Cores, fontes e personalização do agendamento online.' },
    { icon: Smartphone, label: 'Integração WhatsApp', description: 'Status da conexão e números autorizados.' },
    { icon: Lock, label: 'Segurança & Permissões', description: 'Controle de acesso para sua equipe.' },
    { icon: Bell, label: 'Notificações', description: 'Alertas de novos agendamentos e lembretes.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Configurações</h2>
        <p className="text-brand-neutral-500 font-medium">Ajuste as preferências e detalhes da <span className="text-brand-navy font-bold">{tenant.nome}</span>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, i) => {
          const Content = (
            <div className="flex items-start gap-5 p-7 bg-white border border-brand-neutral-100 rounded-[32px] hover:border-brand-coral hover:shadow-xl hover:-translate-y-1 transition-all text-left group w-full h-full">
              <div className="p-4 bg-brand-neutral-50 rounded-2xl text-brand-neutral-400 group-hover:bg-brand-coral group-hover:text-white transition-all shadow-sm">
                <section.icon size={24} />
              </div>
              <div>
                <h3 className="font-black text-brand-navy mb-1 uppercase text-xs tracking-wider">{section.label}</h3>
                <p className="text-[10px] text-brand-neutral-500 leading-relaxed font-bold uppercase tracking-tight">{section.description}</p>
              </div>
            </div>
          );

          if (section.href) {
            return (
              <a key={i} href={section.href}>
                {Content}
              </a>
            );
          }

          return (
            <button key={i} className="outline-none">
              {Content}
            </button>
          );
        })}
      </div>

      {/* Template Selection Section */}
      <div className="bg-white border border-brand-neutral-100 rounded-[40px] p-10 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-brand-coral/10 rounded-2xl text-brand-coral">
            <Palette size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Template da Página Pública</h3>
            <p className="text-brand-neutral-500 text-xs font-bold uppercase tracking-widest">Escolha como seus clientes verão sua empresa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 'manicure1', name: 'Manicure 1 (Camila)', image: '/previews/manicure1.png', tag: 'Social & Vibrante' },
            { id: 'manicure2', name: 'Manicure 2 (Sand)', image: '/previews/manicure2.png', tag: 'Elegante & Clean' },
            { id: 'barbearia1', name: 'Barbearia 1 (Rei)', image: '/previews/barbearia1.png', tag: 'Premium & Dark' },
          ].map((tmpl) => (
            <button 
              key={tmpl.id}
              disabled={updatingTemplate !== null || tenant.template === tmpl.id}
              className={`relative group transition-all text-left outline-none ${tenant.template === tmpl.id ? 'scale-105 cursor-default' : 'hover:scale-[1.02] cursor-pointer'}`}
              onClick={async () => {
                console.log('CLIENT: Iniciando seleção do template:', tmpl.id);
                setUpdatingTemplate(tmpl.id);
                try {
                  const res = await updateTenantTemplate(tmpl.id);
                  console.log('CLIENT: Resposta da Server Action:', res);
                  if (res.success) {
                    console.log('CLIENT: Sucesso! Atualizando estado local.');
                    setTenant((prev: any) => ({ ...prev, template: tmpl.id }));
                    setSaveSuccessMessage('Template atualizado com sucesso!');
                    setTimeout(() => setSaveSuccessMessage(null), 3000);
                  } else {
                    console.error('CLIENT: Erro retornado:', res.error);
                    alert('Erro ao atualizar: ' + (res.error || 'Erro desconhecido'));
                  }
                } catch (err) {
                  console.error('CLIENT: Erro de conexão:', err);
                  alert('Erro de conexão ao atualizar template');
                } finally {
                  setUpdatingTemplate(null);
                }
              }}
            >
              <div className={`relative rounded-3xl overflow-hidden border-4 transition-all ${tenant.template === tmpl.id ? 'border-brand-coral shadow-2xl' : 'border-brand-neutral-50 group-hover:border-brand-coral/30'}`}>
                <img src={tmpl.image} alt={tmpl.name} className={`w-full aspect-[4/5] object-cover transition-all ${updatingTemplate === tmpl.id ? 'blur-sm grayscale' : ''}`} />
                
                {/* Overlay status */}
                {updatingTemplate === tmpl.id && (
                  <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px]">
                    <RefreshCw size={32} className="text-brand-coral animate-spin" />
                  </div>
                )}

                <div className={`absolute inset-0 bg-brand-navy/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${tenant.template === tmpl.id || updatingTemplate === tmpl.id ? 'opacity-0' : ''}`}>
                  <p className="text-white font-black uppercase text-xs tracking-widest">Selecionar Template</p>
                </div>

                {(tenant.template === tmpl.id && !updatingTemplate) && (
                  <div className="absolute top-4 right-4 bg-brand-coral text-white p-2 rounded-full shadow-lg animate-in zoom-in duration-300">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 block transition-colors ${tenant.template === tmpl.id ? 'text-brand-coral' : 'text-brand-neutral-400 group-hover:text-brand-coral'}`}>{tmpl.tag}</span>
                <h4 className="text-sm font-black text-brand-navy uppercase tracking-tight">{tmpl.name}</h4>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API / Developers Section */}
      <div className="bg-brand-navy rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <Code2 size={120} />
         </div>

         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                    <Terminal size={24} className="text-brand-coral" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">API para Desenvolvedores</h3>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Integre sua agenda com outros sistemas</p>
                </div>
            </div>

            <div className="space-y-6 max-w-2xl">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-1">Sua API Key</label>
                    <div className="flex gap-3">
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-mono text-sm text-brand-coral font-bold break-all shadow-inner">
                            {tenant.api_key}
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleCopy}
                                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group"
                                title="Copiar Chave"
                            >
                                {copied ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Copy size={20} className="group-hover:scale-110 transition-transform" />}
                            </button>
                            <button 
                                onClick={handleRegenerate}
                                disabled={isPending}
                                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group"
                                title="Regenerar Chave"
                            >
                                <RefreshCw size={20} className={`${isPending ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <h5 className="text-brand-coral font-black text-[10px] uppercase tracking-[0.2em] mb-4">Catálogo & Disponibilidade</h5>
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Endpoint de Serviços</h4>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">
                                curl -X GET "{origin}/api/v1/services" \<br/>
                                &nbsp;&nbsp;-H "X-API-Key: {tenant.api_key}"
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Endpoint de Disponibilidade</h4>
                            <p className="text-[10px] text-white/40 mb-3 font-bold uppercase">Parâmetros: profissional_id, servico_id, data (YYYY-MM-DD)</p>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">
                                curl -X GET "{origin}/api/v1/availability?profissional_id=ID&servico_id=ID&data=2026-03-14" \<br/>
                                &nbsp;&nbsp;-H "X-API-Key: {tenant.api_key}"
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <h5 className="text-brand-coral font-black text-[10px] uppercase tracking-[0.2em] mb-4">Gestão de Agendamentos</h5>
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Listar Agendamentos (Por Cliente)</h4>
                            <p className="text-[10px] text-white/40 mb-3 font-bold uppercase">Método: GET | URL: /api/v1/appointments?cliente_id=TELEFONE</p>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">
                                curl -X GET "{origin}/api/v1/appointments?cliente_id=11988887777" \<br/>
                                &nbsp;&nbsp;-H "X-API-Key: {tenant.api_key}"
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Criar Agendamento</h4>
                            <p className="text-[10px] text-white/40 mb-3 font-bold uppercase">Método: POST | Body: cliente_tel, cliente_nome, servico_id, profissional_id, inicio (ISO)</p>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">
                                curl -X POST "{origin}/api/v1/appointments" \<br/>
                                &nbsp;&nbsp;-H "X-API-Key: {tenant.api_key}" \<br/>
                                &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                                &nbsp;&nbsp;-d '&#123;"cliente_tel":"11988887777","cliente_nome":"João Silva","servico_id":"ID-DO-SERVICO","profissional_id":"ID-DO-PRO","inicio":"2026-03-14T15:00:00"&#125;'
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Alterar Status do Agendamento</h4>
                            <p className="text-[10px] text-white/40 mb-3 font-bold uppercase">Método: PATCH | Body: id, status (confirmado, cancelado, realizado, falta)</p>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">
                                curl -X PATCH "{origin}/api/v1/appointments" \<br/>
                                &nbsp;&nbsp;-H "X-API-Key: {tenant.api_key}" \<br/>
                                &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                                &nbsp;&nbsp;-d '&#123;"id":"ID-DO-AGENDAMENTO","status":"cancelado"&#125;'
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <h5 className="text-brand-coral font-black text-[10px] uppercase tracking-[0.2em] mb-4">Clientes</h5>
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Consultar Dados do Cliente</h4>
                            <p className="text-[10px] text-white/40 mb-3 font-bold uppercase">Método: GET | URL: /api/v1/clients?telefone=NUMERO</p>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">
                                curl -X GET "{origin}/api/v1/clients?telefone=11988887777" \<br/>
                                &nbsp;&nbsp;-H "X-API-Key: {tenant.api_key}"
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <h5 className="text-brand-coral font-black text-[10px] uppercase tracking-[0.2em] mb-4">Profissionais</h5>
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Listar Profissionais Ativos</h4>
                            <p className="text-[10px] text-white/40 mb-3 font-bold uppercase">Método: GET | URL: /api/v1/professionals</p>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">
                                curl -X GET "{origin}/api/v1/professionals" \<br/>
                                &nbsp;&nbsp;-H "X-API-Key: {tenant.api_key}"
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                    <h5 className="text-brand-coral font-black text-[10px] uppercase tracking-[0.2em] mb-4">Administração Global (Público)</h5>
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Cadastro de Novo Estabelecimento</h4>
                            <p className="text-[10px] text-white/40 mb-3 font-bold uppercase">Método: POST | URL: /api/v1/public/tenants</p>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">
                                curl -X POST "{origin}/api/v1/public/tenants" \<br/>
                                &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                                &nbsp;&nbsp;-d '&#123;"nome":"Minha Empresa","slug":"minha-empresa","proprietario_nome":"João","whatsapp_numero":"11999998888","instancia":"instancia-01"&#125;'
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Listar Estabelecimentos por Instância</h4>
                            <p className="text-[10px] text-white/40 mb-3 font-bold uppercase">Método: GET | URL: /api/v1/public/tenants?instancia=ID</p>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">
                                curl -X GET "{origin}/api/v1/public/tenants?instancia=instancia-01"
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Data e Hora Atual do Servidor</h4>
                            <p className="text-[10px] text-white/40 mb-3 font-bold uppercase">Método: GET | URL: /api/v1/public/time — Retorna data, hora e dia da semana em pt-BR</p>
                            <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-emerald-400 border border-white/5 overflow-x-auto whitespace-pre">
                                curl -X GET "{origin}/api/v1/public/time"
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {saveSuccessMessage && (
        <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 size={24} />
          <p className="font-bold">{saveSuccessMessage}</p>
        </div>
      )}
    </div>
  );
}

