"use client";

import { useState, useTransition, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Star, User, Calendar, AlertCircle, X, Clock } from 'lucide-react';
import { createProfessional, updateProfessional, deleteProfessional, getProfessionals } from '@/app/actions/professionals';

type Professional = {
  id: string;
  nome: string;
  especialidades: string;
  horarios: string;
  ativo: boolean;
  comissao_tipo?: string | null;
  comissao_valor?: number | null;
};

// ---- Schedule types ----
type DaySchedule = {
  ativo: boolean;
  inicio: string;
  fim: string;
  almoco_inicio: string;
  almoco_fim: string;
};
type WeekSchedule = Record<string, DaySchedule>;

const DIAS = [
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];

const DEFAULT_SCHEDULE: WeekSchedule = {
  seg: { ativo: true,  inicio: '08:00', fim: '18:00', almoco_inicio: '12:00', almoco_fim: '13:00' },
  ter: { ativo: true,  inicio: '08:00', fim: '18:00', almoco_inicio: '12:00', almoco_fim: '13:00' },
  qua: { ativo: true,  inicio: '08:00', fim: '18:00', almoco_inicio: '12:00', almoco_fim: '13:00' },
  qui: { ativo: true,  inicio: '08:00', fim: '18:00', almoco_inicio: '12:00', almoco_fim: '13:00' },
  sex: { ativo: true,  inicio: '08:00', fim: '18:00', almoco_inicio: '12:00', almoco_fim: '13:00' },
  sab: { ativo: false, inicio: '09:00', fim: '14:00', almoco_inicio: '',      almoco_fim: ''      },
  dom: { ativo: false, inicio: '09:00', fim: '14:00', almoco_inicio: '',      almoco_fim: ''      },
};

function parseSchedule(raw: string): WeekSchedule {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'seg' in parsed) return parsed as WeekSchedule;
  } catch {}
  return DEFAULT_SCHEDULE;
}

function hasSchedule(raw: string): boolean {
  try {
    const p = JSON.parse(raw);
    return p && typeof p === 'object' && 'seg' in p;
  } catch { return false; }
}

