import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, User as UserIcon } from 'lucide-react';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import type { Comment, NewsArticle } from '@/lib/mock-data';
import { CommentSection } from './comment-section';

// Initialize Firebase for server-side
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Server component - can use async/await directly
export default async function NewsArticlePage({ 
  params 
}: { 
  params: Promise<{ articleId: string }> 
}) {
  const { articleId } = await params;
  
  // Fetch article from Firestore server-side
  const articleRef = doc(db, 'news_articles', articleId);
  const articleSnap = await getDoc(articleRef);
  
  if (!articleSnap.exists()) {
    notFound();
  }
  
  const article = { id: articleSnap.id, ...articleSnap.data() } as NewsArticle;
  
  // Fetch comments server-side
  const commentsRef = collection(db, 'news_articles', articleId, 'comments');
  const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));
  const commentsSnap = await getDocs(commentsQuery);
  
  const comments = commentsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comment[];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {article.thumbnailUrl ? (
        <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
          <Image
            src={article.thumbnailUrl}
            alt={article.headline}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8">
            <h1 className="text-4xl font-bold font-headline text-white mb-2">{article.headline}</h1>
            <div className="flex items-center gap-4 text-sm text-neutral-300">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {article.createdAt
                    ? new Date((article.createdAt as any).toDate()).toLocaleDateString()
                    : article.date
                    ? new Date(article.date).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-8xl font-bold font-headline mb-3">MUFC</div>
              <div className="text-xl opacity-90">Manchester United FC</div>
            </div>
          </div>
          <div className="mt-6">
            <h1 className="text-4xl font-bold font-headline mb-4">{article.headline}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {article.createdAt
                    ? new Date((article.createdAt as any).toDate()).toLocaleDateString()
                    : article.date
                    ? new Date(article.date).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <article className="prose prose-lg max-w-none mb-12">
        <p className="text-xl leading-relaxed text-foreground/80 whitespace-pre-wrap">{article.content || article.story}</p>
      </article>
      
      <Separator />

      <div className="mt-12">
        <h2 className="text-3xl font-bold font-headline mb-6">Comments ({comments.length})</h2>
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <Card 
              key={comment.id} 
              className={
                !comment.isApproved 
                  ? 'bg-muted/30 opacity-60 blur-[0.5px] transition-all duration-300' 
                  : 'transition-all duration-300'
              }
            >
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <Avatar className={!comment.isApproved ? 'opacity-50' : ''}>
                  <AvatarFallback>{(comment.author || 'A').charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base font-semibold">{comment.author || 'Anonymous'}</CardTitle>
                  <CardDescription className="text-xs">
                    {(comment.createdAt as any)?.toDate?.().toLocaleString() || 'Just now'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
          {comments.length === 0 && (
            <p className="text-muted-foreground">Be the first to comment on this article.</p>
          )}
        </div>

        <h3 className="text-2xl font-bold font-headline mb-4">Leave a Comment</h3>
        <CommentSection articleId={articleId} />
      </div>
    </div>
  );
}
