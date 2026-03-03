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
  // instagram120 with GET instead of POST
  await testAPI('instagram120-GET', {
    method: 'GET', url: 'https://instagram120.p.rapidapi.com/api/instagram/profile/instagram',
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram120.p.rapidapi.com' },
    timeout: 15000
  });

  // Try the instagram-scraper-2025 with different endpoints
  for (const ep of ['/userinfo', '/profile', '/user', '/v1/user/info', '/v1.2/info']) {
    await testAPI(`ig-2025 ${ep}`, {
      method: 'GET', url: `https://instagram-scraper-20251.p.rapidapi.com${ep}`,
      params: { username_or_id_or_url: 'instagram' },
      headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-scraper-20251.p.rapidapi.com' },
      timeout: 10000
    });
  }

  // Try gramsnap
  await testAPI('gramsnap', {
    method: 'GET', url: 'https://gramsnap.p.rapidapi.com/api/ig/userinfo',
    params: { username: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'gramsnap.p.rapidapi.com' },
    timeout: 15000
  });

  // rocketapi
  await testAPI('rocketapi', {
    method: 'POST', url: 'https://rocketapi-for-instagram.p.rapidapi.com/instagram/user/get_info',
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'rocketapi-for-instagram.p.rapidapi.com', 'Content-Type': 'application/json' },
    data: { username: 'instagram' },
    timeout: 15000
  });
})();
