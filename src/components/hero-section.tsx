'use client';

import { useState, useEffect } from 'react';
import { Match, matches } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FootballIcon } from './icons/football-icon';

export function HeroSection() {
  const [liveMatch] = useState<Match | undefined>(matches.find((m) => m.status === 'live'));
  const [nextMatch] = useState<Match | undefined>(
    matches.filter((m) => m.status === 'fixture').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  );
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!nextMatch) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(nextMatch.date).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        // Optionally, you could refresh data here to check for a new live match
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextMatch]);

  const CountdownDisplay = () => (
    <div className="flex gap-4 text-center">
      <div>
        <div className="text-5xl font-bold font-headline">{countdown.days.toString().padStart(2, '0')}</div>
        <div className="text-sm text-muted-foreground">Days</div>
      </div>
      <div>
        <div className="text-5xl font-bold font-headline">{countdown.hours.toString().padStart(2, '0')}</div>
        <div className="text-sm text-muted-foreground">Hours</div>
      </div>
      <div>
        <div className="text-5xl font-bold font-headline">{countdown.minutes.toString().padStart(2, '0')}</div>
        <div className="text-sm text-muted-foreground">Minutes</div>
      </div>
      <div>
        <div className="text-5xl font-bold font-headline">{countdown.seconds.toString().padStart(2, '0')}</div>
        <div className="text-sm text-muted-foreground">Seconds</div>
      </div>
    </div>
  );

  return (
    <section className="mb-12">
      <Card className="bg-secondary/50">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          {liveMatch ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>
                <p className="font-semibold text-muted-foreground">{liveMatch.competition}</p>
              </div>
              <div className="flex items-center justify-around w-full max-w-2xl text-center">
                <div className="flex-1 flex flex-col items-center gap-3">
                  <FootballIcon className="h-12 w-12 text-foreground" />
                  <span className="font-bold text-2xl">{liveMatch.homeTeam}</span>
                </div>
                <div className="px-6">
                  <p className="text-5xl font-bold font-headline">{`${liveMatch.homeScore} - ${liveMatch.awayScore}`}</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-3">
                  <FootballIcon className="h-12 w-12 text-foreground" />
                  <span className="font-bold text-2xl">{liveMatch.awayTeam}</span>
                </div>
              </div>
            </>
          ) : nextMatch ? (
            <>
              <h2 className="text-2xl font-bold font-headline mb-2">Next Match</h2>
              <p className="text-lg text-muted-foreground mb-6">
                {nextMatch.homeTeam} vs {nextMatch.awayTeam}
              </p>
              <CountdownDisplay />
            </>
          ) : (
            <p className="text-xl font-semibold">No upcoming matches scheduled.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}