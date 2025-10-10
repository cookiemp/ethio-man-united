'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NewsArticle } from '@/lib/mock-data';

const ITEMS_PER_PAGE = 12;

interface NewsPageClientProps {
  initialArticles: NewsArticle[];
}

export function NewsPageClient({ initialArticles }: NewsPageClientProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [firstVisible, setFirstVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(initialArticles.length >= ITEMS_PER_PAGE);
  const [pageHistory, setPageHistory] = useState<DocumentSnapshot[]>([]);

  async function loadArticles(direction: 'next' | 'prev' | 'initial' = 'initial') {
    try {
      setIsLoading(true);
      const articlesRef = collection(db, 'news_articles');
      
      let articlesQuery;
      
      if (direction === 'next' && lastVisible) {
        articlesQuery = query(
          articlesRef,
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(ITEMS_PER_PAGE + 1)
        );
      } else if (direction === 'prev' && pageHistory.length > 0) {
        const prevCursor = pageHistory[pageHistory.length - 1];
        articlesQuery = query(
          articlesRef,
          orderBy('createdAt', 'desc'),
          startAfter(prevCursor),
          limit(ITEMS_PER_PAGE + 1)
        );
      } else {
        articlesQuery = query(
          articlesRef,
          orderBy('createdAt', 'desc'),
          limit(ITEMS_PER_PAGE + 1)
        );
      }

      const articlesSnap = await getDocs(articlesQuery);
      const fetchedArticles = articlesSnap.docs.slice(0, ITEMS_PER_PAGE).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsArticle[];

      setArticles(fetchedArticles);
      setHasMore(articlesSnap.docs.length > ITEMS_PER_PAGE);

      if (articlesSnap.docs.length > 0) {
        setFirstVisible(articlesSnap.docs[0]);
        setLastVisible(articlesSnap.docs[Math.min(ITEMS_PER_PAGE - 1, articlesSnap.docs.length - 1)]);
      }

      // Update page history for prev navigation
      if (direction === 'next' && firstVisible) {
        setPageHistory(prev => [...prev, firstVisible]);
      } else if (direction === 'prev') {
        setPageHistory(prev => prev.slice(0, -1));
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading articles:', error);
      setIsLoading(false);
    }
  }

  const handleNext = () => {
    setCurrentPage(prev => prev + 1);
    loadArticles('next');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      loadArticles('prev');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Latest News</h1>
        {articles.length > 0 && (
          <span className="text-sm text-muted-foreground">Page {currentPage}</span>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No news articles yet.</p>
          <p className="text-sm text-muted-foreground">
            Login to the <Link href="/admin" className="text-primary hover:underline">admin panel</Link> to create your first article.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <Link href={`/news/${article.id}`} key={article.id} className="block group">
                <Card
                  className="flex flex-col overflow-hidden h-full transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl"
                >
                  <CardHeader className="p-0">
                    {article.thumbnailUrl ? (
                      <div className="relative h-56 w-full">
                        <Image
                          src={article.thumbnailUrl}
                          alt={article.headline}
                          fill
                          style={{ objectFit: 'cover' }}
                          priority={index < 3 && currentPage === 1}
                        />
                      </div>
                    ) : (
                      <div className="relative h-56 w-full bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center">
                        <div className="text-white text-center p-6">
                          <div className="text-6xl font-bold font-headline mb-2">MUFC</div>
                          <div className="text-sm opacity-80">Manchester United</div>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6 flex-grow">
                    <CardTitle className="font-headline text-xl mb-2 leading-tight">
                      {article.headline}
                    </CardTitle>
                    <CardDescription>{(article.story || article.content || '').substring(0, 100)}...</CardDescription>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-between items-center">
                    <div>
                      <Badge variant="secondary">
                        {article.createdAt 
                          ? new Date(
                              typeof article.createdAt === 'number' 
                                ? article.createdAt 
                                : (article.createdAt as any).toDate?.()
                            ).toLocaleDateString()
                          : article.date 
                          ? new Date(article.date).toLocaleDateString() 
                          : 'N/A'
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center text-primary font-semibold text-sm">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {(currentPage > 1 || hasMore) && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                onClick={handlePrev}
                disabled={currentPage === 1 || isLoading}
                variant="outline"
                size="lg"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <span className="text-sm font-medium px-4">
                Page {currentPage}
              </span>
              
              <Button
                onClick={handleNext}
                disabled={!hasMore || isLoading}
                variant="outline"
                size="lg"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
