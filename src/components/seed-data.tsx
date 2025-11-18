
'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { seedArticles } from '@/lib/seed';

// This component will run once on mount, check if articles exist,
// and if not, it will seed the database.
export function SeedData() {
  const { firestore } = useFirebase();
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!firestore || isSeeding) {
      return;
    }

    const checkAndSeedDatabase = async () => {
      setIsSeeding(true);
      try {
        console.log('Checking if database needs seeding...');
        const articlesCollection = collection(firestore, 'articles');
        const snapshot = await getDocs(articlesCollection);
        
        // Only seed if the collection is empty
        if (snapshot.empty) {
            console.log('Database is empty. Seeding with initial data...');
            await seedArticles(firestore);
            console.log('Database has been seeded.');
        } else {
            console.log('Database already contains data. Skipping seed.');
        }

      } catch (error) {
        console.error('Error during database seed check:', error);
      } finally {
        setIsSeeding(false);
      }
    };

    checkAndSeedDatabase();

  }, [firestore]);

  // This component does not render anything.
  return null;
}
