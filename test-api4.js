const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

// Try the most popular Instagram APIs with correct endpoints
async function tryAPI(name, host, method, endpoint, params, body) {
  try {
    const opts = {
      method: method || 'GET',
      url: `https://${host}${endpoint}`,
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host },
      timeout: 15000,
    };
    if (params) opts.params = params;
    if (body) { opts.data = body; opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
    const r = await axios(opts);
    console.log(`✅ ${name}: ${r.status}`, JSON.stringify(r.data).slice(0, 400));
    return true;
  } catch (e) {
    console.log(`❌ ${name}: ${e.response?.status}`, JSON.stringify(e.response?.data || e.message).slice(0, 200));
    return false;
  }
}

async function main() {
  // Instagram Scraper API2 (most popular, 10K+ users)
  await tryAPI('scraper-api2', 'instagram-scraper-api2.p.rapidapi.com', 'GET', '/v1/info', { username_or_id_or_url: 'instagram' });
  
  // Instagram Scraper by junioroangel
  await tryAPI('junioroangel', 'instagram-scraper.p.rapidapi.com', 'GET', '/user_info', { username: 'instagram' });

  // Instagram Looter2
  await tryAPI('looter2', 'instagram-looter2.p.rapidapi.com', 'GET', '/profile', { username: 'instagram' });

  // RocketAPI for Instagram  
  await tryAPI('rocketapi', 'rocketapi-for-instagram.p.rapidapi.com', 'POST', '/instagram/user/get_info', null, 'username=instagram');
}
main();
