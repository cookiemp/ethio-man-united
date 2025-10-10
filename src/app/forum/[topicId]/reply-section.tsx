'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { collection, serverTimestamp, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

interface ReplySectionProps {
  postId: string;
}

export function ReplySection({ postId }: ReplySectionProps) {
  const router = useRouter();
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitReply = async () => {
    if (!firestore || !user || !replyContent.trim()) {
      setError('Please write a reply before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Add reply to subcollection
      const repliesRef = collection(firestore, 'forum_posts', postId, 'replies');
      await addDoc(repliesRef, {
        content: replyContent.trim(),
        authorId: user.uid,
        author: user.displayName || user.email || 'Anonymous User',
        createdAt: serverTimestamp(),
      });

      // Try to increment reply count on parent post (may fail if not owner)
      try {
        const postRef = doc(firestore, 'forum_posts', postId);
        await updateDoc(postRef, {
          replyCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (updateErr) {
        // Ignore permission errors on update - the reply was still added successfully
        console.log('Note: Could not update reply count (expected if not post owner)');
      }

      setReplyContent('');
      
      // Real-time updates will show the new reply automatically
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to submit reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
          <MessageSquarePlus className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Join the Conversation</h3>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to reply to this post.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/auth/login')}>
              Login
            </Button>
            <Button onClick={() => router.push('/auth/signup')}>
              Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold font-headline mb-4">Post a Reply</h3>
      <Card>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Textarea 
            placeholder="Write your reply here..." 
            rows={5}
            value={replyContent}
            onChange={(e) => {
              setReplyContent(e.target.value);
              setError('');
            }}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {replyContent.length} characters
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmitReply}
            disabled={!replyContent.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Submit Reply
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
