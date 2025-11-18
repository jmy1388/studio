
import { collection, doc, Timestamp, writeBatch } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

// Helper function to create a slug from a title
const createSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

// Helper function to generate a random date within the last 14 days
const randomDateInPastTwoWeeks = (): Date => {
    const today = new Date();
    const fourteenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
    
    const randomTime = fourteenDaysAgo.getTime() + Math.random() * (today.getTime() - fourteenDaysAgo.getTime());
    
    return new Date(randomTime);
}

// All dummy articles have been removed as per the request.
export const articlesToSeed: any[] = [];

export const seedArticles = async (firestore: Firestore) => {
    // This function is intentionally left empty to prevent any data seeding.
    console.log('Data seeding is disabled.');
    return;
};
