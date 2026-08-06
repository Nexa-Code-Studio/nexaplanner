import { adminAuth, adminDb } from "./firebase-admin";
import { NextResponse } from "next/server";
import { UserProfile } from "@/types";

/**
 * Verifies the Authorization Bearer Token and extracts the authenticated user profile.
 */
export async function getAuthenticatedUser(
  request: Request
): Promise<{ user: UserProfile | null; errorResponse: NextResponse | null }> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { success: false, message: "Unauthorized: Missing or invalid token format" },
          { status: 401 }
        ),
      };
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Query Firestore to verify whitelist and fetch user profile
    const userDocRef = adminDb.collection("users").doc(decodedToken.uid);
    const docSnap = await userDocRef.get();

    if (!docSnap.exists) {
      // Auto-provision hardcoded administrator if not in Firestore yet
      if (decodedToken.email && decodedToken.email.toLowerCase() === "khoirotunnisa2507@gmail.com") {
        const adminProfile: UserProfile = {
          uid: decodedToken.uid,
          name: decodedToken.name || "Admin NexaCode",
          email: decodedToken.email,
          photoURL: decodedToken.picture || "",
          role: "admin",
          createdAt: new Date(),
        };
        await userDocRef.set(adminProfile);
        return { user: adminProfile, errorResponse: null };
      }

      // Fallback: Admin might have whitelisted this email before the user ever logged in.
      // The whitelist document was stored with a sanitized email as the doc ID (not the real Firebase UID).
      // Look up by email, and if found, migrate the document to use the real UID.
      if (decodedToken.email) {
        const emailSnapshot = await adminDb
          .collection("users")
          .where("email", "==", decodedToken.email.toLowerCase().trim())
          .limit(1)
          .get();

        if (!emailSnapshot.empty) {
          const existingDoc = emailSnapshot.docs[0];
          const existingData = existingDoc.data() as UserProfile;

          // Only migrate if the stored UID is different from the real Firebase UID
          if (existingDoc.id !== decodedToken.uid) {
            // Create new document with the real Firebase UID
            const migratedProfile: UserProfile = {
              ...existingData,
              uid: decodedToken.uid,
              name: decodedToken.name || existingData.name || "Anggota NexaPlanner",
              photoURL: decodedToken.picture || existingData.photoURL || "",
            };
            await userDocRef.set(migratedProfile);
            // Delete the old placeholder document
            await existingDoc.ref.delete();
            return { user: migratedProfile, errorResponse: null };
          }

          // Doc ID already matches UID — just return existing data
          return { user: existingData, errorResponse: null };
        }
      }

      return {
        user: null,
        errorResponse: NextResponse.json(
          { success: false, message: "Unauthorized: User is not whitelisted" },
          { status: 401 }
        ),
      };
    }

    const user = docSnap.data() as UserProfile;
    return { user, errorResponse: null };
  } catch (err: any) {
    console.error("Token verification error:", err);
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: `Unauthorized: ${err.message || "Invalid token"}` },
        { status: 401 }
      ),
    };
  }
}

/**
 * Verifies if the authenticated user has one of the allowed roles.
 */
export async function verifyRole(
  request: Request,
  allowedRoles: ("admin" | "member")[]
): Promise<{ user: UserProfile | null; errorResponse: NextResponse | null }> {
  const { user, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse) {
    return { user, errorResponse };
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: "Forbidden: Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

/**
 * Standard checker for checking method-based access.
 * GET requests allowed for members and admins.
 * POST, PUT, DELETE requests allowed for admin only.
 */
export async function checkApiAccess(
  request: Request,
  method: string
): Promise<{ user: UserProfile | null; errorResponse: NextResponse | null }> {
  const url = new URL(request.url);
  const isRead = method === "GET";
  
  // If it's the members API, only allow admins to write (POST/PUT/DELETE)
  // For other APIs (like categories, events), allow both admin and member to write
  const isMembersApi = url.pathname.includes("/api/members");
  
  let requiredRoles: ("admin" | "member")[] = [];
  if (isRead) {
    requiredRoles = ["admin", "member"];
  } else {
    requiredRoles = isMembersApi ? ["admin"] : ["admin", "member"];
  }
  
  return verifyRole(request, requiredRoles);
}
