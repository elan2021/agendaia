'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/app/templates/manicure1/manicure1.module.css';
import { Calendar, Clock, User, Check, ChevronLeft, MapPin, Send, Loader2 } from 'lucide-react';
import { createPublicAppointment } from '@/app/actions/appointments';

interface BookingFlowProps {
  onBack: () => void;
  onSuccess: (data: any) => void;
  services?: any[];
  professionals?: any[];
  tenantId?: string;
}

const fallbackProfessionals = [
  { id: 'fernanda', name: 'Fernanda', spec: 'Nail Art & Gel · Especialista', stars: '4.9', count: '300+', avatarClass: styles.avFernanda, initial: 'F' },
  { id: 'juliana', name: 'Juliana', spec: 'Esmaltação & Spa', stars: '4.8', count: '180+', avatarClass: styles.avJuliana, initial: 'J' },
  { id: 'camila', name: 'Camila', spec: 'Pedicure & Tratamentos', stars: '4.7', count: '120+', avatarClass: styles.avCamila, initial: 'C' },
];

const fallbackServices = [
  { id: 's1', name: 'Esmaltação Simples', price: 35.0, duration_min: 30, emoji: '💅', desc: 'Cutícula + esmalte regular à sua escolha' },
  { id: 's2', name: 'Banho de Gel', price: 120.0, duration_min: 80, emoji: '✨', desc: 'Proteção e brilho duradouro para suas unhas' },
  { id: 's3', name: 'Nail Art Complexa', price: 150.0, duration_min: 105, emoji: '🎨', desc: 'Pedrarias, desenhos feitos à mão e degradê' },
  { id: 's4', name: 'Spa das Mãos', price: 55.0, duration_min: 40, emoji: '🌿', desc: 'Esfoliação, hidratação profunda e massagem' },
];

