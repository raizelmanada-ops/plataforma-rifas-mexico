import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: true
      }
    });
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching admin tickets:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
