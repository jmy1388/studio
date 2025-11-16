
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import Header from '@/components/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'oob',
  description: '모든 주제에 대한 작가들의 이야기, 생각, 전문 지식을 만나보세요.',
  icons: [{ rel: "icon", url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>"}]
};

function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-6 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold text-foreground">oob</p>
            <p>&copy; {new Date().getFullYear()} oob. All rights reserved.</p>
          </div>
          <div className="text-center md:text-right">
            <h4 className="font-semibold">청소년보호정책</h4>
            <p>청소년보호책임자: 홍길동</p>
            <p>이메일: <a href="mailto:privacy@example.com" className="hover:underline">privacy@example.com</a></p>
            <p>
              청소년 유해 정보 신고: {' '}
              <a href="https://www.kocsc.or.kr/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                방송통신심의위원회
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased flex flex-col')}>
        <FirebaseClientProvider>
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
