'use client';

import React, { useState } from 'react';
import styles from './barbearia1.module.css';
import Home from '@/components/templates/barbearia1/Home';
import BookingFlow from '@/components/templates/barbearia1/BookingFlow';
import MyAppointments from '@/components/templates/barbearia1/MyAppointments';
import Location from '@/components/templates/barbearia1/Location';
import Success from '@/components/templates/barbearia1/Success';

type Screen = 'home' | 'booking' | 'appointments' | 'location' | 'success';

const Barbearia1Template = ({ tenant, services, professionals }: { tenant?: any, services?: any[], professionals?: any[] }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [bookingData, setBookingData] = useState<any>(null);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = (data: any) => {
    setBookingData(data);
    const savedAppts = JSON.parse(localStorage.getItem('barbearia1_appointments') || '[]');
    localStorage.setItem('barbearia1_appointments', JSON.stringify([...savedAppts, data]));
    navigateTo('success');
  };

  return (
    <div className={styles.app}>
      {currentScreen === 'home' && (
        <Home onNavigate={(s) => navigateTo(s as Screen)} tenant={tenant} />
      )}
      
      {currentScreen === 'booking' && (
        <BookingFlow 
          onBack={() => navigateTo('home')} 
          onSuccess={handleBookingSuccess} 
          services={services}
          professionals={professionals}
          tenantId={tenant?.id}
        />
      )}

      {currentScreen === 'appointments' && (
        <MyAppointments onBack={() => navigateTo('home')} tenantId={tenant?.id} />
      )}

      {currentScreen === 'location' && (
        <Location onBack={() => navigateTo('home')} tenant={tenant} />
      )}

      {currentScreen === 'success' && bookingData && (
        <Success 
          data={bookingData} 
          onHome={() => navigateTo('home')} 
          onViewAppointments={() => navigateTo('appointments')} 
        />
      )}
    </div>
  );
};

export default Barbearia1Template;
