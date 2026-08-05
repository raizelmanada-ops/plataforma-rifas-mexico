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

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error("Error reservando:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
