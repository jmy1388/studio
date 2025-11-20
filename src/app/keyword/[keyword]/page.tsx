'use client';

import { useParams } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Article } from '@/lib/data';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ArticleListItem({ article }: { article: Article }) {
    const date = (article.createdAt as any).toDate ? (article.createdAt as any).toDate() : new Date(article.createdAt as any);

    return (
        <Link href={`/articles/${article.slug}`}>
            <div className="block p-6 border-b hover:bg-card transition-colors">
                <h3 className="font-headline text-xl font-semibold mb-2">{article.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.summary}</p>
                <div className="flex items-center gap-3 text-sm">
                    <Avatar className="h-8 w-8 bg-muted text-muted-foreground flex items-center justify-center">
                        <User className="h-4 w-4" />
                    </Avatar>
                    <span className="font-semibold">{article.authorUsername}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{format(date, 'yyyy년 M월 d일', { locale: ko })}</span>
                </div>
            </div>
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
    const { data: articles, isLoading } = useCollection<Article>(articlesQuery);

    return (
        <div className="container max-w-3xl mx-auto py-8 md:py-12 px-4 sm:px-6">
            <div className="flex items-center mb-8">
                <Button asChild variant="ghost" size="icon" className="mr-2">
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="font-headline text-3xl font-bold">#{keyword}</h1>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : articles && articles.length > 0 ? (
                <div className="border rounded-lg">
                    {articles.map((article) => (
                        <ArticleListItem key={article.id} article={article} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-lg">
                    <p className="text-muted-foreground text-lg">
                        '{keyword}' 태그가 포함된 글이 없습니다.
                    </p>
                </div>
            )}
        </div>
    );
}
