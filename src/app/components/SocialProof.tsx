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

      // Ocultar después de 4 segundos
      hideTimeout = setTimeout(() => {
        setNotification(null);
      }, 4000);

      // Programar la siguiente notificación entre 3 y 8 segundos
      const nextTime = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
      timeout = setTimeout(showRandomNotification, nextTime);
    };

    // Iniciar la primera notificación muy rápido (2 segundos)
    timeout = setTimeout(showRandomNotification, 2000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '120px',
      left: '50%',
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
      width: 'max-content',
      maxWidth: '320px',
      animation: 'slideInTop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
    }}>
      <style>{`
        @keyframes slideInTop {
          from { transform: translate(-50%, -50px) scale(0.9); opacity: 0; }
          to { transform: translate(-50%, 0) scale(1); opacity: 1; }
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
