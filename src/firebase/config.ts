// src/lib/firebase/config.ts (Vercel 환경 변수를 읽도록 수정됨)

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; 

// 🚨 Vercel 환경 변수(NEXT_PUBLIC_...)를 사용하여 Firebase 설정을 구성합니다.
const firebaseConfig = {
  // 키 값은 모두 Vercel의 환경 변수에서 가져옵니다.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, 
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId는 Vercel에 없으므로 제외하거나 필요하면 추가해야 합니다.
};

// Next.js 환경에 맞게 Firebase 앱을 초기화합니다.
let app;
if (!getApps().length) {
  // 앱이 초기화되어 있지 않으면, 환경 변수를 사용하여 새로 초기화합니다.
  app = initializeApp(firebaseConfig);
} else {
  // 이미 초기화된 앱이 있으면 그것을 사용합니다.
  app = getApp();
}

// 각 Firebase 서비스 객체를 내보냅니다.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
