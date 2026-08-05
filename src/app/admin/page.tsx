"use client";

import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"ventas" | "configuracion">("ventas");
  const [selectedTicketView, setSelectedTicketView] = useState<any>(null);

  const [config, setConfig] = useState<any>({
    drawDate: "",
    lotteryName: "",
    prizes: "",
    videoUrl: "",
    bannerUrl: "",
    whatsappAdmin: "",
    nequiNumber: "",
    nequiName: "",
    qrUrl: ""
  });
  
  const formattedDate = config.drawDate ? new Date(config.drawDate + "T12:00:00").toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : "";
  
  const [reservations, setReservations] = useState<any[]>([]);

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/admin/reservations");
      const data = await res.json();
      if(Array.isArray(data)) setReservations(data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetch("/api/config").then(res => res.json()).then(data => {
      if(data) setConfig(data);
    }).catch(e => console.error(e));
    
    fetchReservations();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchReservations();
    } catch(e) {
      alert("Error al actualizar");
    }
  };

  const handleRelease = async (id: string) => {
    if(confirm("¿Estás seguro de liberar esta boleta?")) {
      try {
        await fetch(`/api/admin/reservations/${id}`, { method: 'DELETE' });
        fetchReservations();
      } catch(e) {
        alert("Error al liberar");
      }
    }
  };

  const handleSaveConfig = async () => {
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      alert("Configuración guardada");
    } catch(e) {
      alert("Error al guardar configuración");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <form onSubmit={handleLogin} className="glass-panel max-w-sm w-full p-8 text-center">
          <h1 className="text-2xl text-accent mb-6">Acceso Administrativo</h1>
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="input-field w-full mb-4 text-center"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn btn-primary w-full">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-accent">Panel de Control</h1>
          <p className="text-sm text-gray-400">Gran Rifa Millonaria</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-gray-400 hover:text-white">Cerrar Sesión</button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <p className="text-gray-400 text-sm">Boletas Vendidas</p>
          <p className="text-3xl font-bold text-white mt-2">{reservations.filter(r => r.status === 'PAID').length}</p>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <p className="text-gray-400 text-sm">Reservas Pendientes</p>
          <p className="text-3xl font-bold text-warning mt-2">{reservations.filter(r => r.status === 'RESERVED').length}</p>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <p className="text-gray-400 text-sm">Porcentaje Vendido</p>
          <p className="text-3xl font-bold text-accent mt-2">1.4%</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab("ventas")}
          className={`px-4 py-2 rounded-t-lg font-bold ${activeTab === "ventas" ? "bg-accent text-black" : "bg-black/50 text-gray-400 hover:text-white"}`}
        >
          Últimas Reservas (Clientes Reales)
        </button>
        <button 
          onClick={() => setActiveTab("configuracion")}
          className={`px-4 py-2 rounded-t-lg font-bold ${activeTab === "configuracion" ? "bg-accent text-black" : "bg-black/50 text-gray-400 hover:text-white"}`}
        >
          Configuración del Sorteo
        </button>
      </div>

      <div className="glass-panel p-6">
        {activeTab === "ventas" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-3">Boleta</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">WhatsApp</th>
                  <th className="pb-3">Cédula</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr><td colSpan={6} className="py-4 text-center text-gray-500">No hay reservas aún</td></tr>
                ) : reservations.filter(r => r.status !== 'LIBERADO').map((res) => (
                  <tr key={res.id} className="border-b border-white/5">
                    <td className="py-4 font-bold text-accent">#{res.number}</td>
                    <td className="py-4">{res.customer?.name}</td>
                    <td className="py-4">{res.customer?.phone}</td>
                    <td className="py-4">{res.customer?.idNumber}</td>
                    <td className="py-4">
                      {res.status === 'PAID' ? (
                        <span className="bg-success/20 text-success px-2 py-1 rounded text-xs font-bold">Pagado</span>
                      ) : (
                        <span className="bg-warning/20 text-warning px-2 py-1 rounded text-xs font-bold">Pendiente</span>
                      )}
                    </td>
                    <td className="py-4 flex flex-wrap gap-2">
                      <button onClick={() => setSelectedTicketView(res)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-blue-500 border border-blue-400">Ver Boleta</button>
                      {res.status !== 'PAID' && (
                        <button onClick={() => handleUpdateStatus(res.id, 'PAID')} className="bg-success text-black px-3 py-1 rounded text-sm font-bold hover:bg-green-500">Aprobar</button>
                      )}
                      <button onClick={() => handleRelease(res.id)} className="bg-danger text-white px-3 py-1 rounded text-sm font-bold hover:bg-red-700">Liberar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "configuracion" && (
          <div className="max-w-2xl">
            <h2 className="text-xl mb-6">Ajustes de la Plataforma</h2>
            
            <div className="mb-8 border border-white/10 p-4 rounded-lg bg-black/30">
              <h3 className="font-bold text-accent mb-2">Premios de la Rifa Actual</h3>
              <p className="text-sm text-gray-400 mb-4">Modifica los premios que aparecerán en la página principal. Esto es útil cuando terminas un sorteo y empiezas uno nuevo de $60.000.</p>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-accent/20 text-accent font-bold px-2 py-1 rounded">1</span>
                  <input type="text" className="input-field w-full" defaultValue="Ford Ranger XLT Bi-Turbo (2024)" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-accent/20 text-accent font-bold px-2 py-1 rounded">2</span>
                  <input type="text" className="input-field w-full" defaultValue="Yamaha NMAX V3" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-accent/20 text-accent font-bold px-2 py-1 rounded">3</span>
                  <input type="text" className="input-field w-full" defaultValue="Yamaha XTZ 150" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-accent/20 text-accent font-bold px-2 py-1 rounded">4</span>
                  <input type="text" className="input-field w-full" defaultValue="Toyota Hilux AT 4x4" />
                </div>
                <input 
                  type="text" 
                  className="input-field w-full" 
                  value={config.prizes} 
                  onChange={(e) => setConfig({...config, prizes: e.target.value})} 
                />
                <button onClick={handleSaveConfig} className="btn btn-primary mt-2">Guardar Premios</button>
              </div>
            </div>
            
            <div className="mb-8 border border-white/10 p-4 rounded-lg bg-black/30">
              <h3 className="font-bold text-accent mb-2">Datos del Sorteo</h3>
              <p className="text-sm text-gray-400 mb-4">La fecha y la lotería con la que juega el premio mayor.</p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Fecha del Sorteo</label>
                  <input type="date" className="input-field w-full max-w-xs" value={config.drawDate} onChange={(e) => setConfig({...config, drawDate: e.target.value})} />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Lotería Oficial</label>
                  <input type="text" className="input-field w-full max-w-xs" value={config.lotteryName} onChange={(e) => setConfig({...config, lotteryName: e.target.value})} />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Video del Sorteo (URL de YouTube o .mp4)</label>
                  <input type="text" className="input-field w-full max-w-xs" value={config.videoUrl} onChange={(e) => setConfig({...config, videoUrl: e.target.value})} placeholder="Ej: /videos/moto.mp4" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Imagen de Portada (Banner URL)</label>
                  <input type="text" className="input-field w-full max-w-xs" value={config.bannerUrl} onChange={(e) => setConfig({...config, bannerUrl: e.target.value})} placeholder="Ej: /images/banner.png" />
                  <p className="text-[10px] text-gray-500 mt-1">Sube la imagen a internet y pega el link aquí, o usa /images/banner.png.</p>
                </div>
                
                {/* Nuevos Campos de Contacto y Pago */}
                <h3 className="font-bold text-[#FFD700] mt-4 mb-2 border-b border-white/10 pb-2">Información de Pago y Contacto</h3>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Número de WhatsApp (Administrador)</label>
                  <input type="text" className="input-field w-full max-w-xs" value={config.whatsappAdmin} onChange={(e) => setConfig({...config, whatsappAdmin: e.target.value})} placeholder="Ej: 573228743384" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Cuenta de Nequi para Pagos</label>
                  <input type="text" className="input-field w-full max-w-xs" value={config.nequiNumber} onChange={(e) => setConfig({...config, nequiNumber: e.target.value})} placeholder="Ej: 3228743384" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Nombre del Titular Nequi</label>
                  <input type="text" className="input-field w-full max-w-xs" value={config.nequiName || ""} onChange={(e) => setConfig({...config, nequiName: e.target.value})} placeholder="Ej: Jose Surez" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-400 mb-1">Código QR Nequi (Opcional)</label>
                  <input type="text" className="input-field w-full max-w-xs" value={config.qrUrl || ""} onChange={(e) => setConfig({...config, qrUrl: e.target.value})} placeholder="Ej: /images/qr.png" />
                  <p className="text-[10px] text-gray-500 mt-1">Sube la foto del QR a public/images/ y pon la ruta, o pega un link.</p>
                </div>

                <button onClick={handleSaveConfig} className="btn btn-primary mt-4 max-w-xs">Guardar Configuración</button>
              </div>

              <div className="mt-12 pt-6 border-t border-red-500/30">
                <h3 className="font-bold text-red-500 mb-2">Zona de Peligro (Nuevo Sorteo)</h3>
                <p className="text-xs text-gray-400 mb-4">Usa este botón SOLO cuando vayas a empezar una nueva rifa. Borrará absolutamente todas las reservas y dejará la grilla vacía para empezar de cero.</p>
                <button 
                  onClick={async () => {
                    if (confirm("🚨 ¿ESTÁS COMPLETAMENTE SEGURO? Esto borrará todas las boletas vendidas actualmente. Esta acción no se puede deshacer.")) {
                      try {
                        await fetch('/api/tickets/reset', { method: 'DELETE' });
                        alert("✅ Sorteo reiniciado. La grilla está vacía.");
                      } catch(e) {
                        alert("Error al reiniciar.");
                      }
                    }
                  }} 
                  className="btn bg-red-600 hover:bg-red-700 text-white mt-2 max-w-xs"
                >
                  ⚠️ Reiniciar Sorteo (Borrar Todo)
                </button>
              </div>
            </div>

            <div className="mb-8 border border-white/10 p-4 rounded-lg bg-black/30">
              <h3 className="font-bold text-accent mb-2">WhatsApp de Recepción</h3>
              <p className="text-sm text-gray-400 mb-4">Número al que los clientes enviarán sus comprobantes de Nequi.</p>
              <div className="flex gap-2">
                <input type="text" className="input-field w-full max-w-xs" defaultValue="573017952235" />
                <button className="btn btn-primary">Guardar</button>
              </div>
            </div>
            
            <div className="mb-8 border border-white/10 p-4 rounded-lg bg-black/30">
              <h3 className="font-bold text-accent mb-2">Renovar Sorteo (Nueva Rifa)</h3>
              <p className="text-sm text-gray-400 mb-4">Utiliza esta opción cuando entregues el premio actual y quieras lanzar una rifa nueva. Esto vaciará la lista de clientes, liberará los 10,000 números y reiniciará las estadísticas.</p>
              <button className="btn bg-danger hover:bg-red-700 text-white font-bold px-6 py-2 rounded">
                ⚠️ Reiniciar Plataforma
              </button>
            </div>
            
          </div>
        )}
      </div>

      {selectedTicketView && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md my-auto flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <p className="text-white font-bold bg-blue-600 px-4 py-1 rounded-full text-sm shadow-md">
                Toma captura y envíala por WhatsApp
              </p>
              <button 
                onClick={() => setSelectedTicketView(null)} 
                className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full font-bold flex items-center justify-center text-xl shadow-lg"
              >
                ✕
              </button>
            </div>
            
            {/* INICIO BOLETA */}
            <div className="relative glass-panel p-8 overflow-hidden rounded-2xl border-2 border-accent/50 shadow-[0_0_40px_rgba(255,215,0,0.4)] text-center w-full">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-accent-hover"></div>
              
              <div className="relative z-10">
                {config.bannerUrl ? (
                  <div className="flex justify-center mb-4">
                    <img src={config.bannerUrl} alt="Sorteos Millonarios" className="h-16 object-contain" />
                  </div>
                ) : (
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#b38728] uppercase font-serif mb-4">
                    Sorteos Millonarios
                  </h2>
                )}
                <h3 className="text-xl font-bold text-white mb-4 tracking-widest border-b border-white/10 pb-2">BOLETA DIGITAL OFICIAL</h3>
                <div className="text-7xl font-black text-accent tracking-widest mb-6 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                  {selectedTicketView.number}
                </div>
                
                <div className="bg-black/50 p-4 rounded-lg mb-6 border border-white/5">
                  <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">PARTICIPANDO POR:</p>
                  <p className="text-sm font-bold text-white uppercase tracking-wide mb-3">{config.prizes}</p>
                  
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
                      <p className="text-xs text-gray-300 font-bold uppercase">{config.lotteryName}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left border-t border-white/10 pt-6 mt-4">
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Titular</p>
                    <p className="font-bold text-white truncate">{selectedTicketView.customer?.name}</p>
                  </div>
                  <div className="overflow-hidden text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Cédula</p>
                    <p className="font-bold text-white truncate">{selectedTicketView.customer?.idNumber}</p>
                  </div>
                  
                  <div className="col-span-2 mt-4 text-center border-t border-white/10 pt-4">
                    {selectedTicketView.status === 'PAID' ? (
                      <div className="inline-block border-2 border-[#00ff66] bg-[#00ff66]/10 px-8 py-3 rounded-lg transform -rotate-2">
                        <p className="text-2xl font-black text-[#00ff66] tracking-widest uppercase text-shadow-sm shadow-[#00ff66]">
                          PAGADO
                        </p>
                        <p className="text-[10px] text-[#00ff66] font-bold uppercase tracking-widest mt-1">100% Confirmado</p>
                      </div>
                    ) : (
                      <div className="inline-block border-2 border-warning bg-warning/10 px-6 py-2 rounded-lg">
                        <p className="text-xl font-black text-warning tracking-widest uppercase">
                          PENDIENTE
                        </p>
                        <p className="text-[9px] text-warning font-bold uppercase tracking-widest mt-1">A la espera del pago</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* FIN BOLETA */}
            
            <a 
              href={`https://wa.me/${selectedTicketView.customer?.phone.replace(/\D/g, '')}?text=¡Hola%20${selectedTicketView.customer?.name.split(' ')[0]}!%20Hemos%20confirmado%20tu%20pago.%20Te%20adjunto%20tu%20Boleta%20Digital%20Oficial%20del%20número%20${selectedTicketView.number}.%20¡Mucha%20suerte!`}
              target="_blank"
              className="mt-6 w-full bg-[#25D366] text-white font-bold py-4 rounded-xl text-center text-lg flex items-center justify-center gap-2 hover:bg-[#128C7E] shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-colors"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Enviar Boleta por WhatsApp
            </a>
            <p className="text-gray-400 text-xs text-center mt-3">💡 Toma captura de la boleta de arriba y envíala usando este botón.</p>
          </div>
        </div>
      )}
    </div>
  );
}
