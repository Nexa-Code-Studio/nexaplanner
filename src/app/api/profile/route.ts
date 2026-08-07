import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { checkApiAccess } from "@/lib/api-auth";

export async function PUT(request: Request) {
  // Validate token and authenticate the caller
  const { user: authUser, errorResponse } = await checkApiAccess(request, "PUT");
  if (errorResponse) {
    return errorResponse;
  }
  if (!authUser) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, username, password, photoURL } = body;

    if (!name || !username) {
      return NextResponse.json(
        { success: false, message: "Nama dan Username wajib diisi" },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    if (!normalizedUsername) {
      return NextResponse.json(
        { success: false, message: "Username harus diisi huruf dan angka saja" },
        { status: 400 }
      );
    }

    const userDocRef = adminDb.collection("users").doc(authUser.uid);
    const userSnap = await userDocRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    const currentProfile = userSnap.data()!;

    // 1. If username has changed, check for uniqueness
    if (normalizedUsername !== currentProfile.username) {
      const dupQuery = await adminDb
        .collection("users")
        .where("username", "==", normalizedUsername)
        .get();

      const isTaken = dupQuery.docs.some((doc: any) => doc.id !== authUser.uid);
      if (isTaken) {
        return NextResponse.json(
          { success: false, message: "Username sudah terdaftar pada pengguna lain" },
          { status: 400 }
        );
      }
    }

    // 2. Perform updates
    const updates: any = {
      name: name.trim(),
      username: normalizedUsername,
      photoURL: photoURL || "",
      updatedAt: new Date().toISOString(),
    };

    if (password) {
      updates.password = password;
    }

    await userDocRef.update(updates);

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: {
        uid: authUser.uid,
        name: updates.name,
        username: updates.username,
        photoURL: updates.photoURL,
        role: currentProfile.role,
        email: currentProfile.email,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
