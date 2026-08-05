const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Robust .env.local parser yang bisa handle FIREBASE_PRIVATE_KEY multiline
function loadEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  // Match KEY="value possibly spanning lines" or KEY=value
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
const privateKey = env['FIREBASE_PRIVATE_KEY'];

if (!projectId || !clientEmail || !privateKey) {
  console.error('ERROR: Kredensial Firebase Admin belum lengkap di .env.local');
  console.log('FIREBASE_PROJECT_ID:', projectId || '(kosong)');
  console.log('FIREBASE_CLIENT_EMAIL:', clientEmail || '(kosong)');
  console.log('FIREBASE_PRIVATE_KEY:', privateKey ? '(ada)' : '(kosong)');
  process.exit(1);
}

console.log('✅ Kredensial ditemukan');
console.log('Project  :', projectId);
console.log('Email    :', clientEmail);

const app = getApps().length === 0
  ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  : getApps()[0];

const db = getFirestore(app);
const WHITELIST_EMAIL = 'khoirotunnisa2507@gmail.com';

async function run() {
  console.log('\nMengambil data koleksi "users" dari Firestore...\n');
  const snap = await db.collection('users').get();

  if (snap.empty) {
    console.log('✅ Koleksi "users" masih kosong. Tidak ada yang perlu dihapus.');
    return;
  }

  console.log('=== Daftar Semua Users ===\n');
  const toDelete = [];

  snap.forEach(doc => {
    const d = doc.data();
    const isAdmin = d.email && d.email.toLowerCase() === WHITELIST_EMAIL.toLowerCase();
    console.log('UID   :', doc.id);
    console.log('Email :', d.email);
    console.log('Role  :', d.role);
    console.log('Status:', isAdmin ? '✅ Admin Utama (tidak akan dihapus)' : '⚠️  TIDAK DI WHITELIST → akan dihapus');
    console.log('---');
    if (!isAdmin) toDelete.push({ id: doc.id, email: d.email });
  });

  if (toDelete.length === 0) {
    console.log('\n✅ Tidak ada dokumen user yang perlu dibersihkan.');
    return;
  }

  console.log('\nMenghapus', toDelete.length, 'dokumen tidak sah...\n');
  for (const entry of toDelete) {
    await db.collection('users').doc(entry.id).delete();
    console.log('   ✂ Dihapus:', entry.email, '(UID: ' + entry.id + ')');
  }

  console.log('\n✅ Beres! Koleksi users sekarang hanya berisi admin utama.');
  console.log('   Mulai sekarang, hanya email yang diwhitelist Admin yang bisa login.\n');
}

run().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
