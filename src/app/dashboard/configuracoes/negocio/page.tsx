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
  Save,
  ArrowLeft,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { getCurrentTenant, updateBusinessInfo } from '@/app/actions/tenants';

export default function BusinessInfoPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getCurrentTenant();
      setTenant(data);
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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest px-1">Endereço Completo</label>
            <div className="relative">
              <div className="absolute left-6 top-5 text-brand-neutral-400">
                <MapPin size={18} />
              </div>
              <textarea 
                name="endereco"
                defaultValue={tenant?.endereco}
                rows={3}
                className="w-full pl-14 pr-6 py-4 bg-brand-neutral-50 border-2 border-transparent rounded-2xl focus:border-brand-coral focus:bg-white outline-none transition-all font-bold text-brand-navy resize-none"
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>
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
