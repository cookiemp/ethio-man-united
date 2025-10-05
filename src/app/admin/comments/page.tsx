import { allComments } from '@/lib/mock-data';
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
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminCommentsPage() {
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
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="text-muted-foreground">{comment.content}</TableCell>
                  <TableCell className="font-medium">{comment.author}</TableCell>
                  <TableCell>{comment.source}</TableCell>
                  <TableCell>
                    <Badge variant={comment.status === 'approved' ? 'default' : 'secondary'} className={comment.status === 'approved' ? 'bg-green-600' : ''}>
                      {comment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {comment.status === 'pending' && (
                      <>
                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-600">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
