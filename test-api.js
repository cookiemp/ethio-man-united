// Quick test script to verify API-Football connection
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.FOOTBALL_API_KEY;
const TEAM_ID = 33; // Manchester United

if (!API_KEY) {
  console.error('❌ FOOTBALL_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('✅ API Key found:', API_KEY.substring(0, 10) + '...');
console.log('🔍 Testing API-Football connection...\n');

async function testAPI() {
  const endpoints = [
    `/fixtures?team=${TEAM_ID}&season=2023&from=2023-04-01&to=2023-05-31`,
    `/fixtures?team=${TEAM_ID}&season=2023&from=2023-03-01&to=2023-05-31&status=FT`,
    `/fixtures?team=${TEAM_ID}&season=2022`,
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing: https://v3.football.api-sports.io${endpoint}`);
    
    try {
      const response = await fetch(`https://v3.football.api-sports.io${endpoint}`, {
        headers: {
          'x-apisports-key': API_KEY,
        },
      });

      const data = await response.json();
      
      console.log('   Status:', response.status, response.statusText);
      console.log('   Results:', data.results || 0, 'items');
      console.log('   Errors:', data.errors || 'none');
      
      if (data.response && data.response.length > 0) {
        const first = data.response[0];
        console.log('   First match:', {
          id: first.fixture.id,
          date: first.fixture.date,
          home: first.teams.home.name,
          away: first.teams.away.name,
          competition: first.league.name,
        });
      }
    } catch (error) {
      console.error('   ❌ Error:', error.message);
    }
  }
}

testAPI().then(() => {
  console.log('\n✅ Test complete! Check results above.');
}).catch(err => {
  console.error('\n❌ Test failed:', err);
});
