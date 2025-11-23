'use client';

// src/app/articles/[slug]/page.tsx

// ✅ [핵심] 빌드 시점에 미리 페이지를 만들지 않도록 강제합니다. (배포 오류 해결)
export const dynamic = 'force-dynamic';

import React from 'react';
import { useArticleDetail } from '@/hooks/useArticles';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ArticlePage() {
  // URL에서 글 ID(slug)를 가져옵니다.
  const params = useParams();
  const slug = params?.slug as string;
  const { article, loading } = useArticleDetail(slug);

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // 글이 없을 때 표시
  if (!article) {
    return (
      <div className="container mx-auto py-20 text-center px-4">
        <h1 className="text-2xl font-bold mb-4">글을 찾을 수 없습니다.</h1>
        <p className="text-muted-foreground mb-8">삭제되었거나 존재하지 않는 페이지입니다.</p>
        <Link href="/" className="text-primary hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  // 글 상세 내용 표시
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← 목록으로 돌아가기
        </Link>
      </div>

      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground break-keep leading-tight">
          {article.title}
        </h1>
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span className="font-medium flex items-center gap-2">
            <span>✍️</span>
            {article.authorUsername || '익명'}
          </span>
        </div>
      </header>

      <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
        <div className="whitespace-pre-wrap leading-relaxed text-foreground min-h-[200px]">
          {article.content}
        </div>
      </article>

      {article.tags && article.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-6 border-t border-border">
          {article.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


