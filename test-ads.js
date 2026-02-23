const https = require('https');

// Test if Adsterra scripts are reachable
const urls = [
  'https://pl28772947.effectivegatecpm.com/11/2a/44/112a4451f89eb82797367144be67b6b7.js',
  'https://pl28773008.effectivegatecpm.com/7b466dd839b40ecfeb07def8c857f3b2/invoke.js',
];

urls.forEach(url => {
  https.get(url, r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => console.log(`${r.statusCode} | ${url.slice(-30)} | ${d.length} bytes | starts: ${d.slice(0, 80)}`));
  }).on('error', e => console.log(`ERR ${url}: ${e.message}`));
});
