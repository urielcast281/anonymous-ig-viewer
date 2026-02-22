const axios = require('axios');

async function test() {
  try {
    const resp = await axios.get('https://instagram-scraper-20251.p.rapidapi.com/userinfo/', {
      params: { username_or_id: 'funkopopsnews' },
      headers: {
        'X-RapidAPI-Key': '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf',
        'X-RapidAPI-Host': 'instagram-scraper-20251.p.rapidapi.com',
      },
      timeout: 15000,
    });
    const d = resp.data.data;
    console.log('username:', d.username);
    console.log('full_name:', d.full_name);
    console.log('followers:', d.follower_count);
    console.log('is_private:', d.is_private);
    console.log('media_count:', d.media_count);
    // Check if posts are included
    console.log('has items?', !!d.items);
    console.log('has edge_owner?', !!d.edge_owner_to_timeline_media);
    console.log('keys:', Object.keys(d).filter(k => k.includes('media') || k.includes('item') || k.includes('edge') || k.includes('post')));
  } catch (e) {
    console.log('Error:', e.response?.status, e.response?.data || e.message);
  }
}
test();
