'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MatchHighlightCard } from '@/components/match-highlight-card';
import { useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import type { Match } from '@/lib/football-api';
import type { NewsArticle } from '@/lib/mock-data';
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
  const { firestore } = useFirebase();
  const [recentResults, setRecentResults] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  
  // Fetch latest news article from Firestore
  const newsQuery = useMemoFirebase(
    () => firestore ? query(
      collection(firestore, 'news_articles'),
      orderBy('createdAt', 'desc'),
      limit(1)
    ) : null,
    [firestore]
  );
  const { data: newsArticles } = useCollection<NewsArticle>(newsQuery);
  const latestArticle = newsArticles?.[0];

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/matches/results');
        if (res.ok) {
          const data = await res.json();
          setRecentResults(data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setIsLoadingMatches(false);
      }
    }
    fetchResults();
  }, []);

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

      {/* Match Highlight Section - Live or Upcoming */}
      <section>
        <h2 className="text-3xl font-bold font-headline mb-6 flex items-center gap-3">
          <Trophy className="h-7 w-7 text-primary" />
          Match Highlight
        </h2>
        <MatchHighlightCard />
      </section>

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
              {latestArticle.thumbnailUrl ? (
                <div className="relative h-64 md:h-auto">
                  <Image
                    src={latestArticle.thumbnailUrl}
                    alt={latestArticle.headline}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              ) : (
                <div className="relative h-64 md:h-auto bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center">
                  <div className="text-white text-center p-6">
                    <div className="text-6xl font-bold font-headline mb-2">MUFC</div>
                    <div className="text-sm opacity-80">Manchester United</div>
                  </div>
                </div>
              )}
              <div className="flex flex-col p-6">
                <CardHeader className="p-0">
                  <CardTitle className="font-headline text-2xl mb-2 leading-tight group-hover:text-primary">
                    {latestArticle.headline}
                  </CardTitle>
                   <Badge variant="secondary" className="w-fit">
                    {latestArticle.createdAt 
                      ? new Date((latestArticle.createdAt as any).toDate()).toLocaleDateString()
                      : latestArticle.date 
                      ? new Date(latestArticle.date).toLocaleDateString() 
                      : 'N/A'
                    }
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 pt-4 flex-grow">
                  <p className="text-muted-foreground">{(latestArticle.story || latestArticle.content || '').substring(0, 150)}...</p>
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
        {isLoadingMatches ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
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
                      {match.homeTeam.logo && (
                        <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={32} height={32} />
                      )}
                      <span className="font-semibold text-sm">{match.homeTeam.name}</span>
                    </div>
                    <div className="px-4">
                      <p className="text-3xl font-bold font-headline">
                        {match.score.home} - {match.score.away}
                      </p>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      {match.awayTeam.logo && (
                        <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={32} height={32} />
                      )}
                      <span className="font-semibold text-sm">{match.awayTeam.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
