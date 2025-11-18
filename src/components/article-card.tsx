
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/lib/data';
import { getImage } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';
import type { Timestamp } from 'firebase/firestore';


interface ArticleCardProps {
  article: Article;
  authorUsername?: string;
  index: number;
}

function AuthorDetails({ authorUsername, createdAt }: { authorUsername?: string, createdAt: Timestamp }) {
    if (!authorUsername) {
        return (
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        )
    }
    
    const authorAvatar = getImage('user-1'); // Placeholder
    const date = createdAt.toDate();

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                {authorAvatar && <AvatarImage src={authorAvatar.imageUrl} alt={authorUsername} data-ai-hint={authorAvatar.imageHint}/>}
                <AvatarFallback>{authorUsername.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold text-sm">{authorUsername}</p>
                <p className="text-xs text-muted-foreground">
                    {format(date, 'yyyy년 M월 d일', { locale: ko })}
                </p>
            </div>
        </div>
    )
}

export default function ArticleCard({ article, authorUsername, index }: ArticleCardProps) {
  const image = getImage(article.imageId);

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
        <AuthorDetails authorUsername={authorUsername} createdAt={article.createdAt} />
      </CardFooter>
    </Card>
  );
}
