'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import ArticleCard from '@/components/article-card';
import type { Article } from '@/lib/data';
import { useHomeArticles } from '@/hooks/useArticles';
import { Timestamp } from 'firebase/firestore';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

const KEYWORDS = [
  '부모님 몰래', '급식 메뉴', '친구 관계', '부모님 관계', '게임',
  '진로', '싫어요', '좋아요', '나의 비밀', '시험',
  '공부', '학원 이야기', '틱톡', '인스타그램', '수학'
];

export default function Home() {
  const { articles: allArticles, loading: isLoading } = useHomeArticles();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const articlesWithDate = useMemo(() => {
    return allArticles?.map(article => {
      if (article.createdAt && typeof (article.createdAt as any).seconds === 'number') {
        return {
          ...article,
          createdAt: new Timestamp(
            (article.createdAt as any).seconds,
            (article.createdAt as any).nanoseconds
          ),
        };
      }
      return article;
    });
  }, [allArticles]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery) {
      return articlesWithDate;
    }
    return articlesWithDate?.filter(article => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const isMatch =
        article.title.toLowerCase().includes(lowerCaseQuery) ||
        article.summary.toLowerCase().includes(lowerCaseQuery) ||
        article.content.toLowerCase().includes(lowerCaseQuery) ||
        (article.authorUsername && article.authorUsername.toLowerCase().includes(lowerCaseQuery)) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery));
      return isMatch;
    });
  }, [articlesWithDate, searchQuery]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', handleSelect);

    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

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
        ) : filteredArticles && filteredArticles.length > 0 ? (
          <>
            <Carousel
              setApi={setApi}
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {filteredArticles.map((article, index) => (
                  <CarouselItem key={article.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <ArticleCard
                        article={article}
                        authorUsername={article.authorUsername}
                        index={index}
                        className="h-full"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
            {api && (
              <div className="py-2 mt-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-4">
                {api.scrollSnapList().map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api.scrollTo(index)}
                    className={cn(
                      'font-mono text-base',
                      current === index
                        ? 'text-foreground font-bold border-b-2 border-primary'
                        : 'text-muted-foreground'
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? `"${searchQuery}"에 대한 검색 결과가 없습니다.` : '게시된 글이 없습니다.'}
            </p>
          </div>
        )}
      </div>

      <div className="container max-w-5xl mx-auto py-8 md:py-12 px-4 sm:px-6 mt-8">
        <header className="text-center mb-8 md:mb-12">
          <h2 className="font-headline text-2xl sm:text-3xl tracking-[0.3em] font-light text-foreground mb-2">
            KEYWORD
          </h2>
        </header>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : KEYWORDS.length > 0 ? (
          <div className="grid grid-cols-5 gap-0 border-t border-l border-border">
            {KEYWORDS.map(tag => (
              <Link
                href={`/keyword/${encodeURIComponent(tag)}`}
                key={tag}
                className="relative flex items-center justify-center h-24 p-4 border-b border-r border-border text-center text-foreground hover:bg-accent transition-colors"
              >
                <span className="font-medium">{tag}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>


      <footer className="mt-16 py-8 text-center text-xs text-muted-foreground">
        <div className="container mx-auto">
          <p>청소년에게 부적절한 내용을 게시할 경우, 법적 책임이 따릅니다. 신고: 사이버경찰청 ☎ 182</p>
        </div>
      </footer>
    </div>
  );
}
