import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let unsubscribe: () => void;

        try {
            const { auth } = initializeFirebase();

            unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            }, (err) => {
                console.error('Auth state change error:', err);
                setError(err);
                setLoading(false);
            });
        } catch (err) {
            console.error('Firebase initialization error in useUser:', err);
            setError(err instanceof Error ? err : new Error('Unknown firebase error'));
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return { user, loading, error };
}
