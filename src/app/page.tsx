
import Link from 'next/link';
import { HeroSection } from '@/components/hero-section';
import { newsArticles, matches } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Newspaper, Trophy } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const latestArticle = newsArticles[0];
  const recentResults = matches.filter((m) => m.status === 'result').slice(0, 3);

  return (
    <div className="animate-fade-in-up space-y-16">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
          Manchester United Fan Community
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Your home for news, matches, and passionate discussion about the Red Devils.
        </p>
      </section>

      <HeroSection />

      {latestArticle && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold font-headline flex items-center gap-3">
              <Newspaper className="h-7 w-7 text-primary" />
              Latest News
            </h2>
            <Button variant="outline" asChild>
              <Link href="/news">
                View All News
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <Link href={`/news/${latestArticle.id}`} className="block group">
            <Card className="grid md:grid-cols-2 overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative h-64 md:h-auto">
                 <Image
                    src={latestArticle.thumbnailUrl}
                    alt={latestArticle.headline}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={latestArticle.thumbnailHint}
                    priority
                  />
              </div>
              <div className="flex flex-col p-6">
                <CardHeader className="p-0">
                  <CardTitle className="font-headline text-2xl mb-2 leading-tight group-hover:text-primary">
                    {latestArticle.headline}
                  </CardTitle>
                   <Badge variant="secondary" className="w-fit">{new Date(latestArticle.date).toLocaleDateString()}</Badge>
                </CardHeader>
                <CardContent className="p-0 pt-4 flex-grow">
                  <p className="text-muted-foreground">{latestArticle.story.substring(0, 150)}...</p>
                </CardContent>
                <CardFooter className="p-0 pt-6">
                   <div className="flex items-center text-primary font-semibold text-sm">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                </CardFooter>
              </div>
            </Card>
          </Link>
        </section>
      )}

      <section>
        <h2 className="text-3xl font-bold font-headline mb-6 flex items-center gap-3">
          <Trophy className="h-7 w-7 text-primary" />
          Recent Results
        </h2>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {recentResults.map((match) => (
            <Card key={match.id} className="hover:shadow-md transition-shadow">
               <CardHeader>
                <CardDescription className="flex justify-between items-center">
                  <span>{new Date(match.date).toLocaleDateString()}</span>
                  <Badge variant="outline">{match.competition}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-around text-center">
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="font-semibold text-lg">{match.homeTeam}</span>
                  </div>
                  <div className="px-4">
                    <p className="text-3xl font-bold font-headline">{`${match.homeScore} - ${match.awayScore}`}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="font-semibold text-lg">{match.awayTeam}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
