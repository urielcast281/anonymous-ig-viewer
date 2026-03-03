const https = require('https');

const RAPIDAPI_KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
const username = 'cristiano';

// Alternative endpoint patterns to try
const alternativeTests = [
  {
    name: 'instagram-scraper-api2 (alternative)',
    host: 'instagram-scraper-api2.p.rapidapi.com',
    path: `/v1/user_info`,
    method: 'POST',
    body: { username }
  },
  {
    name: 'instagram-bulk-profile-scrapper (v2)',
    host: 'instagram-bulk-profile-scrapper.p.rapidapi.com',
    path: `/userinfo`,
    method: 'POST',
    body: { username: username }
  },
  {
    name: 'instagram-scraper-2022 (info)',
    host: 'instagram-scraper-2022.p.rapidapi.com',
    path: `/user_info`,
    method: 'POST',
    body: { username: username }
  },
  {
    name: 'instagram28 (alt)',
    host: 'instagram28.p.rapidapi.com',
    path: `/userinfo`,
    method: 'POST',
    body: { user: username }
  },
  {
    name: 'instagram47 (profile)',
    host: 'instagram47.p.rapidapi.com',
    path: `/profile`,
    method: 'POST',
    body: { username: username }
  },
  {
    name: 'instagram230 (profile)',
    host: 'instagram230.p.rapidapi.com',
    path: `/profile`,
    method: 'POST',
    body: { username: username }
  },
  // Let's also try some GET endpoints with different patterns
  {
    name: 'instagram-scraper-api2 (simple)',
    host: 'instagram-scraper-api2.p.rapidapi.com',
    path: `/v1/user_info?username=${username}`,
    method: 'GET'
  },
  {
    name: 'instagram28 (simple)',
    host: 'instagram28.p.rapidapi.com',
    path: `/user/${username}`,
    method: 'GET'
  }
];

function testAPI(api) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing ${api.name}...`);
    
    const postData = api.body ? JSON.stringify(api.body) : null;
    
    const options = {
      hostname: api.host,
      path: api.path,
      method: api.method,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': api.host,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 ${api.name}: Status ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log(`✅ ${api.name}: SUCCESS - Got data for ${username}`);
            console.log(`   Response keys: ${Object.keys(parsed).slice(0, 5).join(', ')}...`);
            if (parsed.data) {
              console.log(`   Data keys: ${Object.keys(parsed.data).slice(0, 5).join(', ')}...`);
            }
            resolve({ api, success: true, data: parsed, status: res.statusCode });
          } catch (e) {
            console.log(`❌ ${api.name}: Invalid JSON response`);
            console.log(`   Raw response: ${data.slice(0, 200)}...`);
            resolve({ api, success: false, error: 'Invalid JSON', status: res.statusCode, response: data.slice(0, 200) });
          }
        } else {
          console.log(`❌ ${api.name}: Failed with status ${res.statusCode}`);
          if (res.statusCode === 429) {
            console.log(`   Rate limited (quota exceeded)`);
          } else if (res.statusCode === 403) {
            console.log(`   Forbidden (check API key or permissions)`);
          } else if (res.statusCode === 404) {
            console.log(`   Not found (endpoint may not exist)`);
          }
          console.log(`   Response: ${data.slice(0, 200)}...`);
          resolve({ api, success: false, status: res.statusCode, response: data.slice(0, 200) });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${api.name}: Error - ${err.message}`);
      resolve({ api, success: false, error: err.message });
    });

    req.on('timeout', () => {
      console.log(`⏰ ${api.name}: Timeout`);
      req.destroy();
      resolve({ api, success: false, error: 'Timeout' });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testAlternativeAPIs() {
  console.log('🔍 Testing alternative Instagram API endpoints...\n');
  console.log(`Testing profile data for: ${username}`);
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const api of alternativeTests) {
    const result = await testAPI(api);
    results.push(result);
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY RESULTS:');
  console.log('='.repeat(60));
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (working.length > 0) {
    console.log(`\n✅ WORKING APIs (${working.length}):`);
    working.forEach(r => {
      console.log(`   • ${r.api.name}`);
      console.log(`     Host: ${r.api.host}`);
      console.log(`     Method: ${r.api.method} ${r.api.path}`);
      if (r.api.body) {
        console.log(`     Body: ${JSON.stringify(r.api.body)}`);
      }
      console.log('');
    });
    
    console.log(`\n🎯 RECOMMENDED: Use ${working[0].api.name} as the new Priority 2 API`);
    return working[0];
  } else {
    console.log(`\n❌ NO WORKING APIs found. All ${failed.length} APIs failed.`);
    console.log(`\n⚠️  All RapidAPI endpoints seem to be unavailable or require different authentication.`);
    console.log(`   We'll need to rely on mock data as the fallback.`);
  }
  
  return null;
}

testAlternativeAPIs().catch(console.error);