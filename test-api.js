const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

axios.post('https://instagram120.p.rapidapi.com/api/instagram/profile', 
  { username: 'harimwick' },
  { headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram120.p.rapidapi.com', 'Content-Type': 'application/json' }, timeout: 15000 }
).then(r => {
  console.log('status:', r.status);
  console.log('hasResult:', !!r.data?.result);
  console.log('username:', r.data?.result?.username);
  console.log('pic:', (r.data?.result?.profile_pic_url || '').substring(0, 100));
  console.log('followers:', r.data?.result?.edge_followed_by?.count || r.data?.result?.follower_count);
}).catch(e => {
  console.log('error:', e.response?.status, e.response?.data || e.message);
});
