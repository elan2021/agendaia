"use client";

import { useState, useTransition } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { createTenant } from '@/app/actions/tenants';
import Link from 'next/link';

export default function CadastroPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNome(value);
    // Auto-generate slug: lowercase, remove accents, replace spaces with -
    const autoSlug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-0\s]/g, "")
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTenant(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="min-h-screen bg-brand-cream/30 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-brand-navy/5 border border-brand-neutral-100 max-w-md w-full text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-brand-navy mb-4">Empresa Cadastrada!</h2>
          <p className="text-brand-neutral-500 mb-8 leading-relaxed">
            Parabéns! Sua empresa <span className="font-bold text-brand-navy italic">"{nome}"</span> foi registrada com sucesso. Em breve nossa equipe entrará em contato para finalizar o provisionamento.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-navy text-white rounded-2xl font-bold hover:bg-brand-navy/90 transition-all shadow-lg active:scale-95"
          >
            Acessar Dashboard
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-coral/5 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-navy/5 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="bg-white rounded-[48px] shadow-2xl shadow-brand-navy/5 border border-brand-neutral-100 max-w-4xl w-full relative z-10 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Info */}
        <div className="md:w-1/3 bg-brand-navy p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,107,107,0.1),transparent)]" />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-6">Atendimento <span className="text-brand-coral">Inteligente</span></h1>
            <div className="space-y-4 text-brand-neutral-500 font-medium">
              <p className="leading-relaxed">
                Junte-se à revolução no atendimento automatizado. Cadastre sua empresa agora e deixe a IA cuidar da sua agenda.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 space-y-6">
             <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-brand-coral/20 transition-colors">
                  <Globe size={20} className="text-brand-coral" />
                </div>
                <p className="text-sm font-bold">Presença Digital</p>
             </div>
             <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-brand-coral/20 transition-colors">
                  <Loader2 size={20} className="text-brand-coral" />
                </div>
                <p className="text-sm font-bold">Automação 24/7</p>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-2/3 p-12 bg-white">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-brand-navy tracking-tight">Crie sua conta</h2>
            <p className="text-brand-neutral-500 mt-2 font-medium">Preencha os dados básicos do seu negócio.</p>
          </div>

          <form action={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nome da Empresa */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Building2 size={12} className="text-brand-coral" />
                  Nome da Empresa
                </label>
                <input 
                  type="text"
                  name="nome"
                  required
                  placeholder="Ex: Barbearia New Style"
                  value={nome}
                  onChange={handleNomeChange}
                  className="w-full bg-brand-neutral-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-brand-navy focus:ring-2 focus:ring-brand-coral/20 transition-all placeholder:text-brand-neutral-300"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Globe size={12} className="text-brand-coral" />
                  Slug da Página
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    name="slug"
                    required
                    placeholder="ex-barbearia-style"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-brand-neutral-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-brand-navy focus:ring-2 focus:ring-brand-coral/20 transition-all placeholder:text-brand-neutral-300"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-neutral-200">.atendimentointeligente.com</span>
                </div>
              </div>

              {/* Proprietário */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <User size={12} className="text-brand-coral" />
                  Nome do Proprietário
                </label>
                <input 
                  type="text"
                  name="proprietario_nome"
                  required
                  placeholder="Seu nome completo"
                  className="w-full bg-brand-neutral-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-brand-navy focus:ring-2 focus:ring-brand-coral/20 transition-all placeholder:text-brand-neutral-300"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Phone size={12} className="text-brand-coral" />
                  Telefone / WhatsApp
                </label>
                <input 
                  type="tel"
                  name="whatsapp_numero"
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full bg-brand-neutral-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-brand-navy focus:ring-2 focus:ring-brand-coral/20 transition-all placeholder:text-brand-neutral-300"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <div className="pt-4">
              <button 
                disabled={isPending}
                type="submit"
                className="w-full py-5 bg-brand-navy text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-navy/20 hover:bg-brand-navy/90 hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-3"
              >
                {isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    Criar minha empresa
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center text-[10px] font-bold text-brand-neutral-400 uppercase tracking-tight leading-relaxed">
              Ao criar conta você concorda com nossos <br />
              <span className="text-brand-navy hover:underline cursor-pointer">Termos de Uso</span> e <span className="text-brand-navy hover:underline cursor-pointer">Políticas de Privacidade</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
