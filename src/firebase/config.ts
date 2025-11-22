// src/lib/firebase/config.ts (수정된 전체 코드)
// 🚨 기존 코드를 이 코드로 덮어쓰거나, 누락된 부분을 채워넣어주세요.

import { FirebaseOptions } from 'firebase/app';

// Vercel 환경 변수를 사용하여 Firebase 설정을 구성합니다.
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

