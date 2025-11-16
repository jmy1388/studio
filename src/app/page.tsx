
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search, Loader2, PenSquare, User } from 'lucide-react';
import ArticleCard from '@/components/article-card';
import { getImage, User as Author } from '@/lib/data';
import type { Article, UserProfile } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { getPersonalizedArticleRecommendations } from '@/ai/flows/personalized-article-recommendations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';

function PersonalizedFeed() {
  const { user, userProfile } = useAuth();
  const [recommendations, setRecommendations] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { firestore } = useFirebase();
  const articlesRef = useMemoFirebase(() => collection(firestore, 'articles'), [firestore]);
  const { data: allArticles } = useCollection<Article>(articlesRef);

  useEffect(() => {
    if (user && userProfile && allArticles && userProfile.readingList && userProfile.readingList.length > 0) {
      setIsLoading(true);
      const fetchRecommendations = async () => {
        try {
          const historyTitles = userProfile.readingList
            .map(id => allArticles.find(a => a.id === id)?.title)
            .filter((t): t is string => !!t);

          if (historyTitles.length > 0) {
            const result = await getPersonalizedArticleRecommendations({
              readingHistory: historyTitles,
              numberOfRecommendations: 3,
            });

            const recommendedArticles = result.recommendations
              .map(title => allArticles.find(a => a.title === title))
              .filter((a): a is Article => !!a);

            setRecommendations(recommendedArticles);
          } else {
            setRecommendations([]);
          }
        } catch (error) {
          console.error("Failed to fetch recommendations:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecommendations();
    } else {
      setIsLoading(false);
       setRecommendations([]);
    }
  }, [user, userProfile, allArticles]);

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
                authorId={article.authorId}
                index={index}
            />
            ))}
        </div>
      </div>
    </div>
  );
}

function WriteArticleCta() {
  const { user } = useAuth();
  const userInitials = user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('') : (user?.email ? user.email[0].toUpperCase() : '');

  return (
      <div className="my-8 md:my-12">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
              <div className="bg-card border rounded-lg p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <Avatar className="h-12 w-12 hidden sm:flex">
                      {user && user.photoURL ? (
                          <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                      ) : (
                          <User className="h-6 w-6 text-muted-foreground" />
                      )}
                      {user && <AvatarFallback>{userInitials}</AvatarFallback>}
                  </Avatar>
                  <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">당신의 이야기를 공유해보세요</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                         당신의 아이디어를 기사로 만들어 세상과 소통하세요.
                      </p>
                  </div>
                  {user ? (
                      <Button asChild className="w-full sm:w-auto mt-4 sm:mt-0">
                          <Link href="/submit">
                              <PenSquare className="mr-2 h-4 w-4" />
                              글쓰기
                          </Link>
                      </Button>
                  ) : (
                      <Button asChild className="w-full sm:w-auto mt-4 sm:mt-0">
                          <Link href="/login">시작하기</Link>
                      </Button>
                  )}
              </div>
          </div>
      </div>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const { firestore } = useFirebase();
  
  const articlesQuery = useMemoFirebase(() => {
    const coll = collection(firestore, 'articles');
    return query(coll, orderBy('likeCount', 'desc'));
  }, [firestore]);

  const { data: allArticles, isLoading } = useCollection<Article>(articlesQuery);

  const filteredArticles = useMemo(() => {
    if (!allArticles) return [];
    if (!searchTerm) return allArticles;
    const lowercasedTerm = searchTerm.toLowerCase();
    return allArticles.filter(article => {
      // We can't filter by author name client-side anymore without fetching all users
      return (
        article.title.toLowerCase().includes(lowercasedTerm) ||
        article.summary.toLowerCase().includes(lowercasedTerm) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
      );
    });
  }, [searchTerm, allArticles]);

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
      <WriteArticleCta />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <h2 className="font-headline text-2xl md:text-3xl mb-6">
          {searchTerm ? '검색 결과' : '모든 작품'}
        </h2>
        {isLoading ? (
            <div className="text-center py-16">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                authorId={article.authorId}
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
