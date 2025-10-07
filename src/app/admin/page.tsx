'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Newspaper, MessageCircleWarning, MessageSquare, CheckCircle2 } from 'lucide-react';
import { collection, collectionGroup, query, where } from 'firebase/firestore';
import type { NewsArticle, ForumPost, Comment } from '@/lib/mock-data';

export default function AdminDashboardPage() {
  const { firestore } = useFirebase();

  const newsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'news_articles') : null),
    [firestore]
  );
  const { data: newsArticles, isLoading: isLoadingNews } = useCollection<NewsArticle>(newsQuery);

  const forumQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'forum_posts') : null),
    [firestore]
  );
  const { data: forumPosts, isLoading: isLoadingForum } = useCollection<ForumPost>(forumQuery);

  const commentsQuery = useMemoFirebase(
    () => (firestore ? collectionGroup(firestore, 'comments') : null),
    [firestore]
  );
  const { data: allComments, isLoading: isLoadingComments } = useCollection<Comment>(commentsQuery);

  const pendingCommentsCount = allComments?.filter(c => !c.isApproved).length ?? 0;
  const approvedCommentsCount = allComments?.filter(c => c.isApproved).length ?? 0;
  
  const StatCard = ({ title, value, icon: Icon, isLoading, description }: { title: string, value: number, icon: React.ElementType, isLoading: boolean, description?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-16 bg-muted animate-pulse rounded-md" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total News Articles"
          value={newsArticles?.length ?? 0}
          icon={Newspaper}
          isLoading={isLoadingNews}
        />
        <StatCard
          title="Total Forum Posts"
          value={forumPosts?.length ?? 0}
          icon={MessageSquare}
          isLoading={isLoadingForum}
        />
        <StatCard
          title="Pending Comments"
          value={pendingCommentsCount}
          icon={MessageCircleWarning}
          isLoading={isLoadingComments}
          description="Awaiting moderation"
        />
        <StatCard
          title="Approved Comments"
          value={approvedCommentsCount}
          icon={CheckCircle2}
          isLoading={isLoadingComments}
          description="Visible to the public"
        />
      </div>
    </div>
  );
}
