'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { ReplySection } from './reply-section';
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

interface Reply {
  id: string;
  content: string;
  author: string;
  authorId: string;
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

export default function ForumTopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params?.topicId as string;
  const { firestore } = useFirebase();

  // Memoize Firestore references
  const postRef = useMemoFirebase(
    () => firestore ? doc(firestore, 'forum_posts', topicId) : null,
    [firestore, topicId]
  );

  const repliesQuery = useMemoFirebase(
    () => firestore ? query(
      collection(firestore, 'forum_posts', topicId, 'replies'),
      orderBy('createdAt', 'asc')
    ) : null,
    [firestore, topicId]
  );

  // Real-time data fetching
  const { data: post, isLoading: postLoading, error: postError } = useDoc<ForumPost>(postRef);
  const { data: replies, isLoading: repliesLoading } = useCollection<Reply>(repliesQuery);

  // Loading state
  if (postLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading discussion...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (postError || !post) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This discussion could not be found or has been removed.
          </AlertDescription>
        </Alert>
        <button 
          onClick={() => router.push('/forum')}
          className="mt-4 text-primary hover:underline"
        >
          ← Back to Forum
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Post Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold font-headline">{post.title}</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Started by <span className="font-medium">{post.author}</span></span>
          <span>•</span>
          <span>{post.createdAt ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Just now'}</span>
          <span>•</span>
          <Badge 
            variant="secondary" 
            className={categoryColors[post.category] || 'bg-gray-100 text-gray-800'}
          >
            {categoryLabels[post.category] || post.category}
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Original Post */}
        <Card className="bg-secondary">
          <CardHeader className="flex flex-row items-start gap-4">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {post.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{post.author}</CardTitle>
              <CardDescription>
                {post.createdAt 
                  ? new Date(post.createdAt.toDate()).toLocaleString()
                  : 'Just now'
                }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>
          </CardContent>
        </Card>

        {/* Replies */}
        {repliesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading replies...</span>
          </div>
        ) : replies && replies.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">
                {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
              </h2>
            </div>
            <div className="space-y-4">
              {replies.map((reply) => (
                <Card key={reply.id}>
                  <CardHeader className="flex flex-row items-start gap-4 pb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                        {reply.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{reply.author}</CardTitle>
                      <CardDescription className="text-xs">
                        {reply.createdAt 
                          ? new Date(reply.createdAt.toDate()).toLocaleString()
                          : 'Just now'
                        }
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{reply.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}

        <Separator />

        {/* Reply Form */}
        <ReplySection postId={topicId} />
      </div>
    </div>
  );
}
