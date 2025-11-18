
'use client';

import { useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { seedArticles } from '@/lib/seed';

// This component is responsible for seeding the database with initial data
// if it's empty. It runs once on the client side.
export default function SeedData() {
  const { firestore } = useFirebase();

  useEffect(() => {
    if (firestore) {
      seedArticles(firestore);
    }
  }, [firestore]);

  return null; // This component doesn't render anything.
}
