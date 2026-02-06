// src/firebase/init.ts
import { getApps, initializeApp, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Define um tipo para o objeto de serviços retornado, para maior clareza.
export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

/**
 * Inicializa e retorna os principais serviços do Firebase (App, Auth, Firestore).
 * Utiliza o padrão Singleton para evitar múltiplas inicializações no ambiente Next.js.
 */
export function initializeFirebase(): FirebaseServices {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  
  // Retorna o objeto completo que o FirebaseProvider espera.
  return { firebaseApp: app, auth, firestore };
}

// A exportação individual do 'app' é mantida por segurança, caso outra parte do código dependa dela.
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
