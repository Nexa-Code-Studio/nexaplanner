import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { checkApiAccess } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { errorResponse } = await checkApiAccess(request, "GET");
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const docRef = adminDb.collection("settings").doc("general");
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // Return default configuration if it doesn't exist yet
      const defaults = {
        discordWebhookUrl: "",
        discordMessage: "Oi, reminder nih!",
        reminderTime: "08:00",
        isH7Enabled: true,
        isH3Enabled: true,
        isH1Enabled: true,
        isH0Enabled: true,
      };
      return NextResponse.json({ success: true, data: defaults });
    }

    return NextResponse.json({ success: true, data: docSnap.data() });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // Only admins are allowed to edit settings
  const { user, errorResponse } = await checkApiAccess(request, "PUT");
  if (errorResponse) {
    return errorResponse;
  }
  if (!user || user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Forbidden: Admins only" }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    const settingsData = {
      discordWebhookUrl: body.discordWebhookUrl || "",
      discordMessage: body.discordMessage || "Oi, reminder nih!",
      reminderTime: body.reminderTime || "08:00",
      isH7Enabled: typeof body.isH7Enabled === "boolean" ? body.isH7Enabled : true,
      isH3Enabled: typeof body.isH3Enabled === "boolean" ? body.isH3Enabled : true,
      isH1Enabled: typeof body.isH1Enabled === "boolean" ? body.isH1Enabled : true,
      isH0Enabled: typeof body.isH0Enabled === "boolean" ? body.isH0Enabled : true,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email,
    };

    const docRef = adminDb.collection("settings").doc("general");
    await docRef.set(settingsData, { merge: true });

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan", data: settingsData });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
