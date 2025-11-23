import { useState, useEffect } from 'react';
import { collection, query, orderBy, where, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Article } from '@/lib/data';

export function useHomeArticles() {
    const { firestore } = useFirebase();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;

        const fetchArticles = async () => {
            try {
                const q = query(collection(firestore, 'articles'), orderBy('likeCount', 'desc'), limit(20));
                const snapshot = await getDocs(q);
                const fetchedArticles = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Article[];
                setArticles(fetchedArticles);
            } catch (error) {
                console.error("Error fetching home articles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [firestore]);

    return { articles, loading };
}

export function useArticleDetail(slug: string) {
    const { firestore } = useFirebase();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !slug) return;

        const fetchArticle = async () => {
            setLoading(true);
            try {
                // First try to get by ID (assuming slug might be ID)
                const docRef = doc(firestore, 'articles', slug);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setArticle({ id: docSnap.id, ...docSnap.data() } as Article);
                } else {
                    // Fallback: Query by slug field
                    const q = query(collection(firestore, 'articles'), where('slug', '==', slug), limit(1));
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        setArticle({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Article);
                    } else {
                        setArticle(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching article detail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [firestore, slug]);

    return { article, loading };
}
