import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Teléfono requerido" }, { status: 400 });
  }

  try {
    const customers = await prisma.customer.findMany({
      where: { phone: phone },
      include: {
        tickets: true
      }
    });

    if (!customers || customers.length === 0) {
      return NextResponse.json({ tickets: [] });
    }

    // Extract all tickets from all matching customers (in case they ordered multiple times)
    const allTickets = customers.flatMap(c => c.tickets);
    
    // Sort so PAID are first
    allTickets.sort((a, b) => a.status === "PAID" ? -1 : 1);

    return NextResponse.json({ tickets: allTickets });
  } catch (error) {
    console.error("Error searching tickets:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
