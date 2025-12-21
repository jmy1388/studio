
'use client';

import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, increment, onSnapshot, updateDoc } from 'firebase/firestore';
import type { Article } from '@/lib/data';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

// A non-blocking update function for the client
const updateDocumentNonBlocking = (docRef: any, data: any) => {
  updateDoc(docRef, data).catch(err => console.error("Update failed", err));
};


// The Client Component that handles all interaction and rendering
export default function ArticlePageContent({ article: initialArticle }: { article: Article }) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const [article, setArticle] = useState(initialArticle);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Since we get initial data, we can re-hydrate the timestamp on the client
  const date = useMemo(() => {
    if (article.createdAt && typeof (article.createdAt as any).seconds === 'number') {
      // This is a Firestore Timestamp-like object from the server
      return new Date((article.createdAt as any).seconds * 1000);
    }
    // Fallback for any other date format
    return new Date(article.createdAt as any);
  }, [article.createdAt]);


  useEffect(() => {
    if (article && firestore) {
      const liked = localStorage.getItem(`liked_${article.id}`) === 'true';
      setIsLiked(liked);

      // We still need to listen for real-time updates for likeCount
      const docRef = doc(firestore, 'articles', article.id);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setArticle(prev => ({ ...prev, likeCount: data.likeCount }));
        }
      });

      setIsLoading(false);
      return () => unsubscribe();

    } else if (article) {
      setIsLoading(false);
    }
  }, [article, firestore]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
  }

  const handleLikeClick = () => {
    if (!article || !firestore) return;

    if (!user || user.isAnonymous) {
      toast({
        title: "로그인이 필요합니다",
        description: "좋아요를 누르려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    const articleRef = doc(firestore, 'articles', article.id);
    const newLikedState = !isLiked;

    updateDocumentNonBlocking(articleRef, {
      likeCount: increment(newLikedState ? 1 : -1)
    });

    setIsLiked(newLikedState);
    localStorage.setItem(`liked_${article.id}`, String(newLikedState));
  }

  return (
    <article className="container max-w-3xl mx-auto py-8 md:py-12 px-4 sm:px-6">
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="font-normal text-sm">{tag}</Badge>
          ))}
        </div>
        <h1 className="font-headline text-3xl md:text-5xl font-bold leading-tight mb-4 text-gray-900 dark:text-gray-100">
          {article.title}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          {article.summary}
        </p>
        <div className="mt-6 flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            게시일: {format(date, 'yyyy년 M월 d일', { locale: ko })}
          </p>
        </div>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground my-8">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed md:text-lg md:leading-relaxed">{paragraph}</p>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full h-14 w-14" onClick={handleLikeClick}>
            <Heart className={`h-6 w-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </Button>
          {article.likeCount !== null ? (
            <span className="text-sm text-muted-foreground">{article.likeCount}명이 좋아합니다</span>
          ) : (
            <div className="h-5 w-24 bg-muted rounded-md animate-pulse mt-1"></div>
          )}
        </div>
      </div>

      <div className="mt-12 border-t pt-8">
        {/* Author section removed */}
      </div>
    </article>
  );
}
