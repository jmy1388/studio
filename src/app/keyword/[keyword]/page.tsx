'use client';

// src/app/keyword/[keyword]/page.tsx

// Force dynamic rendering to prevent hydration mismatch
export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Article } from '@/lib/data';
import { Loader2, Heart, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function ArticleListItem({ article }: { article: Article }) {
    // Safely handle Timestamp conversion
    let date: Date;
    try {
        if ((article.createdAt as any)?.toDate) {
            date = (article.createdAt as any).toDate();
        } else if (article.createdAt instanceof Date) {
            date = article.createdAt;
        } else {
            date = new Date(article.createdAt as any);
        }
    } catch (e) {
        date = new Date();
    }

    return (
        <Link href={`/articles/${article.slug}`} className="block mb-6 group">
            <Card className="w-full aspect-[4/1] p-6 flex flex-col justify-center hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card">
                <div className="flex flex-col h-full justify-between">
                    <div>
                        <h3 className="font-headline text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-1">
                            {article.title}
                        </h3>
                        <p className="text-muted-foreground text-base line-clamp-2 leading-relaxed">
                            {article.summary}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-auto pt-4">
                        <span className="font-medium text-foreground flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {article.authorUsername || '익명'}
                        </span>
                        <span className="text-border">|</span>
                        <span>{format(date, 'yyyy.MM.dd', { locale: ko })}</span>
                        <span className="text-border">|</span>
                        <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {article.likeCount || 0}
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}


export default function KeywordPage() {
    const params = useParams();
    const keyword = decodeURIComponent(params.keyword as string);
    const { firestore } = useFirebase();

    const articlesQuery = useMemoFirebase(
        () => firestore
            ? query(
                collection(firestore, 'articles'),
                where('tags', 'array-contains', keyword),
                orderBy('createdAt', 'desc')
            )
            : null,
        [firestore, keyword]
    );
    const { data: articles, isLoading, error } = useCollection<Article>(articlesQuery);

    return (
        <div className="w-[60%] mx-auto py-12 px-4">
            <div className="flex flex-col items-center mb-12">
                <h1 className="font-headline text-4xl font-bold text-primary mb-2">#{keyword}</h1>
                <p className="text-muted-foreground">
                    총 {articles?.length || 0}개의 글이 있습니다
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : articles && articles.length > 0 ? (
                <div className="space-y-6">
                    {articles.map((article) => (
                        <ArticleListItem key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-card/50 rounded-xl border border-dashed">
                    <p className="text-muted-foreground text-lg">
                        '{keyword}' 태그가 포함된 글이 없습니다.
                    </p>
                    {error && (
                        <p className="text-xs text-muted-foreground mt-2 opacity-50">
                            (데이터를 불러오는 중 문제가 발생했습니다)
                        </p>
                    )}
                    <Button asChild variant="link" className="mt-4">
                        <Link href="/">
                            홈으로 돌아가기
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
