"use client";

import { useState } from "react";

interface CheckoutFormProps {
  selectedTicket: string | null;
  onBack: () => void;
  onSuccess: (data: any) => void;
}

export default function CheckoutForm({ selectedTicket, onBack, onSuccess }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to reserve the ticket
    setTimeout(() => {
      setLoading(false);
      // Track event
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'InitiateCheckout');
      }
      onSuccess({ ...formData, ticketNumber: selectedTicket });
    }, 1000);
  };

  if (!selectedTicket) return null;

  return (
    <div className="max-w-lg mx-auto w-full animate-fade-in border-2 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)] bg-black/95 p-6 rounded-xl" style={{ boxSizing: 'border-box' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl text-accent mb-2 font-black uppercase tracking-wider">¡Completa tus Datos!</h2>
        <p className="text-gray-300 text-sm">
          Boletos seleccionados: <span className="font-bold text-black bg-[#FFD700] px-4 py-2 rounded-lg block mt-3 text-xl md:text-2xl shadow-[0_0_15px_rgba(255,215,0,0.5)]">{selectedTicket}</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="input-group mb-2">
          <label className="block text-[#FFD700] font-black text-lg mb-2 uppercase tracking-wide" htmlFor="name">
            👤 Nombre Completo *
          </label>
          <input 
            type="text" 
            id="name"
            required
            className="w-full font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD700]/50 shadow-[inset_0_0_15px_rgba(255,215,0,0.1)] transition-all" 
            style={{ backgroundColor: '#2a2a0a', color: 'white', padding: '0.85rem 1.25rem', height: '3.5rem', fontSize: '1.15rem', borderRadius: '0.75rem', border: '2px solid #FFD700' }}
            placeholder="Ej. Juan Pérez"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="input-group mb-2">
          <label className="block text-[#FFD700] font-black text-lg mb-2 uppercase tracking-wide" htmlFor="phone">
            📱 WhatsApp / Teléfono *
          </label>
          <input 
            type="tel" 
            id="phone"
            required
            className="w-full font-bold focus:outline-none focus:ring-4 focus:ring-[#FFD700]/50 shadow-[inset_0_0_15px_rgba(255,215,0,0.1)] transition-all" 
            style={{ backgroundColor: '#2a2a0a', color: 'white', padding: '0.85rem 1.25rem', height: '3.5rem', fontSize: '1.15rem', borderRadius: '0.75rem', border: '2px solid #FFD700' }}
            placeholder="Ej. 55 1234 5678"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div className="input-group mb-4">
          <label className="block text-gray-300 font-bold text-sm mb-1 uppercase tracking-wide" htmlFor="email">
            📧 Correo Electrónico <span className="text-gray-400 font-normal lowercase">(opcional)</span>
          </label>
          <input 
            type="email" 
            id="email"
            className="w-full font-normal focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50" 
            style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '0.75rem 1rem', height: '3rem', fontSize: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)' }}
            placeholder="tu@correo.com (si tienes)"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <p className="text-[11px] text-gray-400 mt-1">
            * Si no tienes correo no te preocupes, te entregamos tu ficha OXXO directo por WhatsApp.
          </p>
        </div>
        
        <div className="bg-success/10 border border-success/30 rounded-lg p-3">
          <p className="text-xs text-success font-bold text-center">
            💬 Al continuar, te llevaremos directo a WhatsApp para darte tu ficha de pago OXXO o cuenta de transferencia.
          </p>
        </div>
        
        <div className="flex gap-4 mt-2">
          <button 
            type="button" 
            onClick={onBack} 
            className="btn bg-gray-800 text-white hover:bg-gray-700 w-1/3"
            disabled={loading}
          >
            ← Volver
          </button>
          
          <button 
            type="submit" 
            className="btn w-2/3 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-base md:text-lg flex items-center justify-center gap-2 border border-white/30 shadow-[0_0_20px_rgba(37,211,102,0.5)]"
            disabled={loading}
          >
            {loading ? "Apartando..." : "💬 Pagar en WhatsApp"}
          </button>
        </div>
      </form>
    </div>
  );
}
