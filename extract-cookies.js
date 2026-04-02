/**
 * Extract IG session cookies from the OpenClaw browser via CDP
 * Saves to .ig-sessions/web-cookies.json for use by instagram-web-session.js
 */
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function getDebuggerUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:18800/json', res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const pages = JSON.parse(d);
          const ig = pages.find(p => p.url?.includes('instagram.com'));
          if (ig) resolve(ig.webSocketDebuggerUrl);
          else reject(new Error('No Instagram tab found'));
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function getCookiesViaCDP(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.on('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Network.getCookies', params: { urls: ['https://www.instagram.com'] } }));
    });
    ws.on('message', data => {
      const msg = JSON.parse(data);
      if (msg.id === 1) {
        ws.close();
        if (msg.result?.cookies) resolve(msg.result.cookies);
        else reject(new Error('No cookies in response'));
      }
    });
    ws.on('error', reject);
    setTimeout(() => { ws.close(); reject(new Error('CDP timeout')); }, 5000);
  });
}

async function main() {
  try {
    console.log('Finding Instagram browser tab...');
    const wsUrl = await getDebuggerUrl();
    console.log('Got debugger URL, extracting cookies...');
    
    const allCookies = await getCookiesViaCDP(wsUrl);
    const igCookies = allCookies.filter(c => c.domain?.includes('instagram.com'));
    
    // Build cookie map
    const cookieMap = {};
    for (const c of igCookies) {
      cookieMap[c.name] = c.value;
    }
    
    console.log('Found cookies:', Object.keys(cookieMap).join(', '));
    console.log('sessionid:', cookieMap.sessionid ? '✅ present' : '❌ MISSING');
    console.log('csrftoken:', cookieMap.csrftoken ? '✅ present' : '❌ MISSING');
    console.log('ds_user_id:', cookieMap.ds_user_id || 'missing');
    
    // Save
    const outDir = path.join(__dirname, '.ig-sessions');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'web-cookies.json'), JSON.stringify(cookieMap, null, 2));
    console.log('\n✅ Cookies saved to .ig-sessions/web-cookies.json');
    
  } catch (e) {
    console.error('❌', e.message);
  }
}

main();
