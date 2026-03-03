const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

async function testAPI(name, config) {
  try {
    const r = await axios(config);
    console.log(`✅ ${name}: ${r.status} — ${JSON.stringify(r.data).substring(0, 150)}`);
    return true;
  } catch (e) {
    console.log(`❌ ${name}: ${e.response?.status || e.message}`);
    return false;
  }
}

(async () => {
  // 1. instagram120 (current)
  await testAPI('instagram120', {
    method: 'POST', url: 'https://instagram120.p.rapidapi.com/api/instagram/profile',
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram120.p.rapidapi.com', 'Content-Type': 'application/json' },
    data: { username: 'instagram' }, timeout: 10000
  });

  // 2. instagram-scraper-api2 (existing fallback)
  await testAPI('scraper-api2', {
    method: 'GET', url: 'https://instagram-scraper-api2.p.rapidapi.com/v1/info',
    params: { username_or_id_or_url: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com' },
    timeout: 10000
  });

  // 3. instagram-scraper-stable-api
  await testAPI('stable-api', {
    method: 'GET', url: 'https://instagram-scraper-stable-api.p.rapidapi.com/user_profile',
    params: { username: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com' },
    timeout: 10000
  });

  // 4. free-instagram-scraper
  await testAPI('free-scraper', {
    method: 'GET', url: 'https://free-instagram-scraper.p.rapidapi.com/profile',
    params: { username: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'free-instagram-scraper.p.rapidapi.com' },
    timeout: 10000
  });

  // 5. instagram-api-fast-reliable
  await testAPI('fast-reliable', {
    method: 'GET', url: 'https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/user/info',
    params: { username: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com' },
    timeout: 10000
  });

  // 6. instagram-scraper (junioroangel)
  await testAPI('ig-scraper', {
    method: 'GET', url: 'https://instagram-scraper.p.rapidapi.com/profile',
    params: { username: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-scraper.p.rapidapi.com' },
    timeout: 10000
  });
})();
