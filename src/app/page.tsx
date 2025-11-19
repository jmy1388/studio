
'use client';

import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import ArticleCard from '@/components/article-card';
import type { Article } from '@/lib/data';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';

export default function Home() {
  const { firestore } = useFirebase();

  const articlesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'articles'), orderBy('likeCount', 'desc')) : null,
    [firestore]
  );
  const { data: allArticles, isLoading } = useCollection<Article>(articlesQuery);

  const articlesWithDate = useMemo(() => {
    return allArticles?.map(article => {
        if (article.createdAt && typeof (article.createdAt as any).seconds === 'number') {
            return {
                ...article,
                createdAt: new Timestamp((article.createdAt as any).seconds, (article.createdAt as any).nanoseconds)
            }
        }
        return article;
    })
  }, [allArticles]);

  return (
    <div className="py-6 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl mb-4 text-primary">oob</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            나의 글을 세상에 꺼내는 공간, oob
          </p>
        </header>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          </div>
        ) : articlesWithDate && articlesWithDate.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {articlesWithDate.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                authorUsername={article.authorUsername}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg">
            <p className="text-muted-foreground text-lg">게시된 글이 없습니다.</p>
          </div>
        )}
      </div>
      <footer className="mt-16 py-8 text-center text-xs text-muted-foreground">
        <div className="container mx-auto">
          <p>청소년에게 부적절한 내용을 게시할 경우, 법적 책임이 따릅니다. 신고: 사이버경찰청 ☎ 182</p>
        </div>
      </footer>
    </div>
  );
}
