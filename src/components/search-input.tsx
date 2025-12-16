
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// 하이라이트 스타일을 위한 CSS 클래스 이름
const HIGHLIGHT_CLASS = 'search-highlight';
const HIGHLIGHT_ACTIVE_CLASS = 'search-highlight-active';

export default function SearchInput() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const highlightRefs = useRef<HTMLElement[]>([]);

  // 페이지 내 텍스트 하이라이트 함수
  const highlightText = useCallback((query: string) => {
    // 기존 하이라이트 제거
    clearHighlights();

    if (!query.trim()) {
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }

    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    const walker = document.createTreeWalker(
      mainContent,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node: Text | null;
    while ((node = walker.nextNode() as Text)) {
      if (node.textContent && node.textContent.toLowerCase().includes(query.toLowerCase())) {
        textNodes.push(node);
      }
    }

    let count = 0;
    const refs: HTMLElement[] = [];

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
      const parts = text.split(regex);

      if (parts.length > 1) {
        const fragment = document.createDocumentFragment();
        parts.forEach((part) => {
          if (part.toLowerCase() === query.toLowerCase()) {
            const mark = document.createElement('mark');
            mark.className = HIGHLIGHT_CLASS;
            mark.textContent = part;
            refs.push(mark);
            fragment.appendChild(mark);
            count++;
          } else {
            fragment.appendChild(document.createTextNode(part));
          }
        });
        textNode.parentNode?.replaceChild(fragment, textNode);
      }
    });

    highlightRefs.current = refs;
    setMatchCount(count);
    if (count > 0) {
      setCurrentMatch(1);
      scrollToMatch(0, refs);
    }
  }, []);

  // 하이라이트 제거 함수
  const clearHighlights = useCallback(() => {
    const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
    highlights.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
    highlightRefs.current = [];
  }, []);

  // 특정 매치로 스크롤
  const scrollToMatch = (index: number, refs: HTMLElement[] = highlightRefs.current) => {
    // 모든 active 클래스 제거
    refs.forEach(ref => ref.classList.remove(HIGHLIGHT_ACTIVE_CLASS));

    if (refs[index]) {
      refs[index].classList.add(HIGHLIGHT_ACTIVE_CLASS);
      refs[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 다음/이전 매치로 이동
  const goToNextMatch = () => {
    if (matchCount === 0) return;
    const next = currentMatch >= matchCount ? 1 : currentMatch + 1;
    setCurrentMatch(next);
    scrollToMatch(next - 1);
  };

  const goToPrevMatch = () => {
    if (matchCount === 0) return;
    const prev = currentMatch <= 1 ? matchCount : currentMatch - 1;
    setCurrentMatch(prev);
    scrollToMatch(prev - 1);
  };

  // 검색창 닫을 때 하이라이트 제거
  const handleClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    clearHighlights();
    setMatchCount(0);
    setCurrentMatch(0);
  };

  // 검색어 변경 시 실시간 하이라이트
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (isSearchOpen) {
        highlightText(searchQuery);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isSearchOpen, highlightText]);

  // ESC 키로 검색창 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        handleClose();
      }
      // Enter 키로 다음 매치, Shift+Enter로 이전 매치
      if (e.key === 'Enter' && isSearchOpen && matchCount > 0) {
        e.preventDefault();
        if (e.shiftKey) {
          goToPrevMatch();
        } else {
          goToNextMatch();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, matchCount, currentMatch]);

  return (
    <>

      {isSearchOpen ? (
        <div className="absolute left-0 w-full px-4 sm:px-6 flex items-center gap-2 animate-fade-in-up">
          <Search className="absolute left-7 sm:left-9 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="현재 페이지에서 검색..."
            className="pl-10 w-full h-10 text-base rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {matchCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
              <span>{currentMatch}/{matchCount}</span>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevMatch}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMatch}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}
          {matchCount === 0 && searchQuery.trim() && (
            <span className="text-sm text-muted-foreground whitespace-nowrap">결과 없음</span>
          )}
          <Button type="button" variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className={cn('flex items-center space-x-2 transition-opacity', isSearchOpen ? 'opacity-0' : 'opacity-100')}>
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
      )}
    </>
  );
}

// 정규식 특수문자 이스케이프
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
