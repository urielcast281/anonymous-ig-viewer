const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

// Try a different Instagram API on RapidAPI
async function tryAPIs() {
  const apis = [
    { host: 'instagram-scraper-api2.p.rapidapi.com', url: '/v1/info', params: { username_or_id_or_url: 'harimwick' }, method: 'get' },
    { host: 'instagram-bulk-profile-scrapper.p.rapidapi.com', url: '/clients/api/ig/ig_profile', params: { ig: 'harimwick' }, method: 'get' },
    { host: 'instagram47.p.rapidapi.com', url: '/api/user_info', params: { username: 'harimwick' }, method: 'get' },
  ];

  for (const api of apis) {
    try {
      console.log(`\nTrying ${api.host}...`);
      const config = {
        headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': api.host },
        timeout: 15000
      };
      let r;
      if (api.method === 'get') {
        r = await axios.get(`https://${api.host}${api.url}`, { ...config, params: api.params });
      } else {
        r = await axios.post(`https://${api.host}${api.url}`, api.params, config);
      }
      console.log('Status:', r.status);
      console.log('Data keys:', Object.keys(r.data || {}).slice(0, 10));
      console.log('Sample:', JSON.stringify(r.data).substring(0, 300));
    } catch (e) {
      console.log('Error:', e.response?.status, (e.response?.data ? JSON.stringify(e.response.data).substring(0, 150) : e.message));
    }
  }
}

tryAPIs();
