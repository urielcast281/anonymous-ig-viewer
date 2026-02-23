const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

async function tryAll() {
  // Exhaustive list of known Instagram API hosts on RapidAPI
  const apis = [
    { host: 'instagram120.p.rapidapi.com', method: 'post', url: '/api/instagram/profile', data: { username: 'instagram' } },
    { host: 'instagram-looter2.p.rapidapi.com', url: '/profile?id=instagram' },
    { host: 'instagram-bulk-profile-scrapper.p.rapidapi.com', url: '/clients/api/ig/ig_profile?ig=instagram' },
    { host: 'instagram-profile1.p.rapidapi.com', url: '/getprofile/instagram' },
    { host: 'instagram28.p.rapidapi.com', url: '/user_info?user_name=instagram' },
    { host: 'instagram47.p.rapidapi.com', url: '/api/user_info?username=instagram' },
    { host: 'instagram130.p.rapidapi.com', url: '/account-info?username=instagram' },
    { host: 'instagram-statistics-api.p.rapidapi.com', url: '/community?url=https://www.instagram.com/instagram' },
    { host: 'instagram-scraper-20231.p.rapidapi.com', url: '/userinfo?username=instagram' },
    { host: 'instagram-best-experience.p.rapidapi.com', url: '/user/info?username=instagram' },
    { host: 'instagram-api-2022.p.rapidapi.com', url: '/userinfo?username=instagram' },
    { host: 'social-media-data-tt.p.rapidapi.com', url: '/live/user/info?username=instagram&platform=instagram' },
    { host: 'instagram-scraper-api2.p.rapidapi.com', url: '/v1/info?username_or_id_or_url=instagram' },
  ];

  for (const api of apis) {
    const start = Date.now();
    try {
      let r;
      if (api.method === 'post') {
        r = await axios.post(`https://${api.host}${api.url}`, api.data, {
          headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': api.host, 'Content-Type': 'application/json' },
          timeout: 10000
        });
      } else {
        r = await axios.get(`https://${api.host}${api.url}`, {
          headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': api.host },
          timeout: 10000
        });
      }
      const ms = Date.now() - start;
      console.log(`✅ ${api.host} — ${r.status} (${ms}ms)`);
      console.log(`   ${JSON.stringify(r.data).substring(0, 250)}\n`);
    } catch (e) {
      const ms = Date.now() - start;
      const s = e.response?.status;
      const m = e.response?.data?.message || e.message;
      const icon = s === 403 ? '🔒' : s === 404 ? '💀' : '❌';
      console.log(`${icon} ${api.host} — ${s || 'timeout'}: ${m} (${ms}ms)`);
    }
  }
}
tryAll();
