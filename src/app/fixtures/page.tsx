'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import type { Match } from '@/lib/football-api';

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [results, setResults] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [fixturesRes, resultsRes] = await Promise.all([
          fetch('/api/matches/fixtures'),
          fetch('/api/matches/results'),
        ]);

        if (fixturesRes.ok && resultsRes.ok) {
          const fixturesData = await fixturesRes.json();
          const resultsData = await resultsRes.json();
          setFixtures(fixturesData);
          setResults(resultsData);
        } else {
          setError('Failed to load match data');
        }
      } catch (err) {
        setError('Error loading matches');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const MatchCard = ({ match }: { match: Match }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardDescription className="flex justify-between items-center">
          <span>{new Date(match.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
          <Badge variant="outline">{match.competition}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-around text-center">
          <div className="flex-1 flex flex-col items-center gap-2">
            {match.homeTeam.logo && (
              <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={40} height={40} />
            )}
            <span className="font-semibold text-sm">{match.homeTeam.name}</span>
          </div>
          <div className="px-4">
            {match.status === 'finished' ? (
              <div className="text-center">
                <p className="text-3xl font-bold font-headline">
                  {match.score.home} - {match.score.away}
                </p>
                <p className="text-xs text-muted-foreground mt-1">FT</p>
              </div>
            ) : match.status === 'live' ? (
              <div className="text-center">
                <p className="text-3xl font-bold font-headline text-primary">
                  {match.score.home} - {match.score.away}
                </p>
                <Badge variant="destructive" className="mt-1">LIVE</Badge>
              </div>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">vs</p>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            {match.awayTeam.logo && (
              <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={40} height={40} />
            )}
            <span className="font-semibold text-sm">{match.awayTeam.name}</span>
          </div>
        </div>
        {match.venue && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            {match.venue.name}, {match.venue.city}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8">Fixtures & Results</h1>
      
      <Alert className="mb-6 bg-green-50 border-green-200">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900">
          ⚽ <strong>Live Data:</strong> Current 2024-25 season matches from football-data.org. 
          Real-time fixtures, results, and team information!
        </AlertDescription>
      </Alert>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="fixtures">Upcoming Fixtures</TabsTrigger>
          <TabsTrigger value="results">Recent Results</TabsTrigger>
        </TabsList>
        <TabsContent value="fixtures" className="mt-6">
          <div className="space-y-6">
            {fixtures.length > 0 ? (
              fixtures.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <p className="text-center text-muted-foreground">No upcoming fixtures.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="results" className="mt-6">
          <div className="space-y-6">
            {results.length > 0 ? (
              results.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <p className="text-center text-muted-foreground">No recent results available.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
