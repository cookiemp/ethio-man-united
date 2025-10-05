import { matches } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FootballIcon } from '@/components/icons/football-icon';

export default function FixturesPage() {
  const upcomingFixtures = matches.filter((m) => m.status === 'fixture');
  const recentResults = matches.filter((m) => m.status === 'result');

  const MatchCard = ({ match }: { match: typeof matches[0] }) => (
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
            <FootballIcon className="h-10 w-10 text-muted-foreground" />
            <span className="font-semibold text-lg">{match.homeTeam}</span>
          </div>
          <div className="px-4">
            {match.status === 'result' ? (
              <p className="text-3xl font-bold font-headline">{`${match.homeScore} - ${match.awayScore}`}</p>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">vs</p>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <FootballIcon className="h-10 w-10 text-muted-foreground" />
            <span className="font-semibold text-lg">{match.awayTeam}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold font-headline mb-8">Fixtures & Results</h1>
      <Tabs defaultValue="fixtures" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="fixtures">Upcoming Fixtures</TabsTrigger>
          <TabsTrigger value="results">Recent Results</TabsTrigger>
        </TabsList>
        <TabsContent value="fixtures" className="mt-6">
          <div className="space-y-6">
            {upcomingFixtures.length > 0 ? (
              upcomingFixtures.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <p>No upcoming fixtures.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="results" className="mt-6">
          <div className="space-y-6">
            {recentResults.length > 0 ? (
              recentResults.map((match) => <MatchCard key={match.id} match={match} />)
            ) : (
              <p>No recent results available.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
