const https = require('https');
https.get('https://ipeep.xyz/sw.js', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => console.log('Status:', r.statusCode, '\nBody:', d));
}).on('error', e => console.log('ERR:', e.message));
