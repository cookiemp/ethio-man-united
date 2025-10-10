import { NextResponse } from 'next/server';
import { getLiveMatch, getUpcomingFixtures, getRecentResults } from '@/lib/football-api';

export const dynamic = 'force-dynamic'; // Disable caching for this route

export async function GET() {
  try {
    // Priority 1: Check for live match
    const liveMatch = await getLiveMatch();
    if (liveMatch) {
      console.log('[Match Highlight] Found live match:', liveMatch.homeTeam.name, 'vs', liveMatch.awayTeam.name);
      return NextResponse.json({
        mode: 'live',
        match: liveMatch,
      });
    }

    // Priority 2: Get next upcoming fixture
    const upcomingMatches = await getUpcomingFixtures(5);
    const now = Date.now();
    const nextMatch = upcomingMatches
      .filter((m) => new Date(m.date).getTime() > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    if (nextMatch) {
      console.log('[Match Highlight] Found upcoming match:', nextMatch.homeTeam.name, 'vs', nextMatch.awayTeam.name);
      return NextResponse.json({
        mode: 'upcoming',
        match: nextMatch,
        kickoff: nextMatch.date,
      });
    }

    // Fallback: Show most recent result
    const recentResults = await getRecentResults(1);
    if (recentResults[0]) {
      console.log('[Match Highlight] Showing recent result as fallback');
      return NextResponse.json({
        mode: 'recent',
        match: recentResults[0],
      });
    }

    // No matches at all
    return NextResponse.json({ mode: 'none' });
  } catch (error) {
    console.error('[Match Highlight] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load match highlight' },
      { status: 500 }
    );
  }
}
