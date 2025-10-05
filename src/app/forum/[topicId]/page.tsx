import { forumTopics } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ForumTopicPage({ params }: { params: { topicId: string } }) {
  const topic = forumTopics.find((t) => t.id === params.topicId);

  if (!topic) {
    notFound();
  }

  const [originalPost, ...replies] = topic.posts;

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold font-headline mb-2">{topic.title}</h1>
      <p className="text-muted-foreground mb-8">
        A discussion started by {topic.author} on {new Date(topic.date).toLocaleDateString()}
      </p>

      <div className="space-y-6">
        <Card className="bg-secondary">
          <CardHeader className="flex flex-row items-start gap-4">
            <Avatar>
              <AvatarFallback>{originalPost.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{originalPost.author}</CardTitle>
              <CardDescription>{new Date(originalPost.date).toLocaleString()}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{originalPost.content}</p>
          </CardContent>
        </Card>

        {replies.map((post, index) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-start gap-4">
              <Avatar>
                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{post.author}</CardTitle>
                <CardDescription>{new Date(post.date).toLocaleString()}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{post.content}</p>
            </CardContent>
          </Card>
        ))}

        <Separator />

        <div>
          <h3 className="text-2xl font-bold font-headline mb-4">Post a Reply</h3>
          <Card>
            <CardContent className="pt-6">
              <Textarea placeholder="Write your reply here..." rows={5} />
            </CardContent>
            <CardFooter>
              <Button>Submit Reply</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
