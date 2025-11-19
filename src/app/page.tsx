
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search, Loader2, PenSquare } from 'lucide-react';
import ArticleCard from '@/components/article-card';
import type { Article } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
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


  const filteredArticles = useMemo(() => {
    if (!articlesWithDate) return [];
    if (!searchTerm) return articlesWithDate;
    const lowercasedTerm = searchTerm.toLowerCase();
    return articlesWithDate.filter(article => {
      return (
        article.title.toLowerCase().includes(lowercasedTerm) ||
        article.summary.toLowerCase().includes(lowercasedTerm) ||
        (article.authorUsername && article.authorUsername.toLowerCase().includes(lowercasedTerm)) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
      );
    });
  }, [searchTerm, articlesWithDate]);

  return (
    <div className="py-6 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl mb-4 text-primary">oob</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            나의 글을 세상에 꺼내는 공간, oob
          </p>
        </header>

        <div className="mb-8 md:mb-12 max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="제목, 작가 또는 태그로 글 검색"
              className="pl-12 w-full h-12 text-base rounded-full shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <h2 className="font-headline text-2xl md:text-3xl mb-6">
          {searchTerm ? '검색 결과' : '인기 작품'}
        </h2>
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredArticles.map((article, index) => (
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
            <p className="text-muted-foreground text-lg">글을 찾을 수 없습니다. 다른 검색어를 시도해 보세요.</p>
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
