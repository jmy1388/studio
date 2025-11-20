'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Logo from './logo';
import { PlusCircle, Search, X, Tags } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    // Redirect to home page for searching
    router.push(`/?${params.toString()}`);
     if(pathname !== '/') {
        // If we are not on the homepage, a search action should navigate to the homepage.
        // We use window.location to force a full page reload which will pick up the new query param.
        // This is not ideal, but it's the simplest way to handle this for now.
        window.location.href = `/?${params.toString()}`;
    }
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className={cn('mr-4 flex transition-all duration-300', isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100')}>
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
            {isSearchOpen && (
              <form onSubmit={handleSearchSubmit} className="absolute left-0 w-full px-4 sm:px-6 flex items-center gap-2 animate-fade-in-up">
                 <Search className="absolute left-7 sm:left-9 h-5 w-5 text-muted-foreground" />
                 <Input 
                    type="search"
                    placeholder="제목, 내용, 작가 또는 태그로 검색"
                    className="pl-10 w-full h-10 text-base rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                 />
                 <Button type="button" variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                    <X className="h-5 w-5"/>
                 </Button>
              </form>
            )}

            <div className={cn('flex items-center space-x-2 transition-opacity', isSearchOpen ? 'opacity-0' : 'opacity-100')}>
                <Button asChild variant="ghost">
                  <Link href="/keywords">
                    <Tags className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">키워드</span>
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/submit">
                    <PlusCircle className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">글쓰기</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                    <Search className="h-5 w-5" />
                    <span className="sr-only">검색</span>
                </Button>
            </div>
        </div>
      </div>
    </header>
  );
}
