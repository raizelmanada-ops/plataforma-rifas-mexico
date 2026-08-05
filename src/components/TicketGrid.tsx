"use client";

import { useState } from "react";

export default function TicketGrid({ onSelectTicket }: { onSelectTicket: (ticket: string) => void }) {
  const [loading, setLoading] = useState(false);

  const bundles = [
    { id: 1, name: "Bronce", count: 10, price: "$15 MXN", bonus: "", color: "from-[#cd7f32] to-[#8c5622]" },
    { id: 2, name: "Plata", count: 50, price: "$75 MXN", bonus: "", color: "from-[#e5e4e2] to-[#a9a9a9]", text: "text-black" },
    { id: 3, name: "Oro", count: 100, price: "$150 MXN", bonus: "Bono: $15,000 MXN", color: "from-[#FFD700] to-[#b38728]", popular: true, text: "text-black" },
    { id: 4, name: "VIP", count: 200, price: "$300 MXN", bonus: "Bono: $30,000 MXN + IPHONE 15", color: "from-[#ff00a5] to-[#800052]" },
  ];

  const handleSelectBundle = (bundle: any) => {
    setLoading(true);
    
    // Simulate generating numbers with a slot machine effect delay
    setTimeout(() => {
      setLoading(false);
      onSelectTicket(`${bundle.count} Boletos (Asignados al Azar)`);
    }, 1500);
  };

  return (
    <div className="w-full relative max-w-4xl mx-auto">
      <div className="bg-black/60 border border-[#FFD700]/30 rounded-xl p-4 sm:p-8 mb-8 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FDB931] uppercase mb-2 tracking-tighter">
            🎰 La Maquinita de la Suerte
          </h3>
          <p className="text-gray-300 text-sm md:text-base">Selecciona tu paquete y el sistema te asignará tus boletos ganadores de forma automática y aleatoria.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-7xl animate-bounce mb-6">🎰</div>
            <h4 className="text-2xl font-black text-[#FFD700] animate-pulse uppercase tracking-widest text-center">Generando tus Boletos...</h4>
            <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">Buscando los mejores números en la bóveda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {bundles.map(bundle => (
              <div 
                key={bundle.id}
                onClick={() => handleSelectBundle(bundle)}
                className={`relative cursor-pointer group rounded-2xl overflow-hidden border-2 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] ${
                  bundle.popular ? 'border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.2)]' : 'border-white/10 hover:border-white/30'
                }`}
              >
                {bundle.popular && (
                  <div className="absolute top-0 left-0 w-full bg-danger text-white text-[10px] font-black uppercase text-center py-1.5 z-10 tracking-widest animate-pulse">
                    🔥 EL MÁS VENDIDO 🔥
                  </div>
                )}
                
                <div className={`bg-gradient-to-br ${bundle.color} p-6 h-full flex flex-col items-center justify-center text-center relative z-0 ${bundle.text || 'text-white'} ${bundle.popular ? 'pt-10' : ''}`}>
                  <h4 className="text-lg font-black uppercase tracking-widest opacity-90 mb-2">Paquete {bundle.name}</h4>
                  <div className="text-6xl font-black mb-1 drop-shadow-md">{bundle.count}</div>
                  <div className="text-xs uppercase font-bold tracking-widest opacity-80 mb-6">Boletos</div>
                  
                  <div className="text-3xl font-black mb-2 bg-black/10 px-4 py-1 rounded-lg">{bundle.price}</div>
                  
                  {bundle.bonus ? (
                    <div className="bg-black/90 text-[#FFD700] font-bold text-[10px] uppercase px-3 py-2.5 rounded-lg mt-3 w-full border border-[#FFD700]/50 shadow-inner">
                      {bundle.bonus}
                    </div>
                  ) : (
                    <div className="h-[42px] mt-3 w-full"></div>
                  )}
                  
                  <button className="mt-6 w-full bg-black/20 hover:bg-black/40 border border-black/20 rounded-lg py-3 font-black uppercase text-sm transition-colors shadow-sm">
                    SELECCIONAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-[10px] text-gray-500 uppercase tracking-wider">
          * Emisión total de 1,000,000 de boletos (000000 al 999999). Tus números exactos de 6 cifras serán asignados aleatoriamente y enviados a tu correo electrónico inmediatamente al confirmar el pago.
        </div>
      </div>
    </div>
  );
}
