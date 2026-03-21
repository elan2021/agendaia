"use client";

import { useState, useEffect, useTransition } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MoreVertical,
  Clock,
  User,
  CheckCircle2,
  X,
  Phone,
  Calendar as CalendarIcon,
  Search,
  AlertCircle,
  Scissors,
  Check,
  Users,
  TrendingUp,
  Info
} from 'lucide-react';
import { getAppointments, createAppointment, getAvailableSlots, getClientByPhone } from '@/app/actions/appointments';
import { getProfessionals } from '@/app/actions/professionals';
import { getServices } from '@/app/actions/services';

type Appointment = {
  id: string;
  inicio: Date;
  fim: Date;
  status: string;
  cliente: { nome: string | null; telefone: string };
  servico: { nome: string; preco: number };
  profissional: { nome: string };
};

const hours = Array.from({ length: 14 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedProId, setSelectedProId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // --- Modal Form State ---
  const [formTel, setFormTel] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formServico, setFormServico] = useState('');
  const [formPro, setFormPro] = useState('');
  const [formData, setFormData] = useState(new Date().toISOString().split('T')[0]);
  const [formHora, setFormHora] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  useEffect(() => {
    if (formPro && formData && formServico) {
      loadSlots();
    }
  }, [formPro, formData, formServico]);

  async function fetchData() {
    const apps = await getAppointments(currentDate.toISOString().split('T')[0]);
    const pros = await getProfessionals();
    const servs = await getServices();
    
    // Convert dates from string to Date objects if needed
    const processedApps = apps.map((a: any) => ({
      ...a,
      inicio: new Date(a.inicio),
      fim: new Date(a.fim)
    }));

    setAppointments(processedApps);
    setProfessionals(pros);
    setServices(servs);
  }

  async function handlePhoneLookup(tel: string) {
    setFormTel(tel);
    if (tel.length >= 10) {
      const client = await getClientByPhone(tel);
      if (client?.nome) setFormNome(client.nome);
    }
  }

  async function loadSlots() {
    setIsLoadingSlots(true);
    const slots = await getAvailableSlots(formPro, formData, formServico);
    setAvailableSlots(slots);
    setIsLoadingSlots(false);
  }

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    const [year, month, day] = formData.split('-').map(Number);
    const [hour, min] = formHora.split(':').map(Number);
    const inicioDate = new Date(year, month - 1, day, hour, min);

    startTransition(async () => {
      const res = await createAppointment({
        cliente_tel: formTel,
        cliente_nome: formNome,
        servico_id: formServico,
        profissional_id: formPro,
        inicio: inicioDate.toISOString(),
        status: 'confirmado'
      });

      if (res.success) {
        setIsModalOpen(false);
        fetchData();
        // Reset form
        setFormTel('');
        setFormNome('');
        setFormServico('');
        setFormPro('');
        setFormHora('');
      }
    });
  }

  const changeDate = (days: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    setCurrentDate(next);
  };

  const filteredApps = selectedProId === 'all' 
    ? appointments 
    : appointments.filter(a => (a as any).profissional_id === selectedProId);

  const stats = {
    realizados: appointments.filter(a => a.status === 'pago').length,
    confirmados: appointments.filter(a => a.status === 'confirmado').length,
    total: appointments.length
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-sans">Agenda</h2>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1 bg-white border border-brand-neutral-100 rounded-xl px-2 py-1 shadow-sm">
              <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-brand-cream rounded-lg text-brand-neutral-500 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <h3 className="font-bold text-brand-navy px-2 text-sm">
                {currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-brand-cream rounded-lg text-brand-neutral-500 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="text-xs font-bold text-brand-coral uppercase tracking-widest hover:bg-brand-coral/5 px-3 py-2 rounded-lg transition-colors"
            >
              Hoje
            </button>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative group">
            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neutral-400 group-focus-within:text-brand-coral transition-colors" />
            <select 
              value={selectedProId}
              onChange={(e) => setSelectedProId(e.target.value)}
              className="bg-white border border-brand-neutral-100 rounded-xl pl-10 pr-4 py-2 text-sm font-bold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-coral/20 appearance-none min-w-[200px] shadow-sm cursor-pointer"
            >
              <option value="all">Todos os Profissionais</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-coral text-white rounded-xl font-bold text-sm hover:bg-brand-coral/90 transition-all shadow-lg shadow-brand-coral/20 active:scale-95"
          >
            <Plus size={18} />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Grid View */}
      <div className="bg-white rounded-2xl border border-brand-neutral-100 shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-brand-neutral-100 min-h-[600px]">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {hours.map((hour) => (
            <div key={hour} className="group flex min-h-[100px] border-b border-brand-neutral-50 last:border-0 hover:bg-brand-cream/5 transition-colors">
              <div className="w-20 py-6 px-6 text-[10px] font-black text-brand-neutral-400 border-r border-brand-neutral-50/50 bg-brand-cream/10 flex-shrink-0 flex flex-col items-center">
                <span className="text-brand-navy text-sm">{hour}</span>
                <div className="w-1 h-1 bg-brand-neutral-200 rounded-full mt-2 group-hover:bg-brand-coral transition-colors" />
              </div>
              <div className="flex-1 p-3 flex flex-col gap-3">
                {filteredApps.filter(a => {
                  const h = a.inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  return h === hour;
                }).map((app) => (
                  <div key={app.id} className="bg-white border border-brand-neutral-100 p-4 rounded-2xl shadow-sm cursor-pointer hover:shadow-md hover:border-brand-coral/20 transition-all group/card relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-coral" />
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-brand-coral uppercase tracking-widest">{app.servico.nome}</span>
                       <span className="text-xs font-black text-brand-navy">R$ {app.servico.preco.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-xl bg-brand-cream flex items-center justify-center text-brand-navy font-bold text-xs">
                           {app.cliente.nome?.charAt(0) || 'C'}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-brand-navy leading-none">{app.cliente.nome || 'Cliente sem nome'}</p>
                            <p className="text-[10px] text-brand-neutral-500 font-medium mt-1">{app.cliente.telefone}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-neutral-50 rounded-full">
                        <User size={12} className="text-brand-neutral-400" />
                        <span className="text-[10px] font-bold text-brand-navy uppercase">{app.profissional.nome}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredApps.filter(a => {
                   const h = a.inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                   return h === hour;
                }).length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[10px] font-black text-brand-neutral-300 uppercase tracking-widest hover:text-brand-coral transition-colors">
                      Disponível
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Sidebar Summary */}
        <div className="md:w-80 p-6 bg-brand-neutral-50/30 overflow-y-auto space-y-6">
          <h4 className="font-black text-[10px] text-brand-neutral-400 uppercase tracking-widest mb-4">Resumo do Dia</h4>
          
          <div className="p-5 bg-white rounded-2xl border border-brand-neutral-100 shadow-sm transition-transform hover:-translate-y-1">
            <p className="text-[10px] text-brand-neutral-400 font-black uppercase mb-1">Taxa de Ocupação</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-brand-navy">
                {Math.round((stats.total / (hours.length * (professionals.length || 1))) * 100)}%
              </span>
              <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black mb-1">
                <TrendingUp size={14} />
                <span>+12%</span>
              </div>
            </div>
            <div className="w-full bg-brand-neutral-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-brand-coral h-full rounded-full transition-all duration-1000" 
                style={{ width: `${Math.round((stats.total / (hours.length * (professionals.length || 1))) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-brand-neutral-100 text-center group hover:border-emerald-100 transition-colors">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-2xl font-black text-brand-navy">{stats.realizados}</p>
              <p className="text-[10px] text-brand-neutral-400 font-black uppercase tracking-tight">Finalizados</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-brand-neutral-100 text-center group hover:border-brand-coral/20 transition-colors">
              <div className="w-10 h-10 bg-brand-coral/5 text-brand-coral rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <p className="text-2xl font-black text-brand-navy">{stats.confirmados}</p>
              <p className="text-[10px] text-brand-neutral-400 font-black uppercase tracking-tight">Pendentes</p>
            </div>
          </div>

          {/* Next Appointments */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest pt-2">Próximos do Dia</h5>
            {appointments.slice(0, 3).map(app => (
              <div key={app.id} className="flex gap-4 group">
                <div className="relative pt-1">
                  <div className="w-2 h-2 bg-brand-coral rounded-full" />
                  <div className="absolute top-4 left-[3px] w-[2px] h-full bg-brand-neutral-100 group-last:hidden" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy">{app.inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-[10px] font-medium text-brand-neutral-500">{app.cliente.nome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Agendamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-brand-cream border border-white/20 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-brand-navy p-8 text-white relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-coral rounded-2xl shadow-lg shadow-brand-coral/20">
                  <CalendarIcon size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Novo Agendamento</h3>
                  <p className="text-brand-neutral-400 text-sm mt-1">Preencha os dados abaixo para reservar um horário.</p>
                </div>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSchedule} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente Info */}
                <div className="space-y-4 md:col-span-2">
                  <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={12} className="text-brand-coral" />
                    Informações do Cliente
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neutral-300 group-focus-within:text-brand-coral transition-colors" />
                      <input 
                        type="tel"
                        required
                        placeholder="Telefone (DD) 99999-9999"
                        value={formTel}
                        onChange={(e) => handlePhoneLookup(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-brand-neutral-100 rounded-2xl text-sm font-bold text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-coral/10 transition-all"
                      />
                    </div>
                    <div className="relative group">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neutral-300 group-focus-within:text-brand-coral transition-colors" />
                      <input 
                        type="text"
                        required
                        placeholder="Nome Completo"
                        value={formNome}
                        onChange={(e) => setFormNome(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-brand-neutral-100 rounded-2xl text-sm font-bold text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-coral/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Serviço e Profissional */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <Scissors size={12} className="text-brand-coral" />
                    O que será feito?
                  </p>
                  <select 
                    required
                    value={formServico}
                    onChange={(e) => setFormServico(e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-brand-neutral-100 rounded-2xl text-sm font-bold text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-coral/10 transition-all cursor-pointer"
                  >
                    <option value="">Selecione o Serviço</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.nome} ({s.duracao_min} min)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} className="text-brand-coral" />
                    Com quem?
                  </p>
                  <select 
                    required
                    value={formPro}
                    onChange={(e) => setFormPro(e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-brand-neutral-100 rounded-2xl text-sm font-bold text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-coral/10 transition-all cursor-pointer"
                  >
                    <option value="">Selecione o Profissional</option>
                    {professionals.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Data e Horários */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2">
                      <CalendarIcon size={12} className="text-brand-coral" />
                      Quando?
                    </p>
                    <input 
                      type="date"
                      required
                      value={formData}
                      onChange={(e) => setFormData(e.target.value)}
                      className="text-xs font-black text-brand-navy bg-brand-cream/50 border border-brand-neutral-100 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-coral/20"
                    />
                  </div>

                  {isLoadingSlots ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3 bg-white/50 rounded-2xl border border-dashed border-brand-neutral-200">
                       <Clock className="text-brand-coral animate-spin-slow" size={24} />
                       <p className="text-xs font-bold text-brand-neutral-400 uppercase tracking-widest">Calculando horários livres...</p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setFormHora(slot)}
                          className={`py-3 rounded-xl text-xs font-black transition-all border ${
                            formHora === slot 
                              ? 'bg-brand-navy text-white border-brand-navy shadow-lg shadow-brand-navy/20 scale-105' 
                              : 'bg-white text-brand-navy border-brand-neutral-50 hover:border-brand-coral/30 hover:bg-brand-cream/30'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (formPro && formData && formServico) ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-3 bg-brand-coral/5 rounded-2xl border border-dashed border-brand-coral/20">
                      <AlertCircle className="text-brand-coral" size={24} />
                      <p className="text-xs font-bold text-brand-coral uppercase tracking-widest">Infelizmente não há horários livres.</p>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center gap-3 bg-brand-neutral-50/50 rounded-2xl border border-dashed border-brand-neutral-200">
                      <Info size={24} className="text-brand-neutral-300" />
                      <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Selecione Serviço, Profissional e Data.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão Salvar */}
              <button 
                type="submit"
                disabled={isPending || !formHora}
                className="w-full py-5 bg-brand-navy text-white rounded-2xl font-black text-lg hover:bg-brand-navy/90 transition-all shadow-xl shadow-brand-navy/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
              >
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    Reservando...
                  </>
                ) : (
                  <>
                    <Check size={24} />
                    Confirmar Agendamento ({formHora})
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d4;
        }
      `}</style>
    </div>
  );
}


