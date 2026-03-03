const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

async function testAPI(name, config) {
  try {
    const r = await axios(config);
    console.log(`✅ ${name}: ${r.status} — ${JSON.stringify(r.data).substring(0, 200)}`);
    return true;
  } catch (e) {
    console.log(`❌ ${name}: ${e.response?.status || e.message} — ${JSON.stringify(e.response?.data || '').substring(0, 100)}`);
    return false;
  }
}

(async () => {
  // Instagram Scraper 2025
  await testAPI('ig-scraper-2025', {
    method: 'GET', url: 'https://instagram-scraper-20251.p.rapidapi.com/v1/profile',
    params: { username_or_id_or_url: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-scraper-20251.p.rapidapi.com' },
    timeout: 15000
  });

  // Social Media Data API
  await testAPI('social-media-data', {
    method: 'GET', url: 'https://social-media-data-tt.p.rapidapi.com/live/user/info',
    params: { username: 'instagram', platform: 'instagram' },
    headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'social-media-data-tt.p.rapidapi.com' },
    timeout: 15000
  });

  // Try direct Instagram web scraping (no API)
  try {
    const r = await axios.get('https://www.instagram.com/api/v1/users/web_profile_info/?username=instagram', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-IG-App-ID': '936619743392459',
      },
      timeout: 10000
    });
    console.log(`✅ Direct IG: ${r.status} — ${JSON.stringify(r.data).substring(0, 200)}`);
  } catch (e) {
    console.log(`❌ Direct IG: ${e.response?.status || e.message}`);
  }

  // Try i.instagram.com (mobile API)
  try {
    const r = await axios.get('https://i.instagram.com/api/v1/users/web_profile_info/?username=instagram', {
      headers: {
        'User-Agent': 'Instagram 275.0.0.27.98 Android',
        'X-IG-App-ID': '936619743392459',
      },
      timeout: 10000
    });
    console.log(`✅ Mobile IG: ${r.status} — ${JSON.stringify(r.data).substring(0, 200)}`);
  } catch (e) {
    console.log(`❌ Mobile IG: ${e.response?.status || e.message}`);
  }
})();
