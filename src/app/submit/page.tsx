
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import AuthGate from '@/components/auth-gate';
import { addArticle } from '@/lib/data';

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
  title: z.string().min(5, { message: '제목은 5자 이상이어야 합니다.' }).max(100),
  summary: z.string().min(20, { message: '요약은 20자 이상이어야 합니다.' }).max(200),
  content: z.string().min(100, { message: '내용은 100자 이상이어야 합니다.' }),
  tags: z.string().refine(value => value.split(',').every(tag => tag.trim().length > 0), {
    message: '쉼표로 구분된 태그를 제공하십시오.',
  }),
});

function SubmitPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: { title: '', summary: '', content: '', tags: '' },
  });

  function onSubmit(values: z.infer<typeof articleSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: '오류', description: '기사를 제출하려면 로그인해야 합니다.' });
        return;
    }
    const newArticle = addArticle({
        ...values,
        authorId: user.id,
        imageId: `article-${Math.ceil(Math.random() * 5)}`, // Random image for now
        tags: values.tags.split(',').map(tag => tag.trim()),
    });
    
    toast({ title: '기사 제출됨!', description: '기사가 게시되었습니다.' });
    router.push(`/articles/${newArticle.slug}`);
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 md:py-12 px-4 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">기사 제출</CardTitle>
          <CardDescription>세상과 당신의 이야기를 공유하세요. 아래 양식을 작성하여 기사를 게시하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">제목</FormLabel>
                    <FormControl>
                      <Input placeholder="모든 것의 미래" {...field} />
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
                    <FormLabel className="text-lg">요약</FormLabel>
                    <FormControl>
                      <Textarea placeholder="기사에 대한 간략한 한 단락 요약." {...field} />
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
                      <Textarea className="min-h-[300px]" placeholder="여기에 전체 기사를 작성하세요. 단락에 줄 바꿈을 사용할 수 있습니다." {...field} />
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
                        쉼표로 구분된 태그 목록을 제공하십시오.
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

export default function SubmitPage() {
    return (
        <AuthGate>
            <SubmitPageContent />
        </AuthGate>
    )
}
