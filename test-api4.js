// Test: scrape Instagram profile page directly (no API needed)
const axios = require('axios');

async function scrapeProfile(username) {
  try {
    // Instagram's public web profile JSON endpoint
    const r = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 15000,
    });
    const user = r.data?.data?.user;
    if (user) {
      console.log('SUCCESS! username:', user.username);
      console.log('full_name:', user.full_name);
      console.log('followers:', user.edge_followed_by?.count);
      console.log('pic:', user.profile_pic_url_hd?.substring(0, 100));
      console.log('posts:', user.edge_owner_to_timeline_media?.count);
      console.log('first post pic:', user.edge_owner_to_timeline_media?.edges?.[0]?.node?.display_url?.substring(0, 100));
    } else {
      console.log('No user data. Response:', JSON.stringify(r.data).substring(0, 300));
    }
  } catch (e) {
    console.log('Error:', e.response?.status, e.response?.data ? JSON.stringify(e.response.data).substring(0, 200) : e.message);
  }
}

scrapeProfile('harimwick');
