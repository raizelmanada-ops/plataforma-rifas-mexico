"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const ticket = searchParams.get('ticket') || '';
  const idNumber = searchParams.get('id') || '';
  
  // Enlace real de Hotmart
  const hotmartLink = `https://pay.hotmart.com/R107022375T?src=bol_${ticket}_doc_${idNumber}`;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-black/60 p-6 border border-[#FFD700]/30 rounded-2xl text-center shadow-[0_0_30px_rgba(255,215,0,0.15)] backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-black text-[#FFD700] mb-2 uppercase tracking-tighter">¡Estás a un paso!</h1>
        <p className="text-gray-300 mb-6 text-sm">
          Adquiere nuestra <strong>Guía de Mentalidad Millonaria</strong> y llévate de <span className="text-[#00ff66] font-bold">BONO GRATIS</span> tu participación oficial en el Sorteo con tu paquete de <span className="font-black text-[#FFD700] text-xl px-2">{ticket}</span>.
        </p>
        
        <div className="w-full flex justify-center mb-6">
           <img src="/portada_ebook.jpg" alt="Guía de Mentalidad Millonaria" className="max-w-[180px] rounded-lg shadow-[0_0_20px_rgba(255,215,0,0.4)] border border-white/10" />
        </div>
        
        <div className="bg-black/50 p-4 rounded-lg mb-6 text-left border border-white/5 shadow-inner">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Tu compra incluye:</p>
          <ul className="text-sm space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-[#FFD700]">📚</span> 
              <span><strong>eBook Digital:</strong> Guía de Mentalidad Millonaria (Descarga Inmediata)</span>
            </li>
            <li className="flex items-start gap-2 bg-[#00ff66]/10 p-2 rounded border border-[#00ff66]/20">
              <span className="text-[#00ff66]">🎟️</span> 
              <span><strong>Bono de Regalo:</strong> {ticket} para el Sorteo Oficial.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00d2ff]">🔒</span> 
              <span><strong>Pago 100% Seguro:</strong> OXXO Pay, SPEI y Tarjetas.</span>
            </li>
          </ul>
        </div>
        
        <a 
          href={hotmartLink}
          className="w-full flex justify-center items-center h-14 text-lg font-black bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black rounded-lg shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-[1.02] transition-transform"
        >
          COMPRAR Y RECIBIR BONO
        </a>
        
        <p className="text-[10px] text-gray-500 mt-5 leading-tight opacity-80">
          Al hacer clic serás redirigido a la plataforma segura de Hotmart. Podrás pagar en efectivo vía OXXO, transferencia SPEI o con tu tarjeta. El acceso al eBook y tu boleto digital llegarán a tu correo electrónico al instante.
        </p>
      </div>
    </main>
  );
}

export default function CheckoutEbook() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
