import { collection, getDocs, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { NewsPageClient } from './news-page-client';
import type { NewsArticle } from '@/lib/mock-data';

const ITEMS_PER_PAGE = 12;

// Enable ISR - revalidate every 5 minutes
export const revalidate = 300;

// Initialize Firebase for server-side
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default async function NewsPage() {
  // Fetch initial articles on server
  const articlesRef = collection(db, 'news_articles');
  const articlesQuery = query(articlesRef, orderBy('createdAt', 'desc'), firestoreLimit(ITEMS_PER_PAGE));
  const articlesSnap = await getDocs(articlesQuery);
  
  const initialArticles = articlesSnap.docs.map(doc => {
    const data = doc.data();
    // Convert Firestore timestamps to serializable format
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt ? data.createdAt.toMillis() : null,
      updatedAt: data.updatedAt ? data.updatedAt.toMillis() : null,
    };
  }) as NewsArticle[];

  // Render on server with initial data, client handles pagination
  return <NewsPageClient initialArticles={initialArticles} />;
}
