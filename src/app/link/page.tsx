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
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        backgroundColor: '#111111',
        padding: '40px 20px',
        borderRadius: '24px',
        border: '1px solid #333',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        
        {/* Placeholder Logo / Shield */}
        <div style={{
          width: '120px',
          height: '120px',
          backgroundColor: '#222',
          borderRadius: '50%',
          margin: '0 auto 24px auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '3px solid #FFD700',
          boxShadow: '0 0 20px rgba(255,215,0,0.2)'
        }}>
          <span style={{ fontSize: '3rem' }}>⭐</span>
        </div>

        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          marginBottom: '10px',
          letterSpacing: '-0.5px'
        }}>
          COMUNIDAD VIP
        </h1>
        
        <p style={{
          color: '#888',
          fontSize: '1rem',
          marginBottom: '40px',
          lineHeight: '1.5'
        }}>
          Estás a un paso de ingresar a nuestra plataforma oficial.
        </p>

        <Link href="/" passHref>
          <button style={{
            width: '100%',
            padding: '16px 24px',
            backgroundColor: '#FFD700',
            color: '#000',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 15px rgba(255,215,0,0.3)'
          }}>
            Ingresar Aquí
          </button>
        </Link>
        
      </div>
      
      <div style={{ marginTop: '30px', color: '#444', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} Comunidad VIP. Todos los derechos reservados.
      </div>
    </div>
  );
}
