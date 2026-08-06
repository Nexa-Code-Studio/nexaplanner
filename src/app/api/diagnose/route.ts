import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    env: {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "MISSING",
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "MISSING",
      FIREBASE_PRIVATE_KEY_EXISTS: !!process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "MISSING",
    },
    adminSdk: {
      dbInitialized: !!adminDb,
      authInitialized: !!adminAuth,
    }
  };

  try {
    // Attempt a light check: verify if Firestore is responsive
    if (adminDb && typeof adminDb.collection === "function") {
      const testSnap = await adminDb.collection("users").limit(1).get();
      diagnostics.firestore = {
        success: true,
        empty: testSnap.empty,
      };
    } else {
      diagnostics.firestore = {
        success: false,
        error: "adminDb collection method is not available (using mock or failed init)",
      };
    }
  } catch (err: any) {
    diagnostics.firestore = {
      success: false,
      error: err.message || err,
      stack: err.stack,
    };
  }

  return NextResponse.json(diagnostics);
}
