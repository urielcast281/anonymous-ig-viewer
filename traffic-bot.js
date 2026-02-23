/**
 * Traffic Bot for ipeep.xyz
 * Simulates real user visits with random pages, user agents, and delays
 * Run: node traffic-bot.js [count] [delayMs]
 */

const https = require('https');
const http = require('http');

const SITE = 'https://ipeep.xyz';
const PAGES = [
  '/',
  '/profile/instagram',
  '/profile/cristiano',
  '/profile/therock',
  '/profile/kyliejenner',
  '/profile/selenagomez',
  '/profile/taylorswift',
  '/profile/neymarjr',
  '/profile/kimkardashian',
  '/search?q=instagram',
  '/search?q=cristiano',
  '/search?q=drake',
  '/instagram-story-viewer',
  '/anonymous-instagram-viewer',
  '/picuki-alternative',
  '/blog',
  '/blog/view-instagram-stories-anonymously',
  '/blog/best-picuki-alternatives',
  '/blog/is-anonymous-instagram-viewing-safe',
  '/about',
  '/about/how-it-works',
  '/about/privacy',
  '/about/terms',
  '/stories/instagram',
  '/stories/cristiano',
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

const REFERRERS = [
  'https://www.google.com/search?q=instagram+story+viewer',
  'https://www.google.com/search?q=view+instagram+anonymously',
  'https://www.google.com/search?q=picuki+alternative',
  'https://www.google.com/search?q=anonymous+instagram+viewer',
  'https://www.bing.com/search?q=instagram+story+viewer+free',
  'https://duckduckgo.com/?q=view+instagram+stories+anonymously',
  'https://www.reddit.com/r/instagram/',
  'https://twitter.com/',
  '',  // direct visit
  '',
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms + Math.random() * ms * 0.5)); }

async function visit(i) {
  const page = rand(PAGES);
  const url = SITE + page;
  const ua = rand(USER_AGENTS);
  const ref = rand(REFERRERS);

  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': ua,
        'Referer': ref,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
      timeout: 15000,
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const status = res.statusCode;
        const icon = status === 200 ? '✅' : status === 302 ? '↗️' : '❌';
        console.log(`${icon} [${i}] ${status} ${page} (${data.length}b) | UA: ${ua.slice(0, 40)}...`);
        resolve(status);
      });
    });
    req.on('error', (e) => {
      console.log(`❌ [${i}] ERR ${page}: ${e.message}`);
      resolve(0);
    });
    req.on('timeout', () => { req.destroy(); resolve(0); });
  });
}

async function main() {
  const count = parseInt(process.argv[2]) || 50;
  const delayMs = parseInt(process.argv[3]) || 3000;

  console.log(`🤖 Traffic Bot starting — ${count} visits, ~${delayMs}ms between each`);
  console.log(`🎯 Target: ${SITE}`);
  console.log(`📄 ${PAGES.length} pages, ${USER_AGENTS.length} user agents, ${REFERRERS.length} referrers\n`);

  let ok = 0, fail = 0;
  for (let i = 1; i <= count; i++) {
    const status = await visit(i);
    if (status === 200 || status === 302) ok++; else fail++;
    if (i < count) await sleep(delayMs);
  }

  console.log(`\n🏁 Done! ${ok} successful, ${fail} failed out of ${count} visits`);
}

main();
