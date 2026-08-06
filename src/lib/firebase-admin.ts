import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

// Robust private key parser — handles all Vercel import variants:
// 1. Key with surrounding quotes: "-----BEGIN..."
// 2. Flattened single-line keys (where Vercel stripped all \n literals to a single string of length 1676)
// 3. Literal \n (from .env.local import): "...KEY-----\nMII..."
// 4. Double-escaped \\n (some Vercel versions): "...KEY-----\\nMII..."
function parsePrivateKey(raw: string | undefined): string {
  if (!raw) return "";
  let key = raw.trim();
  // Strip surrounding single or double quotes
  key = key.replace(/^["']|["']$/g, "");
  
  // If the key has no newlines but contains BEGIN and END headers,
  // it has been flattened by Vercel's environment parser.
  if (!key.includes("\n") && !key.includes("\r")) {
    const beginHeader = "-----BEGIN PRIVATE KEY-----";
    const endHeader = "-----END PRIVATE KEY-----";
    
    if (key.includes(beginHeader) && key.includes(endHeader)) {
      let body = key
        .replace(beginHeader, "")
        .replace(endHeader, "")
        .replace(/\s+/g, ""); // remove all spaces
      
      const lines = [];
      for (let i = 0; i < body.length; i += 64) {
        lines.push(body.substring(i, i + 64));
      }
      
      return `${beginHeader}\n${lines.join("\n")}\n${endHeader}\n`;
    }
  }
  
  // Fallback for standard formatting
  key = key.replace(/\\\\n/g, "\n");
  key = key.replace(/\\n/g, "\n");
  return key.trim() + "\n";
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
let initError: any = null;

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
  } catch (error: any) {
    console.error("Failed to initialize real Firebase Admin SDK, falling back to dummy mocks:", error);
    initError = error.message || String(error);
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

export { adminDb, adminAuth, initError };
export default app;
