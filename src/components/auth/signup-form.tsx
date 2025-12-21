'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializeFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function SignupForm() {
    const [userid, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic ID validation (alphanumeric, etc.)
        const idRegex = /^[a-zA-Z0-9_]+$/;
        if (!idRegex.test(userid)) {
            setError('아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            setLoading(false);
            return;
        }

        // Append dummy domain for Firebase Auth
        const email = `${userid}@oob.local`;

        try {
            const { auth } = initializeFirebase();
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            if (userCredential.user && displayName) {
                await updateProfile(userCredential.user, {
                    displayName: displayName
                });
            }

            router.push('/'); // Redirect to home on success
        } catch (err: any) {
            console.error('Signup error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('이미 사용 중인 아이디입니다.');
            } else if (err.code === 'auth/invalid-email') {
                setError('유효하지 않은 아이디 형식입니다.');
            } else if (err.code === 'auth/weak-password') {
                setError('비밀번호가 너무 약합니다.');
            } else {
                setError('회원가입 중 문제가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">회원가입</CardTitle>
                <CardDescription>
                    새로운 계정을 만들기 위해 정보를 입력하세요.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="displayName">이름 (닉네임)</Label>
                        <Input
                            id="displayName"
                            placeholder="홍길동"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>
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
                        <p className="text-xs text-muted-foreground">영문, 숫자, 밑줄(_) 사용 가능</p>
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
                        <p className="text-xs text-muted-foreground">최소 6자 이상 입력해주세요.</p>
                    </div>
                    {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading ? '가입 중...' : '회원가입'}
                    </Button>
                    <div className="text-sm text-center text-muted-foreground">
                        이미 계정이 있으신가요?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            로그인
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
