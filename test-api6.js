const axios = require('axios');

// Try alternative free services
async function test() {
  const username = 'harimwick';
  
  // Method 1: imginn.com (popular IG viewer, has JSON API)
  try {
    console.log('Trying imginn...');
    const r = await axios.get(`https://imginn.com/api/search/?q=${username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    });
    console.log('imginn status:', r.status, JSON.stringify(r.data).substring(0, 300));
  } catch(e) { console.log('imginn error:', e.response?.status || e.message); }

  // Method 2: i.instagram.com (mobile API - public profiles)
  try {
    console.log('\nTrying i.instagram.com mobile API...');
    const r = await axios.get(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      headers: { 
        'User-Agent': 'Instagram 275.0.0.27.98 Android (33/13; 440dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100; en_US; 458229258)',
        'X-IG-App-ID': '936619743392459',
      },
      timeout: 10000
    });
    console.log('mobile status:', r.status, JSON.stringify(r.data).substring(0, 300));
  } catch(e) { console.log('mobile error:', e.response?.status || e.message); }

  // Method 3: gramhir / dumpor style
  try {
    console.log('\nTrying dumpor...');
    const r = await axios.get(`https://dumpoir.com/v/${username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000
    });
    console.log('dumpor status:', r.status, 'length:', r.data.length);
    // Extract profile pic from HTML
    const picMatch = r.data.match(/class="user__img"[^>]*src="([^"]+)"/);
    if (picMatch) console.log('Found pic:', picMatch[1].substring(0, 100));
  } catch(e) { console.log('dumpor error:', e.response?.status || e.message); }
}

test();
