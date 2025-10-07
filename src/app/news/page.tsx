import Image from 'next/image';
import Link from 'next/link';
import { newsArticles } from '@/lib/mock-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8">Latest News</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {newsArticles.map((article, index) => (
          <Link href={`/news/${article.id}`} key={article.id} className="block group">
            <Card
              className="flex flex-col overflow-hidden h-full transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl"
            >
              <CardHeader className="p-0">
                <div className="relative h-56 w-full">
                  <Image
                    src={article.thumbnailUrl}
                    alt={article.headline}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={article.thumbnailHint}
                    priority={index < 3}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <CardTitle className="font-headline text-xl mb-2 leading-tight">
                  {article.headline}
                </CardTitle>
                <CardDescription>{article.story.substring(0, 100)}...</CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-between items-center">
                <div>
                  <Badge variant="secondary">{new Date(article.date).toLocaleDateString()}</Badge>
                </div>
                <div className="flex items-center text-primary font-semibold text-sm">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
