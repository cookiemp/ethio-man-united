import Link from 'next/link';
import { forumTopics } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ForumPage() {
  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Forum</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">Topic</TableHead>
              <TableHead className="text-center">Replies</TableHead>
              <TableHead className="text-right">Last Post</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forumTopics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell>
                  <Link
                    href={`/forum/${topic.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {topic.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    by {topic.author} on {new Date(topic.date).toLocaleDateString()}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{topic.posts.length - 1}</Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  by {topic.posts[topic.posts.length - 1].author} <br />
                  on {new Date(topic.posts[topic.posts.length - 1].date).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
