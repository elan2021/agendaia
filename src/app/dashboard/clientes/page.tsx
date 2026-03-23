"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Calendar, 
  MessageSquare, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Star,
  UserPlus,
  Trash2
} from 'lucide-react';
import { getClients, deleteClient } from '@/app/actions/appointments';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteTel, setConfirmDeleteTel] = useState<string | null>(null);
  const [deletingTel, setDeletingTel] = useState<string | null>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    setIsLoading(true);
    const data = await getClients();
    setClientes(data);
    setIsLoading(false);
  }

  async function handleDelete(telefone: string) {
    setDeletingTel(telefone);
    const res = await deleteClient(telefone);
    if (res.success) {
      setClientes(prev => prev.filter(c => c.telefone !== telefone));
    }
    setDeletingTel(null);
    setConfirmDeleteTel(null);
  }

  const filteredClientes = clientes.filter(c => 
    c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.telefone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-sans">Clientes</h2>
          <p className="text-brand-neutral-500 text-sm mt-1">Gerencie sua base de {clientes.length} clientes cadastrados.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neutral-400 group-focus-within:text-brand-coral transition-colors" />
            <input 
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-brand-neutral-100 rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-coral/20 min-w-[280px] shadow-sm transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-xl font-bold text-sm hover:bg-brand-navy/90 transition-all shadow-sm active:scale-95">
            <UserPlus size={18} />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-brand-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-coral/10 text-brand-coral rounded-xl">
              <Users size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
              <TrendingUp size={14} />
              <span>+5% este mês</span>
            </div>
          </div>
          <p className="text-3xl font-black text-brand-navy">{clientes.length}</p>
          <p className="text-xs font-bold text-brand-neutral-400 uppercase tracking-widest mt-1">Total de Clientes</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-cream text-brand-navy rounded-xl">
              <Star size={24} />
            </div>
          </div>
          <p className="text-3xl font-black text-brand-navy">
            {clientes.filter(c => c.total_visitas > 5).length}
          </p>
          <p className="text-xs font-bold text-brand-neutral-400 uppercase tracking-widest mt-1">Clientes Fiéis (5+ visitas)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquare size={24} />
            </div>
          </div>
          <p className="text-3xl font-black text-brand-navy">
            {clientes.filter(c => c.nome).length}
          </p>
          <p className="text-xs font-bold text-brand-neutral-400 uppercase tracking-widest mt-1">Perfis Completos</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-brand-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-neutral-50/50 border-b border-brand-neutral-100">
                <th className="px-6 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Contato</th>
                <th className="px-6 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Visitas</th>
                <th className="px-6 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Último Agendamento</th>
                <th className="px-6 py-4 text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-neutral-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-brand-neutral-100 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-brand-neutral-100 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-brand-neutral-100 rounded w-8" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-brand-neutral-100 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-brand-neutral-100 rounded ml-auto w-8" /></td>
                  </tr>
                ))
              ) : filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.telefone} className="hover:bg-brand-cream/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-cream flex items-center justify-center text-brand-navy font-bold text-sm">
                          {cliente.nome?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-brand-navy">{cliente.nome || 'Sem nome'}</p>
                          <p className="text-[10px] font-bold text-brand-neutral-400 uppercase tracking-tighter">
                            Cadastrado em {new Date(cliente.criado_em).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-brand-neutral-600">
                        <Phone size={14} className="text-brand-neutral-300" />
                        {cliente.telefone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-neutral-50 rounded-full text-xs font-bold text-brand-navy">
                        {cliente.total_visitas}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-brand-navy">
                        <Calendar size={14} className="text-brand-neutral-300" />
                        {cliente.ultimo_agendamento 
                          ? new Date(cliente.ultimo_agendamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : 'Nenhum'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-brand-neutral-400 hover:text-brand-coral hover:bg-brand-coral/5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <MessageSquare size={18} />
                        </button>
                        {confirmDeleteTel === cliente.telefone ? (
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-xl px-2 py-1">
                            <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">Excluir?</span>
                            <button
                              onClick={() => handleDelete(cliente.telefone)}
                              disabled={deletingTel === cliente.telefone}
                              className="text-[9px] font-black text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-lg uppercase transition-colors disabled:opacity-50"
                            >
                              {deletingTel === cliente.telefone ? '...' : 'Sim'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteTel(null)}
                              className="text-[9px] font-black text-brand-neutral-400 hover:text-brand-navy px-1 uppercase transition-colors"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteTel(cliente.telefone)}
                            className="p-2 text-brand-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Excluir cliente"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-brand-neutral-400">
                      <Search size={48} className="opacity-20" />
                      <p className="font-bold">Nenhum cliente encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
