const https = require('https');
https.get('https://quge5.com/88/tag.min.js', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => console.log('Monetag:', r.statusCode, d.length, 'bytes', d.slice(0, 150)));
}).on('error', e => console.log('ERR:', e.message));
