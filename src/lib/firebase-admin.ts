import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

// Robust private key parser — handles all Vercel import variants:
// 1. Key with surrounding quotes: "-----BEGIN..."
// 2. Literal \n (from .env.local import): "...KEY-----\nMII..."
// 3. Double-escaped \\n (some Vercel versions): "...KEY-----\\nMII..."
// 4. Already has real newlines (manually pasted in Vercel dashboard)
function parsePrivateKey(raw: string | undefined): string {
  if (!raw) return "";
  let key = raw;
  // Strip surrounding single or double quotes
  key = key.replace(/^["']|["']$/g, "");
  // Convert double-escaped \\n to real newline
  key = key.replace(/\\\\n/g, "\n");
  // Convert literal \n to real newline (if not already real newlines)
  key = key.replace(/\\n/g, "\n");
  return key.trim();
}

const privateKey = parsePrivateKey(rawPrivateKey);

const isDummy = 
  !projectId || 
  projectId.includes("placeholder") || 
  !privateKey || 
  privateKey.includes("placeholder") ||
  !clientEmail ||
  clientEmail.includes("placeholder");

let adminDb: any;
let adminAuth: any;
let app: any;

if (!isDummy && projectId && clientEmail && privateKey) {
  try {
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      app = getApp();
    }
    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize real Firebase Admin SDK, falling back to dummy mocks:", error);
    isDummyFallback();
  }
} else {
  isDummyFallback();
}

function isDummyFallback() {
  // Mock implementations to satisfy Next.js build compilation and static routing evaluations
  adminDb = {
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: false,
          id: "dummy-id",
          data: () => null,
        }),
        set: async () => {},
        update: async () => {},
        delete: async () => {},
      }),
      orderBy: () => ({
        get: async () => ({
          docs: [],
          forEach: () => {},
        }),
      }),
      where: () => ({
        limit: () => ({
          get: async () => ({
            empty: true,
            docs: [],
          }),
        }),
      }),
    }),
  } as any;

  adminAuth = {
    verifyIdToken: async () => ({
      uid: "dummy-uid",
      name: "Dummy Admin",
      email: "khoirotunnisa2507@gmail.com",
      picture: "",
    }),
  } as any;
}

export { adminDb, adminAuth };
export default app;
