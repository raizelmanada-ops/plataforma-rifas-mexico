"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import TicketGrid from "@/components/TicketGrid";
import CheckoutForm from "@/components/CheckoutForm";
import SocialProof from "./components/SocialProof";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 22, seconds: 59 });
  const [step, setStep] = useState<"grid" | "checkout" | "ticket">("grid");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearchTickets = async () => {
    if (!searchPhone) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?phone=${encodeURIComponent(searchPhone)}`);
      const data = await res.json();
      setSearchResults(data.tickets || []);
    } catch(e) {
      console.error(e);
      setSearchResults([]);
    }
    setIsSearching(false);
  };
  
  // Configuración del sorteo conectada a la BD
  const [drawDate, setDrawDate] = useState("2026-09-15");
  const [lotteryName, setLotteryName] = useState("La Nacional");
  const [prizes, setPrizes] = useState("GMC SIERRA ACCESORIZADA + $20,000 MXN");
  const [videoUrl, setVideoUrl] = useState("/video_rifa.mp4");
  const [bannerUrl, setBannerUrl] = useState("");
  const [whatsappAdmin, setWhatsappAdmin] = useState("525540920884");
  const [nequiNumber, setNequiNumber] = useState("");
  const [nequiName, setNequiName] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isAssistantMuted, setIsAssistantMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const assistantVideoRef = useRef<HTMLVideoElement | null>(null);

  // Carrusel Hero
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const heroImages = [
    "/sierra-1.jpg",
    "/sierra-2.jpg",
    "/sierra-3.jpg",
    "/sierra-4.jpg",
    "/sierra-5.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [heroImages.length]);
  
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        // Silenciar el video principal automáticamente
        setIsMuted(true);
        const vid = document.getElementById('main-promo-video') as HTMLVideoElement;
        if (vid) vid.muted = true;
        
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setDrawDate(data.drawDate || "2024-11-21");
          setLotteryName(data.lotteryName || "Pronósticos Oficiales de México");
          setPrizes(data.prizes || "Ford Ranger XLT Bi-Turbo (2024)");
          setVideoUrl(data.videoUrl || "");
          if (data.bannerUrl) setBannerUrl(data.bannerUrl);
          if (data.whatsappAdmin) setWhatsappAdmin(data.whatsappAdmin);
          if (data.nequiNumber) setNequiNumber(data.nequiNumber);
          if (data.nequiName) setNequiName(data.nequiName);
          if (data.qrUrl) setQrUrl(data.qrUrl);
        }
      })
      .catch(console.error);
  }, []);

  // Helper para formatear la fecha a un texto amigable
  const formattedDate = new Date(drawDate + "T12:00:00").toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Simple countdown effect real basado en una fecha
  useEffect(() => {
    // Calculamos el tiempo real hasta el sorteo
    const targetDate = new Date(drawDate + "T23:59:59").getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [drawDate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleTicketSelect = (ticket: string, code: string) => {
    // Generar números si es un paquete rápido ("10 Boletos (Máquina de la Suerte)")
    const match = ticket.match(/^(\d+)\s+Boleto/i);
    if (match && ticket.includes("Máquina de la Suerte")) {
      const count = parseInt(match[1], 10);
      const nums: string[] = [];
      while(nums.length < count) {
        const rand = Math.floor(Math.random() * 60000).toString().padStart(5, '0');
        if (!nums.includes(rand)) nums.push(rand);
      }
      setSelectedTicket(`${nums.join(', ')} (${count} Boletos)`);
    } else {
      setSelectedTicket(ticket);
    }
    setSelectedCode(code);
    setStep("checkout");
  };

  const handleCheckoutSubmit = async (data: any) => {
    setUserData(data);
    setStep("ticket");
    
    // Guardar en la base de datos real
    try {
      await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketNumber: selectedTicket,
          name: data.name,
          phone: data.phone,
          email: data.email,
          idNumber: data.phone
        })
      });
    } catch (error) {
      console.error("Error reservando:", error);
    }

    // Abrir WhatsApp directamente con los datos de pago
    try {
      const emailLine = data.email ? `\n📧 Correo: ${data.email}` : '';
      const waMsg = `¡Hola! Acabo de apartar mis boletos para la GMC Sierra + $20,000 MXN:\n\n👤 Titular: ${data.name}\n📱 Teléfono: ${data.phone}${emailLine}\n🎟️ Boletos / Paquete: ${selectedTicket}\n\nPor favor mándenme mi código de barras / ficha oficial de OXXO para ir a pagar.`;
      const waUrl = `https://wa.me/${whatsappAdmin}?text=${encodeURIComponent(waMsg)}`;
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error("Error abriendo WhatsApp:", err);
    }
  };

  const faqs = [
    { q: "¿Cómo se elige al ganador?", a: "El ganador se determina de forma transparente en la fecha oficial establecida ante transmisión en vivo." },
    { q: "¿Dónde se publica al ganador?", a: "Las entregas y ganadores se publican en nuestra página web y en nuestras transmisiones oficiales de Facebook." },
    { q: "¿Dónde y cómo se entrega la camioneta?", a: "¡Te la llevamos hasta la puerta de tu casa en cualquier parte de la República Mexicana! Firmaremos el cambio de propietario a tu nombre." },
    { q: "¿Debo pagar impuestos si gano?", a: "¡No! Asumimos los trámites de entrega para que el vehículo quede listo a tu nombre." }
  ];

  return (
    <main className="min-h-screen pb-12 flex flex-col items-center selection:bg-accent selection:text-black">
      <header style={{ width: '100%', position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'black', borderBottom: '1px solid rgba(255,215,0,0.3)', padding: '12px 16px', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
        {bannerUrl ? (
          <img src={bannerUrl} alt="Comunidad VIP Banner" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto' }} />
        ) : (
          <div style={{ textAlign: 'center', flex: '1 1 100%', minWidth: '250px' }} className="md:flex-1 md:text-left">
            <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'transparent', backgroundImage: 'linear-gradient(to bottom, #FFD700, #b38728)', WebkitBackgroundClip: 'text', textTransform: 'uppercase', fontFamily: 'serif', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              CLUB VIP
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2" style={{ backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 0 5px rgba(24,119,242,0.5)' }}>
                <path d="M22.5 12.5l-1.58 1.58.22 2.22-2.22.47-1.07 1.95-2.05-.88-1.7 1.34-1.7-1.34-2.05.88-1.07-1.95-2.22-.47.22-2.22L3.5 12.5l1.58-1.58-.22-2.22 2.22-.47 1.07-1.95 2.05.88 1.7-1.34 1.7 1.34 2.05-.88 1.07 1.95 2.22.47-.22 2.22 1.58 1.58zm-11 4.5l6-6-1.5-1.5-4.5 4.5-2-2-1.5 1.5 3.5 3.5z" />
              </svg>
            </h1>
            <p style={{ color: '#00ff66', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: '4px 0 0 0' }}>
              Comunidad de amantes de los motores en México
            </p>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flex: '1 1 auto', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setIsSearchModalOpen(true)}
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: '10px 16px', borderRadius: '50px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}
          >
            🔍 Mis Boletos
          </button>
          <a 
            href={`https://wa.me/${whatsappAdmin}?text=Hola,%20quiero%20información%20del%20evento`} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ backgroundColor: '#25D366', color: '#ffffff', padding: '10px 16px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900', fontSize: '14px', border: '2px solid rgba(255,255,255,0.5)', boxShadow: '0 0 20px rgba(37,211,102,0.5)', textDecoration: 'none' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>WHATSAPP</span>
          </a>
        </div>
      </header>

      {/* HERO SECTION - GMC SIERRA (FOTO LIMPIA Y VISIBLE) */}
      <section style={{ width: '100%', position: 'relative', backgroundColor: 'black', borderBottom: '1px solid rgba(255,215,0,0.3)', zIndex: 10, marginBottom: '16px' }}>
        <div style={{ width: '100%', maxWidth: '1152px', margin: '0 auto', height: '48vh', minHeight: '340px', position: 'relative', overflow: 'hidden' }}>
          {/* Suave degradado inferior solo para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-10 pointer-events-none"></div>
          
          {/* Carrusel de Fotos de la Camioneta */}
          {heroImages.map((src, index) => (
            <img 
              key={index}
              src={src} 
              alt={`GMC Sierra Foto ${index + 1}`} 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: index === heroImageIndex ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
                zIndex: index === heroImageIndex ? 5 : 1
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none"><rect width="800" height="400" fill="%23222"/><text x="400" y="200" fill="%23FFD700" font-size="24" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">FOTO SIERRA ' + (index + 1) + ' AQUÍ</text></svg>';
              }}
            />
          ))}
          
          {/* Indicadores del Carrusel */}
          <div style={{ position: 'absolute', bottom: '12px', left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 20 }}>
            {heroImages.map((_, index) => (
              <div 
                key={index} 
                onClick={() => setHeroImageIndex(index)}
                style={{ height: '8px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s', width: index === heroImageIndex ? '32px' : '8px', backgroundColor: index === heroImageIndex ? '#FFD700' : 'rgba(255,255,255,0.5)', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              ></div>
            ))}
          </div>

          {/* Información esencial sobre la foto */}
          <div style={{ position: 'absolute', bottom: '28px', left: 0, width: '100%', textAlign: 'center', zIndex: 20, padding: '0 16px', pointerEvents: 'none' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.9)', margin: 0, lineHeight: 1.2 }}>
              GMC Sierra Denali + $20,000 MXN
            </h2>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid #FFD700', color: '#FFD700', padding: '4px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '900', textTransform: 'uppercase', marginTop: '8px', letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              🗓️ Juega el: {formattedDate}
            </div>
            <br/>
            <button 
              onClick={() => {
                document.getElementById('grid-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ marginTop: '12px', backgroundColor: '#FFD700', color: 'black', padding: '12px 32px', borderRadius: '50px', fontSize: '1.1rem', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 0 25px rgba(255,215,0,0.8)', cursor: 'pointer', border: '2px solid white', pointerEvents: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', animation: 'bounce 2s infinite' }}
            >
              🎟️ VER BOLETOS DESDE $11 MXN 👇
            </button>
          </div>
        </div>
      </section>

      {step === "grid" && (
        <section id="grid-section" style={{ width: '100%', maxWidth: '1152px', margin: '0 auto', padding: '0 16px', textAlign: 'center', boxSizing: 'border-box' }}>
          
          {/* BARRA DE INFORMACIÓN Y FICHA TÉCNICA */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '12px', margin: '12px 0 20px 0' }}>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,215,0,0.3)', padding: '6px 16px', borderRadius: '50px', color: '#FFD700', fontWeight: 'bold', fontSize: '0.85rem' }}>
              🗓️ Fecha Oficial: <span className="text-white">{formattedDate}</span>
            </div>
            <button 
              onClick={() => setIsLegalModalOpen(true)}
              style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#d4d4d8', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              📄 Ver Ficha Técnica
            </button>
          </div>

          {/* 1. SELECTOR DE BOLETOS Y MAQUINITA (INMEDIATAMENTE ARRIBA) */}
          <TicketGrid onSelectTicket={handleTicketSelect} />

          {/* 2. ASISTENTE VIRTUAL DE AYUDA */}
          <div style={{ width: '100%', maxWidth: '768px', margin: '36px auto 36px auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 10, boxSizing: 'border-box' }}>
            
            {/* Contenedor del Video */}
            <div 
              style={{ width: '130px', height: '200px', minWidth: '130px', maxWidth: '130px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #FFD700', backgroundColor: 'black', position: 'relative', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,215,0,0.5)', transform: 'translateZ(0)' }}
              title={isAssistantMuted ? "Toca para encender el audio" : "Toca para silenciar"}
              onClick={() => {
                if (assistantVideoRef.current) {
                  const newMutedState = !assistantVideoRef.current.muted;
                  assistantVideoRef.current.muted = newMutedState;
                  setIsAssistantMuted(newMutedState);
                }
              }}
            >
              <video 
                ref={assistantVideoRef}
                src="/video_asistente.mp4" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', maxWidth: '100%', display: 'block' }}
                autoPlay 
                muted 
                loop 
                playsInline
              />
              
              {/* Botón de Volumen Visual */}
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                {isAssistantMuted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                )}
              </div>
              
              <div style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', backgroundColor: '#00ff66', borderRadius: '50%', border: '2px solid black', boxShadow: '0 0 10px #00ff66', animation: 'pulse 2s infinite' }}></div>
            </div>
            
            {/* Globo de Chat */}
            <div style={{ flex: 1, backgroundColor: '#111111', color: 'white', padding: '14px 16px', borderRadius: '16px', borderBottomLeftRadius: '0', border: '1px solid rgba(255,215,0,0.3)', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ position: 'absolute', left: '-8px', bottom: '16px', width: '16px', height: '16px', backgroundColor: '#111111', borderLeft: '1px solid rgba(255,215,0,0.3)', borderBottom: '1px solid rgba(255,215,0,0.3)', transform: 'rotate(45deg)' }}></div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', lineHeight: '1.5', color: '#e5e7eb' }}>
                <p style={{ marginBottom: '4px' }}><span style={{ color: '#00ff66' }}>1.</span> Elige tu paquete o tus números con la maquinita.</p>
                <p style={{ marginBottom: '4px' }}><span style={{ color: '#00ff66' }}>2.</span> Ingresa tu nombre y teléfono de WhatsApp.</p>
                <p style={{ marginBottom: '4px' }}><span style={{ color: '#00ff66' }}>3.</span> Te mandamos directo a WhatsApp tu ficha oficial de OXXO para pagar.</p>
                <p style={{ color: '#FFD700', fontWeight: '900', marginTop: '6px' }}>¡Aparta tus números ahora! 🍀</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {step === "checkout" && (
        <section className="w-full max-w-xl mx-auto px-4 mt-12 animate-fade-in">
          <button onClick={() => setStep("grid")} className="text-gray-400 hover:text-accent mb-6 flex items-center gap-2 transition-colors">
            ← Volver a los números
          </button>
          
          <div className="bg-black/60 p-6 rounded-xl border border-accent/30 text-center mb-8 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Boletos Seleccionados</p>
            <p className={`font-black text-accent mt-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)] ${selectedTicket && selectedTicket.length > 15 ? 'text-xl md:text-2xl break-words' : 'text-4xl md:text-6xl'}`}>
              {selectedTicket}
            </p>
            <p className="text-success font-bold mt-2 animate-pulse">¡Boletos disponibles para ti!</p>
            <p className="text-sm text-gray-300 mt-1 text-center">Ingresa tus datos para enviarte tu ficha de pago a WhatsApp.</p>
          </div>

          <CheckoutForm selectedTicket={selectedTicket!} onBack={() => setStep("grid")} onSuccess={handleCheckoutSubmit} />
        </section>
      )}

      {step === "ticket" && (
        <section className="w-full max-w-md mx-auto px-4 mt-12 animate-fade-in text-center">
          <div className="bg-success/20 text-success p-4 rounded-xl mb-6 font-bold border border-success/30 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
            ✅ ¡Tus boletos han sido apartados exitosamente!
          </div>
          
          <div className="relative glass-panel p-6 mb-6 overflow-hidden rounded-2xl border-2 border-accent/50 shadow-[0_0_40px_rgba(255,215,0,0.2)] bg-black/80">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-accent-hover"></div>
            
            <div className="relative z-10">
              {bannerUrl ? (
                <div className="flex justify-center mb-4">
                  <img src={bannerUrl} alt="Comunidad VIP" className="h-16 object-contain" />
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#b38728] uppercase font-serif mb-1">
                    CLUB VIP
                  </h2>
                  <p className="text-[#00ff66] text-[10px] font-bold uppercase tracking-widest mb-4">Comunidad de Amantes de los Motores</p>
                </div>
              )}
              <h3 className="text-base font-bold text-white mb-2 tracking-widest border-b border-white/10 pb-2">BOLETOS APARTADOS</h3>
              <div className="text-xl md:text-2xl font-black text-accent tracking-wide mb-4 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] break-words">
                {selectedTicket}
              </div>
              
              <div className="bg-black/50 p-4 rounded-lg mb-4 border border-white/5">
                <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">PARTICIPANDO POR:</p>
                <p className="text-sm font-bold text-white uppercase tracking-wide mb-2">{prizes}</p>
                
                <div className="flex justify-between items-center border-t border-white/10 pt-2 text-xs text-gray-300">
                  <span className="text-gray-500 font-bold uppercase text-[10px]">Fecha del Sorteo:</span>
                  <span className="font-bold text-[#FFD700]">{formattedDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left border-t border-white/10 pt-4 mt-2">
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Titular</p>
                  <p className="font-bold text-white text-sm truncate">{userData?.name}</p>
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Teléfono</p>
                  <p className="font-bold text-white text-sm truncate">{userData?.phone}</p>
                </div>
                {userData?.email && (
                  <div className="col-span-2 overflow-hidden mt-1">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Correo</p>
                    <p className="font-bold text-white text-xs truncate">{userData.email}</p>
                  </div>
                )}
                <div className="col-span-2 mt-2 bg-white/5 p-3 rounded border border-white/10 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Estado</p>
                  <p className="text-warning font-bold animate-pulse mb-1">⚠️ APARTADO - PENDIENTE DE PAGO</p>
                  <p className="text-[11px] text-gray-300">Envía tus datos a WhatsApp para entregarte tu ficha OXXO o cuenta de pago.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* BOTÓN PRINCIPAL: PEDIR FICHA OXXO POR WHATSAPP */}
          <a 
            href={`https://wa.me/${whatsappAdmin}?text=${encodeURIComponent(`¡Hola! Acabo de apartar mis boletos para la GMC Sierra + $20,000 MXN:\n\n👤 Titular: ${userData?.name || ''}\n📱 Teléfono: ${userData?.phone || ''}${userData?.email ? `\n📧 Correo: ${userData.email}` : ''}\n🎟️ Boletos: ${selectedTicket || ''}\n\nPor favor mándenme mi ficha oficial de OXXO para ir a pagar.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mb-4 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-base md:text-lg py-4 px-4 rounded-xl shadow-[0_0_25px_rgba(37,211,102,0.6)] transition-all hover:scale-[1.02] border-2 border-white/40 text-center"
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" style={{ minWidth: '28px' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs uppercase opacity-90 leading-none">Paso Final</div>
              <div className="font-black text-sm md:text-base leading-tight">ENVIAR BOLETOS POR WHATSAPP</div>
            </div>
          </a>
        </section>
      )}

      {step === "grid" && (
        <>
          {/* 4. EL VIDEO PASÓ A SER PRUEBA SOCIAL AL FONDO */}
          <section className="w-full max-w-4xl mx-auto px-4 mt-8 mb-8">
        <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover uppercase text-center mb-4">
          Conoce tu Premio
        </h3>
        <div style={{ aspectRatio: '16/9', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '2px solid #FFD700', boxShadow: '0 0 40px rgba(255,215,0,0.3)', backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxSizing: 'border-box' }}>
          {videoUrl ? (
            videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") || videoUrl.includes("vimeo.com") ? (
              <iframe 
                src={videoUrl} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Video del Premio"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <video 
                  id="main-promo-video-bottom"
                  src={videoUrl} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  controls 
                  autoPlay 
                  muted
                  loop 
                  playsInline
                >
                  Tu navegador no soporta videos.
                </video>
              </div>
            )
          ) : null}
        </div>
      </section>

      {/* PRUEBA SOCIAL / EVENTOS EXPRESS */}
      <section className="w-full max-w-6xl mx-auto px-4 mt-16 mb-8 text-center">
        <h3 className="text-2xl md:text-4xl font-black text-white uppercase mb-2">
          Evidencia de <span className="text-accent">Ganadores</span>
        </h3>
        <p className="text-gray-400 text-sm md:text-base mb-8 uppercase tracking-widest font-bold">Últimos Eventos Express (Entregas 100% Confiables ✅)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#111] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:border-accent/50 transition-colors">
            <div className="h-48 bg-gray-800 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1594732832278-abd644401426?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center">
              {/* Imagen de un ganador simulada */}
              <div className="bg-black/50 w-full h-full flex flex-col items-center justify-center p-4">
                <span className="bg-success text-black font-black uppercase px-3 py-1 rounded-full text-xs mb-2 shadow-[0_0_10px_rgba(0,255,0,0.5)]">¡Entregado!</span>
              </div>
            </div>
            <div className="p-4 text-left">
              <h4 className="font-bold text-white text-lg leading-tight mb-1">Evento Express: $10,000 Pesos</h4>
              <p className="text-xs text-gray-400">Entregado a José Ali de Chihuahua.</p>
            </div>
          </div>
          
          <div className="bg-[#111] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:border-accent/50 transition-colors">
            <div className="h-48 bg-gray-800 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1628005370420-4e4b52b27072?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center">
              <div className="bg-black/50 w-full h-full flex flex-col items-center justify-center p-4">
                <span className="bg-success text-black font-black uppercase px-3 py-1 rounded-full text-xs mb-2 shadow-[0_0_10px_rgba(0,255,0,0.5)]">¡Entregado!</span>
              </div>
            </div>
            <div className="p-4 text-left">
              <h4 className="font-bold text-white text-lg leading-tight mb-1">Evento Express: Set de Llantas</h4>
              <p className="text-xs text-gray-400">Entregado a María Gómez, Sinaloa.</p>
            </div>
          </div>

          <div className="bg-[#111] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:border-accent/50 transition-colors">
            <div className="h-48 bg-gray-800 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1594732832278-abd644401426?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center">
              <div className="bg-black/50 w-full h-full flex flex-col items-center justify-center p-4">
                <span className="bg-warning text-black font-black uppercase px-3 py-1 rounded-full text-xs mb-2 shadow-[0_0_10px_rgba(255,215,0,0.5)]">Evento Activo</span>
              </div>
            </div>
            <div className="p-4 text-left">
              <h4 className="font-bold text-white text-lg leading-tight mb-1">GMC Sierra + $20,000 MXN</h4>
              <p className="text-xs text-accent font-bold">¡Tú puedes ser el próximo!</p>
            </div>
          </div>
        </div>
      </section>

      {/* PREVIOUS WINNERS SECTION (FACEBOOK LINK) */}
      <section className="w-full max-w-6xl mx-auto px-4 mt-8 mb-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover uppercase">Transparencia y Entregas</h3>
          <p className="text-gray-400 text-sm mt-2">Visita nuestra página oficial de Facebook para ver todas nuestras entregas en vivo.</p>
        </div>
        
        <div className="flex justify-center" style={{ padding: '0 10px' }}>
          <a 
            href="https://www.facebook.com/profile.php?id=61592447626424" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ backgroundColor: '#1877F2', padding: '12px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 0 20px rgba(24,119,242,0.4)', color: 'white', fontWeight: '900', fontSize: '0.9rem', textDecoration: 'none', maxWidth: '100%', flexWrap: 'wrap', textAlign: 'center' }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
            </svg>
            <span>VER GANADORES EN FACEBOOK</span>
          </a>
        </div>
      </section>

      {/* TRANSPARENCY BANNER */}
      <div className="w-full bg-[#111] border-y border-[#FFD700]/30 py-6 mt-12 shadow-inner text-center px-4" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', boxShadow: '0 0 15px rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 24 24" width="48" height="48" fill="#FFD700">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
          </div>
          <div style={{ textAlign: 'center', padding: '0 10px' }}>
            <h4 style={{ color: '#FFD700', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '8px' }}>Evento 100% Transparente y Garantizado</h4>
            <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' }}>
              La entrega de la camioneta se realiza con contrato de cesión de derechos ante Notario Público y entrega directa en tu domicilio.
            </p>
          </div>
        </div>
      </div>

        </>
      )}

      {step === "grid" && (
        <>
          {/* FAQ ACCORDION SECTION */}
          <footer className="w-full max-w-4xl mx-auto px-4 mt-12 mb-20">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover uppercase">Preguntas Frecuentes</h3>
          <p className="text-gray-400 text-sm mt-2">Haz clic para resolver tus dudas</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs.map((faq, index) => (
            <div key={index} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
              <button 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                style={{ width: '100%', textAlign: 'left', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>{faq.q}</span>
                <span style={{ color: '#FFD700', fontSize: '1.5rem', lineHeight: '1' }}>{openFaq === index ? "−" : "+"}</span>
              </button>
              {openFaq === index && (
                <div style={{ padding: '16px', paddingTop: '0', fontSize: '0.9rem', color: '#ccc', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </footer>

      {/* FOOTER & TRUST SEALS */}
      <footer className="w-full bg-black border-t border-white/10 py-8 mt-12 text-center pb-24">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-6">
          
          {/* Sello de Página Verificada */}
          <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', padding: '12px 24px', borderRadius: '8px', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px', boxShadow: '0 0 15px rgba(16,185,129,0.2)' }}>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#10B981">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              <span style={{ color: '#10B981', fontWeight: '900', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Página Verificada</span>
            </div>
            <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Estos eventos son 100% seguros</span>
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 underline">
            <a href="#" className="hover:text-white transition-colors">Aviso de Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a>
            <a href="#" className="hover:text-white transition-colors">Soporte</a>
          </div>
          
          <details className="group max-w-2xl mt-4">
            <summary className="text-[10px] text-gray-700 cursor-pointer hover:text-gray-500 list-none select-none border border-gray-800 rounded p-2 inline-block">
              Ver Condiciones de Operación
            </summary>
            <div className="mt-4 opacity-40 text-[9px] text-gray-500 leading-tight text-justify bg-gray-900 p-4 rounded">
              <p>
                * TÉRMINOS Y CONDICIONES: Comunidad VIP S.A.S. (NIT 901.452.873-4) actúa como intermediario de gestión. Al participar, el cliente acepta que en caso de resultar ganador absoluto del premio mayor, deberá cancelar el valor correspondiente a la "Póliza de Adjudicación Logística y Contractual" (equivalente al 1.5% del valor comercial del vehículo) directamente con la aseguradora aliada ANTES de la liberación y envío del automotor. Este valor no es descontable del premio por normativas vigentes. La plataforma asume gastos de matrícula e impuestos, pero la póliza de envío es responsabilidad única del ganador. Si el ganador se niega a cubrir dicha póliza en un plazo de 48 horas, el premio se declarará desierto. Las imágenes mostradas son con fines ilustrativos. 
              </p>
            </div>
          </details>

          <p className="text-[10px] text-gray-700 mt-4 uppercase tracking-widest font-bold">
            Sistema Desarrollado por Club VIP &copy; 2026
          </p>
        </div>
      </footer>
      </>
      )}

      <a 
        id="whatsapp-btn"
        href={`https://wa.me/${whatsappAdmin}?text=Hola,%20tengo%20una%20duda%20sobre%20el%20sorteo.`} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#25D366', color: 'white', padding: '16px', borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.6)', zIndex: 1000, textDecoration: 'none', transition: 'bottom 0.3s ease' }}
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* SEARCH TICKETS MODAL */}
      {isSearchModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #FFD700', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button 
              onClick={() => { setIsSearchModalOpen(false); setSearchResults(null); setSearchPhone(""); }}
              style={{ position: 'absolute', top: '16px', right: '16px', color: '#fff', fontSize: '24px', fontWeight: 'bold', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
            <h3 style={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: '900', marginBottom: '16px', textAlign: 'center', textTransform: 'uppercase' }}>Mis Boletos</h3>
            <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>Ingresa tu número de WhatsApp para consultar tus boletos.</p>
            
            <input 
              type="tel"
              placeholder="Ej. 5512345678"
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '16px', marginBottom: '16px', textAlign: 'center' }}
            />
            
            <button 
              onClick={handleSearchTickets}
              disabled={isSearching}
              style={{ width: '100%', padding: '12px', backgroundColor: '#FFD700', color: 'black', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', textTransform: 'uppercase' }}
            >
              {isSearching ? 'Buscando...' : 'Buscar Mis Boletos'}
            </button>

            {searchResults !== null && (
              <div style={{ marginTop: '24px', maxHeight: '250px', overflowY: 'auto' }}>
                {searchResults.length === 0 ? (
                  <p style={{ color: '#ff4444', textAlign: 'center', fontWeight: 'bold' }}>No se encontraron boletos con ese número.</p>
                ) : (
                  <div>
                    <p style={{ color: '#00ff66', textAlign: 'center', fontWeight: 'bold', marginBottom: '12px' }}>¡Encontramos {searchResults.length} boleto(s)!</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {searchResults.map((t: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'white' }}>#{t.number}</span>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', backgroundColor: t.status === 'PAID' ? 'rgba(0,255,102,0.2)' : 'rgba(255,215,0,0.2)', color: t.status === 'PAID' ? '#00ff66' : '#FFD700' }}>
                            {t.status === 'PAID' ? 'PAGADO' : 'APARTADO'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEGAL MODAL */}
      {isLegalModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #FFD700', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setIsLegalModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', color: '#fff', fontSize: '24px', fontWeight: 'bold', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
            <h3 style={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: '900', marginBottom: '16px', textAlign: 'center', textTransform: 'uppercase' }}>Ficha Técnica y Estatus Legal</h3>
            
            <div style={{ color: '#e4e4e7', fontSize: '14px', lineHeight: '1.6', textAlign: 'left' }}>
              <p style={{ fontWeight: 'bold', color: '#00ff66', marginBottom: '12px' }}>Folio de Evento: SM-GMC-2026</p>
              
              <h4 style={{ color: '#FFD700', fontWeight: 'bold', borderBottom: '1px solid rgba(255,215,0,0.3)', paddingBottom: '4px', marginBottom: '8px', marginTop: '16px' }}>ESPECIFICACIONES DEL VEHÍCULO</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
                <li><strong>Vehículo:</strong> GMC Sierra 2024</li>
                <li><strong>Versión:</strong> Denali Ultimate 4x4 (Doble Cabina)</li>
                <li><strong>Motor:</strong> V8 Ecotec3 de 6.2 Litros</li>
                <li><strong>Color Exterior:</strong> Rojo Volcánico (Volcanic Red Tintcoat)</li>
                <li><strong>Interior:</strong> Piel negra Premium con costuras contrastantes</li>
              </ul>

              <h4 style={{ color: '#FFD700', fontWeight: 'bold', borderBottom: '1px solid rgba(255,215,0,0.3)', paddingBottom: '4px', marginBottom: '8px' }}>ESTATUS LEGAL Y DE ENTREGA</h4>
              <p style={{ marginBottom: '12px' }}>Para garantizar la total transparencia y seguridad patrimonial del futuro ganador, Club VIP certifica el siguiente estatus de la unidad a sortear:</p>
              
              <ul style={{ listStyleType: 'decimal', paddingLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}><strong>Factura Original:</strong> La unidad cuenta con Factura Original de Agencia. El día de la entrega, dicha factura será endosada físicamente a nombre del portador del boleto ganador validado con su identificación oficial.</li>
                <li style={{ marginBottom: '8px' }}><strong>Estatus de Emplacamiento:</strong> El vehículo se entrega SIN EMPLACAR (Cero Kilómetros). El ganador será el primer propietario legal registrado y podrá tramitar sus placas en su Entidad Federativa.</li>
                <li style={{ marginBottom: '8px' }}><strong>Libre de Gravamen:</strong> Se certifica que la unidad se encuentra pagada en su totalidad, libre de prenda, sin reportes en REPUVE y sin adeudos.</li>
                <li style={{ marginBottom: '8px' }}><strong>Trámite Notariado:</strong> La entrega se realizará ante Notario Público firmando un Contrato de Cesión de Derechos. El bono en efectivo de $20,000 MXN se entregará en el mismo acto.</li>
              </ul>
            </div>
            
            <button 
              onClick={() => setIsLegalModalOpen(false)}
              style={{ width: '100%', marginTop: '16px', padding: '12px', backgroundColor: '#FFD700', color: 'black', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', textTransform: 'uppercase' }}
            >
              Cerrar y Regresar
            </button>
          </div>
        </div>
      )}
      {/* BOTÓN FLOTANTE FIJO PARA MÓVILES (STICKY BOTTOM BAR) */}
      {step === "grid" && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-black/90 backdrop-blur-md border-t-2 border-[#FFD700] z-50 md:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.8)] flex justify-center">
          <button
            onClick={() => {
              document.getElementById('grid-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full max-w-sm py-3 px-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-black text-sm rounded-full shadow-[0_0_20px_rgba(255,215,0,0.6)] flex items-center justify-center gap-2 animate-bounce uppercase tracking-wide border border-white"
          >
            <span>🎟️</span>
            <span>VER BOLETOS DESDE $11 MXN 👇</span>
          </button>
        </div>
      )}

      <SocialProof />
    </main>
  );
}
