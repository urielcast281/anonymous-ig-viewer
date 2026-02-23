const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

async function tryAPI(name, host, method, endpoint, params, body) {
  try {
    const opts = {
      method: method || 'GET',
      url: `https://${host}${endpoint}`,
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host, 'Content-Type': 'application/json' },
      timeout: 15000,
    };
    if (params) opts.params = params;
    if (body) opts.data = body;
    const r = await axios(opts);
    console.log(`✅ ${name}: ${r.status}`, JSON.stringify(r.data).slice(0, 600));
    return true;
  } catch (e) {
    console.log(`❌ ${name}: ${e.response?.status}`, JSON.stringify(e.response?.data || e.message).slice(0, 200));
    return false;
  }
}

async function main() {
  // 1. Instagram Stories API (Prasadbro) - dedicated stories API
  await tryAPI('stories-api', 'instagram-stories1.p.rapidapi.com', 'GET', '/v1/get_stories', { username: 'cristiano' });
  
  // 2. Our existing instagram120 - stories endpoint with different usernames
  await tryAPI('ig120-stories-cr7', 'instagram120.p.rapidapi.com', 'POST', '/api/instagram/stories', { username: 'cristiano' });
  await tryAPI('ig120-stories-ig', 'instagram120.p.rapidapi.com', 'POST', '/api/instagram/stories', { username: 'instagram' });
  await tryAPI('ig120-stories-kim', 'instagram120.p.rapidapi.com', 'POST', '/api/instagram/stories', { username: 'kimkardashian' });
  
  // 3. Try highlights (these persist longer than 24h stories)
  await tryAPI('ig120-highlights', 'instagram120.p.rapidapi.com', 'POST', '/api/instagram/highlights', { username: 'cristiano' });
  await tryAPI('ig120-reels', 'instagram120.p.rapidapi.com', 'POST', '/api/instagram/reels', { username: 'cristiano' });
}
main();
