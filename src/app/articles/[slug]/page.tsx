
'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { useFirebase, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, increment } from 'firebase/firestore';
import type { Article } from '@/lib/data';
import { getImage } from '@/lib/data';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { firestore } = useFirebase();

  const articlesQuery = useMemoFirebase(() => query(collection(firestore, 'articles'), where('slug', '==', slug)), [firestore, slug]);
  const { data: articles, isLoading: articlesLoading } = useCollection<Article>(articlesQuery);
  const article = articles?.[0];

  const [isLiked, setIsLiked] = useState(false);
  
  useEffect(() => {
    if (article) {
      const liked = localStorage.getItem(`liked_${article.id}`) === 'true';
      setIsLiked(liked);
    }
  }, [article]);
  
  if (articlesLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
  }
  
  if (!article) {
    notFound();
  }

  const image = getImage(article.imageId);
  const authorAvatar = article.authorUsername ? getImage('user-1') : undefined; // Placeholder avatar logic
  
  const handleLikeClick = () => {
    if (!article) return;
    const articleRef = doc(firestore, 'articles', article.id);
    const newLikedState = !isLiked;

    updateDocumentNonBlocking(articleRef, {
      likeCount: increment(newLikedState ? 1 : -1)
    });
    
    setIsLiked(newLikedState);
    localStorage.setItem(`liked_${article.id}`, String(newLikedState));
  }

  const date = article.createdAt.toDate();

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
             {article.authorUsername && (
              <>
                <Avatar className="h-12 w-12">
                   {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} alt={article.authorUsername} data-ai-hint={authorAvatar.imageHint} />}
                  <AvatarFallback>{article.authorUsername.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{article.authorUsername}</p>
                  <p className="text-sm text-muted-foreground">
                    게시일: {format(date, 'yyyy년 M월 d일', { locale: ko })}
                  </p>
                </div>
              </>
            )}
        </div>
      </header>

      {image && (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden my-8 shadow-lg">
          <Image
            src={image.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
            data-ai-hint={image.imageHint}
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground">
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
            {article.authorUsername && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg bg-card p-4 sm:p-6">
                     <Avatar className="h-16 w-16">
                        {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} alt={article.authorUsername} data-ai-hint={authorAvatar.imageHint} />}
                        <AvatarFallback>{article.authorUsername.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                        <p className="text-sm text-muted-foreground">작가</p>
                        <h3 className="text-lg font-semibold">{article.authorUsername}</h3>
                    </div>
                </div>
            )}
       </div>
    </article>
  );
}
