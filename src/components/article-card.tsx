
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { Button } from './ui/button';


interface ArticleCardProps {
    article: Article;
    index: number;
    className?: string;
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
        const newLikeCount = newLikedState ? localLikeCount + 1 : localLikeCount - 1;

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

export default function ArticleCard({ article, index, className }: ArticleCardProps) {

    return (
        <Card
            className={cn(
                "relative flex flex-col overflow-visible transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl animate-fade-in-up border-transparent shadow-none hover:bg-card",
                className
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {index === 0 && (
                <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-[0.6rem] font-bold">
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
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{article.authorUsername || "익명"}</span>
                            <span className="text-xs text-muted-foreground">
                                {(() => {
                                    try {
                                        if (article.createdAt && typeof (article.createdAt as any).seconds === 'number') {
                                            return format(new Date((article.createdAt as any).seconds * 1000), 'yy.MM.dd', { locale: ko });
                                        }
                                        return format(new Date(article.createdAt as any), 'yy.MM.dd', { locale: ko });
                                    } catch (e) {
                                        return '';
                                    }
                                })()}
                            </span>
                        </div>
                    </div>
                    <LikeButton article={article} />
                </CardFooter>
            </Link>
        </Card>
    );
}
