import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    await prisma.ticket.deleteMany({});
    return NextResponse.json({ success: true, message: "Todas las reservas han sido eliminadas." });
  } catch (error) {
    console.error("Error reseteando tickets:", error);
    return NextResponse.json({ error: "Error al reiniciar el sorteo." }, { status: 500 });
  }
}
