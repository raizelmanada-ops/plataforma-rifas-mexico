'use client';
import { useState, useEffect } from 'react';

const names = ["Juan P.", "María G.", "Carlos M.", "Ana R.", "Luis F.", "Laura C.", "Jorge T.", "Sofía L.", "Pedro S.", "Alejandro M.", "Fernanda V.", "Diego H.", "Miguel A.", "Carmen S."];
const cities = ["Monterrey", "CDMX", "Jalisco", "Edo. de México", "Puebla", "Querétaro", "Veracruz", "Nuevo León", "Guanajuato", "Chihuahua", "Tijuana"];

export default function SocialProof() {
  const [notification, setNotification] = useState<{ name: string, city: string, tickets: number } | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    const showRandomNotification = () => {
      // Ocultar cualquier notificación existente primero
      setNotification(null);
      
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      
      // La mayoría de la gente compra pocos boletos, a veces muchos.
      const ticketsArray = [1, 2, 2, 3, 3, 5, 5, 10, 15];
      const randomTickets = ticketsArray[Math.floor(Math.random() * ticketsArray.length)];

      setNotification({ name: randomName, city: randomCity, tickets: randomTickets });

      // Ocultar después de 5 segundos
      hideTimeout = setTimeout(() => {
        setNotification(null);
      }, 5000);

      // Programar la siguiente notificación entre 12 y 35 segundos
      const nextTime = Math.floor(Math.random() * (35000 - 12000 + 1)) + 12000;
      timeout = setTimeout(showRandomNotification, nextTime);
    };

    // Iniciar la primera notificación después de 8 segundos de entrar a la página
    timeout = setTimeout(showRandomNotification, 8000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      border: '1px solid rgba(255, 215, 0, 0.5)',
      borderLeft: '4px solid #FFD700',
      borderRadius: '8px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 215, 0, 0.2)',
      zIndex: 9999,
      maxWidth: '320px',
      animation: 'slideIn 0.5s ease-out forwards'
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100px) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
      <div style={{
        backgroundColor: '#00ff66',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <span style={{ color: 'black', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
      </div>
      <div>
        <p style={{ color: 'white', margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>
          {notification.name} de {notification.city}
        </p>
        <p style={{ color: '#FFD700', margin: 0, fontSize: '0.75rem', marginTop: '2px' }}>
          compró {notification.tickets} boleto{notification.tickets > 1 ? 's' : ''} hace un momento
        </p>
      </div>
    </div>
  );
}
