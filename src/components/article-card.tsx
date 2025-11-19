
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';
import type { Timestamp } from 'firebase/firestore';
import { User, Heart } from 'lucide-react';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { Button } from './ui/button';


interface ArticleCardProps {
  article: Article;
  authorUsername?: string;
  index: number;
}

function AuthorDetails({ authorUsername, createdAt }: { authorUsername?: string, createdAt: Timestamp }) {
    if (!authorUsername) {
        return (
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        )
    }
    
    const date = createdAt.toDate();

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-muted text-muted-foreground flex items-center justify-center">
                <User className="h-5 w-5" />
            </Avatar>
            <div>
                <p className="font-semibold text-sm">{authorUsername}</p>
                <p className="text-xs text-muted-foreground">
                    {format(date, 'yyyy년 M월 d일', { locale: ko })}
                </p>
            </div>
        </div>
    )
}

function LikeButton({ article }: { article: Article }) {
    const { firestore } = useFirebase();
    const [isLiked, setIsLiked] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(article.likeCount);

    useEffect(() => {
        const liked = localStorage.getItem(`liked_${article.id}`) === 'true';
        setIsLiked(liked);
    }, [article.id]);
    
    const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation(); // Prevent event bubbling
        if (!firestore) return;

        const articleRef = doc(firestore, 'articles', article.id);
        const newLikedState = !isLiked;
        const newLikeCount = newLikedState ? localLikeCount + 1 : localLikeCount -1;
        
        updateDocumentNonBlocking(articleRef, {
            likeCount: increment(newLikedState ? 1 : -1)
        });
        
        setIsLiked(newLikedState);
        setLocalLikeCount(newLikeCount);
        localStorage.setItem(`liked_${article.id}`, String(newLikedState));
    }

    return (
        <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLikeClick}>
                <Heart className={`h-4 w-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </Button>
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
                {localLikeCount}
            </span>
        </div>
    );
}

export default function ArticleCard({ article, authorUsername, index }: ArticleCardProps) {

  return (
    <Card
      className="relative flex flex-col overflow-visible transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl animate-fade-in-up border-transparent shadow-none hover:bg-card"
      style={{ animationDelay: `${index * 100}ms` }}
    >
        {index === 0 && (
          <div className="absolute -top-3 -left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
            인기
          </div>
        )}
        <Link href={`/articles/${article.slug}`} className="flex flex-col flex-grow">
            <CardContent className="flex-grow p-4">
                <CardTitle className="font-headline text-lg leading-tight mb-2 hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                </CardTitle>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-3">{article.summary}</p>
                <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="font-normal text-xs">{tag}</Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <AuthorDetails authorUsername={authorUsername} createdAt={article.createdAt} />
                <LikeButton article={article} />
            </CardFooter>
        </Link>
    </Card>
  );
}
