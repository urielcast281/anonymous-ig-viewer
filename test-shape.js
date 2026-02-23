const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
const host = 'instagram120.p.rapidapi.com';

axios.post(`https://${host}/api/instagram/profile`, { username: 'cristiano' }, {
  headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host, 'Content-Type': 'application/json' },
  timeout: 15000,
}).then(r => {
  console.log(JSON.stringify(r.data, null, 2).slice(0, 2000));
}).catch(e => console.log('FAIL:', e.response?.status, e.response?.data));
