'use client';

import React from 'react';
import styles from '@/app/templates/manicure1/manicure1.module.css';
import { Star, Clock, Calendar, Bookmark, MapPin, ChevronRight, Instagram, Facebook } from 'lucide-react';

interface HomeProps {
  onNavigate: (screen: string) => void;
  tenant?: any;
}

const Home: React.FC<HomeProps> = ({ onNavigate, tenant }) => {
  const bizName = tenant?.nome || "Atendimento Inteligente";
  
  return (
    <div className={`${styles.screen} ${styles.active}`}>
      <div className={styles.hero}>
        <div className={styles.heroPhoto}></div>
        <div className={styles.heroLogoAnchor}>
          <div className={styles.heroLogo}>
             <img src="https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?w=120&h=120&fit=crop" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      <div className={styles.homeContent}>
        <h1 className={styles.studioName}>{bizName}</h1>
        <p className={styles.studioSub}>Nails & Esthetics</p>

        <div className={styles.hoursBadge}>
          <div className={`${styles.hoursDot} ${styles.hoursDotOpen}`}></div>
          <span className={styles.hoursText}>Aberto agora • Fecha às 20h</span>
        </div>

        <div className={styles.contentDivider}></div>

        <div className={styles.ratingStrip}>
          <div className={styles.ratingItem}>
            <span className={styles.ratingValue}>4.9</span>
            <span className={styles.ratingLabel}>Avaliações</span>
          </div>
          <div className={styles.ratingSep}></div>
          <div className={styles.ratingItem}>
            <span className={styles.ratingValue}>8+</span>
            <span className={styles.ratingLabel}>Anos Exp.</span>
          </div>
          <div className={styles.ratingSep}></div>
          <div className={styles.ratingItem}>
            <span className={styles.ratingValue}>2k</span>
            <span className={styles.ratingLabel}>Clientes</span>
          </div>
        </div>

        <div className={styles.testimonialsSection}>
          <h3 className={styles.sectionTitle}>Depoimentos</h3>
          <div className={styles.testimonialsScroll}>
            <div className={styles.testiCard}>
              <div className={styles.testiStars}>★★★★★</div>
              <p className={styles.testiText}>"Melhor manicure da cidade! Super atenciosa e o trabalho é impecável."</p>
              <p className={styles.testiName}>Ana Paula</p>
              <p className={styles.testiService}>Manicure & Pedicure</p>
            </div>
            <div className={styles.testiCard}>
              <div className={styles.testiStars}>★★★★★</div>
              <p className={styles.testiText}>"O ambiente é maravilhoso e as unhas duram uma eternidade. Recomendo!"</p>
              <p className={styles.testiName}>Carla Silva</p>
              <p className={styles.testiService}>Alongamento em Gel</p>
            </div>
          </div>
        </div>

        <div className={styles.cardsArea}>
          <button className={`${styles.actionCard} ${styles.cardAgendar}`} onClick={() => onNavigate('booking')}>
            <div className={styles.cardRow}>
              <div className={styles.cardIconWrap}><Calendar color="#fff" size={24} /></div>
              <div className={styles.cardInfo}>
                <h4 className={styles.cardTitle}>Agendar Horário</h4>
                <p className={styles.cardSub}>Escolha serviço, data e hora</p>
              </div>
              <ChevronRight className={styles.cardArrow} color="#fff" size={20} />
            </div>
            <div className={styles.shimmerBar}></div>
          </button>

          <button className={`${styles.actionCard} ${styles.cardMeus}`} onClick={() => onNavigate('appointments')}>
            <div className={styles.cardRow}>
              <div className={styles.cardIconWrap}><Bookmark color="#B85470" size={24} /></div>
              <div className={styles.cardInfo}>
                <h4 className={styles.cardTitle} style={{ color: '#1E1018' }}>Meus Agendamentos</h4>
                <p className={styles.cardSub}>Ver ou cancelar seus horários</p>
              </div>
              <ChevronRight className={styles.cardArrow} color="#B85470" size={20} />
            </div>
          </button>

          <button className={`${styles.actionCard} ${styles.cardOnde}`} onClick={() => onNavigate('location')}>
            <div className={styles.cardRow}>
              <div className={styles.cardIconWrap}><MapPin color="#C9974A" size={24} /></div>
              <div className={styles.cardInfo}>
                <h4 className={styles.cardTitle} style={{ color: '#1E1018' }}>Onde Estamos</h4>
                <p className={styles.cardSub}>Localização e contatos</p>
              </div>
              <ChevronRight className={styles.cardArrow} color="#C9974A" size={20} />
            </div>
          </button>
        </div>

        <div className={styles.socialRow}>
          <a href="#" className={styles.soc}><Instagram size={18} /></a>
          <a href="#" className={styles.soc}><Facebook size={18} /></a>
        </div>

        <footer className={styles.miniFooter}>
          © 2024 Beauty Studio • Profissionalismo e Elegância
        </footer>
      </div>
    </div>
  );
};

export default Home;
