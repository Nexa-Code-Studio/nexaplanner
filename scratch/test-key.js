const fs = require('fs');
const path = require('path');
const { cert } = require('firebase-admin/app');

function parsePrivateKey(raw) {
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

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  
  // Extract FIREBASE_PRIVATE_KEY
  const match = content.match(/^FIREBASE_PRIVATE_KEY=(.*)$/m);
  if (!match) {
    console.error("FIREBASE_PRIVATE_KEY not found in .env.local");
    process.exit(1);
  }
  
  const rawKey = match[1].trim();
  console.log("Raw Key starts with:", rawKey.substring(0, 40));
  
  const parsedKey = parsePrivateKey(rawKey);
  console.log("Parsed Key starts with:", parsedKey.substring(0, 40));
  console.log("Parsed Key ends with:", parsedKey.substring(parsedKey.length - 40));
  console.log("Contains actual newlines?", parsedKey.includes("\n"));
  
  // Try cert initialization
  const certObj = cert({
    projectId: "test",
    clientEmail: "test@test.com",
    privateKey: parsedKey
  });
  console.log("✅ cert() succeeded!");
} catch (e) {
  console.error("❌ Failed:", e.message);
}
