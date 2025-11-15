'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from '@/components/logo';

const loginSchema = z.object({
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
  password: z.string().min(1, { message: '비밀번호를 입력해주세요.' }),
});

const signupSchema = z.object({
    name: z.string().min(2, { message: '이름은 2자 이상이어야 합니다.' }),
    email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
    password: z.string().min(8, { message: '비밀번호는 8자 이상이어야 합니다.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, signup } = useAuth();
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });


  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    const user = login(values.email, values.password);
    if (user) {
      toast({ title: '로그인 성공!', description: `다시 오신 것을 환영합니다, ${user.name}님!` });
      router.push('/profile');
    } else {
      toast({
        variant: 'destructive',
        title: '로그인 실패',
        description: '이메일과 비밀번호를 확인해주세요.',
      });
      loginForm.reset();
    }
  }

  function onSignupSubmit(values: z.infer<typeof signupSchema>) {
    const newUser = signup(values.name, values.email, values.password);
    if (newUser) {
      toast({ title: '계정이 생성되었습니다!', description: `환영합니다, ${newUser.name}님!` });
      router.push('/profile');
    } else {
      toast({
        variant: 'destructive',
        title: '회원가입 실패',
        description: '이 이메일을 사용하는 사용자가 이미 존재할 수 있습니다.',
      });
    }
  }

  return (
    <div className="w-full">
        <div className="text-center mb-8 flex flex-col items-center">
            <Logo />
            <h2 className="mt-6 text-center text-3xl font-headline tracking-tight text-foreground">
                계정에 로그인하거나 새 계정을 만드세요
            </h2>
        </div>
        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">로그인</TabsTrigger>
                <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>이메일 주소</FormLabel>
                                <FormControl>
                                    <Input placeholder="you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>비밀번호</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                            {loginForm.formState.isSubmitting ? '로그인 중...' : '로그인'}
                        </Button>
                    </form>
                </Form>
            </TabsContent>
            <TabsContent value="signup">
                 <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                        <FormField
                            control={signupForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>이름</FormLabel>
                                <FormControl>
                                    <Input placeholder="이름" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signupForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>이메일 주소</FormLabel>
                                <FormControl>
                                    <Input placeholder="you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signupForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>비밀번호</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="8자 이상" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={signupForm.formState.isSubmitting}>
                            {signupForm.formState.isSubmitting ? '계정 생성 중...' : '계정 만들기'}
                        </Button>
                    </form>
                </Form>
            </TabsContent>
        </Tabs>
    </div>
  );
}
