
import * as admin from 'firebase-admin';

/**
 * @fileOverview Configuração do Firebase Admin SDK Resiliente.
 * Se as chaves estiverem ausentes, o servidor não trava, apenas avisa.
 */

const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  const rawKey = key.replace(/^"|"$/g, '');
  return rawKey.replace(/\\n/g, '\n');
};

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};

if (!admin.apps.length) {
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.warn("⚠️ EduCore: Admin SDK operando em modo restrito (chaves ausentes).");
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    } catch (error) {
      console.error("❌ Erro ao inicializar Admin SDK:", error);
    }
  }
}

const adminDb = admin.apps.length ? admin.firestore() : null;
const adminAuth = admin.apps.length ? admin.auth() : null;

export { admin, adminDb, adminAuth };
