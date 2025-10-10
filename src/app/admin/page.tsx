'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { Newspaper, MessageCircleWarning, MessageSquare, CheckCircle2, Users, TrendingUp } from 'lucide-react';
import { collection, collectionGroup } from 'firebase/firestore';
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
  
  // Calculate total replies across all forum posts
  const totalReplies = forumPosts?.reduce((sum, post) => sum + ((post as any).replyCount || 0), 0) ?? 0;
  
  // Calculate total users (news articles + forum posts + comments authors)
  const usersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading: isLoadingUsers } = useCollection<any>(usersQuery);
  
  // Total content items
  const totalContent = (newsArticles?.length ?? 0) + (forumPosts?.length ?? 0) + (allComments?.length ?? 0) + totalReplies;
  
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
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        )}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-headline mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your Manchester United fan community</p>
      </div>
      
      {/* Primary Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Community Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Registered Users"
            value={users?.length ?? 0}
            icon={Users}
            isLoading={isLoadingUsers}
            description="Active community members"
          />
          <StatCard
            title="Total Content"
            value={totalContent}
            icon={TrendingUp}
            isLoading={isLoadingNews || isLoadingForum || isLoadingComments}
            description="Articles, posts, comments & replies"
          />
          <StatCard
            title="News Articles"
            value={newsArticles?.length ?? 0}
            icon={Newspaper}
            isLoading={isLoadingNews}
          />
          <StatCard
            title="Forum Posts"
            value={forumPosts?.length ?? 0}
            icon={MessageSquare}
            isLoading={isLoadingForum}
            description={`${totalReplies} total replies`}
          />
        </div>
      </div>
      
      {/* Moderation Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Moderation Queue</h2>
        <div className="grid gap-4 md:grid-cols-3">
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
            description="Visible to public"
          />
          <StatCard
            title="Total Comments"
            value={allComments?.length ?? 0}
            icon={MessageSquare}
            isLoading={isLoadingComments}
            description="All comments across site"
          />
        </div>
      </div>
    </div>
  );
}
