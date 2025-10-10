'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, ExternalLink } from 'lucide-react';
import type { Match } from '@/lib/football-api';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type HighlightResponse = {
  mode: 'live' | 'upcoming' | 'recent' | 'none';
  match?: Match;
  kickoff?: string;
};

export function MatchHighlightCard() {
  const { firestore } = useFirebase();
  const [data, setData] = useState<HighlightResponse | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [watchLiveUrl, setWatchLiveUrl] = useState<string>('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadData() {
    try {
      const res = await fetch('/api/matches/highlight', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading match highlight:', error);
      setIsLoading(false);
    }
  }

  // Fetch watch live URL from settings
  async function loadWatchLiveUrl() {
    if (!firestore) return;
    try {
      const settingsRef = doc(firestore, 'settings', 'general');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setWatchLiveUrl(data.watchLiveUrl || '');
      }
    } catch (error) {
      console.error('Error loading watch live URL:', error);
    }
  }

  // Initial load
  useEffect(() => {
    loadData();
    if (firestore) {
      loadWatchLiveUrl();
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [firestore]);

  // Handle polling and countdown based on mode
  useEffect(() => {
    if (!data) return;

    // Clear existing intervals
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    if (data.mode === 'live') {
      // Poll every 30 seconds for live match updates
      pollRef.current = setInterval(() => {
        loadData();
      }, 30_000);
    } else if (data.mode === 'recent') {
      // Poll every 15 minutes when showing finished match to check for new matches
      pollRef.current = setInterval(() => {
        loadData();
      }, 15 * 60 * 1000); // 15 minutes
    } else if (data.mode === 'upcoming' && data.kickoff) {
      const kickoffTime = new Date(data.kickoff).getTime();

      // Update countdown every second
      const updateCountdown = () => {
        const now = Date.now();
        const diff = kickoffTime - now;

        if (diff <= 0) {
          setCountdown('Starting soon...');
          // Start polling when match is about to start
          if (!pollRef.current) {
            pollRef.current = setInterval(loadData, 30_000);
          }
          return;
        }

        const seconds = Math.floor(diff / 1000);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (days > 0) {
          setCountdown(`${days}d ${hours}h ${minutes}m`);
        } else {
          setCountdown(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
          );
        }

        // Start polling 5 minutes before kickoff
        if (diff <= 5 * 60 * 1000 && !pollRef.current) {
          pollRef.current = setInterval(loadData, 30_000);
        }
      };

      updateCountdown();
      countdownRef.current = setInterval(updateCountdown, 1000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [data]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.mode === 'none' || !data.match) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center min-h-[200px] text-muted-foreground">
          No upcoming matches
        </CardContent>
      </Card>
    );
  }

  const { match, mode } = data;

  return (
    <Card className="w-full overflow-hidden border-2 border-primary/20 hover:shadow-xl transition-shadow">
      <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white pb-4">
        <div className="flex items-center justify-between">
          <CardDescription className="text-white/90 font-semibold text-sm">
            {match.competition}
          </CardDescription>
          {mode === 'live' && (
            <Badge variant="destructive" className="animate-pulse bg-white text-red-600 font-bold">
              ● LIVE
            </Badge>
          )}
          {mode === 'upcoming' && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/40">
              <Clock className="h-3 w-3 mr-1" />
              {countdown}
            </Badge>
          )}
          {mode === 'recent' && (
            <Badge variant="outline" className="bg-white/20 text-white border-white/40">
              Final
            </Badge>
          )}
        </div>
        <div className="text-xs text-white/80 mt-1">
          {new Date(match.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          •{' '}
          {new Date(match.date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-8 pb-8">
        <div className="flex items-center justify-around">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center gap-3">
            {match.homeTeam.logo && (
              <div className="relative w-20 h-20">
                <Image
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            )}
            <span className="font-bold text-center text-lg leading-tight">
              {match.homeTeam.name}
            </span>
          </div>

          {/* Score or VS */}
          <div className="px-6 flex flex-col items-center gap-2">
            {mode === 'upcoming' ? (
              <>
                <p className="text-4xl font-bold text-muted-foreground font-headline">VS</p>
                {countdown && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Kicks off in</p>
                    <p className="text-lg font-bold text-primary font-mono">{countdown}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <p className="text-5xl font-bold font-headline text-primary">
                  {match.score.home !== null ? match.score.home : '-'} -{' '}
                  {match.score.away !== null ? match.score.away : '-'}
                </p>
                {mode === 'live' && (
                  <>
                    <p className="text-xs text-muted-foreground mt-2 animate-pulse">
                      Live updates
                    </p>
                    {watchLiveUrl && (
                      <Button
                        asChild
                        size="sm"
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg animate-pulse"
                      >
                        <Link href={watchLiveUrl} target="_blank" rel="noopener noreferrer">
                          Watch Live <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center gap-3">
            {match.awayTeam.logo && (
              <div className="relative w-20 h-20">
                <Image
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            )}
            <span className="font-bold text-center text-lg leading-tight">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Venue info */}
        {match.venue?.name && match.venue.name !== 'N/A' && match.venue.name !== 'TBD' && (
          <p className="text-xs text-muted-foreground text-center mt-6">
            📍 {match.venue.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
