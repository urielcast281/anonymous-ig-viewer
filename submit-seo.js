const https = require('https');

const pages = [
  'https://ipeep.xyz',
  'https://ipeep.xyz/instagram-story-viewer',
  'https://ipeep.xyz/anonymous-instagram-viewer',
  'https://ipeep.xyz/picuki-alternative',
  'https://ipeep.xyz/blog',
  'https://ipeep.xyz/about',
  'https://ipeep.xyz/blog/how-to-view-instagram-stories-anonymously',
  'https://ipeep.xyz/blog/best-instagram-viewer-tools-2025',
  'https://ipeep.xyz/blog/picuki-alternatives-that-actually-work',
];

// Submit to Bing IndexNow
console.log('📡 Submitting to Bing IndexNow...');
let done = 0;
pages.forEach(url => {
  const reqUrl = `https://www.bing.com/indexnow?url=${encodeURIComponent(url)}&key=ipeepxyz2026`;
  https.get(reqUrl, res => {
    console.log(`  ${res.statusCode === 202 ? '✅' : '❌'} ${url} → ${res.statusCode}`);
    if (++done === pages.length) {
      console.log('\n📡 Submitting to Yandex IndexNow...');
      done = 0;
      pages.forEach(url2 => {
        const yUrl = `https://yandex.com/indexnow?url=${encodeURIComponent(url2)}&key=ipeepxyz2026`;
        https.get(yUrl, res2 => {
          console.log(`  ${res2.statusCode < 300 ? '✅' : '❌'} ${url2} → ${res2.statusCode}`);
          if (++done === pages.length) console.log('\nDone!');
        }).on('error', () => { console.log(`  ❌ ${url2} → error`); done++; });
      });
    }
  }).on('error', () => { console.log(`  ❌ ${url} → error`); done++; });
});
