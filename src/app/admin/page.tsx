import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { newsArticles, allComments } from '@/lib/mock-data';
import { Newspaper, MessageCircleWarning } from 'lucide-react';

export default function AdminDashboardPage() {
  const pendingComments = allComments.filter(c => c.status === 'pending').length;

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total News Articles</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsArticles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Comments</CardTitle>
            <MessageCircleWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingComments}</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
