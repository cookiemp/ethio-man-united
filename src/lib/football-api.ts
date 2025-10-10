/**
 * Football API Integration
 * API: football-data.org (https://www.football-data.org/)
 * 
 * Free tier: 10 requests/minute, unlimited per day
 * Current season: 2024-25
 * Strategy: 30-min caching to minimize requests
 */

// Manchester United team ID in football-data.org
export const MAN_UNITED_TEAM_ID = 66;
export const PREMIER_LEAGUE_ID = 2021;

// TypeScript Types
export interface Match {
  id: number;
  date: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  homeTeam: {
    id: number;
    name: string;
    logo: string;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
  };
  score: {
    home: number | null;
    away: number | null;
  };
  competition: string;
  venue: {
    name: string;
    city: string;
  };
  referee: string | null;
}

export interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface FootballDataResponse {
  matches: any[];
  resultSet: {
    count: number;
    first: string;
    last: string;
  };
}

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch from football-data.org with error handling
 */
async function fetchFromAPI(endpoint: string): Promise<FootballDataResponse> {
  const apiKey = process.env.FOOTBALL_API_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
  
  if (!apiKey) {
    console.warn('Football API key not configured. Using mock data.');
    throw new Error('API_KEY_MISSING');
  }

  const url = `https://api.football-data.org/v4${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': apiKey,
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes in Next.js
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: FootballDataResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Football API error:', error);
    throw error;
  }
}

/**
 * Get upcoming fixtures for Manchester United
 */
export async function getUpcomingFixtures(limit: number = 5): Promise<Match[]> {
  const cacheKey = `fixtures_${limit}`;
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  try {
    // Get scheduled matches
    const endpoint = `/teams/${MAN_UNITED_TEAM_ID}/matches?status=SCHEDULED&limit=${limit}`;
    console.log('[Football API] Fetching fixtures from:', endpoint);
    const data = await fetchFromAPI(endpoint);
    console.log('[Football API] Received', data.matches?.length || 0, 'fixtures from API');
    
    const fixtures: Match[] = data.matches.map((item) => ({
      id: item.id,
      date: item.utcDate,
      status: mapStatus(item.status),
      homeTeam: {
        id: item.homeTeam.id,
        name: item.homeTeam.name,
        logo: item.homeTeam.crest,
      },
      awayTeam: {
        id: item.awayTeam.id,
        name: item.awayTeam.name,
        logo: item.awayTeam.crest,
      },
      score: {
        home: item.score?.fullTime?.home || null,
        away: item.score?.fullTime?.away || null,
      },
      competition: item.competition.name,
      venue: {
        name: item.venue || 'TBD',
        city: '',
      },
      referee: item.referees?.[0]?.name || null,
    }));

    setCache(cacheKey, fixtures);
    return fixtures;
  } catch (error: any) {
    if (error.message === 'API_KEY_MISSING') {
      return getMockFixtures(limit);
    }
    throw error;
  }
}

/**
 * Get live match for Manchester United (if any)
 */
export async function getLiveMatch(): Promise<Match | null> {
  try {
    // Check for IN_PLAY matches first
    let endpoint = `/teams/${MAN_UNITED_TEAM_ID}/matches?status=IN_PLAY&limit=1`;
    console.log('[Football API] Checking for live match:', endpoint);
    let data = await fetchFromAPI(endpoint);
    
    // If no IN_PLAY, check PAUSED (halftime, etc.)
    if (!data.matches || data.matches.length === 0) {
      endpoint = `/teams/${MAN_UNITED_TEAM_ID}/matches?status=PAUSED&limit=1`;
      data = await fetchFromAPI(endpoint);
    }
    
    if (!data.matches || data.matches.length === 0) {
      return null;
    }
    
    const item = data.matches[0];
    return {
      id: item.id,
      date: item.utcDate,
      status: mapStatus(item.status),
      homeTeam: {
        id: item.homeTeam.id,
        name: item.homeTeam.name,
        logo: item.homeTeam.crest,
      },
      awayTeam: {
        id: item.awayTeam.id,
        name: item.awayTeam.name,
        logo: item.awayTeam.crest,
      },
      score: {
        home: item.score?.fullTime?.home || item.score?.halfTime?.home || 0,
        away: item.score?.fullTime?.away || item.score?.halfTime?.away || 0,
      },
      competition: item.competition.name,
      venue: {
        name: item.venue || 'N/A',
        city: '',
      },
      referee: item.referees?.[0]?.name || null,
    };
  } catch (error: any) {
    console.error('[Football API] Error fetching live match:', error);
    return null;
  }
}

/**
 * Get recent results for Manchester United
 */
export async function getRecentResults(limit: number = 5): Promise<Match[]> {
  const cacheKey = `results_${limit}`;
  const cached = getCached<Match[]>(cacheKey);
  if (cached) return cached;

  try {
    // Get finished matches
    const endpoint = `/teams/${MAN_UNITED_TEAM_ID}/matches?status=FINISHED&limit=${limit}`;
    console.log('[Football API] Fetching results from:', endpoint);
    const data = await fetchFromAPI(endpoint);
    console.log('[Football API] Received', data.matches?.length || 0, 'results from API');

    const results: Match[] = data.matches.map((item) => ({
      id: item.id,
      date: item.utcDate,
      status: mapStatus(item.status),
      homeTeam: {
        id: item.homeTeam.id,
        name: item.homeTeam.name,
        logo: item.homeTeam.crest,
      },
      awayTeam: {
        id: item.awayTeam.id,
        name: item.awayTeam.name,
        logo: item.awayTeam.crest,
      },
      score: {
        home: item.score?.fullTime?.home || 0,
        away: item.score?.fullTime?.away || 0,
      },
      competition: item.competition.name,
      venue: {
        name: item.venue || 'N/A',
        city: '',
      },
      referee: item.referees?.[0]?.name || null,
    }))
    // Ensure newest-first ordering (latest to oldest)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setCache(cacheKey, results);
    return results;
  } catch (error: any) {
    if (error.message === 'API_KEY_MISSING') {
      return getMockResults(limit);
    }
    throw error;
  }
}

/**
 * Get Premier League standings
 */
export async function getStandings(): Promise<Standing[]> {
  const cacheKey = 'standings';
  const cached = getCached<Standing[]>(cacheKey);
  if (cached) return cached;

  try {
    const endpoint = `/competitions/${PREMIER_LEAGUE_ID}/standings`;
    const data: any = await fetchFromAPI(endpoint);

    const standings: Standing[] = data.standings[0].table.map((item: any) => ({
      rank: item.position,
      team: {
        id: item.team.id,
        name: item.team.name,
        logo: item.team.crest,
      },
      points: item.points,
      played: item.playedGames,
      won: item.won,
      drawn: item.draw,
      lost: item.lost,
      goalsFor: item.goalsFor,
      goalsAgainst: item.goalsAgainst,
      goalDifference: item.goalDifference,
    }));

    setCache(cacheKey, standings);
    return standings;
  } catch (error: any) {
    if (error.message === 'API_KEY_MISSING') {
      return [];
    }
    throw error;
  }
}

/**
 * Map API status codes to our status enum
 */
function mapStatus(apiStatus: string): Match['status'] {
  const statusMap: Record<string, Match['status']> = {
    'TIMED': 'scheduled',
    'SCHEDULED': 'scheduled',
    'IN_PLAY': 'live',
    'PAUSED': 'live',
    'FINISHED': 'finished',
    'AWARDED': 'finished',
    'POSTPONED': 'postponed',
    'CANCELLED': 'cancelled',
    'SUSPENDED': 'postponed',
  };

  return statusMap[apiStatus] || 'scheduled';
}

/**
 * Mock data fallback (when API key is not configured)
 */
function getMockFixtures(limit: number): Match[] {
  const mockFixtures: Match[] = [
    {
      id: 1,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      homeTeam: { id: 33, name: 'Manchester United', logo: '' },
      awayTeam: { id: 40, name: 'Liverpool', logo: '' },
      score: { home: null, away: null },
      competition: 'Premier League',
      venue: { name: 'Old Trafford', city: 'Manchester' },
      referee: null,
    },
    {
      id: 2,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      homeTeam: { id: 50, name: 'Manchester City', logo: '' },
      awayTeam: { id: 33, name: 'Manchester United', logo: '' },
      score: { home: null, away: null },
      competition: 'Premier League',
      venue: { name: 'Etihad Stadium', city: 'Manchester' },
      referee: null,
    },
  ];

  return mockFixtures.slice(0, limit);
}

function getMockResults(limit: number): Match[] {
  const mockResults: Match[] = [
    {
      id: 3,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'finished',
      homeTeam: { id: 33, name: 'Manchester United', logo: '' },
      awayTeam: { id: 34, name: 'Newcastle', logo: '' },
      score: { home: 3, away: 0 },
      competition: 'Premier League',
      venue: { name: 'Old Trafford', city: 'Manchester' },
      referee: 'Michael Oliver',
    },
    {
      id: 4,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'finished',
      homeTeam: { id: 42, name: 'Arsenal', logo: '' },
      awayTeam: { id: 33, name: 'Manchester United', logo: '' },
      score: { home: 1, away: 1 },
      competition: 'Premier League',
      venue: { name: 'Emirates Stadium', city: 'London' },
      referee: 'Anthony Taylor',
    },
  ];

  return mockResults.slice(0, limit);
}
