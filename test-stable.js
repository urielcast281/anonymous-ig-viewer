const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
const host = 'instagram-scraper-stable-api.p.rapidapi.com';

async function test() {
  // Find available endpoints
  const endpoints = [
    ['GET', '/user_info', { username: 'instagram' }],
    ['GET', '/userinfo', { username: 'instagram' }],
    ['GET', '/profile', { username: 'instagram' }],
    ['POST', '/get_ig_user_info_v2.php', null, 'username=instagram'],
    ['POST', '/get_ig_user_followers_v2.php', null, 'username=instagram'],
  ];

  for (const [method, ep, params, body] of endpoints) {
    try {
      const opts = {
        method,
        url: `https://${host}${ep}`,
        headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host },
        timeout: 15000,
      };
      if (params) opts.params = params;
      if (body) { opts.data = body; opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
      const r = await axios(opts);
      console.log(`✅ ${method} ${ep}: ${r.status}`, JSON.stringify(r.data).slice(0, 400));
    } catch (e) {
      console.log(`❌ ${method} ${ep}: ${e.response?.status}`, JSON.stringify(e.response?.data || e.message).slice(0, 200));
    }
  }
}
test();
