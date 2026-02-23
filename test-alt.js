const axios = require('axios');

async function test() {
  // Method: Use gramsnap.com or similar proxy services
  const proxies = [
    { name: 'gramsnap', url: 'https://gramsnap.com/api/profile/instagram' },
    { name: 'picnob', url: 'https://www.picnob.com/api/profile/instagram' },
    { name: 'instanavigation', url: 'https://instanavigation.com/api/profile/instagram' },
  ];

  for (const p of proxies) {
    try {
      console.log(`Trying ${p.name}...`);
      const r = await axios.get(p.url, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 10000 
      });
      console.log(`  Status: ${r.status}, Data: ${JSON.stringify(r.data).substring(0, 300)}`);
    } catch (e) {
      console.log(`  Error: ${e.response?.status || e.message}`);
    }
  }

  // Method: Use a free proxy to call Instagram's API
  console.log('\nTrying Instagram GraphQL...');
  try {
    const r = await axios.get('https://www.instagram.com/instagram/?__a=1&__d=dis', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': '',
      },
      timeout: 10000,
      maxRedirects: 0,
      validateStatus: s => s < 400
    });
    console.log(`  Status: ${r.status}`);
    console.log(`  Type: ${r.headers['content-type']}`);
    console.log(`  Data: ${JSON.stringify(r.data).substring(0, 300)}`);
  } catch (e) {
    console.log(`  Error: ${e.response?.status} ${e.response?.headers?.location || ''}`);
  }
}
test();
