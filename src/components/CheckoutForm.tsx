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
    idNumber: "",
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
    }, 1500);
  };

  if (!selectedTicket) return null;

  return (
    <div className="max-w-lg mx-auto w-full animate-fade-in border-2 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)] bg-black/95 p-6 rounded-xl" style={{ boxSizing: 'border-box' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl text-accent mb-2 font-black uppercase tracking-wider">¡Completa tu Reserva!</h2>
        <p className="text-gray-300 text-sm">
          Has seleccionado: <span className="font-bold text-black bg-[#FFD700] px-4 py-2 rounded-lg block mt-3 text-2xl shadow-[0_0_15px_rgba(255,215,0,0.5)]">{selectedTicket}</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="input-group">
          <label className="block text-[#FFD700] font-black text-lg mb-2 uppercase tracking-wide" htmlFor="name">👤 Nombre y Apellido *</label>
          <input 
            type="text" 
            id="name"
            required
            className="w-full p-4 text-lg font-bold bg-[#2a2a0a] text-white border-2 border-[#FFD700] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#FFD700]/50 shadow-[inset_0_0_15px_rgba(255,215,0,0.1)] transition-all" 
            placeholder="Ej. Carlos Vives"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="input-group">
          <label className="block text-[#FFD700] font-black text-lg mb-2 uppercase tracking-wide" htmlFor="phone">📱 Celular (WhatsApp) *</label>
          <input 
            type="tel" 
            id="phone"
            required
            className="w-full p-4 text-lg font-bold bg-[#2a2a0a] text-white border-2 border-[#FFD700] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#FFD700]/50 shadow-[inset_0_0_15px_rgba(255,215,0,0.1)] transition-all" 
            placeholder="Ej. 300 123 4567"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        
        <div className="input-group">
          <label className="block text-[#FFD700] font-black text-lg mb-2 uppercase tracking-wide" htmlFor="idNumber">💳 CURP o INE *</label>
          <input 
            type="text" 
            id="idNumber"
            required
            className="w-full p-4 text-lg font-bold bg-[#2a2a0a] text-white border-2 border-[#FFD700] rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#FFD700]/50 shadow-[inset_0_0_15px_rgba(255,215,0,0.1)] transition-all" 
            placeholder="Ej. ABCD1234567890"
            value={formData.idNumber}
            onChange={e => setFormData({...formData, idNumber: e.target.value})}
          />
        </div>
        
        <div className="bg-success/10 border border-success/30 rounded-lg p-4 mt-2">
          <p className="text-sm text-success font-bold text-center">🔐 Tus datos están seguros.</p>
          <p className="text-xs text-gray-300 mt-1 text-center">Al hacer clic en continuar, serás redirigido a Hotmart para realizar tu pago 100% seguro. Puedes pagar con tarjeta, OXXO o transferencia SPEI.</p>
        </div>
        
        <div className="flex gap-4 mt-4">
          <button 
            type="button" 
            onClick={onBack} 
            className="btn bg-gray-800 text-white hover:bg-gray-700 w-1/3"
            disabled={loading}
          >
            Atrás
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary w-2/3"
            disabled={loading}
          >
            {loading ? "Reservando..." : "Continuar al Pago"}
          </button>
        </div>
      </form>
    </div>
  );
}
