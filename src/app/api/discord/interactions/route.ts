import { NextResponse, after } from "next/server";
import crypto from "crypto";

import { GET as getTimelineImage } from "../timeline-image/route";

export const dynamic = "force-dynamic";

function verifyDiscordRequest(
  clientPublicKey: string,
  signature: string,
  timestamp: string,
  rawBody: string
): boolean {
  try {
    const key = crypto.createPublicKey({
      key: Buffer.concat([
        Buffer.from([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]),
        Buffer.from(clientPublicKey, "hex"),
      ]),
      format: "der",
      type: "spki",
    });

    const data = Buffer.from(timestamp + rawBody, "utf-8");
    const sig = Buffer.from(signature, "hex");

    return crypto.verify(null, data, key, sig);
  } catch (err) {
    return false;
  }
}

export async function POST(request: Request) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!publicKey) {
    return NextResponse.json(
      { success: false, message: "DISCORD_PUBLIC_KEY belum dikonfigurasi di server." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  if (!signature || !timestamp) {
    return new Response("Signature headers missing", { status: 401 });
  }

  const rawBody = await request.text();
  const isVerified = verifyDiscordRequest(publicKey, signature, timestamp, rawBody);

  if (!isVerified) {
    return new Response("Invalid signature verification", { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  // 1. Respond to PING
  if (payload.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // 2. Respond to Slash Commands
  if (payload.type === 2) {
    const commandName = payload.data.name;
    const applicationId = payload.application_id;
    const interactionToken = payload.token;

    if (commandName === "timeline" || commandName === "visualize") {
      let filter = "month-this";
      let parameter = "";

      if (payload.data.options) {
        const filterOpt = payload.data.options.find((o: any) => o.name === "filter");
        if (filterOpt) filter = filterOpt.value;

        const paramOpt = payload.data.options.find((o: any) => o.name === "parameter");
        if (paramOpt) parameter = paramOpt.value;
      }

      const host = request.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";

      const processDeferred = async () => {
        try {
          const imageUrl = `${protocol}://${host}/api/discord/timeline-image?filter=${filter}&parameter=${encodeURIComponent(parameter)}`;
          // Call image generator in-process directly to bypass HTTP network calls/cold starts
          const imageRes = await getTimelineImage(new Request(imageUrl));

          if (!imageRes.ok) {
            throw new Error(`Failed to generate timeline image: status ${imageRes.status}`);
          }

          const imageBlob = await imageRes.blob();

          // Prepare multipart form data payload for Discord callback
          const formData = new FormData();
          const payloadJson = JSON.stringify({
            content: "Berikut adalah visualisasi timeline rencana event tim:",
            attachments: [{ id: 0, filename: "timeline.png" }],
          });

          formData.append("payload_json", payloadJson);
          formData.append("files[0]", imageBlob, "timeline.png");

          const callbackUrl = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`;
          const patchRes = await fetch(callbackUrl, {
            method: "PATCH",
            body: formData,
          });

          if (!patchRes.ok) {
            const errText = await patchRes.text();
            console.error("Discord callback failed:", errText);
          }
        } catch (err) {
          console.error("Deferred processing failed:", err);
          // Attempt to update Discord message with error text
          try {
            const callbackUrl = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`;
            await fetch(callbackUrl, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: `❌ Gagal mengambil timeline: ${err instanceof Error ? err.message : String(err)}`,
              }),
            });
          } catch (discordErr) {
            console.error("Failed to notify Discord of error:", discordErr);
          }
        }
      };

      // Register the task to run in the background after the response is sent to Discord
      after(() => {
        processDeferred();
      });

      // Respond immediately with Deferred Message type (5) to satisfy Discord's 3s limit
      return NextResponse.json({
        type: 5, // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
      });
    }
  }

  return NextResponse.json({ success: false, message: "Interaction type not supported" }, { status: 400 });
}
