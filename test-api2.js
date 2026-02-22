const axios = require('axios');

async function test() {
  const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
  const host = 'instagram-scraper-20251.p.rapidapi.com';
  
  // Test userinfo endpoint
  try {
    const r = await axios.get(`https://${host}/userinfo/`, {
      params: { username_or_id: 'instagram' },
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host },
      timeout: 15000,
    });
    console.log('userinfo:', r.status, JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('userinfo FAIL:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 300));
  }

  // Test search endpoint
  try {
    const r = await axios.get(`https://${host}/search_users/`, {
      params: { search_query: 'instagram' },
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host },
      timeout: 15000,
    });
    console.log('search:', r.status, JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('search FAIL:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 300));
  }
}
test();
