const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
const host = 'instagram120.p.rapidapi.com';

axios.post(`https://${host}/api/instagram/profile`, { username: 'cristiano' }, {
  headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host, 'Content-Type': 'application/json' },
  timeout: 15000,
}).then(r => {
  console.log('Status:', r.status);
  console.log('Headers:', JSON.stringify(r.headers).slice(0, 300));
  const d = r.data.result;
  console.log('Username:', d.username, '| Followers:', d.follower_count, '| Verified:', d.is_verified);
}).catch(e => {
  console.log('FAIL:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 300));
  console.log('Headers:', JSON.stringify(e.response?.headers || {}).slice(0, 300));
});
