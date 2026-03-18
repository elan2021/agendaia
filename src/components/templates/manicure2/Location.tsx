'use client';

import React from 'react';
import styles from '@/app/templates/manicure2/manicure2.module.css';
import { ChevronLeft, MapPin, Phone, Instagram, Clock, ExternalLink } from 'lucide-react';

interface LocationProps {
  onBack: () => void;
  tenant?: any;
}

const Location: React.FC<LocationProps> = ({ onBack, tenant }) => {
  const bizName = tenant?.nome || "Beauty Studio";
  const bizPhone = tenant?.whatsapp_numero || "(17) 99876-5432";
  return (
    <div className={`${styles.screen} ${styles.active}`}>
      <div className={styles.scrHeader}>
        <button className={styles.backBtn} onClick={onBack}><ChevronLeft size={20} /></button>
        <div>
          <div className={styles.scrTitle}>Onde Estamos</div>
          <div className={styles.scrSub}>Venha nos visitar em Rio Preto</div>
        </div>
      </div>

      <div className={styles.mapBody}>
        <div className={styles.mapFrame}>
          <svg className={styles.mapSvg} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="300" fill="#F0DDE3" />
            <path d="M0 50H400M0 150H400M0 250H400M100 0V300M250 0V300" stroke="#FFFFFF" strokeWidth="6" />
            <circle cx="180" cy="120" r="14" fill="#B85470" fillOpacity="0.2" />
            <circle cx="180" cy="120" r="6" fill="#B85470" />
            <text x="195" y="125" fontFamily="Fraunces" fontSize="14" fontWeight="600" fill="#1E1018">{bizName}</text>
          </svg>
        </div>

        <div className={styles.mapInfoCard}>
          <div className={styles.mapPinLabel}><MapPin size={12} /> Localização Premium</div>
          <h3 className={styles.mapStudioName}>{bizName}</h3>
          <p className={styles.mapAddress}>Rua das Flores, 142 • Sala 04<br/>Centro, São José do Rio Preto - SP</p>

          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <div className={styles.infoRowIcon}><Phone size={18} color="#B85470" /></div>
              <div className={styles.infoRowText}>
                <div className={styles.infoRowTitle}>{bizPhone}</div>
                <div className={styles.infoRowSub}>WhatsApp e Ligações</div>
              </div>
            </div>
            <div className={styles.infoRow}>
              <div className={styles.infoRowIcon}><Clock size={18} color="#B85470" /></div>
              <div className={styles.infoRowText}>
                <div className={styles.infoRowTitle}>Segunda a Sábado</div>
                <div className={styles.infoRowSub}>09h às 20h</div>
              </div>
              <div className={`${styles.infoRowBadge} ${styles.badgeOpen}`}>Aberto</div>
            </div>
          </div>

          <button className={styles.btnMaps}>
            <ExternalLink size={18} />
            Abrir no Google Maps
          </button>
        </div>
      </div>
    </div>
  );
};

export default Location;
