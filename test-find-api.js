const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

// Test APIs that are likely to exist and have free tiers
async function tryAll() {
  const apis = [
    { name: 'instagram-scraper-api3', host: 'instagram-scraper-api3.p.rapidapi.com', url: '/user_info', params: { username: 'instagram' } },
    { name: 'instagram-data1', host: 'instagram-data1.p.rapidapi.com', url: '/user/info', params: { username: 'instagram' } },
    { name: 'instagram-looter2', host: 'instagram-looter2.p.rapidapi.com', url: '/profile', params: { username: 'instagram' } },
    { name: 'instagram-api-20231', host: 'instagram-api-20231.p.rapidapi.com', url: '/api/user_info', params: { username: 'instagram' } },
    { name: 'instagram-bulk-scraper', host: 'instagram-bulk-profile-scrapper.p.rapidapi.com', url: '/clients/api/ig/ig_profile', params: { ig: 'instagram' } },
    { name: 'real-time-instagram', host: 'real-time-instagram-scraper-api.p.rapidapi.com', url: '/v1/user/info', params: { username: 'instagram' } },
    { name: 'social-api1', host: 'social-api1-instagram.p.rapidapi.com', url: '/v1/info', params: { username: 'instagram' } },
  ];

  for (const api of apis) {
    try {
      console.log(`\n${api.name} (${api.host})...`);
      const r = await axios.get(`https://${api.host}${api.url}`, {
        params: api.params,
        headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': api.host },
        timeout: 10000
      });
      console.log('  ✅ Status:', r.status, '| Data:', JSON.stringify(r.data).substring(0, 200));
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.message || e.message;
      console.log(`  ❌ ${status}: ${msg}`);
    }
  }
}
tryAll();
