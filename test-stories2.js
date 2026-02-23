const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
const host = 'instagram120.p.rapidapi.com';
const h = { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host, 'Content-Type': 'application/json' };

async function main() {
  // Step 1: Get user ID from profile
  const profile = await axios.post(`https://${host}/api/instagram/profile`, { username: 'cristiano' }, { headers: h, timeout: 15000 });
  const userId = profile.data.result.id;
  console.log('User ID:', userId);

  // Step 2: Get stories with userId
  try {
    const stories = await axios.post(`https://${host}/api/instagram/stories`, { userId }, { headers: h, timeout: 15000 });
    console.log('Stories:', JSON.stringify(stories.data).slice(0, 800));
  } catch (e) {
    console.log('Stories FAIL:', e.response?.status, JSON.stringify(e.response?.data).slice(0, 300));
  }

  // Step 3: Get highlights with userId
  try {
    const highlights = await axios.post(`https://${host}/api/instagram/highlights`, { userId }, { headers: h, timeout: 15000 });
    console.log('Highlights:', JSON.stringify(highlights.data).slice(0, 800));
  } catch (e) {
    console.log('Highlights FAIL:', e.response?.status, JSON.stringify(e.response?.data).slice(0, 300));
  }

  // Step 4: Get reels with userId
  try {
    const reels = await axios.post(`https://${host}/api/instagram/reels`, { userId }, { headers: h, timeout: 15000 });
    console.log('Reels:', JSON.stringify(reels.data).slice(0, 800));
  } catch (e) {
    console.log('Reels FAIL:', e.response?.status, JSON.stringify(e.response?.data).slice(0, 300));
  }
}
main();
