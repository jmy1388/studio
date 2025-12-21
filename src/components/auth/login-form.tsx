'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializeFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function LoginForm() {
    const [userid, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Append dummy domain for Firebase Auth
        const email = `${userid}@oob.local`;

        try {
            const { auth } = initializeFirebase();
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/'); // Redirect to home on success
        } catch (err: any) {
            console.error('Login error:', err);
            // Basic error mapping for better UX
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-email') {
                setError('아이디 또는 비밀번호가 올바르지 않습니다.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.');
            } else {
                setError('로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">로그인</CardTitle>
                <CardDescription>
                    아이디와 비밀번호를 입력하여 로그인하세요.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="userid">아이디</Label>
                        <Input
                            id="userid"
                            type="text"
                            placeholder="아이디를 입력하세요"
                            required
                            value={userid}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">비밀번호</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                        계정이 없으신가요?{' '}
                        <Link href="/signup" className="text-primary hover:underline">
                            회원가입
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
