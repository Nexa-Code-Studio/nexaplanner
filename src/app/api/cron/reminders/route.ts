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

    const parseFirebaseDate = (dateVal: any): Date => {
      if (!dateVal) return new Date();
      if (dateVal.seconds !== undefined) return new Date(dateVal.seconds * 1000);
      if (dateVal._seconds !== undefined) return new Date(dateVal._seconds * 1000);
      return new Date(dateVal);
    };

    // Helper to format date parts in Asia/Jakarta timezone
    function getWIBDateParts(dateVal: any) {
      const date = parseFirebaseDate(dateVal);
      const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(date);
      const findPart = (type: string) => parts.find(p => p.type === type)?.value || '';
      
      return {
        day: parseInt(findPart('day'), 10),
        monthNum: parseInt(findPart('month'), 10) - 1, // 0-indexed
        year: parseInt(findPart('year'), 10),
        hour: parseInt(findPart('hour'), 10),
        minute: parseInt(findPart('minute'), 10),
      };
    }

    // Helper to get midnight in WIB as a UTC Date for arithmetic calculations
    function getWIBMidnight(dateVal: any): Date {
      const parts = getWIBDateParts(dateVal);
      return new Date(Date.UTC(parts.year, parts.monthNum, parts.day, 0, 0, 0, 0));
    }

    // Helper to format event time in WIB
    function formatEventTimeRange(startVal: any, endVal: any): string {
      const startParts = getWIBDateParts(startVal);
      const endParts = getWIBDateParts(endVal);
      
      if (startParts.hour === 0 && startParts.minute === 0 && endParts.hour === 0 && endParts.minute === 0) {
        return "All Day";
      }
      
      const pad = (num: number) => String(num).padStart(2, '0');
      return `${pad(startParts.hour)}:${pad(startParts.minute)} - ${pad(endParts.hour)}:${pad(endParts.minute)} WIB`;
    }

    // Helper to format Indonesian date in Asia/Jakarta timezone
    function getIndoDayAndDate(dateVal: Date): string {
      const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formatter.format(dateVal);
    }

    function formatIndoDateRange(startVal: any, endVal: any): string {
      const startParts = getWIBDateParts(startVal);
      const endParts = getWIBDateParts(endVal);

      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

      const startDay = startParts.day;
      const startMonth = months[startParts.monthNum];
      const startYear = startParts.year;

      const endDay = endParts.day;
      const endMonth = months[endParts.monthNum];
      const endYear = endParts.year;

      // 1. Same day
      if (startDay === endDay && startParts.monthNum === endParts.monthNum && startYear === endYear) {
        return `${startDay} ${startMonth} ${startYear}`;
      }

      // 2. Same month and same year
      if (startParts.monthNum === endParts.monthNum && startYear === endYear) {
        return `${startDay}–${endDay} ${startMonth} ${startYear}`;
      }

      // 3. Different month, same year
      if (startYear === endYear) {
        return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
      }

      // 4. Different year
      return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
    }

    const todayMidnight = getWIBMidnight(new Date());

    // Initialize grouped events dictionary for the next 7 days (0 to 7)
    const groupedEvents: { [key: number]: any[] } = {};
    for (let i = 0; i <= 7; i++) {
      groupedEvents[i] = [];
    }

    for (const evt of events) {
      const startMidnight = getWIBMidnight(evt.startDate);
      const diffTime = startMidnight.getTime() - todayMidnight.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 7) {
        groupedEvents[diffDays].push(evt);
      }
    }

    // Calculate total count
    const totalCount = Object.values(groupedEvents).reduce((acc, curr) => acc + curr.length, 0);

    // 3. If no events in the next 7 days, do not send webhook
    if (totalCount === 0) {
      return NextResponse.json({ success: true, message: "Tidak ada pengingat agenda untuk dikirim 7 hari ke depan." });
    }

    // 4. Build Discord Embed Fields grouped by day
    const fields = [];
    for (let i = 0; i <= 7; i++) {
      const dayEvents = groupedEvents[i];
      if (dayEvents.length === 0) continue;

      // Sort events on this day chronologically by start time
      dayEvents.sort((a, b) => {
        const timeA = parseFirebaseDate(a.startDate).getTime();
        const timeB = parseFirebaseDate(b.startDate).getTime();
        return timeA - timeB;
      });

      const targetDate = new Date(todayMidnight.getTime() + (i * 24 * 60 * 60 * 1000));
      
      let headerName = "";
      if (i === 0) {
        headerName = `🔴 Hari Ini - ${getIndoDayAndDate(targetDate)}`;
      } else if (i === 1) {
        headerName = `🟡 Besok - ${getIndoDayAndDate(targetDate)}`;
      } else {
        headerName = `📅 ${getIndoDayAndDate(targetDate)} (${i} hari lagi)`;
      }

      const eventLines = dayEvents.map(evt => {
        const categoryName = getCategoryName(evt.categoryId);
        const dateRangeStr = formatIndoDateRange(evt.startDate, evt.endDate);
        const timeRangeStr = formatEventTimeRange(evt.startDate, evt.endDate);

        let eventStr = `• **${evt.title}** [${categoryName}]`;

        if (timeRangeStr !== "All Day") {
          eventStr += `\n  ⏰ ${timeRangeStr}`;
        }

        const startParts = getWIBDateParts(evt.startDate);
        const endParts = getWIBDateParts(evt.endDate);
        const isSameDay = startParts.day === endParts.day && startParts.monthNum === endParts.monthNum && startParts.year === endParts.year;
        if (!isSameDay) {
          eventStr += `\n  📅 ${dateRangeStr}`;
        }

        if (evt.location) {
          eventStr += `\n  📍 ${evt.location}`;
        }

        return eventStr;
      });

      fields.push({
        name: headerName,
        value: eventLines.join("\n\n"),
        inline: false
      });
    }

    const greeting = settings.discordMessage || "Oi, reminder nih!";
    const payload = {
      content: `@everyone ${greeting}`,
      embeds: [
        {
          title: "📅 NexaPlanner - Rangkuman Agenda 7 Hari Ke Depan",
          description: `Berikut adalah agenda tim NexaCode untuk 7 hari ke depan (hari ini s.d. 7 hari mendatang). Terdapat **${totalCount} agenda** yang terdaftar:`,
          color: 2445803, // Hex #2563EB -> decimal
          fields: fields,
          footer: {
            text: "🤖 NexaPlanner Bot",
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
