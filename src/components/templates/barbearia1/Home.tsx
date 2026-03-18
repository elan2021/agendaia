'use client';

import React from 'react';
import styles from '@/app/templates/barbearia1/barbearia1.module.css';
import { Instagram, Youtube, MessageCircle, ChevronRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (screen: string) => void;
  tenant?: any;
}

const Home: React.FC<HomeProps> = ({ onNavigate, tenant }) => {
  const bizName = tenant?.nome || "Barbearia do Rei";
  
  return (
    <div className={`${styles.screen} ${styles.active}`}>
      <div className={styles.hero}>
        <div className={styles.heroTopline}></div>
        <div className={styles.heroPhoto}></div>
        <div className={styles.identityBar}>
          <div className={styles.idLogo}>
            <img 
              src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=200&h=200&fit=crop&crop=center&q=85" 
              alt="Logo Barbearia" 
            />
          </div>
        </div>
      </div>

      <div className={styles.homeContent}>
        <div className={styles.homeIdentity}>
          <div className={styles.idText}>
            <div className={styles.idName}>{bizName}</div>
            <div className={styles.idSub}>Premium Barbershop · Est. 2018</div>
            <div className={styles.idHours}>
              <div className={`${styles.idHoursDot} ${styles.open}`}></div>
              <div className={styles.idHoursText}>Aberto agora · fecha às 20h</div>
            </div>
          </div>
        </div>
        <div className={styles.goldRule}></div>

        <div className={styles.ratingStrip}>
          <div className={styles.ratingItem}>
            <div className={styles.ratingValue}>4.9★</div>
            <div className={styles.ratingLabel}>Avaliação</div>
          </div>
          <div className={styles.ratingItem}>
            <div className={styles.ratingValue}>1.2K+</div>
            <div className={styles.ratingLabel}>Clientes</div>
          </div>
          <div className={styles.ratingItem}>
            <div className={styles.ratingValue}>3</div>
            <div className={styles.ratingLabel}>Barbeiros</div>
          </div>
        </div>

        <div className={styles.testimonialsSection}>
          <div className={styles.sectionTitle}>Depoimentos</div>
          <div className={styles.testimonialsScroll}>
            {[
              { name: 'Lucas M.', text: '"Melhor corte que já fiz na vida. O Rafael manda muito bem, saí outro cara!"', service: 'Corte + Barba' },
              { name: 'Bruno S.', text: '"Ambiente incrível, atendimento top. Virei cliente fiel da Barbearia do Rei."', service: 'Navalhado' },
              { name: 'Felipe A.', text: '"Hidratação na barba fez toda a diferença. Produto excelente e mão boa."', service: 'Barba Completa' }
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="#0F0D0B" strokeWidth="1.8"/><path d="M3 9H21" stroke="#0F0D0B" strokeWidth="1.8"/><path d="M8 2V6M16 2V6" stroke="#0F0D0B" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="15" r="2" fill="#0F0D0B"/></svg>
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitle}>Agendar Horário</div>
                <div className={styles.cardSub}>Escolha o barbeiro, serviço e horário</div>
              </div>
              <ChevronRight className={styles.cardArrow} />
            </div>
            <div className={styles.shimmerBar}></div>
          </button>

          <button className={`${styles.actionCard} ${styles.cardMeus}`} onClick={() => onNavigate('appointments')}>
            <div className={styles.cardRow}>
              <div className={styles.cardIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="#C8941A" strokeWidth="1.8"/><path d="M3 9H21" stroke="#C8941A" strokeWidth="1.8"/><path d="M8 13H16M8 17H13" stroke="#C8941A" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitle}>Meus Agendamentos</div>
                <div className={styles.cardSub}>Veja e gerencie seus horários</div>
              </div>
              <ChevronRight className={styles.cardArrow} />
            </div>
          </button>

          <button className={`${styles.actionCard} ${styles.cardOnde}`} onClick={() => onNavigate('location')}>
            <div className={styles.cardRow}>
              <div className={styles.cardIconWrap}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.69 2 6 4.69 6 8C6 12.5 12 20 12 20C12 20 18 12.5 18 8C18 4.69 15.31 2 12 2Z" stroke="#C8941A" strokeWidth="1.8"/><circle cx="12" cy="8" r="2.5" stroke="#C8941A" strokeWidth="1.8"/></svg>
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitle}>Onde Estamos</div>
                <div className={styles.cardSub}>Av. Brasil, 880 — Rio Preto</div>
              </div>
              <ChevronRight className={styles.cardArrow} />
            </div>
          </button>
        </div>

        <div style={{ fontSize: '0.57rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'Oswald, sans-serif', textAlign: 'center', padding: '16px 0 8px' }}>Siga nas redes</div>
        <div className={styles.socialRow}>
          <a href="#" className={styles.soc} title="Instagram"><Instagram /></a>
          <a href="#" className={styles.soc} title="YouTube"><Youtube /></a>
          <a href="#" className={styles.soc} title="WhatsApp"><MessageCircle /></a>
        </div>

        <div className={styles.miniFooter}>
          <strong style={{ color: 'var(--gold)' }}>@{tenant?.slug || 'barbeariadorei'}</strong> · São José do Rio Preto, SP
        </div>
      </div>
    </div>
  );
};

export default Home;
