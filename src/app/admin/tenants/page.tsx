"use client";

import { useState, useEffect, useTransition } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  ShieldAlert,
  Building2,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Database,
  Key,
  Smartphone
} from 'lucide-react';
import { getTenants, updateTenant } from '@/app/actions/tenants';

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  // Activation Modal State
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [tursoUrl, setTursoUrl] = useState('');
  const [tursoToken, setTursoToken] = useState('');
  const [instancia, setInstancia] = useState('default');

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<'start' | 'pro'>('start');

  async function handleUpgradePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTenant) return;

    startTransition(async () => {
      const result = await updateTenant(selectedTenant.id, {
        plano: upgradePlan
      });

      if (result.success) {
        setIsUpgradeModalOpen(false);
        setSelectedTenant(null);
        fetchTenants();
      }
    });
  }

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    setIsLoading(true);
    const data = await getTenants();
    setTenants(data);
    setIsLoading(false);
  }

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTenant) return;

    startTransition(async () => {
      const result = await updateTenant(selectedTenant.id, {
        turso_db_url: tursoUrl,
        turso_db_token: tursoToken,
        instancia: instancia,
        ativo: true
      });

      if (result.success) {
        setSelectedTenant(null);
        fetchTenants();
      }
    });
  }

  const filteredTenants = tenants.filter(t => 
    t.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-10 bg-brand-neutral-100 rounded-xl w-64" />
        <div className="bg-white rounded-3xl border border-brand-neutral-100 shadow-sm h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-navy uppercase tracking-tighter">Estabelecimentos</h2>
          <p className="text-brand-neutral-500 text-sm font-medium">Gestão global de portfólio e provisionamento.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-navy/90 transition-all shadow-xl active:scale-95">
          <Plus size={18} />
          Novo Tenant Manual
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-brand-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-neutral-50 bg-brand-neutral-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neutral-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou slug..." 
              className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-sm font-bold text-brand-navy focus:ring-2 focus:ring-brand-coral/20 transition-all placeholder:text-brand-neutral-300 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <span className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest mr-2">Status:</span>
             <div className="flex bg-brand-neutral-100 p-1 rounded-xl">
                <button className="px-3 py-1.5 bg-white rounded-lg text-[10px] font-black uppercase text-brand-navy shadow-sm">Todos</button>
                <button className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-brand-neutral-400 hover:text-brand-navy transition-colors">Pendentes</button>
                <button className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-brand-neutral-400 hover:text-brand-navy transition-colors">Ativos</button>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-neutral-50/30">
                <th className="px-8 py-5 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Estabelecimento</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Plano</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Instância</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Base Dados</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Criado em</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-neutral-50">
              {filteredTenants.length > 0 ? filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-brand-cream/10 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-neutral-50 rounded-2xl flex items-center justify-center text-brand-neutral-400 group-hover:bg-brand-coral group-hover:text-white transition-all shadow-md group-hover:shadow-brand-coral/20">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <div className="font-black text-brand-navy text-sm leading-tight">{tenant.nome}</div>
                        <div className="text-[10px] text-brand-coral font-black uppercase tracking-tighter mt-1">.atendimentointeligente.com/{tenant.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-brand-navy/5 text-brand-navy text-[10px] font-black rounded-lg uppercase tracking-tight ring-1 ring-inset ring-brand-navy/10">
                      {tenant.plano}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-brand-coral uppercase">
                      {tenant.instancia || 'default'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${tenant.turso_db_url ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-brand-neutral-200'}`} />
                       <span className="text-[10px] font-black text-brand-neutral-500 uppercase">{tenant.turso_db_url ? 'Provisionado' : 'Aguardando'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-brand-neutral-500">
                      <Calendar size={14} className="text-brand-coral" />
                      <span className="text-xs font-bold uppercase">{new Date(tenant.criado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-inset ${
                      tenant.ativo ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 
                      'bg-amber-50 text-amber-700 ring-amber-200 shadow-sm'
                    }`}>
                      {tenant.ativo ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {tenant.ativo ? 'Ativo' : 'Pendente'}
                    </span>
                  </td>
                    <td className="px-8 py-6 text-right">
                      {!tenant.ativo ? (
                          <button 
                              onClick={() => setSelectedTenant(tenant)}
                              className="px-4 py-2 bg-brand-coral text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-brand-coral/20 hover:scale-105 transition-all active:scale-95"
                          >
                              Configurar & Ativar
                          </button>
                      ) : (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setSelectedTenant(tenant);
                                  setUpgradePlan(tenant.plano === 'pro' ? 'pro' : 'start');
                                  setIsUpgradeModalOpen(true);
                                }}
                                title="Mudar Plano"
                                className="p-2.5 text-brand-neutral-400 hover:text-white hover:bg-brand-coral rounded-xl transition-all shadow-sm"
                              >
                                Mudar Plano
                              </button>
                              <button className="p-2.5 text-brand-neutral-400 hover:text-brand-navy hover:bg-brand-neutral-50 rounded-xl transition-all"><Eye size={18} /></button>
                              <button className="p-2.5 text-brand-neutral-400 hover:text-brand-coral hover:bg-brand-neutral-50 rounded-xl transition-all"><ShieldAlert size={18} /></button>
                          </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={7} className="px-8 py-20 text-center">
                        <p className="text-brand-neutral-400 font-black text-sm uppercase tracking-widest">Nenhum estabelecimento encontrado.</p>
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Activation Modal */}
        {selectedTenant && !isUpgradeModalOpen && (
          <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full p-10 relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-coral/5 rounded-full -mr-16 -mt-16" />
                
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-brand-navy tracking-tight uppercase">Provisionamento Técnico</h3>
                  <p className="text-brand-neutral-500 text-sm font-medium mt-1">Configurar banco de dados Turso para <span className="text-brand-navy font-black">{selectedTenant.nome}</span></p>
                </div>
  
                <form onSubmit={handleActivate} className="space-y-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                          <Database size={12} className="text-brand-coral" />
                          Turso Database URL
                      </label>
                      <input 
                          type="text" 
                          required
                          placeholder="libsql://your-db.turso.io"
                          value={tursoUrl}
                          onChange={(e) => setTursoUrl(e.target.value)}
                          className="w-full bg-brand-neutral-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-brand-navy focus:ring-2 focus:ring-brand-coral/20 transition-all shadow-inner"
                      />
                  </div>
  
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                          <Key size={12} className="text-brand-coral" />
                          Auth Token
                      </label>
                      <input 
                          type="password" 
                          required
                          placeholder="••••••••••••••••"
                          value={tursoToken}
                          onChange={(e) => setTursoToken(e.target.value)}
                          className="w-full bg-brand-neutral-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-brand-navy focus:ring-2 focus:ring-brand-coral/20 transition-all shadow-inner"
                      />
                  </div>
  
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                          <Smartphone size={12} className="text-brand-coral" />
                          Instância WuzAPI
                      </label>
                      <input 
                          type="text" 
                          required
                          placeholder="Ex: instancia-id"
                          value={instancia}
                          onChange={(e) => setInstancia(e.target.value)}
                          className="w-full bg-brand-neutral-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-brand-navy focus:ring-2 focus:ring-brand-coral/20 transition-all shadow-inner"
                      />
                  </div>
  
                  <div className="flex gap-4 pt-4">
                      <button 
                          type="button"
                          onClick={() => setSelectedTenant(null)}
                          className="flex-1 py-4 bg-brand-neutral-50 text-brand-neutral-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-neutral-100 transition-all"
                      >
                          Cancelar
                      </button>
                      <button 
                          disabled={isPending}
                          type="submit"
                          className="flex-1 py-4 bg-brand-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-navy/90 transition-all shadow-xl shadow-brand-navy/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                          {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Ativar Agora'}
                      </button>
                  </div>
                </form>
             </div>
          </div>
        )}

      {/* Upgrade Plano Modal */}
      {selectedTenant && isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full p-10 relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-coral/5 rounded-full -mr-16 -mt-16" />
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-brand-navy tracking-tight uppercase">Mudar Plano</h3>
                <p className="text-brand-neutral-500 text-sm font-medium mt-1">Alterando plano da empresa <span className="text-brand-navy font-black">{selectedTenant.nome}</span></p>
              </div>

              <form onSubmit={handleUpgradePlan} className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:border-brand-navy transition-all">
                    <input 
                      type="radio" 
                      name="planoOption"
                      value="start"
                      checked={upgradePlan === 'start'}
                      onChange={(e) => setUpgradePlan(e.target.value as 'start' | 'pro')}
                      className="w-5 h-5 text-brand-navy"
                    />
                    <div>
                      <h4 className="font-black text-brand-navy">Start</h4>
                      <p className="text-xs text-brand-neutral-500 font-bold">Confirmações automáticas via n8n (agendamento_link)</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 border rounded-2xl cursor-pointer hover:border-brand-coral transition-all">
                    <input 
                      type="radio" 
                      name="planoOption"
                      value="pro"
                      checked={upgradePlan === 'pro'}
                      onChange={(e) => setUpgradePlan(e.target.value as 'start' | 'pro')}
                      className="w-5 h-5 text-brand-coral"
                    />
                    <div>
                      <h4 className="font-black text-brand-coral">Pró</h4>
                      <p className="text-xs text-brand-neutral-500 font-bold">Agendamento autônomo total (agendamento_automatico)</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                        type="button"
                        onClick={() => {
                          setSelectedTenant(null);
                          setIsUpgradeModalOpen(false);
                        }}
                        className="flex-1 py-4 bg-brand-neutral-50 text-brand-neutral-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-neutral-100 transition-all"
                    >
                        Cancelar
                    </button>
                    <button 
                        disabled={isPending}
                        type="submit"
                        className="flex-1 py-4 bg-brand-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-navy/90 transition-all shadow-xl shadow-brand-navy/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Mudança'}
                    </button>
                </div>
              </form>
           </div>
        </div>
      )}
      </div>
    );
  }

function Loader2({ size, className }: { size: number, className?: string }) {
    return <Clock size={size} className={className} />;
}

