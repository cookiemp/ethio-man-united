'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useFirebase, useUser } from '@/firebase';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export function CommentSection({ articleId }: { articleId: string }) {
  const { firestore, auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  const handleSubmitComment = async () => {
    if (!firestore || !user || !comment.trim()) return;

    setIsSubmitting(true);
    const commentsRef = collection(firestore, 'news_articles', articleId, 'comments');
    try {
      await addDoc(commentsRef, {
        content: comment,
        authorId: user.uid,
        author: user.isAnonymous ? 'Anonymous Fan' : user.displayName || 'Fan',
        createdAt: serverTimestamp(),
        isApproved: false,
      });
      setComment('');
      // Refresh the page to show the new comment
      window.location.reload();
    } catch (error) {
      console.error("Error adding comment: ", error);
    } finally {
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting}
        />
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmitComment} 
          disabled={!comment.trim() || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Comment'}
        </Button>
      </CardFooter>
    </Card>
  );
}