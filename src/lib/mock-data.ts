export type NewsArticle = {
  id: string;
  headline: string;
  thumbnailUrl: string;
  thumbnailHint: string;
  story: string;
  author: string;
  date: string;
  comments: Comment[];
};

export type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  competition: string;
  status: 'result' | 'fixture' | 'live';
};

export type ForumPost = {
  id: string;
  author: string;
  content: string;
  date: string;
};

export type ForumTopic = {
  id: string;
  title: string;
  author: string;
  date: string;
  posts: ForumPost[];
};

export type Comment = {
  id: string;
  author: string;
  content: string;
  date: string;
  status: 'pending' | 'approved';
  source: string; // e.g., "News: Article Headline" or "Forum: Topic Title"
};

export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    headline: 'United Secure Dramatic Last-Minute Winner',
    thumbnailUrl: 'https://picsum.photos/seed/celebration/800/600',
    thumbnailHint: 'football celebration',
    story: 'In a breathtaking finish at Old Trafford, Manchester United clinched a vital three points with a goal in the 93rd minute. The crowd erupted as the ball hit the back of the net, sealing a 2-1 victory and keeping their title hopes alive. The manager praised the team\'s resilience and fighting spirit in the post-match interview.',
    author: 'Admin',
    date: '2024-05-10',
    comments: [
      { id: 'c1', author: 'Fan123', content: 'What a game! I was on the edge of my seat!', date: '2024-05-10', status: 'approved', source: 'United Secure Dramatic Last-Minute Winner' },
    ],
  },
  {
    id: '2',
    headline: 'Manager Hints at Summer Transfer Strategy',
    thumbnailUrl: 'https://picsum.photos/seed/manager/800/600',
    thumbnailHint: 'soccer coach',
    story: 'The gaffer spoke to the press today, outlining the club\'s ambitions for the upcoming transfer window. He emphasized the need for a new midfielder and a versatile forward to bolster the squad. "We are actively looking at targets and we will be ready to move when the window opens," he stated, refusing to be drawn on specific names.',
    author: 'Admin',
    date: '2024-05-09',
    comments: [],
  },
  {
    id: '3',
    headline: 'Old Trafford Expansion Plans Approved',
    thumbnailUrl: 'https://picsum.photos/seed/oldtrafford/800/600',
    thumbnailHint: 'stadium football',
    story: 'Manchester United has received the green light to proceed with the expansion of Old Trafford. The project will see the capacity increase by 15,000, bringing the total to just over 90,000. Work is expected to begin at the end of the season and will be completed in phases over the next three years.',
    author: 'Admin',
    date: '2024-05-08',
    comments: [
      { id: 'c2', author: 'Red_Devil_88', content: 'This is amazing news! More fans to cheer on the boys!', date: '2024-05-08', status: 'approved', source: 'Old Trafford Expansion Plans Approved' },
      { id: 'c3', author: 'Utd4Life', content: 'Can\'t wait to see the new stand!', date: '2024-05-08', status: 'pending', source: 'Old Trafford Expansion Plans Approved' },
    ],
  },
];

export const matches: Match[] = [
  // Live Match
  { id: 'm-live', homeTeam: 'Manchester United', awayTeam: 'Liverpool', homeScore: 1, awayScore: 1, date: new Date().toISOString(), competition: 'Premier League', status: 'live' },
  // Results
  { id: 'm1', homeTeam: 'Manchester United', awayTeam: 'Arsenal', homeScore: 2, awayScore: 1, date: '2024-05-10', competition: 'Premier League', status: 'result' },
  { id: 'm2', homeTeam: 'Chelsea', awayTeam: 'Manchester United', homeScore: 2, awayScore: 2, date: '2024-05-04', competition: 'Premier League', status: 'result' },
  { id: 'm3', homeTeam: 'Manchester United', awayTeam: 'Bayern Munich', homeScore: 1, awayScore: 0, date: '2024-04-28', competition: 'Champions League', status: 'result' },
  
  // Fixtures
  { id: 'm4', homeTeam: 'Manchester City', awayTeam: 'Manchester United', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), competition: 'Premier League', status: 'fixture' },
  { id: 'm5', homeTeam: 'Manchester United', awayTeam: 'Liverpool', date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), competition: 'FA Cup Final', status: 'fixture' },
  { id: 'm6', homeTeam: 'Brighton', awayTeam: 'Manchester United', date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(), competition: 'Premier League', status: 'fixture' },
];

export const forumTopics: ForumTopic[] = [
  {
    id: 't1',
    title: 'Who should be our number one transfer target this summer?',
    author: 'TransferTalk',
    date: '2024-05-11',
    posts: [
      { id: 'p1', author: 'TransferTalk', content: 'With the window opening soon, who do you think is the one player we absolutely must sign? For me, it has to be a world-class defensive midfielder.', date: '2024-05-11' },
      { id: 'p2', author: 'GloryGlory', content: 'I agree on the DM. We\'ve been missing a true anchor man for years.', date: '2024-05-11' },
      { id: 'p3', author: 'RedSince92', content: 'Forget the DM, we need a striker who can guarantee 25+ goals a season!', date: '2024-05-12' },
    ],
  },
  {
    id: 't2',
    title: 'Best performance of the season?',
    author: 'MOTM_Man',
    date: '2024-05-09',
    posts: [
      { id: 'p4', author: 'MOTM_Man', content: 'For me, it has to be the 1-0 win against Bayern. We were so solid defensively and clinical when it mattered. What a night!', date: '2024-05-09' },
    ],
  },
];

export const allComments: Comment[] = [
  { id: 'c1', author: 'Fan123', content: 'What a game! I was on the edge of my seat!', date: '2024-05-10', status: 'approved', source: 'News: United Secure Dramatic Last-Minute Winner' },
  { id: 'c2', author: 'Red_Devil_88', content: 'This is amazing news! More fans to cheer on the boys!', date: '2024-05-08', status: 'approved', source: 'News: Old Trafford Expansion Plans Approved' },
  { id: 'c3', author: 'Utd4Life', content: 'Can\'t wait to see the new stand!', date: '2024-05-08', status: 'pending', source: 'News: Old Trafford Expansion Plans Approved' },
  { id: 'c4', author: 'ForumUser', content: 'I think a creative winger is more important. We lack pace out wide.', date: '2024-05-12', status: 'pending', source: 'Forum: Who should be our number one transfer target this summer?' },
  { id: 'c5', author: 'RivalFan007', content: 'You guys got lucky!', date: '2024-05-10', status: 'pending', source: 'News: United Secure Dramatic Last-Minute Winner' },
];