const BookingFlow: React.FC<BookingFlowProps> = ({ onBack, onSuccess, services, professionals, tenantId }) => {
  // Configurando arrays finais
  const finalProfessionals = professionals && professionals.length > 0 ? professionals.map(p => ({
    id: p.id,
    name: p.nome,
    spec: p.especialidades || 'Especialista',
    stars: '5.0',
    count: 'Novo',
    avatarClass: styles.avFernanda, 
    initial: p.nome.charAt(0).toUpperCase()
  })) : fallbackProfessionals;

  const finalServices = services && services.length > 0 ? services.map(s => ({
    id: s.id,
    name: s.nome,
    price: s.preco,
    duration: `${s.duracao_min}min`,
    emoji: '✨', 
    desc: s.descricao || 'Serviço padrão'
  })) : fallbackServices.map(s => ({...s, duration: `${s.duration_min}min`}));

  const [step, setStep] = useState(1);
  const [selectedProf, setSelectedProf] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setStep(s => s + 1);

  const handleProfSelect = (prof: any) => {
    setSelectedProf(prof);
    nextStep();
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    nextStep();
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(day);
    nextStep();
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    nextStep();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      setError("ID da empresa não identificado.");
      return;
    }
    
    if (formData.name && formData.phone && selectedDate && selectedTime) {
      setIsSubmitting(true);
      setError(null);

      try {
        // Encontra o objeto de data correspondente ao dia selecionado
        const dayObj = days.find(d => d.day === selectedDate);
        if (!dayObj) throw new Error("Data inválida");

        const [hours, minutes] = selectedTime.split(':').map(Number);
        const d = dayObj.fullDate;
        // Cria a data com horário local (Brasília) e converte para UTC
        // usando o offset fixo de -03:00 de forma explícita
        const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0, 0);
        const inicioISO = new Date(localDate.getTime() + 3 * 60 * 60 * 1000).toISOString();

        const res = await createPublicAppointment(tenantId, {
          cliente_nome: formData.name,
          cliente_tel: formData.phone.replace(/\D/g, ''), // Limpa formatação do telefone
          servico_id: selectedService.id,
          profissional_id: selectedProf.id,
          inicio: inicioISO,
          status: 'pendente', // Inicia como pendente via página pública
        });

        if (res.success) {
          const bookingSummary = {
            prof: selectedProf.name,
            service: selectedService.name,
            date: `${dayObj.month} ${selectedDate}`,
            time: selectedTime,
            price: selectedService.price,
            ...formData
          };
          onSuccess(bookingSummary);
        } else {
          setError(res.error || "Erro ao realizar agendamento");
        }
      } catch (err: any) {
        setError("Erro ao processar agendamento. Tente novamente.");
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: d.getDate(),
      weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }).split('.')[0].toUpperCase(),
      month: d.toLocaleDateString('pt-BR', { month: 'long' }),
      fullDate: d
    };
  });

  return (
    <div className={`${styles.screen} ${styles.active}`}>
      <div className={styles.scrHeader}>
        <button className={styles.backBtn} onClick={onBack}><ChevronLeft size={20} /></button>
        <div>
          <div className={styles.scrTitle}>Agendar Horário</div>
          <div className={styles.scrSub}>Siga as etapas abaixo</div>
        </div>
      </div>

      <div className={styles.progressWrap}>
        <div className={styles.progressSteps}>
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`${styles.progStep} ${step === s ? styles.progStepActive : ''} ${step > s ? styles.progStepDone : ''}`}>
              <div className={styles.progDot}>{step > s ? <Check size={14} /> : s}</div>
              <div className={styles.progLabel}>
                {s === 1 && 'Profissional'}
                {s === 2 && 'Serviço'}
                {s === 3 && 'Data'}
                {s === 4 && 'Horário'}
                {s === 5 && 'Dados'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.bookBody}>
        {selectedProf && (
          <div className={`${styles.summaryBar} ${styles.summaryBarVisible}`}>
            <span className={styles.sumTag}>{selectedProf.name}</span>
            {selectedService && <span className={styles.sumTag}>{selectedService.name}</span>}
            {selectedDate && <span className={styles.sumTag}>{selectedDate} {days.find(d => d.day === selectedDate)?.month.slice(0, 3)}</span>}
            {selectedTime && <span className={styles.sumTag}>{selectedTime}</span>}
          </div>
        )}

        {step === 1 && (
          <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
            <div className={styles.stepInner}>
              <div className={styles.formLabel}><span className={styles.stepNum}>1</span>Escolha a profissional</div>
              <div className={styles.profGrid}>
                {finalProfessionals.map(p => (
                  <div key={p.id} className={`${styles.profCard} ${selectedProf?.id === p.id ? styles.profCardSelected : ''}`} onClick={() => handleProfSelect(p)}>
                    <div className={`${styles.profAvatar} ${p.avatarClass}`}>{p.initial}<div className={styles.online}></div></div>
                    <div className={styles.profInfo}>
                      <div className={styles.profName}>{p.name}</div>
                      <div className={styles.profSpec}>{p.spec}</div>
                      <div className={styles.profStars}>★★★★★ {p.stars} · {p.count} atendimentos</div>
                    </div>
                    <div className={styles.profCheck}><Check size={14} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
            <div className={styles.stepInner}>
              <div className={styles.formLabel}><span className={styles.stepNum}>2</span>Escolha o serviço</div>
              <div className={styles.servicesGrid}>
                {finalServices.map(s => (
                  <div key={s.id} className={`${styles.serviceCard} ${selectedService?.id === s.id ? styles.serviceCardSelected : ''}`} onClick={() => handleServiceSelect(s)}>
                    <span className={styles.serviceEmoji}>{s.emoji}</span>
                    <div className={styles.serviceName}>{s.name}</div>
                    <div className={styles.serviceDesc}>{s.desc}</div>
                    <div className={styles.servicePrice}>{s.price}</div>
                    <div className={styles.serviceDur}>{s.duration}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
            <div className={styles.stepInner}>
              <div className={styles.formLabel}><span className={styles.stepNum}>3</span>Escolha a data</div>
              <div className={styles.calStrip}>
                {days.map(d => (
                  <div key={d.day} className={`${styles.calDay} ${selectedDate === d.day ? styles.calDaySelected : ''}`} onClick={() => handleDateSelect(d.day)}>
                    <div className={styles.calWd}>{d.weekday}</div>
                    <div className={styles.calNum}>{d.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
            <div className={styles.stepInner}>
              <div className={styles.formLabel}><span className={styles.stepNum}>4</span>Escolha o horário</div>
              <div className={styles.timeGrid}>
                {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                  <div key={t} className={`${styles.timeSlot} ${selectedTime === t ? styles.timeSlotSelected : ''}`} onClick={() => handleTimeSelect(t)}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
            <div className={styles.stepInner}>
              <div className={styles.formLabel}><span className={styles.stepNum}>5</span>Confirme seus dados</div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={styles.fieldWrap}>
                  <input type="text" className={styles.field} placeholder="Seu nome completo" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className={styles.fieldWrap}>
                  <input type="tel" className={styles.field} placeholder="WhatsApp (DDD + Número)" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                {error && <div className={styles.errorMsg} style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 'bold' }}>{error}</div>}
                <div className={`${styles.btnArea} ${styles.btnAreaVisible}`}>
                  <button type="submit" className={styles.btnConfirm} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processando...
                      </>
                    ) : (
                      'Finalizar Agendamento'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
