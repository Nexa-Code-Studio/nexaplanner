import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { EventRepository } from "@/repositories/event.repository";
import { CategoryRepository } from "@/repositories/category.repository";

const eventRepo = new EventRepository();
const categoryRepo = new CategoryRepository();

export async function GET(request: Request) {
  return handleReminders(request);
}

export async function POST(request: Request) {
  return handleReminders(request);
}

async function handleReminders(request: Request) {
  const { searchParams } = new URL(request.url);
  const isTest = searchParams.get("test") === "true";

  try {
    // 1. Get configurations
    const settingsSnap = await adminDb.collection("settings").doc("general").get();
    const settings = settingsSnap.exists 
      ? settingsSnap.data()! 
      : {
          discordWebhookUrl: "",
          isH7Enabled: true,
          isH3Enabled: true,
          isH1Enabled: true,
          isH0Enabled: true,
        };

    const urlParam = searchParams.get("url");
    const webhookUrl = isTest && urlParam ? urlParam : settings.discordWebhookUrl;
    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, message: "Discord Webhook URL belum dikonfigurasi di pengaturan." },
        { status: 400 }
      );
    }

    // If it's a test trigger, send a test payload and exit
    if (isTest) {
      const testPayload = {
        username: "NexaPlanner BOT",
        avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&h=128&q=80",
        embeds: [
          {
            title: "🔔 Uji Coba Integrasi NexaPlanner",
            description: "Koneksi Discord Webhook Anda berhasil terhubung! NexaPlanner BOT siap mengirimkan pengingat agenda tim otomatis.",
            color: 2445803, // Hex #2563EB -> decimal
            fields: [
              {
                name: "Status Sistem",
                value: "✅ Aktif & Terkoneksi",
                inline: true,
              },
              {
                name: "Mode Pemicu",
                value: "Uji Coba Manual",
                inline: true,
              }
            ],
            footer: {
              text: "NexaPlanner Integration System",
            },
            timestamp: new Date().toISOString(),
          }
        ]
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });

      if (!res.ok) {
        throw new Error(`Discord API returned status ${res.status}`);
      }

      return NextResponse.json({ success: true, message: "Test Webhook berhasil dikirim ke Discord!" });
    }

    // 2. Fetch all events & categories
    const events = await eventRepo.findAll();
    const categories = await categoryRepo.findAll();

    const getCategoryName = (catId: string) => {
      const cat = categories.find((c) => c.id === catId);
      return cat ? cat.name : "Tanpa Kategori";
    };

    // Calculate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatToIndoDate = (dateVal: any) => {
      const d = new Date(dateVal);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    };

    // Group matching reminders
    const h0Events: string[] = [];
    const h1Events: string[] = [];
    const h3Events: string[] = [];
    const h7Events: string[] = [];

    for (const evt of events) {
      const start = new Date(evt.startDate as any);
      start.setHours(0, 0, 0, 0);

      const diffTime = start.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      const eventString = `• **${evt.title}** (${getCategoryName(evt.categoryId)}) \n  📅 ${formatToIndoDate(evt.startDate as any)} s/d ${formatToIndoDate(evt.endDate as any)}${evt.location ? `\n  📍 Location: ${evt.location}` : ""}`;

      if (diffDays === 0 && settings.isH0Enabled) {
        h0Events.push(eventString);
      } else if (diffDays === 1 && settings.isH1Enabled) {
        h1Events.push(eventString);
      } else if (diffDays === 3 && settings.isH3Enabled) {
        h3Events.push(eventString);
      } else if (diffDays === 7 && settings.isH7Enabled) {
        h7Events.push(eventString);
      }
    }

    // 3. If no matching events, do not send webhook
    if (h0Events.length === 0 && h1Events.length === 0 && h3Events.length === 0 && h7Events.length === 0) {
      return NextResponse.json({ success: true, message: "Tidak ada pengingat agenda untuk dikirim hari ini." });
    }

    // 4. Construct beautiful embeds fields
    const fields: any[] = [];
    if (h0Events.length > 0) {
      fields.push({
        name: "🚨 Agenda Hari Ini (H-0)",
        value: h0Events.join("\n\n"),
        inline: false,
      });
    }
    if (h1Events.length > 0) {
      fields.push({
        name: "🔔 Agenda Besok (H-1)",
        value: h1Events.join("\n\n"),
        inline: false,
      });
    }
    if (h3Events.length > 0) {
      fields.push({
        name: "⏳ Agenda 3 Hari Lagi (H-3)",
        value: h3Events.join("\n\n"),
        inline: false,
      });
    }
    if (h7Events.length > 0) {
      fields.push({
        name: "📅 Agenda 7 Hari Lagi (H-7)",
        value: h7Events.join("\n\n"),
        inline: false,
      });
    }

    const payload = {
      username: "NexaPlanner BOT",
      avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&h=128&q=80",
      content: "@everyone",
      embeds: [
        {
          title: "📢 Pengingat Agenda NexaCode",
          description: "Halo Tim! Berikut adalah agenda terdekat yang memerlukan perhatian kita:",
          color: 2445803,
          fields,
          footer: {
            text: "NexaPlanner Auto-Reminder",
          },
          timestamp: new Date().toISOString(),
        }
      ]
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Discord API returned status ${res.status}`);
    }

    return NextResponse.json({ success: true, message: "Pengingat berhasil dikirim ke Discord!" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Gagal memproses pengingat otomatis" },
      { status: 500 }
    );
  }
}
