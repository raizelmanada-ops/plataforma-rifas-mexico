"use client";

import { useState, useEffect } from "react";

// Hotmart bundles para enlazar los pagos
const bundles = [
  { id: 1, name: "Base", count: 1, price: 11, hotmartCode: "base" },
  { id: 2, name: "Cobre", count: 3, price: 33, hotmartCode: "05kjlvl8" },
  { id: 3, name: "Plata", count: 5, price: 55, hotmartCode: "cscfs4vt" },
  { id: 4, name: "Oro", count: 10, price: 110, hotmartCode: "insxmui" },
  { id: 5, name: "Platino", count: 25, price: 275, hotmartCode: "zro69vqo" },
  { id: 6, name: "Esmeralda", count: 50, price: 550, hotmartCode: "s5kah3j1" },
  { id: 7, name: "Diamante", count: 100, price: 1100, hotmartCode: "mjcyaq0t" },
];

export default function TicketGrid({ onSelectTicket }: { onSelectTicket: (ticket: string, code: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [visibleNumbers, setVisibleNumbers] = useState<string[]>([]);
  
  const TOTAL_NUMBERS = 60000; // Estándar Lotería Nacional
  
  // Inicializar algunos números visibles aleatorios al cargar
  useEffect(() => {
    generateRandomVisible();
  }, []);

  const generateRandomVisible = () => {
    const nums: string[] = [];
    for (let i = 0; i < 100; i++) {
      const randomNum = Math.floor(Math.random() * TOTAL_NUMBERS).toString().padStart(5, '0');
      if (!nums.includes(randomNum)) nums.push(randomNum);
    }
    setVisibleNumbers(nums.sort());
  };

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
    
    // Si no es exacto, cobrar por boleto individual ($11 c/u)
    return {
      name: "Personalizado",
      count: count,
      price: count * 11,
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
    <div className="w-full max-w-5xl mx-auto mt-12 bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 md:p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
          Busca tu <span className="text-accent">Boleto</span>
        </h3>
        <p className="text-gray-400">Selecciona tus números de la suerte. Participan 60,000 números con la Lotería Nacional.</p>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '32px', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', border: '1px solid #999' }}></div>
          <span style={{ color: 'white' }}>Disponibles</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#FFD700' }}></div>
          <span style={{ color: '#d1d5db' }}>Apartados</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#dc2626' }}></div>
          <span style={{ color: '#d1d5db' }}>Vendidos</span>
        </div>
      </div>

      {/* Máquina rápida */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '4px' }}>Máquina de la Suerte (Combos Rápidos)</p>
        <p style={{ color: '#00ff66', fontSize: '0.875rem', fontWeight: '900', textAlign: 'center', marginBottom: '16px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          🎁 ¡Bono: Llévate $20,000 MXN extra comprando 25+ boletos!
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', padding: '0 8px' }}>
          <button onClick={() => selectRandom(1)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>+1 Boleto</button>
          <button onClick={() => selectRandom(3)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>+3</button>
          <button onClick={() => selectRandom(5)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>+5</button>
          <button onClick={() => selectRandom(10)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>+10</button>
          <button onClick={() => selectRandom(25)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid #10B981', backgroundColor: '#10B981', color: 'white', boxShadow: '0 0 15px rgba(16,185,129,0.3)' }}>+25 + BONO</button>
          <button onClick={() => selectRandom(50)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid #10B981', backgroundColor: '#10B981', color: 'white', boxShadow: '0 0 15px rgba(16,185,129,0.3)' }}>+50 + BONO</button>
          <button onClick={() => selectRandom(100)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '2px solid #FFD700', backgroundColor: '#FFD700', color: 'black', boxShadow: '0 0 20px rgba(255,215,0,0.5)' }}>+100 VIP</button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ maxWidth: '400px', position: 'relative', margin: '0 auto 32px auto' }}>
        <input 
          type="text" 
          placeholder="Ej. 05432" 
          value={searchTerm}
          onChange={handleSearch}
          maxLength={5}
          style={{ width: '100%', padding: '16px 24px', fontSize: '1.5rem', fontWeight: '900', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white' }}
        />
        <div style={{ position: 'absolute', top: 0, right: '16px', height: '100%', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
          <svg width="24" height="24" style={{ color: '#888' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {/* Grid Virtual */}
      <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10 custom-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {visibleNumbers.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-bold">No se encontraron números disponibles con esa búsqueda.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
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
    </div>
  );
}
