"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import TicketGrid from "@/components/TicketGrid";
import CheckoutForm from "@/components/CheckoutForm";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 22, seconds: 59 });
  const [step, setStep] = useState<"grid" | "checkout" | "ticket">("grid");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
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
  const [lotteryName, setLotteryName] = useState("Lotería Nacional");
  const [prizes, setPrizes] = useState("GMC SIERRA ACCESORIZADA + $20,000 MXN");
  const [videoUrl, setVideoUrl] = useState("/video_rifa.mp4");
  const [bannerUrl, setBannerUrl] = useState("");
  const [whatsappAdmin, setWhatsappAdmin] = useState("5215500000000"); // Número de México provisional
  const [nequiNumber, setNequiNumber] = useState("");
  const [nequiName, setNequiName] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Carrusel Hero
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const heroImages = [
    "/sierra-1.jpg",
    "/sierra-2.jpg",
    "/sierra-3.jpg",
    "/sierra-4.jpg",
    "/sierra-5.jpg",
    "/sierra-6.jpg"
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
          setLotteryName(data.lotteryName || "Lotería de Boyacá");
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

  const handleTicketSelect = (ticket: string, code: string) => {
    setSelectedTicket(ticket);
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
          idNumber: data.idNumber
        })
      });
    } catch (error) {
      console.error("Error reservando:", error);
    }
  };

  const faqs = [
    { q: "¿Es legal y autorizado este sorteo?", a: "Totalmente legal. Nuestro sorteo se basa en los resultados oficiales de la Lotería Nacional para la Asistencia Pública, garantizando total transparencia." },
    { q: "¿Cómo se elige a los ganadores?", a: "La combinación ganadora se toma directamente de los números oficiales del Premio Mayor de la Lotería Nacional en la fecha establecida." },
    { q: "¿Qué sucede si el número ganador es un boleto NO vendido?", a: "Para garantizar que el premio se entregue, si el número ganador no fue vendido, el sorteo se repite en la siguiente fecha oficial de la Lotería Nacional hasta que haya un ganador." },
    { q: "¿Dónde se publica a los ganadores?", a: "Las entregas y ganadores se publican en nuestra página web, y realizamos transmisiones en vivo en nuestras redes sociales oficiales (Facebook e Instagram)." },
    { q: "¿Dónde y cómo se entregan los premios?", a: "¡Nosotros te lo llevamos a la puerta de tu casa! Nuestro equipo logístico viajará hasta tu ubicación en cualquier parte de la República. Firmaremos el cambio de propietario en tu ciudad." },
    { q: "¿Debo pagar impuestos si gano?", a: "¡Absolutamente NO! Asumimos el 100% de los impuestos, gastos de placas, tenencia y seguro. El vehículo se entrega a tu nombre sin costo extra." }
  ];

  return (
    <main className="min-h-screen pb-12 flex flex-col items-center selection:bg-accent selection:text-black">
      <header style={{ width: '100%', position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'black', borderBottom: '1px solid rgba(255,215,0,0.3)', padding: '12px 16px', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}>
        {bannerUrl ? (
          <img src={bannerUrl} alt="Sorteos Millonarios Banner" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto' }} />
        ) : (
          <div style={{ textAlign: 'center', flex: '1 1 100%', minWidth: '250px' }} className="md:flex-1 md:text-left">
            <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'transparent', backgroundImage: 'linear-gradient(to bottom, #FFD700, #b38728)', WebkitBackgroundClip: 'text', textTransform: 'uppercase', fontFamily: 'serif', margin: 0 }}>
              Sorteos Millonarios
            </h1>
            <p style={{ color: '#00ff66', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: '4px 0 0 0' }}>
              El Sorteo Entre Amigos de mayor confianza en México
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
            href={`https://wa.me/${whatsappAdmin}?text=Hola,%20quiero%20información%20del%20sorteo`} 
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

      {/* HERO SECTION - GMC SIERRA (FIRST VISUAL IMPACT) */}
      <section style={{ width: '100%', position: 'relative', backgroundColor: 'black', borderBottom: '1px solid rgba(255,215,0,0.3)', zIndex: 10, marginBottom: '24px' }}>
        <div style={{ width: '100%', maxWidth: '1152px', margin: '0 auto', height: '45vh', minHeight: '350px', position: 'relative', overflow: 'hidden' }}>
          {/* Placeholder for the GMC Sierra Image. Best if replaced with a high-res image of the actual prize */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
          {/* Carousel Images */}
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
                opacity: index === heroImageIndex ? 0.9 : 0,
                transition: 'opacity 1s ease-in-out',
                zIndex: index === heroImageIndex ? 5 : 1
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none"><rect width="800" height="400" fill="%23222"/><text x="400" y="200" fill="%23FFD700" font-size="24" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">FOTO SIERRA ' + (index + 1) + ' AQUÍ</text></svg>';
              }}
            />
          ))}
          
          {/* Indicadores del Carrusel */}
          <div style={{ position: 'absolute', bottom: '16px', left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 20 }}>
            {heroImages.map((_, index) => (
              <div 
                key={index} 
                onClick={() => setHeroImageIndex(index)}
                style={{ height: '8px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.3s', width: index === heroImageIndex ? '32px' : '8px', backgroundColor: index === heroImageIndex ? '#FFD700' : 'rgba(255,255,255,0.5)', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              ></div>
            ))}
          </div>
          <div style={{ position: 'absolute', bottom: '40px', left: 0, width: '100%', textAlign: 'center', zIndex: 20, padding: '0 16px', pointerEvents: 'none' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#FFD700', color: 'black', padding: '4px 16px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 4px 6px rgba(0,0,0,0.5)', marginBottom: '8px' }}>
              Sorteo Especial
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.8)', margin: 0, lineHeight: 1.2 }}>
              GMC Sierra + $20,000 MXN
            </h2>
          </div>
        </div>
      </section>

      {step === "grid" && (
        <section style={{ width: '100%', maxWidth: '1152px', margin: '16px auto 0 auto', padding: '0 16px', textAlign: 'center', boxSizing: 'border-box', overflowX: 'hidden' }}>
          <div style={{ padding: '16px', marginBottom: '48px', position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: '1px solid rgba(255,215,0,0.2)' }}>
            {/* Fondo decorativo premium */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFD700]/10 via-transparent to-transparent pointer-events-none"></div>
            
            {/* 1. EL VIDEO ARRIBA DE TODO */}
            <div style={{ width: '100%', maxWidth: '896px', margin: '0 auto 32px auto', position: 'relative', zIndex: 10, boxSizing: 'border-box' }}>
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
                        id="main-promo-video"
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
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0.8 }}>
                    <div style={{ width: '80px', height: '80px', background: 'linear-gradient(to top right, #FFD700, #FDB931)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 0 30px rgba(255,215,0,0.6)' }}>
                      <svg width="40" height="40" style={{ color: 'black', marginLeft: '8px' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p style={{ color: '#FFD700', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.125rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>VIDEO PUBLICITARIO AQUÍ</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. TEXTO DEL PREMIO (Se cambiará en el Dashboard) */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px', color: 'white', zIndex: 10, position: 'relative', wordWrap: 'break-word', overflowWrap: 'break-word', padding: '0 8px' }}>
              El premio mayor actual es: <br/>
              <span style={{ color: '#FFD700', fontSize: '1.5rem', display: 'block', marginTop: '8px' }}>GMC Sierra + $20,000 MXN</span>
            </h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '24px', zIndex: 10, position: 'relative' }}>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', minWidth: '80px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{timeLeft.days}</div>
                <div style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginTop: '4px' }}>Días</div>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', minWidth: '80px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{timeLeft.hours}</div>
                <div style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginTop: '4px' }}>Horas</div>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', minWidth: '80px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{timeLeft.minutes}</div>
                <div style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginTop: '4px' }}>Minutos</div>
              </div>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', minWidth: '80px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>{timeLeft.seconds}</div>
                <div style={{ fontSize: '0.625rem', color: '#6b7280', textTransform: 'uppercase', marginTop: '4px' }}>Segundos</div>
              </div>
            </div>

            {/* SELLOS DE CONFIANZA */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 z-10 relative">
              <div className="bg-black/60 border border-success/30 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(0,255,0,0.1)] hover:border-success/60 transition-colors">
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h4 className="text-white font-bold text-sm uppercase mb-1">Transacción 100% Segura</h4>
                <p className="text-xs text-gray-400">Tus pagos son procesados automáticamente con OXXO, SPEI y Tarjetas.</p>
              </div>

              <div className="bg-black/60 border border-accent/30 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(255,215,0,0.1)] hover:border-accent/60 transition-colors">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                  </svg>
                </div>
                <h4 className="text-white font-bold text-sm uppercase mb-1">Entrega Notariada</h4>
                <p className="text-xs text-gray-400">Cambio de propietario y entrega en toda la República a tu nombre.</p>
              </div>

              <div className="bg-black/60 border border-[#00d2ff]/30 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(0,210,255,0.1)] hover:border-[#00d2ff]/60 transition-colors">
                <div className="w-12 h-12 bg-[#00d2ff]/20 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#00d2ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </div>
                <h4 className="text-white font-bold text-sm uppercase mb-1">Sorteo Transparente</h4>
                <p className="text-xs text-gray-400">Ganador elegido mediante el premio mayor de la lotería oficial.</p>
              </div>
            </div>
          </div>
          
          {/* ASISTENTE VIRTUAL */}
          <div className="w-full max-w-4xl mx-auto mb-10 z-10 relative">
            <div className="glass-panel border-[#00d2ff]/30 p-6 shadow-[0_0_20px_rgba(0,210,255,0.15)] bg-[#0f1525]/80">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-left">
                {/* Avatar */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#3a86ff] p-1 shadow-[0_0_15px_rgba(0,210,255,0.5)]">
                    <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center text-4xl">
                      👩🏼‍💼
                    </div>
                  </div>
                  <p className="text-[#00d2ff] font-bold text-xs mt-2 uppercase tracking-widest text-center">Mensaje<br/>Oficial</p>
                </div>
                
                {/* Mensaje */}
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">¡Sube el volumen y escucha este mensaje promocional!</h3>
                  
                  {/* Botón de Audio */}
                  <div className="flex justify-center md:justify-start">
                    <audio 
                      ref={audioRef} 
                      src="/audio_rifa.ogg" 
                      onEnded={() => setIsPlayingAudio(false)}
                      onPause={() => setIsPlayingAudio(false)}
                      onPlay={() => setIsPlayingAudio(true)}
                      className="hidden" 
                    />
                    <button 
                      onClick={toggleAudio}
                      className={`flex items-center gap-3 px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
                        isPlayingAudio 
                          ? "bg-danger text-white shadow-[0_0_15px_rgba(255,51,51,0.6)] animate-pulse" 
                          : "bg-[#00d2ff] text-black shadow-[0_0_20px_rgba(0,210,255,0.6)] hover:bg-[#3a86ff] hover:text-white"
                      }`}
                    >
                      {isPlayingAudio ? (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          PAUSAR AUDIO
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                          ESCUCHAR AUDIO OFICIAL
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div id="grid-section" className="scroll-mt-10">
            <TicketGrid onSelectTicket={handleTicketSelect} />
          </div>
        </section>
      )}

      {step === "checkout" && (
        <section className="w-full max-w-xl mx-auto px-4 mt-12 animate-fade-in">
          <button onClick={() => setStep("grid")} className="text-gray-400 hover:text-accent mb-6 flex items-center gap-2 transition-colors">
            ← Volver a los números
          </button>
          
          <div className="bg-black/60 p-6 rounded-xl border border-accent/30 text-center mb-8 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Número Seleccionado</p>
            <p className="text-7xl font-black text-accent mt-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">{selectedTicket}</p>
            <p className="text-success font-bold mt-2 animate-pulse">¡Este número está libre!</p>
            <p className="text-sm text-gray-300 mt-1">Llénalo y tendrás 15 minutos para pagarlo antes de que se libere.</p>
          </div>

          <CheckoutForm selectedTicket={selectedTicket!} onBack={() => setStep("grid")} onSuccess={handleCheckoutSubmit} />
        </section>
      )}

      {step === "ticket" && (
        <section className="w-full max-w-md mx-auto px-4 mt-12 animate-fade-in text-center">
          <div className="bg-success/20 text-success p-4 rounded-xl mb-8 font-bold border border-success/30 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
            ✅ ¡Tu número ha sido reservado exitosamente!
          </div>
          
          <div className="relative glass-panel p-8 mb-8 overflow-hidden rounded-2xl border-2 border-accent/50 shadow-[0_0_40px_rgba(255,215,0,0.2)]">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-accent-hover"></div>
            
            <div className="relative z-10">
              {bannerUrl ? (
                <div className="flex justify-center mb-4">
                  <img src={bannerUrl} alt="Sorteos Millonarios" className="h-16 object-contain" />
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#b38728] uppercase font-serif mb-1">
                    Sorteos Millonarios
                  </h2>
                  <p className="text-[#00ff66] text-[10px] font-bold uppercase tracking-widest mb-4">El Sorteo Entre Amigos Oficial</p>
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-4 tracking-widest border-b border-white/10 pb-2">PAQUETE ADQUIRIDO</h3>
              <div className="text-2xl md:text-4xl font-black text-accent tracking-widest mb-6 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                {selectedTicket}
              </div>
              
              <div className="bg-black/50 p-4 rounded-lg mb-6 border border-white/5">
                <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">PARTICIPANDO POR:</p>
                <p className="text-sm font-bold text-white uppercase tracking-wide mb-3">{prizes}</p>
                
                <div className="w-full mb-4 rounded-lg overflow-hidden border border-white/10">
                  <img src="/sorteo_millonario.png" alt="Premio del Sorteo" className="w-full h-auto object-contain" />
                </div>

                <div className="flex justify-between items-end border-t border-white/10 pt-2">
                  <div className="text-left">
                    <p className="text-[9px] text-gray-500 uppercase font-bold">Fecha del Sorteo</p>
                    <p className="text-xs text-gray-300 font-bold capitalize">{formattedDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-500 uppercase font-bold">Sortea Con</p>
                    <p className="text-xs text-gray-300 font-bold uppercase">{lotteryName}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-4 text-left border-t border-white/10 pt-6 mt-4">
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Titular</p>
                  <p className="font-bold text-white truncate">{userData?.name}</p>
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">CURP/INE</p>
                  <p className="font-bold text-white truncate">{userData?.idNumber}</p>
                </div>
                <div className="col-span-2 mt-2 bg-white/5 p-3 rounded border border-white/10 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Estado del Ticket</p>
                  <p className="text-warning font-bold animate-pulse mb-1">⚠️ PENDIENTE DE PAGO</p>
                  <p className="text-[10px] text-danger font-bold mb-2 uppercase">¡Tienes 15 min para pagar o se libera!</p>
                  <div className="bg-[#1A0C2B] border border-[#ff00a5]/30 rounded-lg p-3 text-center mt-2 hidden">
                    {/* El cuadro de Nequi manual fue removido a favor de Hotmart */}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 border-t border-white/5 pt-3">
                <p className="text-[6px] text-gray-600 leading-tight text-justify opacity-40">
                  * TÉRMINOS Y CONDICIONES: Sorteos Millonarios actúa como intermediario. La compra te da acceso a nuestro Ebook y como bono gratis obtienes los tickets. La Lotería Nacional no patrocina ni está vinculada con esta plataforma.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6 text-gray-300 space-y-2 text-sm text-center bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
            <p>
              Realiza tu pago 100% seguro a través de nuestra pasarela autorizada (OXXO, SPEI, Tarjetas).
            </p>
            <p className="font-bold text-accent">
              ¡Tu boleto quedará apartado automáticamente al completar el pago!
            </p>
          </div>
          
          <a 
            href={`/checkout-ebook?ticket=${encodeURIComponent(selectedTicket || '')}&id=${userData?.idNumber}&name=${encodeURIComponent(userData?.name || '')}&code=${selectedCode || ''}`}
            target="_self"
            rel="noreferrer"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).fbq) {
                (window as any).fbq('track', 'Purchase');
              }
            }}
            className="w-full btn btn-primary flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-sm md:text-lg py-3 md:h-16 shadow-[0_0_20px_rgba(255,215,0,0.3)] text-center leading-tight px-2"
          >
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              <span className="font-bold">PAGAR BOLETO AHORA</span>
            </div>
            <span className="text-xs opacity-80 md:hidden">Pago 100% Seguro</span>
          </a>
        </section>
      )}



      {/* PREVIOUS WINNERS SECTION (FACEBOOK LINK) */}
      <section className="w-full max-w-6xl mx-auto px-4 mt-12 mb-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover uppercase">Transparencia y Entregas</h3>
          <p className="text-gray-400 text-sm mt-2">Visita nuestra página oficial de Facebook para ver todas nuestras entregas en vivo.</p>
        </div>
        
        <div className="flex justify-center" style={{ padding: '0 10px' }}>
          <a 
            href="https://www.facebook.com/profile.php?id=61592664040163&locale=es_LA" 
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
            <h4 style={{ color: '#FFD700', fontWeight: '900', fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '8px' }}>Sorteo Autorizado y Transparente</h4>
            <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>
              Nuestro sorteo se basa en los últimos 5 dígitos del Premio Mayor de la <strong>Lotería Nacional</strong> para la Asistencia Pública. Garantizamos total legalidad.
            </p>
            <p style={{ color: '#888', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', lineHeight: '1.4' }}>
              NOTA: Todos nuestros sorteos requieren al menos un 80% de venta de boletos para realizarse, en caso contrario se dará aviso en nuestras páginas y se asignará una nueva fecha.
            </p>
          </div>
        </div>
      </div>

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
            <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Estos sorteos son 100% seguros</span>
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
                * TÉRMINOS Y CONDICIONES: Sorteos Millonarios S.A.S. (NIT 901.452.873-4) actúa como intermediario de gestión. Al participar, el cliente acepta que en caso de resultar ganador absoluto del premio mayor, deberá cancelar el valor correspondiente a la "Póliza de Adjudicación Logística y Contractual" (equivalente al 1.5% del valor comercial del vehículo) directamente con la aseguradora aliada ANTES de la liberación y envío del automotor. Este valor no es descontable del premio por normativas vigentes. La plataforma asume gastos de matrícula e impuestos, pero la póliza de envío es responsabilidad única del ganador. Si el ganador se niega a cubrir dicha póliza en un plazo de 48 horas, el premio se declarará desierto. Las imágenes mostradas son con fines ilustrativos. 
              </p>
            </div>
          </details>

          <p className="text-[10px] text-gray-700 mt-4 uppercase tracking-widest font-bold">
            Sistema Desarrollado por Club VIP &copy; 2026
          </p>
        </div>
      </footer>

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
    </main>
  );
}
