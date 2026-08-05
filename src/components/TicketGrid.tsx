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
        <p className="text-gray-400">Selecciona tus números de la suerte. Participan {TOTAL_NUMBERS.toLocaleString()} números con la Lotería Nacional.</p>
      </div>

      {/* Stats Bar */}
      <div className="flex justify-center gap-4 md:gap-8 mb-8 text-sm md:text-base font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white border border-gray-400"></div>
          <span className="text-white hidden sm:inline">Disponibles</span><span className="text-white sm:hidden">Libres</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
          <span className="text-gray-300">Apartados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-600"></div>
          <span className="text-gray-300">Vendidos</span>
        </div>
      </div>

      {/* Máquina rápida */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest text-center mb-3">Máquina de la Suerte (Azar)</p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          <button onClick={() => selectRandom(1)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} className="bg-black/50 hover:bg-accent hover:text-black transition-all">+1 Boleto</button>
          <button onClick={() => selectRandom(3)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} className="bg-black/50 hover:bg-accent hover:text-black transition-all">+3</button>
          <button onClick={() => selectRandom(5)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} className="bg-black/50 hover:bg-accent hover:text-black transition-all">+5</button>
          <button onClick={() => selectRandom(10)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} className="bg-black/50 hover:bg-accent hover:text-black transition-all">+10</button>
          <button onClick={() => selectRandom(25)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} className="bg-black/50 hover:bg-accent hover:text-black transition-all">+25</button>
          <button onClick={() => selectRandom(50)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} className="bg-black/50 hover:bg-accent hover:text-black transition-all">+50</button>
          <button onClick={() => selectRandom(100)} style={{ padding: '8px 16px', fontWeight: '900', borderRadius: '8px', border: '1px solid #FFD700', backgroundColor: '#FFD700', color: 'black' }} className="hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all">+100</button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mx-auto mb-8" style={{ maxWidth: '400px' }}>
        <input 
          type="text" 
          placeholder="Ej. 05432" 
          value={searchTerm}
          onChange={handleSearch}
          maxLength={5}
          style={{ width: '100%', padding: '16px 24px', fontSize: '1.5rem', fontWeight: '900', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white' }}
          className="focus:outline-none focus:border-accent transition-colors"
        />
        <div className="absolute top-0 right-4 h-full flex items-center pointer-events-none">
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
        <div style={{ position: 'fixed', bottom: '0', left: '0', width: '100%', backgroundColor: 'rgba(0,0,0,0.95)', borderTop: '4px solid #FFD700', padding: '24px', zIndex: 100, boxShadow: '0 -10px 40px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#ccc', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Has seleccionado</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white' }}>{selectedNumbers.length} Boletos</span>
                <span style={{ backgroundColor: '#FFD700', color: 'black', padding: '8px 16px', borderRadius: '8px', fontWeight: '900', fontSize: '2rem' }}>${matchedBundle?.price} MXN</span>
              </div>
              <div style={{ fontSize: '1rem', color: '#FFD700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '600px', margin: '0 auto' }}>
                Boletos: {selectedNumbers.slice(0, 8).join(', ')}{selectedNumbers.length > 8 ? '...' : ''}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', width: '100%', justifyContent: 'center' }}>
              <button 
                onClick={clearSelection}
                style={{ padding: '16px 24px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', fontSize: '1.5rem', cursor: 'pointer', backgroundColor: 'transparent' }}
              >
                🗑️ Borrar
              </button>
              <button 
                onClick={handleCheckout}
                style={{ backgroundColor: '#FFD700', color: 'black', padding: '16px 48px', borderRadius: '12px', fontWeight: '900', fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px', boxShadow: '0 0 20px rgba(255,215,0,0.6)', cursor: 'pointer', border: 'none' }}
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
