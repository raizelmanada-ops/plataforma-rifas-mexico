"use client";

import { useState, useEffect } from "react";

// Hotmart bundles para enlazar los pagos
const bundles = [
  { id: 1, name: "Base", count: 1, price: 25, hotmartCode: "base" },
  { id: 2, name: "Par", count: 2, price: 50, hotmartCode: "05kjlvl8" }, // Usando códigos anteriores de placeholder
  { id: 3, name: "Plata", count: 5, price: 125, hotmartCode: "cscfs4vt" },
  { id: 4, name: "Oro", count: 10, price: 250, hotmartCode: "insxmui" },
  { id: 5, name: "Diamante", count: 50, price: 1250, hotmartCode: "s5kah3j1" },
];

export default function TicketGrid({ onSelectTicket }: { onSelectTicket: (ticket: string, code: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [visibleNumbers, setVisibleNumbers] = useState<string[]>([]);
  const [isMaquinitaOpen, setIsMaquinitaOpen] = useState(false);
  const [maquinitaCount, setMaquinitaCount] = useState(bundles[0].count);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const TOTAL_NUMBERS = 60000; // Estándar Lotería Nacional
  
  const generateRandomVisible = () => {
    const nums: string[] = [];
    for (let i = 0; i < 100; i++) {
      const randomNum = Math.floor(Math.random() * TOTAL_NUMBERS).toString().padStart(5, '0');
      if (!nums.includes(randomNum)) nums.push(randomNum);
    }
    setVisibleNumbers(nums.sort());
  };

  // Inicializar algunos números visibles aleatorios al cargar
  useEffect(() => {
    generateRandomVisible();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 5);
    setSearchTerm(val);
    
    if (val.length >= 2) {
      // Filtrar números que empiecen o contengan el valor
      const exact = val.padStart(5, '0');
      setVisibleNumbers([exact]);
    } else if (val.length === 0) {
      generateRandomVisible();
    }
  };

  const toggleNumber = (num: string) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const selectRandom = (count: number) => {
    setIsGenerating(true);
    setTimeout(() => {
      const newSelection = [...selectedNumbers];
      let added = 0;
      while (added < count) {
        const randomNum = Math.floor(Math.random() * TOTAL_NUMBERS).toString().padStart(5, '0');
        if (!newSelection.includes(randomNum)) {
          newSelection.push(randomNum);
          added++;
        }
      }
      setSelectedNumbers(newSelection);
      setIsGenerating(false);
      setIsMaquinitaOpen(false);
    }, 1500);
  };

  const clearSelection = () => {
    setSelectedNumbers([]);
  };

  const getMatchedBundle = () => {
    const count = selectedNumbers.length;
    if (count === 0) return null;
    
    // Buscar si hay un paquete exacto
    const exactBundle = bundles.find(b => b.count === count);
    if (exactBundle) return exactBundle;
    
    // Si no es exacto, cobrar por boleto individual ($25 c/u)
    return {
      name: "Personalizado",
      count: count,
      price: count * 25,
      hotmartCode: "base" // Se usa el base y multiplicaremos en el checkout
    };
  };

  const handleCheckout = () => {
    if (selectedNumbers.length === 0) return;
    
    // Encontrar el bundle para mandar el link de Hotmart (aproximado)
    const count = selectedNumbers.length;
    const bundle = bundles.slice().reverse().find(b => count >= b.count) || bundles[0];
    
    const displayTickets = selectedNumbers.join(", ");
    onSelectTicket(`${displayTickets} (${selectedNumbers.length} Boletos)`, bundle.hotmartCode);
  };

  const matchedBundle = getMatchedBundle();

  return (
    <div style={{ width: '100%', maxWidth: '1024px', margin: '48px auto 0 auto', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', boxSizing: 'border-box', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', textTransform: 'uppercase', letterSpacing: '-0.05em', margin: '0 0 8px 0' }}>
          Busca tu <span style={{ color: '#FFD700' }}>Boleto</span>
        </h3>
        <p className="text-gray-400">Selecciona tus números de la suerte. Participan 60,000 números con la Lotería Nacional.</p>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '32px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid #999' }}></div>
          <span style={{ color: 'white' }}>Disponibles</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFD700' }}></div>
          <span style={{ color: '#d1d5db' }}>Apartados</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc2626' }}></div>
          <span style={{ color: '#d1d5db' }}>Vendidos</span>
        </div>
      </div>

      {/* Máquina rápida */}
      <div style={{ marginBottom: '32px', width: '100%', boxSizing: 'border-box' }}>
        <button 
          onClick={() => setIsMaquinitaOpen(true)}
          style={{ width: '100%', padding: '16px', backgroundColor: '#222', border: '2px solid #555', borderRadius: '12px', color: 'white', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🎰 MAQUINITA DE LA SUERTE
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', margin: '0 auto 32px auto', boxSizing: 'border-box' }}>
        <input 
          type="text" 
          placeholder="Ej. 05432" 
          value={searchTerm}
          onChange={handleSearch}
          maxLength={5}
          style={{ width: '100%', padding: '16px 40px 16px 16px', fontSize: '1.2rem', fontWeight: '900', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', boxSizing: 'border-box' }}
        />
        <div style={{ position: 'absolute', top: 0, right: '16px', height: '100%', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
          <svg width="24" height="24" style={{ color: '#888' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {/* Grid Virtual */}
      <div className="custom-scrollbar" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '400px', overflowY: 'auto', boxSizing: 'border-box', width: '100%' }}>
        {visibleNumbers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', fontWeight: 'bold' }}>No se encontraron números disponibles con esa búsqueda.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px', boxSizing: 'border-box', width: '100%' }}>
            {visibleNumbers.map(num => {
              const isSelected = selectedNumbers.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  style={{
                    padding: '12px 4px',
                    borderRadius: '8px',
                    fontSize: '1.2rem',
                    fontWeight: '900',
                    border: '2px solid',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ...(isSelected 
                      ? { backgroundColor: '#FFD700', color: 'black', borderColor: '#FFD700', boxShadow: '0 0 10px rgba(255,215,0,0.5)', transform: 'scale(1.05)' }
                      : { backgroundColor: '#ffffff', color: 'black', borderColor: '#ccc' })
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Checkout Bar Flotante */}
      {selectedNumbers.length > 0 && (
        <div style={{ position: 'fixed', bottom: '0', left: '0', width: '100%', backgroundColor: 'rgba(0,0,0,0.95)', borderTop: '4px solid #FFD700', padding: '12px 16px', zIndex: 100, boxShadow: '0 -10px 40px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <style dangerouslySetInnerHTML={{__html: `
            #whatsapp-btn {
              bottom: 90px !important;
            }
          `}} />
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            
            <div style={{ textAlign: 'center', flex: '1 1 auto' }}>
              <p style={{ color: '#ccc', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Has seleccionado</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>{selectedNumbers.length} Boletos</span>
                <span style={{ backgroundColor: '#FFD700', color: 'black', padding: '4px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '1.2rem' }}>${matchedBundle?.price} MXN</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#FFD700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px', margin: '0 auto' }}>
                Boletos: {selectedNumbers.slice(0, 5).join(', ')}{selectedNumbers.length > 5 ? '...' : ''}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flex: '0 1 auto' }}>
              <button 
                onClick={clearSelection}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', backgroundColor: 'transparent' }}
              >
                🗑️
              </button>
              <button 
                onClick={handleCheckout}
                style={{ backgroundColor: '#FFD700', color: 'black', padding: '8px 32px', borderRadius: '8px', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 0 20px rgba(255,215,0,0.6)', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}
              >
                Pagar Ahora
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Maquinita */}
      {isMaquinitaOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', color: 'black', width: '100%', maxWidth: '600px', borderRadius: '16px', border: '4px solid #cc0000', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', backgroundColor: '#cc0000', padding: '8px 16px' }}>
              <button onClick={() => setIsMaquinitaOpen(false)} style={{ color: 'white', background: 'transparent', border: 'none', fontWeight: 'bold', fontSize: '1.5rem', cursor: 'pointer' }}>X</button>
            </div>
            <div style={{ padding: '32px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px', border: '2px solid #cc0000', borderRadius: '12px', padding: '16px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '120px' }}>BOLETOS A GENERAR:</label>
                <select 
                  value={maquinitaCount} 
                  onChange={(e) => setMaquinitaCount(Number(e.target.value))}
                  style={{ flex: 1, padding: '12px', fontSize: '1.1rem', fontWeight: 'bold', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: 'white', color: 'black' }}
                >
                  {bundles.map(b => (
                    <option key={b.id} value={b.count}>{b.count} Boletos por ${b.price}</option>
                  ))}
                  <option value={20}>20 Boletos por $500</option>
                  <option value={100}>100 Boletos por $2500</option>
                </select>
              </div>

              {isGenerating ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '6rem', animation: 'spin 1s infinite linear', display: 'inline-block' }}>🎰</div>
                  <p style={{ fontWeight: '900', marginTop: '24px', fontSize: '1.5rem', color: '#cc0000', textTransform: 'uppercase' }}>¡Generando Suerte!</p>
                  <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
                </div>
              ) : (
                <div 
                  onClick={() => selectRandom(maquinitaCount)}
                  style={{ border: '3px solid #cc0000', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: '#fff' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fff0f0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <p style={{ fontWeight: '900', fontSize: '1.3rem', color: '#000', margin: 0 }}>
                    HAZ CLICK AQUÍ PARA GENERAR {maquinitaCount} BOLETOS AL AZAR!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
