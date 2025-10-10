import { NextResponse } from 'next/server';
import { getRecentResults } from '@/lib/football-api';

export async function GET() {
  try {
    const results = await getRecentResults(10);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

// Cache for 30 minutes
export const revalidate = 1800;
