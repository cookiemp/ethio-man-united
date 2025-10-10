import { NextResponse } from 'next/server';
import { getUpcomingFixtures } from '@/lib/football-api';

export async function GET() {
  try {
    console.log('[API] Fetching upcoming fixtures...');
    const fixtures = await getUpcomingFixtures(10);
    console.log(`[API] Found ${fixtures.length} fixtures`);
    if (fixtures.length > 0) {
      console.log('[API] First fixture:', fixtures[0]);
    }
    return NextResponse.json(fixtures);
  } catch (error) {
    console.error('[API] Error fetching fixtures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixtures' },
      { status: 500 }
    );
  }
}

// Cache for 30 minutes
export const revalidate = 1800;
