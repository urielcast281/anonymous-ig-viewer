const axios = require('axios');

async function test() {
  try {
    const resp = await axios.get('https://instagram-scraper-20251.p.rapidapi.com/userinfo/', {
      params: { username_or_id: 'cristiano' },
      headers: {
        'X-RapidAPI-Key': '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf',
        'X-RapidAPI-Host': 'instagram-scraper-20251.p.rapidapi.com',
      },
      timeout: 15000,
    });
    const d = resp.data.data;
    console.log('username:', d.username);
    console.log('full_name:', d.full_name);
    console.log('biography:', d.biography);
    console.log('followers:', d.follower_count);
    console.log('following:', d.following_count);
    console.log('posts:', d.media_count);
    console.log('profile_pic:', d.profile_pic_url_hd?.slice(0, 100));
    console.log('is_private:', d.is_private);
    console.log('is_verified:', d.is_verified);
  } catch (e) {
    console.log('Error:', e.response?.status, e.response?.data || e.message);
  }
}
test();
