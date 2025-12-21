'use client';

// src/app/articles/[slug]/page.tsx

// ✅ [핵심] 빌드 시점에 미리 페이지를 만들지 않도록 강제합니다. (배포 오류 해결)
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useArticleDetail } from '@/hooks/useArticles';
import { Loader2, Heart } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = params?.slug as string;
  const { article, loading } = useArticleDetail(slug);

  const { firestore, auth } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (auth) {
      const unsub = onAuthStateChanged(auth, setUser);
      return () => unsub();
    }
  }, [auth]);

  useEffect(() => {
    if (article) {
      setLikeCount(article.likeCount);
      const liked = localStorage.getItem(`liked_${article.id}`) === 'true';
      setIsLiked(liked);
    }
  }, [article]);

  const handleLike = () => {
    if (!article || !firestore) return;

    if (!user || user.isAnonymous) {
      toast({
        title: "로그인이 필요합니다",
        description: "좋아요를 누르려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    localStorage.setItem(`liked_${article.id}`, String(newLikedState));

    const articleRef = doc(firestore, 'articles', article.id);
    updateDoc(articleRef, {
      likeCount: increment(newLikedState ? 1 : -1)
    }).catch(err => console.error("Like update failed", err));
  };

  const handleDelete = async () => {
    if (!article || !firestore || !user) return;
    if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(firestore, 'articles', article.id));
      toast({ title: '삭제 완료', description: '글이 삭제되었습니다.' });
      router.push('/');
    } catch (error) {
      console.error('Delete failed', error);
      toast({ variant: 'destructive', title: '삭제 실패', description: '권한이 없거나 오류가 발생했습니다.' });
    } finally {
      setIsDeleting(false);
    }
  };

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

          {user && user.uid === article.authorId && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제하기'}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{article.authorUsername || "익명"}</span>
              <span className="text-xs text-muted-foreground">
                {(() => {
                  try {
                    if (article.createdAt && typeof (article.createdAt as any).seconds === 'number') {
                      return format(new Date((article.createdAt as any).seconds * 1000), 'yyyy.MM.dd', { locale: ko });
                    }
                    return format(new Date(article.createdAt as any), 'yyyy.MM.dd', { locale: ko });
                  } catch (e) {
                    return '';
                  }
                })()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLike}>
              <Heart className={`h-6 w-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </Button>
            <span className="text-sm font-medium tabular-nums">{likeCount}</span>
          </div>
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


