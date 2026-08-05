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
    <div className="glass-panel max-w-lg mx-auto w-full animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl text-accent mb-2">Completar Reserva</h2>
        <p className="text-gray-300">
          Has seleccionado: <span className="font-bold text-accent text-xl bg-black/50 px-3 py-1 rounded block mt-2">{selectedTicket}</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="input-group">
          <label className="input-label" htmlFor="name">Nombre y Apellido *</label>
          <input 
            type="text" 
            id="name"
            required
            className="input-field" 
            placeholder="Ej. Carlos Vives"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="input-group">
          <label className="input-label" htmlFor="phone">Celular (WhatsApp) *</label>
          <input 
            type="tel" 
            id="phone"
            required
            className="input-field" 
            placeholder="Ej. 300 123 4567"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        
        <div className="input-group">
          <label className="input-label" htmlFor="idNumber">CURP o INE *</label>
          <input 
            type="text" 
            id="idNumber"
            required
            className="input-field" 
            placeholder="Ej. ABCD1234567890"
            value={formData.idNumber}
            onChange={e => setFormData({...formData, idNumber: e.target.value})}
          />
        </div>
        
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mt-2">
          <p className="text-sm text-warning font-bold">¡Atención!</p>
          <p className="text-xs text-gray-300 mt-1">Al hacer clic en continuar, tendrás 15 minutos para realizar tu pago 100% seguro a través de nuestra pasarela autorizada, de lo contrario el número se liberará automáticamente.</p>
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
