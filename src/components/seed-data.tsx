
'use client';

import { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, getDocs, writeBatch, query } from 'firebase/firestore';

// This component will run once on mount to clear any existing dummy data.
export function SeedData() {
  const { firestore } = useFirebase();
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!firestore) {
      return;
    }

    const clearDummyData = async () => {
      if (isSeeding) return;

      setIsSeeding(true);
      try {
        console.log('Clearing all dummy articles...');
        const articlesCollection = collection(firestore, 'articles');
        const q = query(articlesCollection);
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log(`Deleting ${snapshot.size} existing articles...`);
            const deleteBatch = writeBatch(firestore);
            snapshot.docs.forEach(doc => {
                // To avoid deleting user-created articles, we could add a check here.
                // For now, per the request, we are clearing all articles.
                deleteBatch.delete(doc.ref);
            });
            await deleteBatch.commit();
            console.log('All articles have been deleted.');
        } else {
            console.log('No articles found to delete.');
        }

      } catch (error) {
        console.error('Error during database clearing process:', error);
      } finally {
        setIsSeeding(false);
      }
    };

    // We only want this to run once to clear the data.
    // In a real app, you might remove this component entirely after it runs.
    clearDummyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  // This component does not render anything.
  return null;
}
