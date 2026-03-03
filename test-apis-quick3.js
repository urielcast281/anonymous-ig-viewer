const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

async function testAPI(name, config) {
  try {
    const r = await axios(config);
    console.log(`✅ ${name}: ${r.status} — ${JSON.stringify(r.data).substring(0, 300)}`);
    return true;
  } catch (e) {
    console.log(`❌ ${name}: ${e.response?.status || e.message} — ${JSON.stringify(e.response?.data || '').substring(0, 150)}`);
    return false;
  }
}

(async () => {
  // ig-scraper-2025 correct endpoint
  await testAPI('ig-scraper-2025 /info', {
    method: 'GET', url: 'https://instagram-scraper-20251.p.rapidapi.com/v1/info',
    params: { username_or_id_or_url: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-scraper-20251.p.rapidapi.com' },
    timeout: 15000
  });

  // instagram-bulk-scraper-latest
  await testAPI('bulk-scraper', {
    method: 'GET', url: 'https://instagram-bulk-scraper-latest.p.rapidapi.com/profile_info_v2/',
    params: { username: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-bulk-scraper-latest.p.rapidapi.com' },
    timeout: 15000
  });

  // instagram-looter2
  await testAPI('looter2', {
    method: 'GET', url: 'https://instagram-looter2.p.rapidapi.com/profile',
    params: { username: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' },
    timeout: 15000
  });

  // instagram-data1
  await testAPI('ig-data1', {
    method: 'GET', url: 'https://instagram-data1.p.rapidapi.com/user/info',
    params: { username: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-data1.p.rapidapi.com' },
    timeout: 15000
  });

  // instagram28
  await testAPI('instagram28', {
    method: 'GET', url: 'https://instagram28.p.rapidapi.com/user_info',
    params: { user_name: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram28.p.rapidapi.com' },
    timeout: 15000
  });
})();
