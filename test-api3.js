const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

async function tryAPI(name, host, endpoint, params) {
  try {
    const r = await axios.get(`https://${host}${endpoint}`, {
      params,
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host },
      timeout: 15000,
    });
    console.log(`✅ ${name}: ${r.status}`, JSON.stringify(r.data).slice(0, 300));
    return true;
  } catch (e) {
    console.log(`❌ ${name}: ${e.response?.status || 'TIMEOUT'}`, JSON.stringify(e.response?.data || e.message).slice(0, 200));
    return false;
  }
}

async function main() {
  // 1. Instagram Scraper (junioroangel)
  await tryAPI('instagram-scraper', 'instagram-scraper.p.rapidapi.com', '/user_info', { username: 'instagram' });
  
  // 2. Instagram API Fast & Reliable
  await tryAPI('fast-reliable', 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com', '/user_info', { username: 'instagram' });
  
  // 3. Instagram Scraper Stable API
  await tryAPI('stable-api', 'instagram-scraper-stable-api.p.rapidapi.com', '/user_info', { username: 'instagram' });
  
  // 4. Free Instagram Scraper
  await tryAPI('free-scraper', 'free-instagram-scraper.p.rapidapi.com', '/user_info', { username: 'instagram' });

  // 5. Instagram Scrapper Posts & Reels
  await tryAPI('posts-reels', 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com', '/user_info', { username: 'instagram' });
}
main();
