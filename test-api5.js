const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

// Try instagram120 with retries
async function test() {
  for (let i = 0; i < 3; i++) {
    console.log(`\nAttempt ${i+1}...`);
    try {
      const r = await axios.post('https://instagram120.p.rapidapi.com/api/instagram/profile',
        { username: 'instagram' },
        { 
          headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram120.p.rapidapi.com', 'Content-Type': 'application/json' },
          timeout: 20000 
        }
      );
      console.log('Status:', r.status);
      console.log('Has result:', !!r.data?.result);
      if (r.data?.result) {
        console.log('Username:', r.data.result.username);
        console.log('Pic URL starts with:', (r.data.result.profile_pic_url || '').substring(0, 60));
        return;
      }
    } catch (e) {
      console.log('Error:', e.response?.status, e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}
test();
