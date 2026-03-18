'use client';

import React from 'react';
import styles from '@/app/templates/manicure1/manicure1.module.css';
import { Check } from 'lucide-react';

interface SuccessProps {
  data: any;
  onHome: () => void;
  onViewAppointments: () => void;
}

const Success: React.FC<SuccessProps> = ({ data, onHome, onViewAppointments }) => {
  return (
    <div className={`${styles.screen} ${styles.active}`}>
      <div className={`${styles.successWrap} ${styles.successWrapShow}`}>
        <div className={styles.successCard}>
          <span className={styles.successIcon}>✨</span>
          <div className={styles.successTitle}>Agendado!</div>
          <p className={styles.successInfo}>Seu horário foi reservado com sucesso. Enviamos os detalhes para seu WhatsApp.</p>
          
          <div className={styles.successDetail}>
            <div className={styles.sdetRow}>
              <span>Profissional</span>
              <span>{data.prof}</span>
            </div>
            <div className={styles.sdetRow}>
              <span>Serviço</span>
              <span>{data.service}</span>
            </div>
            <div className={styles.sdetRow}>
              <span>Data</span>
              <span>{data.date}</span>
            </div>
            <div className={styles.sdetRow}>
              <span>Horário</span>
              <span>{data.time}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <button className={styles.btnConfirm} onClick={onHome}>
            Voltar ao Início
          </button>
          <button className={`${styles.btnConfirm} ${styles.btnConfirmGhost}`} onClick={onViewAppointments}>
            Ver Meus Agendamentos
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
