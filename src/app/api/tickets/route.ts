import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        customer: {
          select: { name: true }
        }
      }
    });
    
    // Formatear para que el frontend lo entienda fácilmente: { "0292": "Juan P." }
    const realOccupied: Record<string, string> = {};
    
    tickets.forEach(ticket => {
      if (ticket.status !== "LIBERADO") {
        realOccupied[ticket.number] = ticket.customer?.name || "Reservado";
      }
    });

    return NextResponse.json(realOccupied);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
