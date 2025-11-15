'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Article, User } from '@/lib/data';
import { getImage } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ArticleCardProps {
  article: Article;
  author: User | undefined;
  index: number;
}

export default function ArticleCard({ article, author, index }: ArticleCardProps) {
  const image = getImage(article.imageId);
  const authorAvatar = author ? getImage(author.avatarId) : undefined;

  return (
    <Card
      className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Link href={`/articles/${article.slug}`} className="block">
        <CardHeader className="p-0">
          <div className="relative aspect-[3/2] w-full">
            {image && (
              <Image
                src={image.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint={image.imageHint}
              />
            )}
          </div>
        </CardHeader>
      </Link>
      <CardContent className="flex-grow p-6">
        <div className="flex gap-2 mb-2">
            {article.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>
            ))}
        </div>
        <Link href={`/articles/${article.slug}`}>
          <CardTitle className="font-headline text-xl leading-tight mb-2 hover:text-primary transition-colors">
            {article.title}
          </CardTitle>
        </Link>
        <p className="text-muted-foreground text-sm line-clamp-3">{article.summary}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="flex items-center gap-3">
          {author && (
            <>
              <Avatar className="h-10 w-10">
                {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} alt={author.name} data-ai-hint={authorAvatar.imageHint}/>}
                <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(article.createdAt), 'yyyy년 M월 d일', { locale: ko })}
                </p>
              </div>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
