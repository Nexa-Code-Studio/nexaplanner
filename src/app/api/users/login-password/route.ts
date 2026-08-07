import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username/Email dan Password wajib diisi" },
        { status: 400 }
      );
    }

    const normalizedUser = username.toLowerCase().trim();

    // 1. Search in Firestore users collection
    let userDoc: any = null;
    
    // Check by username field
    const usernameQuery = await adminDb
      .collection("users")
      .where("username", "==", normalizedUser)
      .limit(1)
      .get();

    if (!usernameQuery.empty) {
      userDoc = usernameQuery.docs[0].data();
    } else {
      // Check by email field
      const emailQuery = await adminDb
        .collection("users")
        .where("email", "==", normalizedUser)
        .limit(1)
        .get();

      if (!emailQuery.empty) {
        userDoc = emailQuery.docs[0].data();
      }
    }

    if (!userDoc) {
      return NextResponse.json(
        { success: false, message: "Akun tidak terdaftar dalam sistem NexaPlanner" },
        { status: 401 }
      );
    }

    // 2. Determine and auto-seed password if missing
    let passwordToCheck = userDoc.password;
    let usernameToUse = userDoc.username;

    if (!passwordToCheck || !usernameToUse) {
      const emailPrefix = userDoc.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      passwordToCheck = passwordToCheck || emailPrefix;
      usernameToUse = usernameToUse || emailPrefix;

      // Update Firestore document so they have it set
      await adminDb.collection("users").doc(userDoc.uid).update({
        username: usernameToUse,
        password: passwordToCheck,
      });
    }

    // 3. Verify password
    if (passwordToCheck !== password) {
      return NextResponse.json(
        { success: false, message: "Username atau Password salah" },
        { status: 401 }
      );
    }

    // 4. Generate Firebase Custom Token
    const customToken = await adminAuth.createCustomToken(userDoc.uid);

    return NextResponse.json({
      success: true,
      customToken,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Gagal memproses login" },
      { status: 500 }
    );
  }
}
