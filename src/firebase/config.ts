// src/lib/firebase/config.ts (수정된 전체 코드)
// 🚨 기존 코드를 이 코드로 덮어쓰거나, 누락된 부분을 채워넣어주세요.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Storage 모듈 import 추가 (storageBucket 사용을 위해)

// Vercel 환경 변수를 사용하여 Firebase 설정을 구성합니다.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // 👈 Vercel에서 가져온 Storage Bucket
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Next.js SSR(서버 측 렌더링) 환경에 맞게 Firebase 앱을 초기화합니다.
let app;
if (!getApps().length) {
  // 이미 초기화된 앱이 없으면 새로 초기화합니다.
  app = initializeApp(firebaseConfig);
} else {
  // 이미 초기화된 앱이 있으면 그것을 사용합니다.
  app = getApp();
}

// 각 Firebase 서비스 객체를 내보내 다른 파일에서 사용할 수 있게 합니다.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Storage 객체도 필요할 수 있으므로 추가합니다.
