const axios = require('axios');

async function test() {
  const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
  const host = 'instagram-scraper-20251.p.rapidapi.com';
  
  // Try different endpoints for posts/media
  const endpoints = [
    { url: '/usermedia/', params: { username_or_id: 'funkopopsnews' } },
    { url: '/user_media/', params: { username_or_id: 'funkopopsnews' } },
    { url: '/posts/', params: { username_or_id: 'funkopopsnews' } },
    { url: '/user_posts/', params: { username_or_id: 'funkopopsnews' } },
    { url: '/media/', params: { username_or_id: 'funkopopsnews' } },
  ];

  for (const ep of endpoints) {
    try {
      const resp = await axios.get(`https://${host}${ep.url}`, {
        params: ep.params,
        headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host },
        timeout: 10000,
      });
      console.log(`✅ ${ep.url} — Status: ${resp.status}, Keys: ${Object.keys(resp.data).join(', ')}`);
      const items = resp.data.data?.items || resp.data.items || resp.data.data;
      if (Array.isArray(items)) console.log(`   Found ${items.length} items`);
      console.log(`   Sample: ${JSON.stringify(resp.data).slice(0, 300)}`);
      return;
    } catch (e) {
      console.log(`❌ ${ep.url} — ${e.response?.status || e.message}`);
    }
  }
}
test();
