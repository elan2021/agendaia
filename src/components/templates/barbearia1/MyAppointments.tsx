'use client';

import React, { useState } from 'react';
import styles from '@/app/templates/barbearia1/barbearia1.module.css';
import { ChevronLeft, Trash2, MessageCircle, Search, Loader2 } from 'lucide-react';
import { getPublicAppointmentsByPhone } from '@/app/actions/public';

interface MyAppointmentsProps {
  onBack: () => void;
  tenantId?: string;
}

const MyAppointments: React.FC<MyAppointmentsProps> = ({ onBack, tenantId }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [step, setStep] = useState<'phone' | 'list'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setError('Telefone inválido');
      return;
    }
    
    setLoading(true);
    setError('');
    
    if (!tenantId) {
       setError('ID da empresa não encontrado.');
       setLoading(false);
       return;
    }

    const res = await getPublicAppointmentsByPhone(tenantId, phone.replace(/\D/g, ''));
    
    if (res?.success) {
      setAppointments(res.appointments);
      setStep('list');
    } else {
      setError(res?.error || 'Erro ao buscar agendamentos');
    }
    setLoading(false);
  };

  const handleCancel = (index: number) => {
    alert('Para cancelar um agendamento, por favor entre em contato pelo WhatsApp da empresa.');
  };

  return (
    <div className={`${styles.screen} ${styles.active}`}>
      <div className={styles.scrHeader}>
        <button className={styles.backBtn} onClick={onBack}><ChevronLeft size={20} /></button>
        <div>
          <div className={styles.scrTitle}>Meus Agendamentos</div>
          <div className={styles.scrSub}>Seu histórico e próximos horários</div>
        </div>
      </div>

      <div className={styles.apptsBody}>
        {step === 'phone' ? (
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
             <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>
               Para ver seus agendamentos, informe o seu número de celular:
             </p>
             <input 
               type="tel" 
               className={styles.field} 
               placeholder="Ex: 11999999999" 
               value={phone}
               onChange={e => setPhone(e.target.value)}
               autoFocus
             />
             {error && <div style={{ color: '#ff6b6b', fontSize: '12px', textAlign: 'center' }}>{error}</div>}
             <div className={`${styles.btnArea} ${styles.btnAreaVisible}`}>
               <button type="submit" className={styles.btnConfirm} disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 {loading ? <Loader2 size={16} className="animate-spin" /> : <><Search size={16} style={{marginRight: '6px'}} /> Buscar Agendamentos</>}
               </button>
             </div>
          </form>
        ) : (
          appointments.length === 0 ? (
            <div className={styles.apptEmpty}>
              <div className={styles.apptEmptyIcon}>💈</div>
              <p className={styles.apptEmptyText}>Você não possui agendamentos.<br/>Seus horários marcados aparecerão aqui.</p>
              <button onClick={() => setStep('phone')} style={{ marginTop: '20px', color: '#b9955a', textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer' }}>Nova Busca</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button onClick={() => setStep('phone')} style={{ alignSelf: 'center', color: '#b9955a', textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '10px' }}>Buscar outro número</button>
              {appointments.map((appt, idx) => (
                <div key={idx} className={styles.apptCard}>
                  <div className={styles.apptTop}>
                    <div className={styles.apptDateBlock}>
                      <div className={styles.apptDay}>{appt.date.split(' de ')[0]}</div>
                      <div className={styles.apptMon}>{appt.date.split(' de ')[1].slice(0, 3)}</div>
                    </div>
                    <div className={styles.apptInfo}>
                      <div className={styles.apptService}>{appt.service}</div>
                      <div className={styles.apptTime}>{appt.time} · {appt.price}</div>
                      <div className={styles.apptProf}>Profissional: {appt.prof}</div>
                    </div>
                    <div className={`${styles.apptStatus} ${appt.status === 'cancelado' ? styles.statusCancelled : styles.statusConfirmed}`}>
                       {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </div>
                  </div>
                  <div className={styles.apptDivider}></div>
                  <div className={styles.apptActions}>
                    <button className={`${styles.apptBtn} ${styles.apptBtnCancel}`} onClick={() => handleCancel(idx)}>
                      <Trash2 size={14} style={{ marginRight: '6px' }} />
                      Cancelar
                    </button>
                    <button className={`${styles.apptBtn} ${styles.apptBtnWhats}`}>
                      <MessageCircle size={14} style={{ marginRight: '6px' }} />
                      Dúvidas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
