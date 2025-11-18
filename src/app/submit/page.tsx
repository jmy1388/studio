
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const articleSchema = z.object({
  authorUsername: z.string().min(2, { message: '필명은 2자 이상이어야 합니다.' }).max(50),
  title: z.string().min(5, { message: '제목은 5자 이상이어야 합니다.' }).max(100),
  summary: z.string().min(20, { message: '요약은 20자 이상이어야 합니다.' }).max(200),
  content: z.string().min(100, { message: '내용은 100자 이상이어야 합니다.' }),
  tags: z.string().refine(value => value.split(',').every(tag => tag.trim().length > 0), {
    message: '원하는 태그를 쉼표로 구분하세요',
  }),
});

export default function SubmitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  
  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: { authorUsername: '', title: '', summary: '', content: '', tags: '' },
  });

  async function onSubmit(values: z.infer<typeof articleSchema>) {
    if (!firestore) {
        toast({ variant: 'destructive', title: '오류', description: '데이터베이스에 연결할 수 없습니다.' });
        return;
    }
    const articlesCollection = collection(firestore, 'articles');
    const slug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    try {
        const newArticle = {
            ...values,
            imageId: `article-${Math.ceil(Math.random() * 5)}`,
            tags: values.tags.split(',').map(tag => tag.trim()),
            slug: slug,
            createdAt: serverTimestamp(),
            likeCount: 0,
        };
        const docRef = await addDocumentNonBlocking(articlesCollection, newArticle);
        
        toast({ title: '기사 제출됨!', description: '기사가 게시되었습니다.' });
        
        router.push(`/articles/${slug}`);

    } catch (error) {
        console.error("Error submitting article:", error);
        toast({ variant: 'destructive', title: '오류', description: '기사를 제출하는 중에 오류가 발생했습니다.' });
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 md:py-12 px-4 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">글쓰기</CardTitle>
          <CardDescription>당신의 이야기를 세상에 펼쳐보세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <FormField
                control={form.control}
                name="authorUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">필명</FormLabel>
                    <FormControl>
                      <Input placeholder="작가의 이름이나 별명" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">제목</FormLabel>
                    <FormControl>
                      <Input placeholder="제목을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">글 소개</FormLabel>
                    <FormControl>
                      <Textarea placeholder="글에 대한 간략한 소개" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">내용</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[300px]" placeholder="여기에 전체 글을 작성하세요. 단락에 줄 바꿈을 사용할 수 있습니다" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">태그</FormLabel>
                    <FormControl>
                      <Input placeholder="기술, 철학, 예술" {...field} />
                    </FormControl>
                     <p className="text-sm text-muted-foreground">
                        원하는 태그를 쉼표로 구분하세요
                     </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? '게시 중...' : '기사 게시'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
