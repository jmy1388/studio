
'use client';

import AuthGate from "@/components/auth-gate";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Article, UserProfile } from "@/lib/data";
import ArticleCard from "@/components/article-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from 'next/navigation'
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2 } from "lucide-react";
import { getImage } from "@/lib/data";

function ProfilePageContent() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const { firestore } = useFirebase();
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab')

    const userArticlesQuery = useMemoFirebase(() => user ? query(collection(firestore, 'articles'), where('authorUsername', '==', userProfile?.username)) : null, [firestore, user, userProfile]);
    const { data: userArticles, isLoading: articlesLoading } = useCollection<Article>(userArticlesQuery);
    
    const savedArticlesQuery = useMemoFirebase(() => {
        if (!userProfile || !userProfile.readingList || userProfile.readingList.length === 0) return null;
        return query(collection(firestore, 'articles'), where('id', 'in', userProfile.readingList));
    }, [firestore, userProfile]);
    const { data: savedArticles, isLoading: savedArticlesLoading } = useCollection<Article>(savedArticlesQuery);


    if (authLoading || !userProfile) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
    }

    const avatarImage = getImage('user-1'); // Placeholder
    const userInitials = userProfile.username.split(' ').map(n => n[0]).join('');

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-5xl">
            <header className="flex flex-col items-center text-center md:flex-row md:text-left gap-6 md:gap-8 mb-12">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 text-4xl">
                    {avatarImage && <AvatarImage src={user?.photoURL || avatarImage.imageUrl} alt={userProfile.username} data-ai-hint={avatarImage.imageHint} />}
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl">{userProfile.username}</h1>
                    <p className="mt-2 text-base text-muted-foreground max-w-xl">{userProfile.bio}</p>
                </div>
            </header>

            <Tabs defaultValue={tab || "written"} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                    <TabsTrigger value="written">내 기사</TabsTrigger>
                    <TabsTrigger value="saved">저장된 기사</TabsTrigger>
                </TabsList>
                <TabsContent value="written" className="mt-0">
                    {articlesLoading ? <div className="text-center py-16"><Loader2 className="mx-auto h-8 w-8 animate-spin"/></div> :
                     userArticles && userArticles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {userArticles.map((article, index) => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    authorUsername={article.authorUsername}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 md:py-20 bg-card rounded-lg shadow-sm">
                            <h3 className="font-headline text-xl md:text-2xl">아직 기사가 없습니다</h3>
                            <p className="text-muted-foreground mt-2">아직 작성한 기사가 없습니다. 생각을 공유해 보세요!</p>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="saved" className="mt-0">
                    {savedArticlesLoading ? <div className="text-center py-16"><Loader2 className="mx-auto h-8 w-8 animate-spin"/></div> :
                     savedArticles && savedArticles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {savedArticles.map((article, index) => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    authorUsername={article.authorUsername}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 md:py-20 bg-card rounded-lg shadow-sm">
                            <h3 className="font-headline text-xl md:text-2xl">저장된 기사 없음</h3>
                            <p className="text-muted-foreground mt-2">피드를 둘러보고 나중에 읽을 기사를 저장하세요.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

        </div>
    );
}


export default function ProfilePage() {
    return (
        <AuthGate>
            <ProfilePageContent />
        </AuthGate>
    );
}
