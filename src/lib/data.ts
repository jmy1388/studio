import type { Timestamp } from 'firebase/firestore';
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export interface Article {
  id:string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  imageId: string;
  authorUsername?: string;
  createdAt: Timestamp;
  tags: string[];
  likeCount: number;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    bio: string;
    readingList: string[]; // array of article IDs
    readingHistory: string[]; // array of article IDs
}


// Mock data is no longer the source of truth, but can be useful for placeholders or initial structure.
// We will primarily fetch from Firestore.

export const getImage = (id: string): ImagePlaceholder | undefined => {
    return PlaceHolderImages.find(img => img.id === id);
}
