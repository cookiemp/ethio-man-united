import { newsArticles } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, UserIcon } from 'lucide-react';

export default function NewsArticlePage({ params }: { params: { articleId: string } }) {
  const article = newsArticles.find((a) => a.id === params.articleId);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
        <Image
          src={article.thumbnailUrl}
          alt={article.headline}
          fill
          style={{ objectFit: 'cover' }}
          data-ai-hint={article.thumbnailHint}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-4xl font-bold font-headline text-white mb-2">{article.headline}</h1>
          <div className="flex items-center gap-4 text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{new Date(article.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <article className="prose prose-lg max-w-none mb-12">
        <p className="text-xl leading-relaxed text-foreground/80">{article.story}</p>
      </article>
      
      <Separator />

      <div className="mt-12">
        <h2 className="text-3xl font-bold font-headline mb-6">Comments ({article.comments.length})</h2>
        <div className="space-y-6 mb-8">
          {article.comments.map((comment) => (
            <Card key={comment.id} className={comment.status === 'pending' ? 'bg-muted/50' : ''}>
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <Avatar>
                  <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">{comment.author}</CardTitle>
                    {comment.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                  </div>
                  <CardDescription className="text-xs">{new Date(comment.date).toLocaleString()}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
          {article.comments.length === 0 && (
            <p className="text-muted-foreground">Be the first to comment on this article.</p>
          )}
        </div>

        <h3 className="text-2xl font-bold font-headline mb-4">Leave a Comment</h3>
        <Card>
          <CardContent className="pt-6">
            <Textarea placeholder="Write your comment here..." rows={5} />
          </CardContent>
          <CardFooter>
            <Button>Submit Comment</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}