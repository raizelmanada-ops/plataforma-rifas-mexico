import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comunidad Oficial VIP',
  description: 'Acceso exclusivo a la comunidad oficial VIP.',
  robots: 'noindex, nofollow'
};

export default function BridgePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      color: '#000000',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        padding: '40px 20px',
      }}>
        
        {/* Placeholder Logo / Shield */}
        <div style={{
          width: '180px',
          height: '180px',
          backgroundColor: '#000',
          borderRadius: '50%',
          margin: '0 auto 40px auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: '4px solid #FFD700',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontSize: '1.2rem', color: '#FFD700', fontWeight: '900', letterSpacing: '1px' }}>SORTEOS</span>
          <span style={{ fontSize: '4rem', color: '#FFF', fontWeight: '900', lineHeight: '1' }}>VIP</span>
          <span style={{ fontSize: '1.2rem', color: '#FFD700', fontWeight: '900', letterSpacing: '1px' }}>MÉXICO</span>
        </div>

        <Link href="/" passHref>
          <button style={{
            width: '100%',
            padding: '18px 24px',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            fontSize: '1.3rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px'
          }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Lista disponible aquí
          </button>
        </Link>
        
      </div>
    </div>
  );
}
