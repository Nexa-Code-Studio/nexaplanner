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
        content: `@everyone ${settings.discordMessage || "Oi, reminder nih!"}`,
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

    const parseFirebaseDate = (dateVal: any): Date => {
      if (!dateVal) return new Date();
      if (dateVal.seconds !== undefined) return new Date(dateVal.seconds * 1000);
      if (dateVal._seconds !== undefined) return new Date(dateVal._seconds * 1000);
      return new Date(dateVal);
    };

    function formatIndoDateRange(startVal: any, endVal: any): string {
      const start = parseFirebaseDate(startVal);
      const end = parseFirebaseDate(endVal);

      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

      const startDay = start.getDate();
      const startMonth = months[start.getMonth()];
      const startYear = start.getFullYear();

      const endDay = end.getDate();
      const endMonth = months[end.getMonth()];
      const endYear = end.getFullYear();

      // 1. Same day
      if (startDay === endDay && startMonth === endMonth && startYear === endYear) {
        return `${startDay} ${startMonth} ${startYear}`;
      }

      // 2. Same month and same year
      if (startMonth === endMonth && startYear === endYear) {
        return `${startDay}–${endDay} ${startMonth} ${startYear}`;
      }

      // 3. Different month, same year
      if (startYear === endYear) {
        return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
      }

      // 4. Different year
      return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
    }

    const isH0Enabled = settings.isH0Enabled !== false;
    const isH1Enabled = settings.isH1Enabled !== false;
    const isH3Enabled = settings.isH3Enabled !== false;
    const isH7Enabled = settings.isH7Enabled !== false;

    // Group matching reminders
    const h0Events: string[] = [];
    const h1Events: string[] = [];
    const h3Events: string[] = [];
    const h7Events: string[] = [];

    for (const evt of events) {
      const start = parseFirebaseDate(evt.startDate);
      start.setHours(0, 0, 0, 0);

      const diffTime = start.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      const dateRangeStr = formatIndoDateRange(evt.startDate, evt.endDate);
      const eventString = `📌 ${evt.title}\n📅 ${getCategoryName(evt.categoryId)} (${dateRangeStr})${evt.location ? `\n📍 ${evt.location}` : ""}`;

      if (diffDays === 0 && isH0Enabled) {
        h0Events.push(eventString);
      } else if (diffDays === 1 && isH1Enabled) {
        h1Events.push(eventString);
      } else if (diffDays === 3 && isH3Enabled) {
        h3Events.push(eventString);
      } else if (diffDays === 7 && isH7Enabled) {
        h7Events.push(eventString);
      }
    }

    // 3. If no matching events, do not send webhook
    if (h0Events.length === 0 && h1Events.length === 0 && h3Events.length === 0 && h7Events.length === 0) {
      return NextResponse.json({ success: true, message: "Tidak ada pengingat agenda untuk dikirim hari ini." });
    }

    // 4. Construct clean, separator-based plain text message
    const separator = "━━━━━━━━━━━━━━━━━━";
    const sections: string[] = [];
    let totalCount = 0;

    if (h0Events.length > 0) {
      totalCount += h0Events.length;
      sections.push(`🔴 HARI INI\n\n${h0Events.join("\n\n")}`);
    }
    if (h1Events.length > 0) {
      totalCount += h1Events.length;
      sections.push(`🟡 BESOK\n\n${h1Events.join("\n\n")}`);
    }
    if (h3Events.length > 0) {
      totalCount += h3Events.length;
      sections.push(`🟢 H-3\n\n${h3Events.join("\n\n")}`);
    }
    if (h7Events.length > 0) {
      totalCount += h7Events.length;
      sections.push(`🔵 H-7\n\n${h7Events.join("\n\n")}`);
    }

    const bodyText = sections.join(`\n\n${separator}\n\n`);

    const greeting = settings.discordMessage || "Oi, reminder nih!";
    const embedDescription = `Ada ${totalCount} agenda yang perlu diperhatikan.\n\n${separator}\n\n${bodyText}\n\n${separator}\n\n🤖 NexaPlanner`;

    const payload = {
      content: `@everyone ${greeting}`,
      embeds: [
        {
          title: "📅 NexaPlanner Reminder",
          description: embedDescription,
          color: 2445803, // Hex #2563EB -> decimal
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
