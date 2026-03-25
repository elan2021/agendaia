'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building, 
  MapPin, 
  Smartphone, 
  Instagram, 
  Facebook, 
  Image as ImageIcon,
  Clock,
  X,
  CalendarDays,
  Save,
  ArrowLeft,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { getCurrentTenant, updateBusinessInfo } from '@/app/actions/tenants';


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

export default function BusinessInfoPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  
  function toggleDay(key: string) {
    setSchedule(s => ({ ...s, [key]: { ...s[key], ativo: !s[key].ativo } }));
  }
  function updateDayField(key: string, field: keyof DaySchedule, value: string | boolean) {
    setSchedule(s => ({ ...s, [key]: { ...s[key], [field]: value } }));
  }


  useEffect(() => {
    async function loadData() {
      const data = await getCurrentTenant();
            setTenant(data);
      if (data?.horario_funcionamento) {
         setSchedule(parseSchedule(data.horario_funcionamento));
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      nome: formData.get('nome') as string,
      proprietario_nome: formData.get('proprietario_nome') as string,
      whatsapp_numero: formData.get('whatsapp_numero') as string,
            endereco: formData.get('endereco') as string,
      bairro: formData.get('bairro') as string,
      cidade: formData.get('cidade') as string,
      horario_funcionamento: JSON.stringify(schedule),
      logo_url: formData.get('logo_url') as string,
      instagram_url: formData.get('instagram_url') as string,
      facebook_url: formData.get('facebook_url') as string,
    };

    startTransition(async () => {
      const res = await updateBusinessInfo(data);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(res.error || 'Erro ao salvar informações');
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse space-y-4">
      <div className="h-10 bg-brand-neutral-50 rounded-xl w-1/4" />
      <div className="h-64 bg-brand-neutral-50 rounded-3xl" />
    </div>;
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-white border border-brand-neutral-100 rounded-2xl hover:bg-brand-neutral-50 transition-all text-brand-neutral-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight uppercase">Informações do Negócio</h2>
          <p className="text-brand-neutral-500 text-sm font-medium uppercase tracking-wider">Configure os detalhes públicos da sua empresa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card: Dados Básicos */}
        <div className="bg-white border border-brand-neutral-100 rounded-[40px] p-8 md:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-brand-neutral-50 pb-6">
            <div className="p-3 bg-brand-coral/10 rounded-2xl text-brand-coral">
              <Building size={24} />
            </div>
            <h3 className="text-lg font-black text-brand-navy uppercase tracking-tight">Dados Principais</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest px-1">Nome da Empresa</label>
              <input 
                name="nome"
                defaultValue={tenant?.nome}
                className="w-full px-6 py-4 bg-brand-neutral-50 border-2 border-transparent rounded-2xl focus:border-brand-coral focus:bg-white outline-none transition-all font-bold text-brand-navy"
                placeholder="Ex: Barber Shop Rei"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest px-1">Nome do Proprietário</label>
              <input 
                name="proprietario_nome"
                defaultValue={tenant?.proprietario_nome}
                className="w-full px-6 py-4 bg-brand-neutral-50 border-2 border-transparent rounded-2xl focus:border-brand-coral focus:bg-white outline-none transition-all font-bold text-brand-navy"
                placeholder="Nome do responsável"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest px-1">WhatsApp de Atendimento</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-neutral-400">
                  <Smartphone size={18} />
                </div>
                <input 
                  name="whatsapp_numero"
                  defaultValue={tenant?.whatsapp_numero}
                  className="w-full pl-14 pr-6 py-4 bg-brand-neutral-50 border-2 border-transparent rounded-2xl focus:border-brand-coral focus:bg-white outline-none transition-all font-bold text-brand-navy"
                  placeholder="DDD + Número"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest px-1">Link do Logo (SVG ou PNG)</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-neutral-400">
                  <ImageIcon size={18} />
                </div>
                <input 
                  name="logo_url"
                  defaultValue={tenant?.logo_url}
                  className="w-full pl-14 pr-6 py-4 bg-brand-neutral-50 border-2 border-transparent rounded-2xl focus:border-brand-coral focus:bg-white outline-none transition-all font-bold text-brand-navy"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest px-1">Endereço da Loja</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative md:col-span-2">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-neutral-400">
                  <MapPin size={18} />
                </div>
                <input 
                  name="endereco"
                  defaultValue={tenant?.endereco}
                  className="w-full pl-14 pr-6 py-4 bg-brand-neutral-50 border-2 border-transparent rounded-2xl focus:border-brand-coral focus:bg-white outline-none transition-all font-bold text-brand-navy"
                  placeholder="Rua e Número (Ex: Av. Paulista, 1000)"
                />
              </div>
              <div className="relative">
                <input 
                  name="bairro"
                  defaultValue={tenant?.bairro}
                  className="w-full px-6 py-4 bg-brand-neutral-50 border-2 border-transparent rounded-2xl focus:border-brand-coral focus:bg-white outline-none transition-all font-bold text-brand-navy"
                  placeholder="Bairro"
                />
              </div>
              <div className="relative">
                <input 
                  name="cidade"
                  defaultValue={tenant?.cidade}
                  className="w-full px-6 py-4 bg-brand-neutral-50 border-2 border-transparent rounded-2xl focus:border-brand-coral focus:bg-white outline-none transition-all font-bold text-brand-navy"
                  placeholder="Cidade - UF"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-4 border-t border-brand-neutral-50">
             <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest px-1">Horários de Atendimento Padrão</label>
             <button type="button" onClick={() => setIsScheduleModalOpen(true)} className="w-full flex items-center justify-between p-4 bg-brand-neutral-50 hover:bg-brand-neutral-100 transition-colors border-2 border-transparent rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-brand-navy">
                    <CalendarDays size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-brand-navy text-sm">Configurar Horários da Loja</p>
                    <p className="text-xs text-brand-neutral-500 font-medium mt-0.5">Dias e horários em que a empresa recebe clientes</p>
                  </div>
                </div>
                <div className="text-brand-coral text-xs font-bold uppercase tracking-widest px-4 py-2 bg-brand-coral/10 rounded-xl">
                  Editar
                </div>
             </button>
          </div>

        </div>

        {/* Card: Redes Sociais */}
        <div className="bg-white border border-brand-neutral-100 rounded-[40px] p-8 md:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-brand-neutral-50 pb-6">
            <div className="p-3 bg-brand-navy/5 rounded-2xl text-brand-navy">
              <Smartphone size={24} />
            </div>
            <h3 className="text-lg font-black text-brand-navy uppercase tracking-tight">Presença Online</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest px-1">Instagram (@usuario)</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-neutral-400">
                  <Instagram size={18} />
                </div>
                <input 
                  name="instagram_url"
                  defaultValue={tenant?.instagram_url}
                  className="w-full pl-14 pr-6 py-4 bg-brand-neutral-50 border-2 border-transparent rounded-2xl focus:border-brand-coral focus:bg-white outline-none transition-all font-bold text-brand-navy"
                  placeholder="@seuusuario"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest px-1">Facebook (Link)</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-neutral-400">
                  <Facebook size={18} />
                </div>
                <input 
                  name="facebook_url"
                  defaultValue={tenant?.facebook_url}
                  className="w-full pl-14 pr-6 py-4 bg-brand-neutral-50 border-2 border-transparent rounded-2xl focus:border-brand-coral focus:bg-white outline-none transition-all font-bold text-brand-navy"
                  placeholder="fb.com/suapagina"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Salvar Flutuante ou no Fim */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={isPending}
            className="flex items-center gap-3 px-10 py-5 bg-brand-coral text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-coral/20 disabled:grayscale disabled:scale-100"
          >
            {isPending ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={24} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>

      
      {/* Toast de Sucesso */}
      
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { e.stopPropagation(); setIsScheduleModalOpen(false); }}>
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="bg-brand-navy p-6 text-white flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Clock size={22} className="text-brand-coral" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Horários da Loja</h3>
                  <p className="text-brand-neutral-300 text-xs mt-0.5">Defina quando a empresa está aberta para funcionamento.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="text-white/60 hover:text-white p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 space-y-3">
              {DIAS.map(({ key, label }) => {
                const day = schedule[key];
                return (
                  <div key={key} className={`rounded-2xl border transition-all overflow-hidden ${day.ativo ? 'border-brand-navy/10 bg-white shadow-sm' : 'border-brand-neutral-100 bg-brand-neutral-50/50'}`}>
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => toggleDay(key)}>
                      <div className="flex items-center gap-3">
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

                    {day.ativo && (
                      <div className="px-4 pb-4 space-y-4 border-t border-brand-neutral-100 animate-in slide-in-from-top-1 duration-150">
                        <div className="pt-3">
                          <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest mb-2">Horário Aberto</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-brand-neutral-400 font-semibold pl-1">Abre</label>
                              <input type="time" value={day.inicio} onChange={e => updateDayField(key, 'inicio', e.target.value)} className="w-full mt-1 p-2.5 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 text-brand-navy font-bold" />
                            </div>
                            <div>
                              <label className="text-[10px] text-brand-neutral-400 font-semibold pl-1">Fecha</label>
                              <input type="time" value={day.fim} onChange={e => updateDayField(key, 'fim', e.target.value)} className="w-full mt-1 p-2.5 bg-brand-cream/20 border border-brand-neutral-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 text-brand-navy font-bold" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest">Pausa / Almoço</p>
                            <span className="text-[10px] text-brand-neutral-300">(opcional)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-brand-neutral-400 font-semibold pl-1">Início</label>
                              <input type="time" value={day.almoco_inicio} onChange={e => updateDayField(key, 'almoco_inicio', e.target.value)} className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 text-brand-navy font-bold" />
                            </div>
                            <div>
                              <label className="text-[10px] text-brand-neutral-400 font-semibold pl-1">Fim</label>
                              <input type="time" value={day.almoco_fim} onChange={e => updateDayField(key, 'almoco_fim', e.target.value)} className="w-full mt-1 p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 text-brand-navy font-bold" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-brand-neutral-100 flex gap-3 flex-shrink-0 bg-white">
              <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="w-full py-4 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy/90 transition-all shadow-md">
                Confirmar Horários
              </button>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 z-50">
          <div className="bg-white/20 p-2 rounded-xl">
             <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="font-black uppercase text-xs tracking-widest">Sucesso!</p>
            <p className="text-[10px] font-bold opacity-90 uppercase">As informações do negócio foram atualizadas.</p>
          </div>
        </div>
      )}
    </div>
  );
}
