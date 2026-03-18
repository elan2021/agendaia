'use client';

import React from 'react';
import styles from '@/app/templates/manicure2/manicure2.module.css';
import { Instagram, MessageCircle, ChevronRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (screen: string) => void;
  tenant?: any;
}

const Home: React.FC<HomeProps> = ({ onNavigate, tenant }) => {
  const bizName = tenant?.nome || "Nails by Fernanda";
  const [firstName, ...rest] = bizName.split(' ');
  const lastName = rest.join(' ');

  return (
    <div className={`${styles.screen} ${styles.active}`}>
      <div className={styles.hero}>
        <div className={styles.heroPhoto}></div>
        <div className={styles.identityBar}>
          <div className={styles.idLogo}>
            <img 
              src="https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?w=120&h=120&fit=crop" 
              alt="Logo" 
            />
          </div>
        </div>
      </div>

      <div className={styles.homeContent}>
        <div className={styles.homeIdentity}>
          <div className={styles.idText}>
            <div className={styles.idName}>{firstName} {lastName && <em>{lastName}</em>}</div>
            <div className={styles.idSub}>Studio · Nail Art</div>
            <div className={styles.idHours}>
              <div className={`${styles.idHoursDot} ${styles.open}`}></div>
              <div className={styles.idHoursText}>Aberto agora · fecha às 20h</div>
            </div>
          </div>
        </div>
        <div className={styles.homeIdentityDivider}></div>

        <div className={styles.ratingStrip}>
          <div className={styles.ratingItem}>
            <div className={styles.ratingValue}>4.9★</div>
            <div className={styles.ratingLabel}>Avaliação</div>
          </div>
          <div className={styles.ratingItem}>
            <div className={styles.ratingValue}>600+</div>
            <div className={styles.ratingLabel}>Clientes</div>
          </div>
          <div className={styles.ratingItem}>
            <div className={styles.ratingValue}>3</div>
            <div className={styles.ratingLabel}>Profissionais</div>
          </div>
        </div>

        <div className={styles.testimonialsSection}>
          <div className={styles.sectionTitle}>Depoimentos</div>
          <div className={styles.testimonialsScroll}>
            {[
              { name: 'Ana Paula M.', text: '"Melhor nail art que já fiz na vida! Fernanda é incrível, super cuidadosa."', service: 'Nail Art' },
              { name: 'Carla S.', text: '"Ambiente lindo, atendimento impecável e o gel durou mais de 3 semanas!"', service: 'Banho de Gel' },
              { name: 'Mariana L.', text: '"O spa das mãos é divino, sai de lá com as mãos de bebê. Recomendo muito!"', service: 'Spa das Mãos' }
            ].map((t, i) => (
              <div key={i} className={styles.testiCard}>
                <div className={styles.testiStars}>★★★★★</div>
                <div className={styles.testiText}>{t.text}</div>
                <div className={styles.testiName}>{t.name}</div>
                <div className={styles.testiService}>{t.service}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cardsArea}>
          <button className={`${styles.actionCard} ${styles.cardAgendar}`} onClick={() => onNavigate('booking')}>
            <div className={styles.cardRow}>
              <div className={styles.cardIconWrap}>
                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="white" strokeWidth="1.8"/><path d="M3 9H21" stroke="white" strokeWidth="1.8"/><path d="M8 2V6M16 2V6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="15" r="2" fill="white"/></svg>
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitle}>Agendar Horário</div>
                <div className={styles.cardSub}>Escolha profissional e serviço</div>
              </div>
              <ChevronRight className={styles.cardArrow} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </div>
            <div className={styles.shimmerBar}></div>
          </button>

          <button className={`${styles.actionCard} ${styles.cardMeus}`} onClick={() => onNavigate('appointments')}>
            <div className={styles.cardRow}>
              <div className={styles.cardIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="#C06478" strokeWidth="1.8"/><path d="M3 9H21" stroke="#C06478" strokeWidth="1.8"/><path d="M8 13H16M8 17H13" stroke="#C06478" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitle} style={{ color: 'var(--text)' }}>Meus Agendamentos</div>
                <div className={styles.cardSub}>Veja e gerencie seus horários</div>
              </div>
              <ChevronRight className={styles.cardArrow} style={{ color: 'var(--rose)' }} />
            </div>
          </button>

          <button className={`${styles.actionCard} ${styles.cardOnde}`} onClick={() => onNavigate('location')}>
            <div className={styles.cardRow}>
              <div className={styles.cardIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.69 2 6 4.69 6 8C6 12.5 12 20 12 20C12 20 18 12.5 18 8C18 4.69 15.31 2 12 2Z" stroke="#C4846A" strokeWidth="1.8"/><circle cx="12" cy="8" r="2.5" stroke="#C4846A" strokeWidth="1.8"/></svg>
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitle} style={{ color: 'var(--text)' }}>Onde Estamos</div>
                <div className={styles.cardSub}>Rua das Flores, 142 — Rio Preto</div>
              </div>
              <ChevronRight className={styles.cardArrow} style={{ color: 'var(--terra)' }} />
            </div>
          </button>
        </div>

        <div style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center', padding: '16px 0 8px' }}>Siga nas redes</div>
        <div className={styles.socialRow}>
          <a href="#" className={styles.soc} title="Instagram"><Instagram /></a>
          <a href="#" className={styles.soc} title="WhatsApp"><MessageCircle /></a>
        </div>

        <div className={styles.miniFooter}>
          <strong style={{ color: 'var(--rose)' }}>@{tenant?.slug || 'nailsbyfernanda'}</strong> · São José do Rio Preto, SP
        </div>
      </div>
    </div>
  );
};

export default Home;
