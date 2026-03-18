'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/app/templates/manicure1/manicure1.module.css';
import { Calendar, Clock, User, Check, ChevronLeft, MapPin, Send } from 'lucide-react';

interface BookingFlowProps {
  onBack: () => void;
  onSuccess: (data: any) => void;
  services?: any[];
  professionals?: any[];
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

const BookingFlow: React.FC<BookingFlowProps> = ({ onBack, onSuccess, services, professionals }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      const bookingData = {
        prof: selectedProf.name,
        service: selectedService.name,
        date: `Março ${selectedDate}`,
        time: selectedTime,
        price: selectedService.price,
        ...formData
      };
      onSuccess(bookingData);
    }
  };

  const days = Array.from({ length: 7 }, (_, i) => i + 15); // Ex: 15 a 21 de Março

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
            {selectedDate && <span className={styles.sumTag}>{selectedDate} Mar</span>}
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
                  <div key={d} className={`${styles.calDay} ${selectedDate === d ? styles.calDaySelected : ''}`} onClick={() => handleDateSelect(d)}>
                    <div className={styles.calWd}>{d === 15 ? 'Dom' : d === 16 ? 'Seg' : d === 17 ? 'Ter' : d === 18 ? 'Qua' : d === 19 ? 'Qui' : d === 20 ? 'Sex' : 'Sáb'}</div>
                    <div className={styles.calNum}>{d}</div>
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
                <div className={styles.policyNote}>
                  <Clock size={16} />
                  <span>Ao confirmar, você concorda com nossa política de cancelamento (até 24h antes).</span>
                </div>
                <div className={`${styles.btnArea} ${styles.btnAreaVisible}`}>
                  <button type="submit" className={styles.btnConfirm}>Finalizar Agendamento</button>
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
