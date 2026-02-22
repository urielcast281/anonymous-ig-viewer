const axios = require('axios');

async function test() {
  try {
    const resp = await axios.get('https://instagram-scraper-20251.p.rapidapi.com/userinfo/', {
      params: { username_or_id: 'instagram' },
      headers: {
        'X-RapidAPI-Key': '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf',
        'X-RapidAPI-Host': 'instagram-scraper-20251.p.rapidapi.com',
      },
      timeout: 15000,
    });
    console.log('Status:', resp.status);
    console.log('Data keys:', Object.keys(resp.data));
    console.log(JSON.stringify(resp.data).slice(0, 2000));
  } catch (e) {
    console.log('Error:', e.response?.status, e.response?.data || e.message);
  }
}
test();
