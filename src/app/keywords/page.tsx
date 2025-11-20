'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Article } from '@/lib/data';
import { Loader2 } from 'lucide-react';

export default function KeywordsPage() {
  const { firestore } = useFirebase();
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);

  const articlesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'articles')) : null),
    [firestore]
  );
  const { data: articles, isLoading } = useCollection<Article>(articlesQuery);

  useEffect(() => {
    if (articles) {
      const allTags = articles.flatMap(article => article.tags);
      const uniqueTagSet = new Set(allTags);
      setUniqueTags(Array.from(uniqueTagSet).sort());
    }
  }, [articles]);

  return (
    <div className="container max-w-5xl mx-auto py-8 md:py-12 px-4 sm:px-6">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="font-headline text-2xl sm:text-3xl tracking-[0.3em] font-light text-foreground mb-2">
          KEYWORD
        </h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 border-t border-l border-border">
          {uniqueTags.map(tag => (
            <Link
              href={`/?q=${encodeURIComponent(tag)}`}
              key={tag}
              className="relative flex items-center justify-center h-24 p-4 border-b border-r border-border text-center text-foreground hover:bg-accent transition-colors"
            >
              <span className="font-medium">{tag}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