export default function ProfessionalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Cadastro/Edição ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPro, setEditingPro] = useState<Professional | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [comissaoAtiva, setComissaoAtiva] = useState(false);
  const [tipoComissao, setTipoComissao] = useState<'fixo' | 'porcentagem' | ''>('');

  // --- Horários ---
  const [scheduleModalPro, setScheduleModalPro] = useState<Professional | null>(null);
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  useEffect(() => { fetchProfessionals(); }, []);

  async function fetchProfessionals() {
    setIsLoading(true);
    try {
      const data = await getProfessionals();
      setProfessionals(data as Professional[]);
    } catch (err) {
      console.error('Erro ao buscar profissionais:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // --- Cadastro/Edição handlers ---
  function openCreateModal() {
    setEditingPro(null); setError(null);
    setComissaoAtiva(false); setTipoComissao('');
    setIsModalOpen(true);
  }
  function openEditModal(pro: Professional) {
    setEditingPro(pro); setError(null);
    setComissaoAtiva(!!pro.comissao_tipo);
    setTipoComissao(pro.comissao_tipo as any || '');
    setIsModalOpen(true);
  }
  function closeModal() { setIsModalOpen(false); setEditingPro(null); setError(null); }

  function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja remover este profissional?')) return;
    startTransition(async () => {
      try { 
        const result = await deleteProfessional(id); 
        if (result.error) {
          alert(result.error);
        } else {
          fetchProfessionals(); 
        }
      }
      catch { alert('Erro ao remover profissional.'); }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    const formData = new FormData(e.currentTarget);

    const cTipo = formData.get('comissao_tipo') as string;
    const cValorRaw = formData.get('comissao_valor') as string;
    const cValor = (cValorRaw && !isNaN(parseFloat(cValorRaw))) ? parseFloat(cValorRaw) : null;

    const data = {
      nome: formData.get('nome') as string,
      especialidades: JSON.stringify([formData.get('especialidade') as string]),
      horarios: editingPro?.horarios ?? JSON.stringify(DEFAULT_SCHEDULE),
      ativo: formData.get('ativo') === 'on',
      comissao_tipo: comissaoAtiva ? cTipo : null,
      comissao_valor: comissaoAtiva ? cValor : null,
    };

    startTransition(async () => {
      try {
        const result = editingPro 
          ? await updateProfessional(editingPro.id, data) 
          : await createProfessional(data);
        
        if (result.error) {
          setError(result.error);
          return;
        }

        closeModal(); 
        fetchProfessionals();
      } catch (err: any) { 
        console.error('ERRO_SALVAR:', err);
        setError('Erro ao salvar profissional. Tente novamente.'); 
      }
    });
  }

  // --- Schedule handlers ---
  function openScheduleModal(pro: Professional) {
    setScheduleModalPro(pro);
    setSchedule(parseSchedule(pro.horarios));
  }
  function closeScheduleModal() { setScheduleModalPro(null); }

  function toggleDay(key: string) {
    setSchedule(s => ({ ...s, [key]: { ...s[key], ativo: !s[key].ativo } }));
  }
  function updateDayField(key: string, field: keyof DaySchedule, value: string | boolean) {
    setSchedule(s => ({ ...s, [key]: { ...s[key], [field]: value } }));
  }

  async function saveSchedule() {
    if (!scheduleModalPro) return;
    setIsSavingSchedule(true);
    try {
      await updateProfessional(scheduleModalPro.id, {
        nome: scheduleModalPro.nome,
        especialidades: scheduleModalPro.especialidades,
        horarios: JSON.stringify(schedule),
        ativo: scheduleModalPro.ativo,
      });
      fetchProfessionals();
      closeScheduleModal();
    } catch { alert('Erro ao salvar horários.'); }
    finally { setIsSavingSchedule(false); }
  }

  function parseEspecialidade(esp: string): string {
    try {
      const arr = JSON.parse(esp);
      return Array.isArray(arr) ? arr[0] || '' : esp;
    } catch { return esp; }
  }

  const filteredPros = professionals.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-sans">Profissionais</h2>
          <p className="text-brand-neutral-500">Gerencie sua equipe e os horários de atendimento.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-brand-coral text-white rounded-xl font-semibold hover:bg-brand-coral/90 transition-colors shadow-sm shadow-brand-coral/20">
          <Plus size={20} /> Novo Profissional
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neutral-300" size={18} />
        <input type="text" placeholder="Buscar profissional..." className="w-full pl-10 pr-4 py-2 bg-white border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all shadow-sm"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-4 text-center text-brand-neutral-400 py-10">Carregando profissionais...</div>
        ) : filteredPros.map((pro) => (
          <div key={pro.id} className="bg-white rounded-2xl border border-brand-neutral-100 shadow-sm hover:shadow-md transition-all group p-6 relative">

            {/* Card top icons */}
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openScheduleModal(pro)}
                className="p-1.5 text-brand-neutral-300 hover:text-brand-navy hover:bg-brand-cream/50 rounded-lg transition-colors"
                title="Configurar Horários">
                <Clock size={16} />
              </button>
              <button onClick={() => openEditModal(pro)}
                className="p-1.5 text-brand-neutral-300 hover:text-brand-navy hover:bg-brand-cream/50 rounded-lg transition-colors"
                title="Editar">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(pro.id)}
                className="p-1.5 text-brand-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 relative ${pro.ativo ? 'bg-brand-cream text-brand-navy' : 'bg-gray-100 text-gray-400'}`}>
                <User size={40} />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${pro.ativo ? 'bg-brand-green' : 'bg-brand-neutral-300'}`}></div>
              </div>
              <h3 className="font-bold text-brand-navy">{pro.nome}</h3>
              <p className="text-sm text-brand-neutral-500 mb-4">{parseEspecialidade(pro.especialidades)}</p>

              <div className="flex items-center gap-4 w-full border-t border-brand-neutral-100 pt-4">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-brand-neutral-400 uppercase tracking-widest">Avaliação</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-brand-navy">—</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-brand-neutral-100"></div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-brand-neutral-400 uppercase tracking-widest">Agenda</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Calendar size={12} className="text-brand-coral" />
                    <span className="text-xs font-bold text-brand-navy">—</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                <button onClick={() => openEditModal(pro)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-brand-cream/50 text-brand-navy rounded-lg text-xs font-bold hover:bg-brand-cream transition-colors">
                  <Edit2 size={14} /> Editar
                </button>
                <button onClick={() => openScheduleModal(pro)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors border ${hasSchedule(pro.horarios)
                    ? 'bg-brand-navy text-white border-brand-navy hover:bg-brand-navy/80'
                    : 'bg-white border-brand-neutral-100 text-brand-neutral-500 hover:text-brand-navy hover:border-brand-navy/20'
                  }`}>
                  <Clock size={14} />
                  {hasSchedule(pro.horarios) ? 'Horários ✓' : 'Horários'}
                </button>
              </div>
            </div>
          </div>
        ))}

        <button onClick={openCreateModal}
          className="border-2 border-dashed border-brand-neutral-100 rounded-2xl flex flex-col items-center justify-center p-6 text-brand-neutral-300 hover:border-brand-coral hover:text-brand-coral transition-all bg-white/50 group min-h-[300px]">
          <Plus size={40} className="mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-sm">Adicionar Membro</p>
        </button>
      </div>

      {professionals.length === 0 && !isLoading && (
        <p className="text-center text-brand-neutral-400 py-6">
          Nenhum profissional cadastrado. Clique em &quot;Novo Profissional&quot; para começar.
        </p>
      )}

      {/* ======================== MODAL CADASTRO/EDIÇÃO ======================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-brand-navy p-6 text-white flex items-start justify-between flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold">{editingPro ? 'Editar Profissional' : 'Novo Profissional'}</h3>
                <p className="text-brand-neutral-300 text-xs mt-1">{editingPro ? 'Atualize as informações.' : 'Cadastre um novo membro da equipe.'}</p>
              </div>
              <button onClick={closeModal} className="text-white/60 hover:text-white p-1 rounded-full transition-colors flex-shrink-0"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-red-100">
                    <AlertCircle size={14} />{error}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest pl-1">Nome Completo</label>
                  <input name="nome" defaultValue={editingPro?.nome}
                    className="w-full p-3 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all"
                    placeholder="Ex: João Silva" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest pl-1">Especialidade</label>
                  <input name="especialidade" defaultValue={editingPro ? parseEspecialidade(editingPro.especialidades) : ''}
                    className="w-full p-3 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all"
                    placeholder="Ex: Barbeiro Master" required />
                </div>

                {/* Toggle Comissão */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-brand-cream/20 rounded-xl cursor-pointer"
                    onClick={() => { setComissaoAtiva(v => !v); setTipoComissao(''); }}>
                    <div>
                      <span className="text-sm font-bold text-brand-navy block">Adicionar Comissão?</span>
                      <span className="text-xs text-brand-neutral-400">Defina a comissão deste profissional</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={comissaoAtiva}
                        onChange={e => { setComissaoAtiva(e.target.checked); if (!e.target.checked) setTipoComissao(''); }}
                        className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-coral peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                  {comissaoAtiva && (
                    <div className="pl-1 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest pl-1">Tipo de Comissão</label>
                        <select name="comissao_tipo" value={tipoComissao} onChange={e => setTipoComissao(e.target.value as 'fixo' | 'porcentagem')}
                          className="w-full p-3 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all text-brand-navy">
                          <option value="">Selecione o tipo...</option>
                          <option value="fixo">💰 Valor Fixo (R$)</option>
                          <option value="porcentagem">📊 Porcentagem (%)</option>
                        </select>
                      </div>
                      {tipoComissao === 'fixo' && (
                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-150">
                          <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest pl-1">Valor Fixo por Atendimento (R$)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neutral-400 text-sm font-bold">R$</span>
                            <input type="number" name="comissao_valor" min="0" step="0.01"
                              defaultValue={editingPro?.comissao_valor || ''}
                              className="w-full pl-10 p-3 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all"
                              placeholder="0,00" />
                          </div>
                        </div>
                      )}
                      {tipoComissao === 'porcentagem' && (
                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-150">
                          <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest pl-1">Porcentagem por Atendimento (%)</label>
                          <div className="relative">
                            <input type="number" name="comissao_valor" min="0" max="100" step="0.1"
                              defaultValue={editingPro?.comissao_valor || ''}
                              className="w-full pr-10 p-3 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral/20 transition-all"
                              placeholder="0" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-neutral-400 text-sm font-bold">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Toggle Ativo */}
                <div className="flex items-center gap-3 p-3 bg-brand-cream/20 rounded-xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="ativo" defaultChecked={editingPro ? editingPro.ativo : true} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-green peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                  <div>
                    <span className="text-sm font-bold text-brand-navy block">Profissional Ativo</span>
                    <span className="text-xs text-brand-neutral-400">Aparece para agendamentos pela IA</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-brand-neutral-100 flex-shrink-0 flex gap-3 bg-white">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 border border-brand-neutral-100 text-brand-neutral-500 rounded-xl text-xs font-bold hover:bg-brand-neutral-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-2 py-3 bg-brand-coral text-white rounded-xl text-xs font-bold hover:bg-brand-coral/90 transition-all shadow-md shadow-brand-coral/20 disabled:opacity-50"
                  style={{ flex: 2 }}>
                  {isPending ? 'Salvando...' : editingPro ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================== MODAL HORÁRIOS ======================== */}
      {scheduleModalPro && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="bg-brand-navy p-6 text-white flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Clock size={22} className="text-brand-coral" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Horários de Trabalho</h3>
                  <p className="text-brand-neutral-300 text-xs mt-0.5">{scheduleModalPro.nome} · {parseEspecialidade(scheduleModalPro.especialidades)}</p>
                </div>
              </div>
              <button onClick={closeScheduleModal} className="text-white/60 hover:text-white p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-3">
              {DIAS.map(({ key, label }) => {
                const day = schedule[key];
                return (
                  <div key={key}
                    className={`rounded-2xl border transition-all overflow-hidden ${day.ativo ? 'border-brand-navy/10 bg-white shadow-sm' : 'border-brand-neutral-100 bg-brand-neutral-50/50'}`}>

                    {/* Day row header */}
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => toggleDay(key)}>
                      <div className="flex items-center gap-3">
                        {/* Toggle */}
                        <div className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${day.ativo ? 'bg-brand-green' : 'bg-gray-200'}`}>
                          <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-all ${day.ativo ? 'left-[18px]' : 'left-[2px]'}`}></div>
                        </div>
                        <span className={`text-sm font-bold ${day.ativo ? 'text-brand-navy' : 'text-brand-neutral-400'}`}>{label}</span>
                      </div>
                      {day.ativo && (
                        <span className="text-xs text-brand-neutral-400 font-medium">
                          {day.inicio} – {day.fim}
                          {day.almoco_inicio && ` · Almoço ${day.almoco_inicio}–${day.almoco_fim}`}
                        </span>
                      )}
                    </div>

                    {/* Expanded fields */}
                    {day.ativo && (
                      <div className="px-4 pb-4 space-y-4 border-t border-brand-neutral-100 animate-in slide-in-from-top-1 duration-150">

                        {/* Horário de trabalho */}
                        <div className="pt-3">
                          <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest mb-2">Horário de Trabalho</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-brand-neutral-400 font-semibold pl-1">Entrada</label>
                              <input type="time" value={day.inicio}
                                onChange={e => updateDayField(key, 'inicio', e.target.value)}
                                className="w-full mt-1 p-2.5 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 text-brand-navy font-bold" />
                            </div>
                            <div>
                              <label className="text-[10px] text-brand-neutral-400 font-semibold pl-1">Saída</label>
                              <input type="time" value={day.fim}
                                onChange={e => updateDayField(key, 'fim', e.target.value)}
                                className="w-full mt-1 p-2.5 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 text-brand-navy font-bold" />
                            </div>
                          </div>
                        </div>

                        {/* Horário de almoço */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Horário de Almoço</p>
                            <span className="text-[10px] text-brand-neutral-300">(opcional)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-brand-neutral-400 font-semibold pl-1">Início</label>
                              <input type="time" value={day.almoco_inicio}
                                onChange={e => updateDayField(key, 'almoco_inicio', e.target.value)}
                                className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 text-brand-navy font-bold" />
                            </div>
                            <div>
                              <label className="text-[10px] text-brand-neutral-400 font-semibold pl-1">Fim</label>
                              <input type="time" value={day.almoco_fim}
                                onChange={e => updateDayField(key, 'almoco_fim', e.target.value)}
                                className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 text-brand-navy font-bold" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-brand-neutral-100 flex gap-3 flex-shrink-0 bg-white">
              <button onClick={closeScheduleModal}
                className="flex-1 py-3 border border-brand-neutral-100 text-brand-neutral-500 rounded-xl text-xs font-bold hover:bg-brand-neutral-50 transition-colors">
                Cancelar
              </button>
              <button onClick={saveSchedule} disabled={isSavingSchedule}
                className="flex-2 py-3 bg-brand-navy text-white rounded-xl text-xs font-bold hover:bg-brand-navy/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ flex: 2 }}>
                {isSavingSchedule ? (
                  <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Salvando...</>
                ) : (
                  <><Clock size={14} /> Salvar Horários</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
