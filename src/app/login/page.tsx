
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
import { Separator } from '@/components/ui/separator';
import { ChromeIcon, ForwardIcon } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
  password: z.string().min(1, { message: '비밀번호를 입력해주세요.' }),
});

const signupSchema = z.object({
    name: z.string().min(2, { message: '이름은 2자 이상이어야 합니다.' }),
    email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
    password: z.string().min(8, { message: '비밀번호는 8자 이상이어야 합니다.' }),
});

const KakaoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 4.477 0 10C0 13.989 2.548 17.408 6.182 19.01L5.618 22.128L9.382 20.033C10.211 20.354 11.091 20.526 12 20.526C18.627 20.526 24 16.049 24 10.526C24 4.904 18.627 0 12 0Z" fill="#391B1B"/>
    </svg>
)

const NaverIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.293 13.7322H7.707V10.2682L12.033 5.95624H20.293V17.9562H11.967L16.293 13.7322Z" fill="#03C75A"/>
    </svg>
)

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, signup, signInWithGoogle } = useAuth();
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });


  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    try {
        await login(values.email, values.password);
        toast({ title: '로그인 성공!', description: `다시 오신 것을 환영합니다!` });
        router.push('/profile');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: '로그인 실패',
            description: '이메일과 비밀번호를 확인해주세요.',
        });
        loginForm.reset();
    }
  }

  async function onSignupSubmit(values: z.infer<typeof signupSchema>) {
    try {
        await signup(values.name, values.email, values.password);
        toast({ title: '계정이 생성되었습니다!', description: `환영합니다, ${values.name}님!` });
        router.push('/profile');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: '회원가입 실패',
            description: '이 이메일을 사용하는 사용자가 이미 존재할 수 있습니다.',
        });
    }
  }

  const handleGoogleSignIn = async () => {
    try {
        await signInWithGoogle();
        router.push('/profile');
        toast({ title: '로그인 성공!', description: '구글 계정으로 로그인되었습니다.' });
    } catch(error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: '구글 로그인 실패',
            description: '나중에 다시 시도해주세요.',
        });
    }
  }

  const handleSocialLogin = (provider: 'kakao' | 'naver') => {
    toast({
        title: `${provider} 로그인`,
        description: '현재 준비 중인 기능입니다.',
    })
  }

  return (
    <div className="w-full max-w-sm mx-auto">
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
        <div className="my-6">
            <Separator />
            <div className="relative">
                <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card px-2 text-sm text-muted-foreground">또는</p>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-3">
             <Button variant="outline" onClick={handleGoogleSignIn}>
                <ChromeIcon className="mr-2 h-4 w-4" />
                Google 계정으로 계속하기
            </Button>
            <Button variant="outline" onClick={() => handleSocialLogin('kakao')}>
                <KakaoIcon />
                카카오 계정으로 계속하기
            </Button>
            <Button variant="outline" onClick={() => handleSocialLogin('naver')}>
                <NaverIcon />
                네이버 계정으로 계속하기
            </Button>
        </div>
    </div>
  );
}
