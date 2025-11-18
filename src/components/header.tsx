
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from './logo';
import { PlusCircle, User } from 'lucide-react';
import { UserNav } from './user-nav';
import { useAuth } from '@/hooks/use-auth';

export default function Header() {
  const { user, loading } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
            <Button asChild variant="ghost">
              <Link href="/submit">
                <PlusCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">글쓰기</span>
              </Link>
            </Button>
            { !loading && (
              user ? <UserNav /> : 
              <Button asChild>
                <Link href="/login">
                  <User className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">로그인</span>
                </Link>
              </Button>
            )}
        </div>
      </div>
    </header>
  );
}
