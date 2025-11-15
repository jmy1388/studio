
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import ArticleCard from '@/components/article-card';
import { getArticles, getAuthor } from '@/lib/data';
import type { Article, User } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { getPersonalizedArticleRecommendations } from '@/ai/flows/personalized-article-recommendations';

const allArticles = getArticles();
const allAuthors = allArticles.map(article => getAuthor(article.authorId)).filter(Boolean) as User[];

function PersonalizedFeed() {
  const { user, readingHistory } = useAuth();
  const [recommendations, setRecommendations] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && readingHistory.length > 0) {
      setIsLoading(true);
      const fetchRecommendations = async () => {
        try {
          const historyTitles = readingHistory
            .map(id => allArticles.find(a => a.id === id)?.title)
            .filter((t): t is string => !!t);

          const result = await getPersonalizedArticleRecommendations({
            readingHistory: historyTitles,
            numberOfRecommendations: 3,
          });

          const recommendedArticles = result.recommendations
            .map(title => allArticles.find(a => a.title === title))
            .filter((a): a is Article => !!a);

          setRecommendations(recommendedArticles);
        } catch (error) {
          console.error("Failed to fetch recommendations:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecommendations();
    } else {
      setIsLoading(false);
    }
  }, [user, readingHistory]);

  if (!user) {
    return null;
  }
  
  if (isLoading) {
      return (
        <div className="mb-12">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <h2 className="font-headline text-2xl md:text-3xl mb-6">회원님을 위한 추천</h2>
          </div>
          <div className="flex items-center justify-center text-muted-foreground p-8">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>마음에 드실 만한 기사를 찾고 있습니다...</span>
          </div>
        </div>
      )
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
       <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <h2 className="font-headline text-2xl md:text-3xl mb-6">회원님을 위한 추천</h2>
      </div>
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {recommendations.map((article, index) => (
            <ArticleCard
                key={article.id}
                article={article}
                author={getAuthor(article.authorId)}
                index={index}
            />
            ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = useMemo(() => {
    if (!searchTerm) return allArticles;
    const lowercasedTerm = searchTerm.toLowerCase();
    return allArticles.filter(article => {
      const author = getAuthor(article.authorId);
      return (
        article.title.toLowerCase().includes(lowercasedTerm) ||
        article.summary.toLowerCase().includes(lowercasedTerm) ||
        (author && author.name.toLowerCase().includes(lowercasedTerm)) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
      );
    });
  }, [searchTerm]);

  return (
    <div className="py-6 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <header className="text-center mb-8 md:mb-12">
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl mb-4 text-primary">oob</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            모든 주제에 대한 작가들의 이야기, 생각, 전문 지식을 만나보세요.
            </p>
        </header>

        <div className="mb-8 md:mb-12 max-w-lg mx-auto">
            <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                type="search"
                placeholder="제목, 저자 또는 태그로 기사 검색..."
                className="pl-12 w-full h-12 text-base rounded-full shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            </div>
        </div>
      </div>
      
      <PersonalizedFeed />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <h2 className="font-headline text-2xl md:text-3xl mb-6">
          {searchTerm ? '검색 결과' : '모든 기사'}
        </h2>
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                author={getAuthor(article.authorId)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg">
            <p className="text-muted-foreground text-lg">기사를 찾을 수 없습니다. 다른 검색어를 시도해 보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
