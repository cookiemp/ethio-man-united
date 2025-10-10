// Test script for football-data.org API
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.FOOTBALL_API_KEY;
const MAN_UNITED_TEAM_ID = 66; // Man United ID in football-data.org

async function testAPI() {
  console.log('Testing football-data.org API...\n');
  console.log('API Key:', API_KEY ? '✅ Found' : '❌ Missing');
  
  if (!API_KEY) {
    console.error('No API key found in .env.local');
    return;
  }

  try {
    // Test 1: Get recent matches
    console.log('\n📊 Test 1: Fetching recent matches...');
    const recentResponse = await fetch(
      `https://api.football-data.org/v4/teams/${MAN_UNITED_TEAM_ID}/matches?status=FINISHED&limit=5`,
      {
        headers: {
          'X-Auth-Token': API_KEY
        }
      }
    );
    
    if (!recentResponse.ok) {
      console.error('❌ Recent matches failed:', recentResponse.status, recentResponse.statusText);
      const errorText = await recentResponse.text();
      console.error('Error details:', errorText);
    } else {
      const recentData = await recentResponse.json();
      console.log('✅ Recent matches:', recentData.resultSet?.count || 0, 'matches found');
      if (recentData.matches && recentData.matches.length > 0) {
        console.log('\nSample match:');
        const match = recentData.matches[0];
        console.log(`  ${match.homeTeam.name} ${match.score.fullTime.home} - ${match.score.fullTime.away} ${match.awayTeam.name}`);
        console.log(`  Date: ${new Date(match.utcDate).toLocaleDateString()}`);
        console.log(`  Competition: ${match.competition.name}`);
      }
    }

    // Test 2: Get scheduled matches
    console.log('\n📊 Test 2: Fetching upcoming fixtures...');
    const upcomingResponse = await fetch(
      `https://api.football-data.org/v4/teams/${MAN_UNITED_TEAM_ID}/matches?status=SCHEDULED&limit=5`,
      {
        headers: {
          'X-Auth-Token': API_KEY
        }
      }
    );
    
    if (!upcomingResponse.ok) {
      console.error('❌ Upcoming fixtures failed:', upcomingResponse.status, upcomingResponse.statusText);
    } else {
      const upcomingData = await upcomingResponse.json();
      console.log('✅ Upcoming fixtures:', upcomingData.resultSet?.count || 0, 'matches found');
      if (upcomingData.matches && upcomingData.matches.length > 0) {
        console.log('\nSample fixture:');
        const match = upcomingData.matches[0];
        console.log(`  ${match.homeTeam.name} vs ${match.awayTeam.name}`);
        console.log(`  Date: ${new Date(match.utcDate).toLocaleString()}`);
        console.log(`  Competition: ${match.competition.name}`);
      }
    }

    // Test 3: Get team info
    console.log('\n📊 Test 3: Fetching Man United team info...');
    const teamResponse = await fetch(
      `https://api.football-data.org/v4/teams/${MAN_UNITED_TEAM_ID}`,
      {
        headers: {
          'X-Auth-Token': API_KEY
        }
      }
    );
    
    if (!teamResponse.ok) {
      console.error('❌ Team info failed:', teamResponse.status);
    } else {
      const teamData = await teamResponse.json();
      console.log('✅ Team info retrieved');
      console.log(`  Name: ${teamData.name}`);
      console.log(`  Short Name: ${teamData.shortName}`);
      console.log(`  Crest: ${teamData.crest}`);
      console.log(`  Website: ${teamData.website}`);
    }

    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testAPI();
