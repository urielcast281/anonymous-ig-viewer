const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

axios.get('https://instagram-scraper-api2.p.rapidapi.com/v1/info', {
  params: { username_or_id_or_url: 'harimwick' },
  headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com' },
  timeout: 15000
}).then(r => {
  console.log('Status:', r.status);
  console.log('Keys:', Object.keys(r.data));
  const d = r.data.data || r.data;
  console.log('username:', d.username);
  console.log('followers:', d.edge_followed_by?.count || d.follower_count);
  console.log('pic:', (d.profile_pic_url_hd || d.profile_pic_url || '').substring(0, 120));
  console.log('posts count:', d.edge_owner_to_timeline_media?.count || d.media_count);
  const posts = d.edge_owner_to_timeline_media?.edges || [];
  console.log('posts returned:', posts.length);
  if (posts[0]) console.log('first post img:', (posts[0].node?.display_url || '').substring(0, 120));
}).catch(e => console.log('Error:', e.response?.status, e.response?.data || e.message));
