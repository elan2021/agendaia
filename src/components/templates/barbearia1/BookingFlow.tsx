'use client';

import React, { useState } from 'react';
import styles from '@/app/templates/barbearia1/barbearia1.module.css';
import { ChevronLeft, Check, Clock, Calendar, Loader2 } from 'lucide-react';
import { createPublicAppointment } from '@/app/actions/appointments';

interface BookingFlowProps {
  onBack: () => void;
  onSuccess: (data: any) => void;
  services?: any[];
  professionals?: any[];
  tenantId?: string;
}

const fallbackBarbers = [
  { id: 'rafa', name: 'Rafael', spec: 'Corte & Barba · Master', avatarClass: styles.avRafael, initial: 'R' },
  { id: 'diego', name: 'Diego', spec: 'Degradê & Navalhado', avatarClass: styles.avDiego, initial: 'D' },
  { id: 'marcos', name: 'Marcos', spec: 'Tratamentos & Pigmentação', avatarClass: styles.avMarcos, initial: 'M' },
];

const fallbackServices = [
  { id: 's1', name: 'Corte Simples', price: 35.0, duration_min: 30, emoji: '✂️', desc: 'Tesoura ou máquina' },
  { id: 's2', name: 'Corte + Barba', price: 60.0, duration_min: 60, emoji: '🧔', desc: 'Combo completo premium' },
  { id: 's3', name: 'Barbeação Hot Towel', price: 40.0, duration_min: 40, emoji: '🔥', desc: 'Toalha quente e navalha' },
  { id: 's4', name: 'Degradê Navalhado', price: 45.0, duration_min: 45, emoji: '✨', desc: 'Acabamento na navalha' },
  { id: 's5', name: 'Pigmentação', price: 30.0, duration_min: 30, emoji: '🎨', desc: 'Correção de falhas' },
  { id: 's6', name: 'Hidratação Barba', price: 25.0, duration_min: 20, emoji: '💧', desc: 'Produtos óleo e balm' },
];

