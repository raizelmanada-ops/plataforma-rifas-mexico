import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let config = await prisma.config.findFirst();
    if (!config) {
      config = await prisma.config.create({
        data: {
          id: "default",
          drawDate: "2024-11-21",
          lotteryName: "Lotería de Boyacá",
          videoUrl: "",
          bannerUrl: "",
          qrUrl: "",
          prizes: "Ford Ranger XLT Bi-Turbo (2024)",
          whatsappAdmin: "573228743384",
          nequiNumber: "3228743384",
          nequiName: "Jose Surez"
        }
      });
    }
    
    // Forzar valores por defecto si la base de datos está vacía para estos campos
    if (config) {
      if (!config.videoUrl) config.videoUrl = "/video_rifa.mp4";
      // Dejamos bannerUrl vacío para que muestre el texto "Sorteos Millonarios" de forma nativa
      if (!config.bannerUrl) config.bannerUrl = "";
      if (config.drawDate === "2024-11-21" || config.drawDate === "2024-08-08") config.drawDate = "2026-08-08";
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    let config = await prisma.config.findFirst();
    
    if (config) {
      config = await prisma.config.update({
        where: { id: config.id },
        data: {
          drawDate: data.drawDate !== undefined ? data.drawDate : config.drawDate,
          lotteryName: data.lotteryName !== undefined ? data.lotteryName : config.lotteryName,
          videoUrl: data.videoUrl !== undefined ? data.videoUrl : config.videoUrl,
          bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : config.bannerUrl,
          qrUrl: data.qrUrl !== undefined ? data.qrUrl : config.qrUrl,
          prizes: data.prizes !== undefined ? data.prizes : config.prizes,
          whatsappAdmin: data.whatsappAdmin !== undefined ? data.whatsappAdmin : config.whatsappAdmin,
          nequiNumber: data.nequiNumber !== undefined ? data.nequiNumber : config.nequiNumber,
          nequiName: data.nequiName !== undefined ? data.nequiName : config.nequiName,
        }
      });
    } else {
      config = await prisma.config.create({
        data: {
          id: "default",
          drawDate: data.drawDate || "2024-11-21",
          lotteryName: data.lotteryName || "Lotería de Boyacá",
          videoUrl: data.videoUrl || "",
          bannerUrl: data.bannerUrl || "",
          qrUrl: data.qrUrl || "",
          prizes: data.prizes || "Ford Ranger XLT Bi-Turbo (2024)",
          whatsappAdmin: data.whatsappAdmin || "573228743384",
          nequiNumber: data.nequiNumber || "3228743384",
          nequiName: data.nequiName || "Jose Surez"
        }
      });
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json({ error: "Error interno al guardar" }, { status: 500 });
  }
}
