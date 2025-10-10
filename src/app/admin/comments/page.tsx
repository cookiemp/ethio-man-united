'use client';

import { useState } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Comment } from '@/lib/mock-data';
import { collectionGroup, DocumentReference } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdminCommentsPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [loadingCommentId, setLoadingCommentId] = useState<string | null>(null);

  const commentsQuery = useMemoFirebase(
    () => (firestore ? collectionGroup(firestore, 'comments') : null),
    [firestore]
  );
  
  const { data: comments, isLoading } = useCollection<Comment>(commentsQuery);

  // Extract parent type and ID from document reference path
  const getCommentPath = (comment: Comment & { ref?: DocumentReference }) => {
    if (!comment.ref) return null;
    
    // Path format: "news_articles/{id}/comments/{commentId}" or "forum_posts/{id}/comments/{commentId}"
    const pathParts = comment.ref.path.split('/');
    if (pathParts.length !== 4) return null;
    
    return {
      parentType: pathParts[0], // 'news_articles' or 'forum_posts'
      parentId: pathParts[1],
      commentId: pathParts[3]
    };
  };

  const handleApprove = async (comment: Comment & { ref?: DocumentReference }) => {
    const pathInfo = getCommentPath(comment);
    if (!pathInfo) {
      toast({
        title: 'Error',
        description: 'Unable to determine comment path',
        variant: 'destructive',
      });
      return;
    }

    setLoadingCommentId(comment.id);

    try {
      const response = await fetch(`/api/admin/comments/${pathInfo.commentId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentType: pathInfo.parentType,
          parentId: pathInfo.parentId,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Comment approved successfully',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to approve comment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error approving comment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoadingCommentId(null);
    }
  };

  const handleRemove = async (comment: Comment & { ref?: DocumentReference }) => {
    const pathInfo = getCommentPath(comment);
    if (!pathInfo) {
      toast({
        title: 'Error',
        description: 'Unable to determine comment path',
        variant: 'destructive',
      });
      return;
    }

    setLoadingCommentId(comment.id);

    try {
      const response = await fetch(
        `/api/admin/comments/${pathInfo.commentId}/delete?parentType=${pathInfo.parentType}&parentId=${pathInfo.parentId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Comment deleted successfully',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete comment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoadingCommentId(null);
    }
  };

  const sortedComments = comments
    ?.sort((a, b) => {
      const aDate = (a.createdAt as any)?.toDate?.() || 0;
      const bDate = (b.createdAt as any)?.toDate?.() || 0;
      return bDate - aDate;
    });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-bold font-headline mb-2">Comment Moderation</h1>
        <p className="text-muted-foreground">Approve or remove comments from users.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Comments</CardTitle>
          <CardDescription>Review comments from news articles and forum posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Comment</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={4}>Loading comments...</TableCell></TableRow>}
              {!isLoading && sortedComments?.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="text-muted-foreground">{comment.content}</TableCell>
                  <TableCell className="font-medium">{(comment as any).author || 'Anonymous'}</TableCell>
                  <TableCell>
                    {comment.isApproved ? (
                       <Badge variant="default" className="bg-green-600">Approved</Badge>
                    ) : (
                       <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!comment.isApproved && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-green-600 hover:text-green-600" 
                          onClick={() => handleApprove(comment)}
                          disabled={loadingCommentId === comment.id}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive" 
                          onClick={() => handleRemove(comment)}
                          disabled={loadingCommentId === comment.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                     {comment.isApproved && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive" 
                          onClick={() => handleRemove(comment)}
                          disabled={loadingCommentId === comment.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     )}
                  </TableCell>
                </TableRow>
              ))}
               {!isLoading && sortedComments?.length === 0 && <TableRow><TableCell colSpan={4}>No comments to moderate.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