const BookingFlow: React.FC<BookingFlowProps> = ({ onBack, onSuccess, services, professionals, tenantId }) => {
  const finalBarbers = professionals && professionals.length > 0 ? professionals.map(p => ({
    id: p.id,
    name: p.nome,
    spec: p.especialidades || 'O Brabo',
    avatarClass: styles.avRafael,
    initial: p.nome.charAt(0).toUpperCase()
  })) : fallbackBarbers;

  const finalServices = services && services.length > 0 ? services.map(s => ({
    id: s.id,
    name: s.nome,
    price: `R$ ${s.preco.toFixed(2).replace('.', ',')}`,
    duration: `${s.duracao_min}min`,
    emoji: '✂️',
    desc: s.descricao || 'Corte no capricho'
  })) : fallbackServices.map(s => ({...s, price: `R$ ${s.price.toFixed(2).replace('.', ',')}`, duration: `${s.duration_min}min`}));

  const [step, setStep] = useState(1);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBarberSelect = (barber: any) => {
    setSelectedBarber(barber);
    setStep(2);
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setStep(3);
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(day);
    setStep(4);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(5);
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
        const dayObj = days.find(d => d.day === selectedDate);
        if (!dayObj) throw new Error("Data inválida");

        const [hours, minutes] = selectedTime.split(':').map(Number);
        const d = dayObj.fullDate;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const inicioISO = `${year}-${month}-${day}T${hh}:${mm}:00-03:00`;

        const res = await createPublicAppointment(tenantId, {
          cliente_nome: formData.name,
          cliente_tel: formData.phone.replace(/\D/g, ''),
          servico_id: selectedService.id,
          profissional_id: selectedBarber.id,
          inicio: inicioISO,
          status: 'pendente',
        });

        if (res.success) {
          onSuccess({
            prof: selectedBarber.name,
            service: selectedService.name,
            date: `${dayObj.fullMonth} ${selectedDate}`,
            time: selectedTime,
            price: selectedService.price,
            ...formData
          });
        } else {
          setError(res.error || "Erro ao realizar agendamento");
        }
      } catch (err: any) {
        setError("Erro ao processar agendamento.");
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
      month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      fullMonth: d.toLocaleDateString('pt-BR', { month: 'long' }),
      fullDate: d
    };
  });

  return (
    <div className={`${styles.screen} ${styles.active}`}>
      <div className={styles.scrHeader}>
        <button className={styles.backBtn} onClick={step > 1 ? () => setStep(step - 1) : onBack}><ChevronLeft /></button>
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
                {s === 1 && 'Barbeiro'}
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
        {selectedBarber && (
          <div className={`${styles.summaryBar} ${styles.summaryBarVisible}`}>
            <span className={styles.sumTag}>{selectedBarber.name}</span>
            {selectedService && <span className={styles.sumTag}>{selectedService.name}</span>}
            {selectedDate && <span className={styles.sumTag}>{selectedDate} {days.find(d => d.day === selectedDate)?.month}</span>}
            {selectedTime && <span className={styles.sumTag}>{selectedTime}</span>}
          </div>
        )}

        <div className={styles.stepInner}>
          {step === 1 && (
            <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
              <div className={styles.formLabel}><span className={styles.stepNum}>1</span>Escolha o barbeiro</div>
              <div className={styles.profGrid}>
                {finalBarbers.map(p => (
                  <div key={p.id} className={`${styles.profCard} ${selectedBarber?.id === p.id ? styles.profCardSelected : ''}`} onClick={() => handleBarberSelect(p)}>
                    <div className={`${styles.profAvatar} ${p.avatarClass}`}>{p.initial}<div className={styles.online}></div></div>
                    <div className={styles.profInfo}>
                      <div className={styles.profName}>{p.name}</div>
                      <div className={styles.profSpec}>{p.spec}</div>
                    </div>
                    <div className={styles.profCheck}><Check size={14} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
              <div className={styles.formLabel}><span className={styles.stepNum}>2</span>Escolha o serviço</div>
              <div className={styles.servicesGrid}>
                {finalServices.map(s => (
                  <div key={s.id} className={`${styles.serviceCard} ${selectedService?.id === s.id ? styles.serviceCardSelected : ''}`} onClick={() => handleServiceSelect(s)}>
                    <span className={styles.serviceEmoji}>{s.emoji}</span>
                    <div className={styles.serviceName}>{s.name}</div>
                    <div className={styles.serviceDesc}>{s.desc}</div>
                    <div className={styles.servicePrice}>{s.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
              <div className={styles.formLabel}><span className={styles.stepNum}>3</span>Escolha a data</div>
              <div className={styles.calStrip}>
                {days.map(d => (
                  <div key={d.day} className={`${styles.calDay} ${selectedDate === d.day ? styles.calDaySelected : ''}`} onClick={() => handleDateSelect(d.day)}>
                    <div className={styles.calWd}>{d.month}</div>
                    <div className={styles.calNum}>{d.day}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
              <div className={styles.formLabel}><span className={styles.stepNum}>4</span>Escolha o horário</div>
              <div className={styles.timeGrid}>
                {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                  <div key={t} className={`${styles.timeSlot} ${selectedTime === t ? styles.timeSlotSelected : ''}`} onClick={() => handleTimeSelect(t)}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
              <div className={styles.formLabel}><span className={styles.stepNum}>5</span>Confirme seus dados</div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" 
                  className={styles.field} 
                  placeholder="Seu nome" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
                <input 
                  type="tel" 
                  className={styles.field} 
                  placeholder="Seu WhatsApp" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                />
                <div className={styles.policyNote}>
                  <Clock size={16} />
                  <span>Respeite o horário agendado. Tolerância de 10 minutos.</span>
                </div>
                {error && <div className={styles.errorMsg} style={{ color: '#ff4d4d', fontSize: '11px', marginBottom: '8px' }}>{error}</div>}
                <div className={`${styles.btnArea} ${styles.btnAreaVisible}`}>
                  <button type="submit" className={styles.btnConfirm} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Reservando...
                      </>
                    ) : (
                      'Confirmar Agendamento'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
