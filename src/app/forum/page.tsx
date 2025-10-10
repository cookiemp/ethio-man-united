'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, MessageSquare, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/client';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId: string;
  isApproved: boolean;
  replyCount: number;
  createdAt: any;
}

const categoryColors: Record<string, string> = {
  'match-discussion': 'bg-blue-100 text-blue-800',
  'transfers': 'bg-green-100 text-green-800',
  'general': 'bg-gray-100 text-gray-800',
  'fan-zone': 'bg-purple-100 text-purple-800',
};

const categoryLabels: Record<string, string> = {
  'match-discussion': 'Match Discussion',
  'transfers': 'Transfers',
  'general': 'General',
  'fan-zone': 'Fan Zone',
};

const ITEMS_PER_PAGE = 20;

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [firstVisible, setFirstVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageHistory, setPageHistory] = useState<DocumentSnapshot[]>([]);

  async function loadPosts(direction: 'next' | 'prev' | 'initial' = 'initial') {
    try {
      setIsLoading(true);
      const forumPostsRef = collection(db, 'forum_posts');
      
      let forumQuery;
      
      if (direction === 'next' && lastVisible) {
        forumQuery = query(
          forumPostsRef,
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(ITEMS_PER_PAGE + 1)
        );
      } else if (direction === 'prev' && pageHistory.length > 0) {
        const prevCursor = pageHistory[pageHistory.length - 1];
        forumQuery = query(
          forumPostsRef,
          orderBy('createdAt', 'desc'),
          startAfter(prevCursor),
          limit(ITEMS_PER_PAGE + 1)
        );
      } else {
        forumQuery = query(
          forumPostsRef,
          orderBy('createdAt', 'desc'),
          limit(ITEMS_PER_PAGE + 1)
        );
      }

      const forumSnap = await getDocs(forumQuery);
      const fetchedPosts = forumSnap.docs.slice(0, ITEMS_PER_PAGE).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ForumPost[];

      setPosts(fetchedPosts);
      setHasMore(forumSnap.docs.length > ITEMS_PER_PAGE);

      if (forumSnap.docs.length > 0) {
        setFirstVisible(forumSnap.docs[0]);
        setLastVisible(forumSnap.docs[Math.min(ITEMS_PER_PAGE - 1, forumSnap.docs.length - 1)]);
      }

      // Update page history for prev navigation
      if (direction === 'next' && firstVisible) {
        setPageHistory(prev => [...prev, firstVisible]);
      } else if (direction === 'prev') {
        setPageHistory(prev => prev.slice(0, -1));
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading forum posts:', error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPosts('initial');
  }, []);

  const handleNext = () => {
    setCurrentPage(prev => prev + 1);
    loadPosts('next');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      loadPosts('prev');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-headline">Forum</h1>
            <p className="text-muted-foreground mt-1">Join the discussion with fellow fans</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline">Forum</h1>
          <p className="text-muted-foreground mt-1">
            Join the discussion with fellow fans
            {posts.length > 0 && (
              <span className="ml-2 text-sm">• Page {currentPage}</span>
            )}
          </p>
        </div>
        <Link href="/forum/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Topic
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to start a conversation!
          </p>
          <Link href="/forum/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">Topic</TableHead>
                <TableHead className="text-center">Category</TableHead>
                <TableHead className="text-center">Replies</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      href={`/forum/${post.id}`}
                      className="font-semibold text-primary hover:underline block"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {post.author}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant="secondary" 
                      className={categoryColors[post.category] || 'bg-gray-100 text-gray-800'}
                    >
                      {categoryLabels[post.category] || post.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{post.replyCount || 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {post.createdAt
                      ? new Date(post.createdAt.toDate()).toLocaleDateString()
                      : 'Just now'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {(currentPage > 1 || hasMore) && (
            <div className="flex justify-center items-center gap-4 mt-8 pb-4">
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
        </div>
      )}
    </div>
  );
}
