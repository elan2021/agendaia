"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
import { 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  Lock,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { requestOTP, verifyOTP } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2>(1);
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // OTP State
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestOTP(whatsapp);
      if (result.error) {
        setError(result.error);
      } else {
        setStep(2);
      }
    });
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    const fullCode = code.join('');
    if (fullCode.length < 6) return;

    startTransition(async () => {
      const result = await verifyOTP(whatsapp, fullCode);
      if (result.error) {
        setError(result.error);
        // Clear code on error
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        router.push('/dashboard');
      }
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Auto-submit when all digits are filled
  useEffect(() => {
    if (code.every(digit => digit !== '') && step === 2) {
      handleVerifyOTP();
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-brand-cream/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-coral/10 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-navy/10 rounded-full blur-[100px] -ml-40 -mb-40" />

      <div className="bg-white rounded-[40px] shadow-2xl shadow-brand-navy/5 border border-brand-neutral-100 max-w-md w-full relative z-10 overflow-hidden text-center p-10 md:p-12 animate-in zoom-in-95 duration-500">
        
        {/* Logo/Identity */}
        <div className="mb-10">
          <div className="w-16 h-16 bg-brand-navy text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-navy/20 active:scale-95 transition-transform">
            <Lock size={28} />
          </div>
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">Agenda<span className="text-brand-coral">IA</span></h1>
          <p className="text-brand-neutral-400 text-sm font-bold mt-2 uppercase tracking-widest">Acesso Restrito</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center">
              <h2 className="text-xl font-black text-brand-navy">Bem-vindo de volta!</h2>
              <p className="text-brand-neutral-500 text-sm mt-2 font-medium">Digite seu WhatsApp cadastrado para receber o acesso.</p>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Phone size={12} className="text-brand-coral" />
                Número do WhatsApp
              </label>
              <input 
                type="tel"
                required
                placeholder="(00) 00000-0000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-brand-neutral-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-brand-navy focus:ring-2 focus:ring-brand-coral/20 transition-all placeholder:text-brand-neutral-300 shadow-inner"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button 
              disabled={isPending}
              type="submit"
              className="w-full py-5 bg-brand-navy text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-navy/20 hover:bg-brand-navy/90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {isPending ? <Loader2 size={20} className="animate-spin" /> : <>Receber Acesso <ArrowRight size={18} /></>}
            </button>

            <Link href="/cadastro" className="block text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest hover:text-brand-coral transition-colors">
              Ainda não tem conta? <span className="text-brand-navy border-b border-brand-navy/20">Cadastre sua empresa</span>
            </Link>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="text-center relative">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="absolute -left-6 top-1/2 -translate-y-1/2 p-2 text-brand-neutral-400 hover:text-brand-navy transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-black text-brand-navy">Verifique seu WhatsApp</h2>
              <p className="text-brand-neutral-500 text-sm mt-2 font-medium px-4">Enviamos um código de 6 dígitos para o número <span className="font-bold text-brand-navy">{whatsapp}</span></p>
            </div>

            <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isPending}
                  className="w-10 h-10 bg-brand-neutral-50 border-none rounded-xl text-center text-lg font-black text-brand-navy focus:ring-2 focus:ring-brand-coral/20 transition-all shadow-inner disabled:opacity-50"
                />
              ))}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button 
                disabled={isPending}
                type="submit"
                className="w-full py-5 bg-brand-navy text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-navy/20 hover:bg-brand-navy/90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {isPending ? <Loader2 size={20} className="animate-spin" /> : <>Confirmar Código <CheckCircle2 size={18} /></>}
              </button>

              <button 
                type="button"
                onClick={handleRequestOTP}
                disabled={isPending}
                className="text-[10px] font-black text-brand-neutral-400 uppercase tracking-widest hover:text-brand-coral transition-colors"
              >
                Não recebeu? <span className="text-brand-navy border-b border-brand-navy/20">Reenviar código</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
