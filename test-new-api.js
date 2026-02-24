const axios = require('axios');
const KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';

async function test() {
  // Test 1: instagram-api-fast-reliable-data-scraper
  try {
    const r = await axios.get('https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/user/info_by_username/instagram', {
      headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com' },
      timeout: 10000,
    });
    console.log('API1 STATUS:', r.status);
    console.log('API1 DATA:', JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('API1 ERR:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 200));
  }

  // Test 2: instagram-data1
  try {
    const r = await axios.get('https://instagram-data1.p.rapidapi.com/user/info?username=instagram', {
      headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-data1.p.rapidapi.com' },
      timeout: 10000,
    });
    console.log('API2 STATUS:', r.status);
    console.log('API2 DATA:', JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('API2 ERR:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 200));
  }

  // Test 3: instagram-looter2
  try {
    const r = await axios.get('https://instagram-looter2.p.rapidapi.com/profile?username=instagram', {
      headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com' },
      timeout: 10000,
    });
    console.log('API3 STATUS:', r.status);
    console.log('API3 DATA:', JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('API3 ERR:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 200));
  }

  // Test 4: instagram120 (current, known down)
  try {
    const r = await axios.post('https://instagram120.p.rapidapi.com/api/instagram/profile', { username: 'instagram' }, {
      headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram120.p.rapidapi.com', 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    console.log('API4 STATUS:', r.status);
    console.log('API4 DATA:', JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('API4 ERR:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 200));
  }

  // Test 5: instagram-bulk-profile-scrapper
  try {
    const r = await axios.get('https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile?ig=instagram&response_type=short', {
      headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': 'instagram-bulk-profile-scrapper.p.rapidapi.com' },
      timeout: 10000,
    });
    console.log('API5 STATUS:', r.status);
    console.log('API5 DATA:', JSON.stringify(r.data).slice(0, 500));
  } catch (e) {
    console.log('API5 ERR:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 200));
  }
}

test();
