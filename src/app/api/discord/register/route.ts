import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!clientId || !botToken) {
    return NextResponse.json(
      {
        success: false,
        message: "Konfigurasi variabel lingkungan DISCORD_CLIENT_ID atau DISCORD_BOT_TOKEN belum disetel di .env.local",
      },
      { status: 500 }
    );
  }

  const commands = [
    {
      name: "timeline",
      description: "Mendapatkan visualisasi timeline agenda tim",
      options: [
        {
          name: "filter",
          description: "Tipe pemfilteran agenda",
          type: 3, // STRING
          required: false,
          choices: [
            { name: "Bulan Ini", value: "month-this" },
            { name: "Hari Ini", value: "today" },
            { name: "7 Hari Ke Depan (Minggu Ini)", value: "week" },
            { name: "30 Hari Ke Depan", value: "next" },
            { name: "Bulan Tertentu (misal: 2026-08)", value: "month-select" },
            { name: "Kategori Tertentu (misal: TFS)", value: "category" },
            { name: "Semua Agenda", value: "all" },
          ],
        },
        {
          name: "parameter",
          description: "Parameter pendukung filter (seperti nama kategori atau format bulan YYYY-MM)",
          type: 3, // STRING
          required: false,
        },
      ],
    },
    {
      name: "visualize",
      description: "Mendapatkan visualisasi timeline agenda tim",
      options: [
        {
          name: "filter",
          description: "Tipe pemfilteran agenda",
          type: 3, // STRING
          required: false,
          choices: [
            { name: "Bulan Ini", value: "month-this" },
            { name: "Hari Ini", value: "today" },
            { name: "7 Hari Ke Depan (Minggu Ini)", value: "week" },
            { name: "30 Hari Ke Depan", value: "next" },
            { name: "Bulan Tertentu (misal: 2026-08)", value: "month-select" },
            { name: "Kategori Tertentu (misal: TFS)", value: "category" },
            { name: "Semua Agenda", value: "all" },
          ],
        },
        {
          name: "parameter",
          description: "Parameter pendukung filter (seperti nama kategori atau format bulan YYYY-MM)",
          type: 3, // STRING
          required: false,
        },
      ],
    },
  ];

  try {
    const response = await fetch(
      `https://discord.com/api/v10/applications/${clientId}/commands`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commands),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || `Discord API returned status ${response.status}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slash commands /timeline dan /visualize berhasil didaftarkan secara global ke Discord!",
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Gagal mendaftarkan slash command",
      },
      { status: 500 }
    );
  }
}
