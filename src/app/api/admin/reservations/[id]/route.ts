import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Falta el estado" }, { status: 400 });
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status }
    });
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    
    // First find the ticket to get its number
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    // Mark it as LIBERADO so it can be reserved again
    await prisma.ticket.update({
      where: { id },
      data: { status: "LIBERADO" }
    });
    
    return NextResponse.json({ success: true, message: "Ticket liberado" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
