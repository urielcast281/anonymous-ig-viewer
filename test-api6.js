const axios = require('axios');
const key = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
const host = 'instagram120.p.rapidapi.com';

async function tryEndpoint(ep, body) {
  try {
    const r = await axios.post(`https://${host}${ep}`, body,
      { headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host, 'Content-Type': 'application/json' }, timeout: 15000 });
    console.log(`✅ ${ep}: ${r.status}`, JSON.stringify(r.data).slice(0, 400));
  } catch (e) {
    console.log(`❌ ${ep}: ${e.response?.status}`, JSON.stringify(e.response?.data || e.message).slice(0, 100));
  }
}

async function main() {
  await tryEndpoint('/api/instagram/info', { username: 'instagram' });
  await tryEndpoint('/api/instagram/profile', { username: 'instagram' });
  await tryEndpoint('/api/instagram/user', { username: 'instagram' });
  await tryEndpoint('/api/instagram/userinfo', { username: 'instagram' });
}
main();
