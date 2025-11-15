'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import Logo from './logo';
import { UserNav } from './user-nav';
import { PlusCircle } from 'lucide-react';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {loading ? null : user ? (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  글쓰기
                </Link>
              </Button>
              <UserNav />
            </>
          ) : (
            <Button asChild>
              <Link href="/login">로그인 / 회원가입</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
