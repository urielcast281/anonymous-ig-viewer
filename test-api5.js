const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
const host = 'instagram-scraper-20251.p.rapidapi.com';

async function tryEndpoint(path, params) {
  try {
    const resp = await axios.get(`https://${host}${path}`, {
      params,
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host },
      timeout: 10000,
    });
    console.log(`✅ ${path} — ${resp.status} — ${JSON.stringify(resp.data).slice(0, 200)}`);
  } catch (e) {
    console.log(`❌ ${path} — ${e.response?.status || e.message}`);
  }
}

async function main() {
  // Try to discover all endpoints
  const paths = [
    '/userinfo/', '/stories/', '/post_info/', '/search_users/',
    '/userposts/', '/user_posts/', '/feed/', '/user_feed/',
    '/reels/', '/user_reels/', '/highlights/', '/followers/',
    '/following/', '/comments/', '/likers/', '/tagged/',
    '/explore/', '/hashtag/', '/location/',
  ];
  
  for (const p of paths) {
    await tryEndpoint(p, { username_or_id: 'funkopopsnews' });
  }
}
main();
