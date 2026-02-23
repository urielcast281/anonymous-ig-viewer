const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
const host = 'instagram120.p.rapidapi.com';
const h = { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host, 'Content-Type': 'application/json' };

// Test multiple popular accounts - someone should have active stories
const users = ['kimkardashian', 'kyliejenner', 'selenagomez', 'therock', 'beyonce', 'justinbieber', 'nike', 'neymarjr'];

async function main() {
  for (const username of users) {
    try {
      const profile = await axios.post(`https://${host}/api/instagram/profile`, { username }, { headers: h, timeout: 10000 });
      const userId = profile.data.result.id;
      const stories = await axios.post(`https://${host}/api/instagram/stories`, { userId }, { headers: h, timeout: 10000 });
      const count = stories.data.result?.length || 0;
      console.log(`${count > 0 ? '✅' : '❌'} ${username} (${userId}): ${count} stories`);
      if (count > 0) {
        console.log('  First story:', JSON.stringify(stories.data.result[0]).slice(0, 300));
      }
    } catch (e) {
      console.log(`❌ ${username}: ERR ${e.response?.status || e.message}`);
    }
  }
}
main();
