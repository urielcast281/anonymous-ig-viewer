const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

async function tryAPIs() {
  const apis = [
    { host: 'instagram-scraper-2022.p.rapidapi.com', url: '/ig/info_username/', params: { user: 'harimwick' }, method: 'get' },
    { host: 'instagram-profile1.p.rapidapi.com', url: '/getprofile/harimwick', params: {}, method: 'get' },
    { host: 'instagram28.p.rapidapi.com', url: '/user_info', params: { user_name: 'harimwick' }, method: 'get' },
    { host: 'rocketapi-for-instagram.p.rapidapi.com', url: '/instagram/user/get_info', body: { username: 'harimwick' }, method: 'post' },
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
        r = await axios.post(`https://${api.host}${api.url}`, api.body, config);
      }
      console.log('Status:', r.status);
      console.log('Sample:', JSON.stringify(r.data).substring(0, 500));
    } catch (e) {
      console.log('Error:', e.response?.status, (e.response?.data ? JSON.stringify(e.response.data).substring(0, 200) : e.message));
    }
  }
}

tryAPIs();
