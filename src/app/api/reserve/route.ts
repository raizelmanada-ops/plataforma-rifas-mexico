import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, idNumber, ticketNumber } = body;

    if (!name || !phone || !idNumber || !ticketNumber) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Comprobar si el número ya está reservado o pagado
    const existingTicket = await prisma.ticket.findUnique({
      where: { number: ticketNumber }
    });

    if (existingTicket && existingTicket.status !== "LIBERADO") {
      return NextResponse.json({ error: "El número ya no está disponible" }, { status: 400 });
    }

    // Crear cliente y reservar boleta
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        idNumber,
        tickets: {
          create: {
            number: ticketNumber,
            status: "RESERVED"
          }
        }
      }
    });

    // Intentar enviar mensaje de WhatsApp a través del bot local (API en puerto 3001)
    try {
      const waMessage = `¡Hola ${name}! 👋\n\nAcabas de separar el boleto 🎫 *${ticketNumber}* en el Club VIP.\n\n⚠️ Tienes *15 MINUTOS* para realizar tu pago 100% seguro a través de nuestra pasarela autorizada (OXXO, SPEI o Tarjeta) y asegurar tu boleto para la GMC Sierra + $20,000 MXN.\n\nSi no realizas el pago en este tiempo, el sistema liberará tu número automáticamente para otros participantes.\n\nSi tienes dudas sobre tu pago o quieres validar tus boletos, puedes escribirme por aquí. ¡Mucha suerte! 🍀`;
      
      await fetch("http://localhost:3001/api/send-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          message: waMessage
        })
      });
    } catch (waError) {
      console.error("No se pudo conectar con el bot de WhatsApp:", waError);
      // No bloqueamos el flujo principal si el bot falla
    }

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error("Error reservando:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
