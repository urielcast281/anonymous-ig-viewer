const axios = require('axios');

async function test() {
  const r = await axios.get('https://dumpoir.com/v/harimwick', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 10000
  });
  console.log(r.data);
}
test().catch(e => console.log('err:', e.message));
