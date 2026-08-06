const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  const regex = /^([A-Z_][A-Z0-9_]*)=(\"(?:[^\"\\]|\\.)*\"|[^\r\n]*)/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    let val = match[2];
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
    env[key] = val;
  }
  return env;
}

const envPath = path.join(__dirname, '..', '.env.local');
const env = loadEnv(envPath);

const projectId = env['FIREBASE_PROJECT_ID'];
const clientEmail = env['FIREBASE_CLIENT_EMAIL'];
const privateKey = env['FIREBASE_PRIVATE_KEY'].replace(/\\n/g, '\n');

const app = getApps().length === 0
  ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  : getApps()[0];

const db = getFirestore(app);

async function run() {
  const snap = await db.collection('events').get();
  console.log(`Jumlah event di Firestore: ${snap.size}`);
  
  if (snap.empty) {
    console.log('Tidak ada event.');
    return;
  }
  
  snap.forEach(doc => {
    console.log('--- EVENT ---');
    console.log('ID         :', doc.id);
    console.log('Title      :', doc.data().title);
    console.log('CategoryId :', doc.data().categoryId);
    console.log('StartDate  :', doc.data().startDate);
    console.log('EndDate    :', doc.data().endDate);
    console.log('CreatedBy  :', doc.data().createdBy);
    console.log('CreatedAt  :', doc.data().createdAt);
  });
}

run().catch(console.error);
