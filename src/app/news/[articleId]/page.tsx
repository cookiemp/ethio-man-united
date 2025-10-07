'use client';

import { newsArticles } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, User as UserIcon } from 'lucide-react';
import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import type { Comment } from '@/lib/mock-data';

function CommentForm({ articleId }: { articleId: string }) {
  const { firestore, auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [comment, setComment] = useState('');

  const handleSignIn = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  const handleSubmitComment = () => {
    if (!firestore || !user || !comment.trim()) return;

    const commentsRef = collection(firestore, 'news_articles', articleId, 'comments');
    addDocumentNonBlocking(commentsRef, {
      content: comment,
      authorId: user.uid,
      author: user.isAnonymous ? 'Anonymous Fan' : user.displayName || 'Fan',
      createdAt: serverTimestamp(),
      isApproved: false,
    });
    setComment('');
  };

  if (isUserLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
          <p className="mb-4">You need to be signed in to leave a comment.</p>
          <Button onClick={handleSignIn}>Sign in Anonymously</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Textarea 
          placeholder="Write your comment here..." 
          rows={5} 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmitComment} disabled={!comment.trim()}>Submit Comment</Button>
      </CardFooter>
    </Card>
  );
}

// Page component is now async to handle params correctly.
export default function NewsArticlePage({ params }: { params: { articleId: string } }) {
  const { articleId } = params;
  const article = newsArticles.find((a) => a.id === articleId);
  const { firestore } = useFirebase();

  const commentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'news_articles', articleId, 'comments');
  }, [firestore, articleId]);
  
  const { data: comments, isLoading: isLoadingComments } = useCollection<Comment>(commentsQuery);

  if (!article) {
    notFound();
  }
  
  const sortedComments = comments?.sort((a, b) => {
    const aDate = (a.createdAt as any)?.toDate?.() || 0;
    const bDate = (b.createdAt as any)?.toDate?.() || 0;
    return bDate - aDate;
  });

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
        <Image
          src={article.thumbnailUrl}
          alt={article.headline}
          fill
          style={{ objectFit: 'cover' }}
          data-ai-hint={article.thumbnailHint}
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
              <span>{new Date(article.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <article className="prose prose-lg max-w-none mb-12">
        <p className="text-xl leading-relaxed text-foreground/80">{article.story}</p>
      </article>
      
      <Separator />

      <div className="mt-12">
        <h2 className="text-3xl font-bold font-headline mb-6">Comments ({comments?.length || 0})</h2>
        <div className="space-y-6 mb-8">
          {isLoadingComments && <p>Loading comments...</p>}
          {sortedComments && sortedComments.map((comment) => (
            <Card key={comment.id} className={!comment.isApproved ? 'bg-muted/50' : ''}>
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <Avatar>
                  <AvatarFallback>{(comment.author || 'A').charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">{comment.author || 'Anonymous'}</CardTitle>
                    {!comment.isApproved && <Badge variant="secondary">Pending</Badge>}
                  </div>
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
          {!isLoadingComments && comments?.length === 0 && (
            <p className="text-muted-foreground">Be the first to comment on this article.</p>
          )}
        </div>

        <h3 className="text-2xl font-bold font-headline mb-4">Leave a Comment</h3>
        <CommentForm articleId={articleId} />
      </div>
    </div>
  );
}
