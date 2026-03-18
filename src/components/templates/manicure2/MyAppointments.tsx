'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/app/templates/manicure2/manicure2.module.css';
import { ChevronLeft, Trash2, MessageCircle } from 'lucide-react';

interface MyAppointmentsProps {
  onBack: () => void;
}

const MyAppointments: React.FC<MyAppointmentsProps> = ({ onBack }) => {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('manicure2_appointments');
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
  }, []);

  const handleCancel = (index: number) => {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      const updated = appointments.filter((_, i) => i !== index);
      setAppointments(updated);
      localStorage.setItem('manicure2_appointments', JSON.stringify(updated));
    }
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
        {appointments.length === 0 ? (
          <div className={styles.apptEmpty}>
            <div className={styles.apptEmptyIcon}>📅</div>
            <p className={styles.apptEmptyText}>Você ainda não possui agendamentos.<br/>Seus horários marcados aparecerão aqui.</p>
          </div>
        ) : (
          appointments.map((appt, idx) => (
            <div key={idx} className={styles.apptCard}>
              <div className={styles.apptTop}>
                <div className={styles.apptDateBlock}>
                  <div className={styles.apptDay}>{appt.date.split(' ')[1]}</div>
                  <div className={styles.apptMon}>{appt.date.split(' ')[0].slice(0, 3)}</div>
                </div>
                <div className={styles.apptInfo}>
                  <div className={styles.apptService}>{appt.service}</div>
                  <div className={styles.apptTime}>{appt.time} · {appt.price}</div>
                  <div className={styles.apptProf}>Profissional: {appt.prof}</div>
                </div>
                <div className={`${styles.apptStatus} ${styles.statusConfirmed}`}>Confirmado</div>
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
          ))
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
