'use client';

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
import { collectionGroup, doc, updateDoc, deleteDoc, getDoc, DocumentReference } from 'firebase/firestore';

export default function AdminCommentsPage() {
  const { firestore } = useFirebase();

  const commentsQuery = useMemoFirebase(
    () => (firestore ? collectionGroup(firestore, 'comments') : null),
    [firestore]
  );
  
  const { data: comments, isLoading } = useCollection<Comment>(commentsQuery);

  const handleApprove = async (comment: Comment & { ref?: DocumentReference }) => {
    if (!firestore || !comment.ref) return;
    await updateDoc(comment.ref, { isApproved: true });
  };

  const handleRemove = async (comment: Comment & { ref?: DocumentReference }) => {
    if (!firestore || !comment.ref) return;
    await deleteDoc(comment.ref);
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
                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-600" onClick={() => handleApprove(comment)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRemove(comment)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                     {comment.isApproved && (
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRemove(comment)}>
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
