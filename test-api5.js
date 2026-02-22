const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
const host = 'instagram120.p.rapidapi.com';

async function test() {
  // Test posts endpoint
  try {
    const r = await axios.post(`https://${host}/api/instagram/posts`, 
      { username: 'instagram', maxId: '' },
      { headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host, 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    console.log('posts:', r.status, JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('posts FAIL:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 300));
  }

  // Try user info endpoint
  try {
    const r = await axios.post(`https://${host}/api/instagram/user_info`,
      { username: 'instagram' },
      { headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host, 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    console.log('user_info:', r.status, JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('user_info FAIL:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 300));
  }

  // Try search
  try {
    const r = await axios.post(`https://${host}/api/instagram/search`,
      { query: 'instagram' },
      { headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host, 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    console.log('search:', r.status, JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('search FAIL:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 300));
  }

  // Try stories
  try {
    const r = await axios.post(`https://${host}/api/instagram/stories`,
      { username: 'instagram' },
      { headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host, 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    console.log('stories:', r.status, JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('stories FAIL:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 300));
  }
}
test();
