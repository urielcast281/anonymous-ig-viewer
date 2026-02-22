const axios = require('axios');

async function test() {
  const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
  const hosts = [
    'instagram-scraper-api2.p.rapidapi.com',
    'instagram-scraper-20251.p.rapidapi.com',
    'instagram-bulk-profile-scrapper.p.rapidapi.com',
  ];

  for (const host of hosts) {
    try {
      const r = await axios.get(`https://${host}/v1/info`, {
        params: { username_or_id_or_url: 'instagram' },
        headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host },
        timeout: 10000,
      });
      console.log(`${host}: ${r.status} OK`, JSON.stringify(r.data).slice(0, 200));
    } catch (e) {
      console.log(`${host}: FAIL ${e.response?.status || e.message}`, JSON.stringify(e.response?.data || '').slice(0, 200));
    }
  }
}
test();
