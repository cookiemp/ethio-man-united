'use client';

import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { useMemoFirebase } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, MessageSquare, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  authorId: string;
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

export default function AdminForumPage() {
  const { firestore } = useFirebase();
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all forum posts
  const forumQuery = useMemoFirebase(
    () => firestore ? query(
      collection(firestore, 'forum_posts'),
      orderBy('createdAt', 'desc')
    ) : null,
    [firestore]
  );

  const { data: posts, isLoading } = useCollection<ForumPost>(forumQuery);

  const handleDeletePost = async () => {
    if (!deletePostId || !firestore) return;

    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      // Delete all replies first (client-side with authenticated user)
      const repliesRef = collection(firestore, 'forum_posts', deletePostId, 'replies');
      const repliesSnap = await getDocs(repliesRef);
      
      const deletePromises = repliesSnap.docs.map(replyDoc => 
        deleteDoc(doc(firestore, 'forum_posts', deletePostId, 'replies', replyDoc.id))
      );
      await Promise.all(deletePromises);

      // Delete the forum post
      const postRef = doc(firestore, 'forum_posts', deletePostId);
      await deleteDoc(postRef);

      setSuccess('Forum post deleted successfully');
      setDeletePostId(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Delete error:', err);
      if (err?.code === 'permission-denied') {
        setError('You do not have permission to delete this post. Please ensure you are logged in as admin.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete post');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading forum posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Forum Moderation</h1>
        <p className="text-muted-foreground mt-1">
          Manage forum posts and discussions
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {!posts || posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Forum Posts</h3>
            <p className="text-muted-foreground text-center">
              There are no forum posts to moderate yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Forum Posts ({posts.length})</CardTitle>
            <CardDescription>
              View and manage all community discussions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-center">Category</TableHead>
                  <TableHead className="text-center">Replies</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {post.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{post.author}</span>
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
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletePostId(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Forum Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this forum post and all its replies.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Post'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
