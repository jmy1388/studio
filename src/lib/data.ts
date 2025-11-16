import { PlaceHolderImages, type ImagePlaceholder } from './placeholder-images';
import { User as FirebaseUser } from 'firebase/auth';

// This is the shape of the data we'll store in Firestore
export interface UserProfile {
  id: string; // Firebase Auth UID
  username: string;
  email: string;
  bio: string;
  photoURL?: string;
  readingList?: string[]; // Array of article IDs
}


export interface Article {
  id:string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  imageId: string;
  authorId: string; // Corresponds to UserProfile ID (Firebase Auth UID)
  createdAt: string; // Should be a timestamp
  tags: string[];
  likeCount: number;
}


// Mock data is no longer the source of truth, but can be useful for placeholders or initial structure.
// We will primarily fetch from Firestore.

export const getImage = (id: string): ImagePlaceholder | undefined => {
    return PlaceHolderImages.find(img => img.id === id);
}

// These functions below are now deprecated in favor of direct Firestore calls,
// but are kept for reference or if parts of the app still use them temporarily.

export const getArticles = (): Article[] => [];
export const getArticleBySlug = (slug: string): Article | undefined => undefined;
export const getAuthor = (id: string): UserProfile | undefined => undefined;
export const getArticlesByAuthor = (authorId: string): Article[] => [];
export const findUser = (email: string, password?: string): UserProfile | undefined => undefined;
export const addUser = (user: Omit<UserProfile, 'id'>): UserProfile => ({...user, id: 'temp'});
export const addArticle = (article: Omit<Article, 'id' | 'slug' | 'createdAt'>): Article => ({
    ...article, 
    id: 'temp',
    slug: 'temp',
    createdAt: new Date().toISOString(),
    likeCount: 0,
});
