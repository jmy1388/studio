
'use client';

import { useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getArticleBySlug, getAuthor, getImage } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { user, loading, isArticleSaved, toggleSaveArticle, addReadingHistory } = useAuth();
  const { toast } = useToast();

  const article = getArticleBySlug(slug);

  useEffect(() => {
    if(article && user) {
        addReadingHistory(article.id);
    }
  }, [article, user, addReadingHistory]);
  
  if (!article) {
    notFound();
  }

  const author = getAuthor(article.authorId);
  const image = getImage(article.imageId);
  const authorAvatar = author ? getImage(author.avatarId) : undefined;
  
  const handleSaveClick = () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "로그인 해주세요",
            description: "기사를 저장하려면 로그인이 필요합니다.",
        });
        return;
    }
    toggleSaveArticle(article.id);
    toast({
        title: isArticleSaved(article.id) ? "기사 저장 취소됨" : "읽기 목록에서 제거되었습니다.",
        description: isArticleSaved(article.id) ? "읽기 목록에 추가되었습니다." : "읽기 목록에 추가되었습니다.",
    })
  }

  return (
    <article className="container max-w-3xl mx-auto py-8 md:py-12 px-4 sm:px-6">
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="font-normal text-sm">{tag}</Badge>
            ))}
        </div>
        <h1 className="font-headline text-3xl md:text-5xl font-bold leading-tight mb-4 text-gray-900 dark:text-gray-100">
          {article.title}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          {article.summary}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             {author && (
              <>
                <Avatar className="h-12 w-12">
                   {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} alt={author.name} data-ai-hint={authorAvatar.imageHint} />}
                  <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    게시일: {format(new Date(article.createdAt), 'yyyy년 M월 d일', { locale: ko })}
                  </p>
                </div>
              </>
            )}
          </div>
           {loading ? (
             <Button disabled variant="outline" className="w-full sm:w-32">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             </Button>
           ): user && (
            <Button variant={isArticleSaved(article.id) ? "default" : "outline"} onClick={handleSaveClick} className="w-full sm:w-auto">
                <Bookmark className={`mr-2 h-4 w-4 ${isArticleSaved(article.id) ? "fill-current" : ""}`} />
                {isArticleSaved(article.id) ? '저장됨' : '저장'}
            </Button>
           )}
        </div>
      </header>

      {image && (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden my-8 shadow-lg">
          <Image
            src={image.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
            data-ai-hint={image.imageHint}
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-base leading-relaxed md:text-lg md:leading-relaxed">{paragraph}</p>
        ))}
      </div>
       <div className="mt-12 border-t pt-8">
            {author && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg bg-card p-4 sm:p-6">
                     <Avatar className="h-16 w-16">
                        {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} alt={author.name} data-ai-hint={authorAvatar.imageHint} />}
                        <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                        <p className="text-sm text-muted-foreground">작성자</p>
                        <h3 className="text-lg font-semibold">{author.name}</h3>
                        <p className="mt-1 text-muted-foreground text-sm">{author.bio}</p>
                    </div>
                </div>
            )}
       </div>
    </article>
  );
}
