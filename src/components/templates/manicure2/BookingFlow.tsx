'use client';

import React, { useState } from 'react';
import styles from '@/app/templates/manicure2/manicure2.module.css';
import { ChevronLeft, Check, Clock, Calendar, Send } from 'lucide-react';

interface BookingFlowProps {
  onBack: () => void;
  onSuccess: (data: any) => void;
  services?: any[];
  professionals?: any[];
}

const fallbackProfessionals = [
  { id: 'fernanda', name: 'Fernanda', spec: 'Nail Art & Gel · Especialista', avatarClass: styles.avFernanda, initial: 'F' },
  { id: 'juliana', name: 'Juliana', spec: 'Esmaltação & Spa', avatarClass: styles.avJuliana, initial: 'J' },
  { id: 'camila', name: 'Camila', spec: 'Pedicure & Tratamentos', avatarClass: styles.avCamila, initial: 'C' },
];

const fallbackServices = [
  { id: 's1', name: 'Esmaltação Simples', price: 35.0, duration_min: 30, emoji: '💅', desc: 'Cutícula + esmalte regular' },
  { id: 's2', name: 'Esmaltação Gel', price: 70.0, duration_min: 60, emoji: '✨', desc: 'Gel de longa duração' },
  { id: 's3', name: 'Nail Art', price: 90.0, duration_min: 90, emoji: '🎨', desc: 'Designs exclusivos' },
  { id: 's4', name: 'Spa das Mãos', price: 55.0, duration_min: 45, emoji: '🌸', desc: 'Hidratação + massagem' },
  { id: 's5', name: 'Banho de Gel', price: 120.0, duration_min: 90, emoji: '💎', desc: 'Alongamento premium' },
  { id: 's6', name: 'Pedicure Completa', price: 50.0, duration_min: 60, emoji: '🦶', desc: 'Cutícula + esmaltação' },
];

const BookingFlow: React.FC<BookingFlowProps> = ({ onBack, onSuccess, services, professionals }) => {
  const finalProfessionals = professionals && professionals.length > 0 ? professionals.map(p => ({
    id: p.id,
    name: p.nome,
    spec: p.especialidades || 'Especialista',
    avatarClass: styles.avFernanda,
    initial: p.nome.charAt(0).toUpperCase()
  })) : fallbackProfessionals;

  const finalServices = services && services.length > 0 ? services.map(s => ({
    id: s.id,
    name: s.nome,
    price: `R$ ${s.preco.toFixed(2).replace('.', ',')}`,
    duration: `${s.duracao_min}min`,
    emoji: '💅',
    desc: s.descricao || 'Tratamento estético'
  })) : fallbackServices.map(s => ({...s, price: `R$ ${s.price.toFixed(2).replace('.', ',')}`, duration: `${s.duration_min}min`}));

  const [step, setStep] = useState(1);
  const [selectedProf, setSelectedProf] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const handleProfSelect = (prof: any) => {
    setSelectedProf(prof);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      onSuccess({
        prof: selectedProf.name,
        service: selectedService.name,
        date: `${days.find(d => d.day === selectedDate)?.fullMonth} ${selectedDate}`,
        time: selectedTime,
        price: selectedService.price,
        ...formData
      });
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
        <button className={styles.backBtn} onClick={onBack}><ChevronLeft /></button>
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
            {selectedDate && <span className={styles.sumTag}>{selectedDate} {days.find(d => d.day === selectedDate)?.month}</span>}
            {selectedTime && <span className={styles.sumTag}>{selectedTime}</span>}
          </div>
        )}

        <div className={styles.stepInner}>
          {step === 1 && (
            <div className={`${styles.stepBlock} ${styles.stepBlockRevealed}`}>
              <div className={styles.formLabel}><span className={styles.stepNum}>1</span>Escolha a profissional</div>
              <div className={styles.profGrid}>
                {professionals.map(p => (
                  <div key={p.id} className={`${styles.profCard} ${selectedProf?.id === p.id ? styles.profCardSelected : ''}`} onClick={() => handleProfSelect(p)}>
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
                {services.map(s => (
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
                  placeholder="Nome completo" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
                <input 
                  type="tel" 
                  className={styles.field} 
                  placeholder="WhatsApp" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                />
                <div className={styles.policyNote}>
                  <Clock size={16} />
                  <span>Ao confirmar, você concorda com nossa política.</span>
                </div>
                <div className={`${styles.btnArea} ${styles.btnAreaVisible}`}>
                  <button type="submit" className={styles.btnConfirm}>Finalizar</button>
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
