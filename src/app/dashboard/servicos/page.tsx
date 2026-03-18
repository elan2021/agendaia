"use client";

import { useState, useTransition, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit2, Trash2, Clock, DollarSign, CheckCircle2, XCircle, AlertCircle, X, Users } from 'lucide-react';
import { createService, updateService, deleteService, getServices } from '@/app/actions/services';
import { getProfessionals } from '@/app/actions/professionals';

type Service = {
  id: string;
  nome: string;
  duracao_min: number;
  preco: number;
  descricao?: string | null;
  ativo: boolean;
  profissionais_ids: string;
};

type Professional = {
  id: string;
  nome: string;
};

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedPros, setSelectedPros] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setIsLoading(true);
    try {
      const [servicesData, prosData] = await Promise.all([
        getServices(),
        getProfessionals()
      ]);
      setServices(servicesData as Service[]);
      setProfessionals(prosData as Professional[]);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setEditingService(null);
    setSelectedPros([]);
    setError(null);
    setIsModalOpen(true);
  }

  function openEditModal(service: Service) {
    setEditingService(service);
    try {
      const parsed = JSON.parse(service.profissionais_ids || "[]");
      setSelectedPros(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSelectedPros([]);
    }
    setError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingService(null);
    setSelectedPros([]);
    setError(null);
  }

  function togglePro(id: string) {
    setSelectedPros(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }

  function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    startTransition(async () => {
      try {
        await deleteService(id);
        fetchServices();
      } catch {
        alert('Erro ao excluir serviço.');
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get('nome') as string,
      preco: Number(formData.get('preco')),
      duracao_min: Number(formData.get('duracao_min')),
      descricao: (formData.get('descricao') as string) || undefined,
      ativo: formData.get('ativo') === 'on',
      profissionais_ids: JSON.stringify(selectedPros),
    };

    startTransition(async () => {
      try {
        if (editingService) {
          await updateService(editingService.id, data);
        } else {
          await createService(data);
        }
        closeModal();
        fetchServices();
      } catch {
        setError('Erro ao salvar serviço. Tente novamente.');
      }
    });
  }

  const filteredServices = services.filter(s =>
    s.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-sans">Serviços</h2>
          <p className="text-brand-neutral-500">Gerencie os serviços oferecidos pela sua empresa.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-coral text-white rounded-xl font-semibold hover:bg-brand-coral/90 transition-colors shadow-sm shadow-brand-coral/20"
        >
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-brand-neutral-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brand-neutral-100 bg-brand-cream/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neutral-300" size={18} />
            <input
              type="text"
              placeholder="Buscar serviço..."
              className="w-full pl-10 pr-4 py-2 bg-brand-cream/30 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-cream/5">
                <th className="px-6 py-4 text-xs font-bold text-brand-neutral-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-neutral-500 uppercase tracking-wider">Duração</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-neutral-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-neutral-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-brand-neutral-400">
                    Carregando serviços...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-brand-neutral-400">
                    Nenhum serviço encontrado. Clique em &quot;Novo Serviço&quot; para começar.
                  </td>
                </tr>
              ) : filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-brand-cream/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-brand-navy">{service.nome}</div>
                    <div className="text-xs text-brand-neutral-500 max-w-xs truncate">{service.descricao || '—'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-brand-neutral-700">
                      <Clock size={14} className="text-brand-neutral-300" />
                      <span className="text-sm">{service.duracao_min} min</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-brand-navy font-bold">
                      <span className="text-xs text-brand-neutral-500">R$</span>
                      <span>{Number(service.preco).toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${service.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {service.ativo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {service.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-2 text-brand-neutral-500 hover:text-brand-navy hover:bg-brand-cream/50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-brand-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-brand-neutral-500 hover:text-brand-navy hover:bg-brand-cream/50 rounded-lg transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-brand-navy p-6 text-white flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </h3>
                <p className="text-brand-neutral-300 text-xs mt-1">
                  {editingService ? 'Atualize as informações do serviço.' : 'Defina o nome, preço e duração.'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-white/60 hover:text-white p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-red-100">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest pl-1">Nome do Serviço</label>
                <input
                  name="nome"
                  defaultValue={editingService?.nome}
                  className="w-full p-3 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all"
                  placeholder="Ex: Corte de Cabelo"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest pl-1">Preço (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neutral-300" size={14} />
                    <input
                      name="preco"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={editingService?.preco}
                      className="w-full pl-8 p-3 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all"
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest pl-1">Duração (min)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neutral-300" size={14} />
                    <input
                      name="duracao_min"
                      type="number"
                      min="5"
                      defaultValue={editingService?.duracao_min}
                      className="w-full pl-8 p-3 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all"
                      placeholder="30"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest pl-1">Descrição</label>
                <textarea
                  name="descricao"
                  defaultValue={editingService?.descricao ?? ''}
                  className="w-full p-3 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all resize-none"
                  placeholder="Uma breve descrição do serviço..."
                  rows={3}
                />
              </div>

              {/* Seleção de Profissionais */}
              <div className="space-y-2 pt-2 border-t border-brand-neutral-100">
                <div className="flex items-center gap-2 pl-1 mb-2">
                  <Users size={14} className="text-brand-neutral-400" />
                  <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">
                    Profissionais que realizam este serviço
                  </label>
                </div>
                
                {professionals.length === 0 ? (
                  <div className="p-4 bg-brand-cream/20 rounded-xl text-sm text-brand-neutral-500 text-center border border-brand-neutral-100 border-dashed">
                    Nenhum profissional cadastrado no sistema.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {professionals.map(pro => (
                      <label
                        key={pro.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedPros.includes(pro.id) 
                            ? 'bg-brand-coral/10 border-brand-coral !text-brand-coral bg-white' 
                            : 'bg-brand-cream/20 border-brand-neutral-100 text-brand-navy hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPros.includes(pro.id)}
                          onChange={() => togglePro(pro.id)}
                          className="w-4 h-4 rounded text-brand-coral focus:ring-brand-coral border-gray-300"
                        />
                        <span className="text-sm font-bold truncate">{pro.nome}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-3 bg-brand-cream/20 rounded-xl">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="ativo"
                    defaultChecked={editingService ? editingService.ativo : true}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-green peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
                <div>
                  <span className="text-sm font-bold text-brand-navy block">Serviço Ativo</span>
                  <span className="text-xs text-brand-neutral-400">Disponível para agendamento pela IA</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-brand-neutral-100 text-brand-neutral-500 rounded-xl text-xs font-bold hover:bg-brand-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-2 py-3 bg-brand-coral text-white rounded-xl text-xs font-bold hover:bg-brand-coral/90 transition-all shadow-md shadow-brand-coral/20 disabled:opacity-50"
                  style={{ flex: 2 }}
                >
                  {isPending ? 'Salvando...' : editingService ? 'Atualizar Serviço' : 'Salvar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
