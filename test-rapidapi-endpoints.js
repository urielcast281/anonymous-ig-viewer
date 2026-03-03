const https = require('https');

const RAPIDAPI_KEY = '3613ebc26emsh8b60dbc9a77d681p1f2c8ajsne00c1eb6aaaf';
const username = 'cristiano';

// Define the APIs to test
const apisToTest = [
  {
    name: 'instagram-scraper-api2',
    host: 'instagram-scraper-api2.p.rapidapi.com',
    path: `/v1/info?username_or_id_or_url=${username}`,
    method: 'GET'
  },
  {
    name: 'instagram-bulk-profile-scrapper',
    host: 'instagram-bulk-profile-scrapper.p.rapidapi.com',
    path: `/userinfo/${username}`,
    method: 'GET'
  },
  {
    name: 'instagram-scraper-2022',
    host: 'instagram-scraper-2022.p.rapidapi.com',
    path: `/user/${username}`,
    method: 'GET'
  },
  {
    name: 'instagram28',
    host: 'instagram28.p.rapidapi.com',
    path: `/user_info?username=${username}`,
    method: 'GET'
  },
  {
    name: 'instagram47',
    host: 'instagram47.p.rapidapi.com',
    path: `/user_info?username=${username}`,
    method: 'GET'
  },
  {
    name: 'instagram230',
    host: 'instagram230.p.rapidapi.com',
    path: `/user?username=${username}`,
    method: 'GET'
  }
];

function testAPI(api) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing ${api.name}...`);
    
    const options = {
      hostname: api.host,
      path: api.path,
      method: api.method,
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': api.host,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

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
            console.log(`   Keys: ${Object.keys(parsed).slice(0, 5).join(', ')}...`);
            resolve({ api, success: true, data: parsed, status: res.statusCode });
          } catch (e) {
            console.log(`❌ ${api.name}: Invalid JSON response`);
            resolve({ api, success: false, error: 'Invalid JSON', status: res.statusCode });
          }
        } else {
          console.log(`❌ ${api.name}: Failed with status ${res.statusCode}`);
          if (res.statusCode === 429) {
            console.log(`   Rate limited (quota exceeded)`);
          }
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

    req.end();
  });
}

async function testAllAPIs() {
  console.log('🔍 Testing Instagram APIs for working endpoints...\n');
  console.log(`Testing profile data for: ${username}`);
  console.log('='.repeat(50));
  
  const results = [];
  
  for (const api of apisToTest) {
    const result = await testAPI(api);
    results.push(result);
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 SUMMARY RESULTS:');
  console.log('='.repeat(50));
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (working.length > 0) {
    console.log(`\n✅ WORKING APIs (${working.length}):`);
    working.forEach(r => {
      console.log(`   • ${r.api.name} (${r.api.host})`);
    });
    
    console.log(`\n🎯 RECOMMENDED: Use ${working[0].api.name} as the new Priority 2 API`);
  } else {
    console.log(`\n❌ NO WORKING APIs found. All ${failed.length} APIs failed.`);
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ FAILED APIs (${failed.length}):`);
    failed.forEach(r => {
      console.log(`   • ${r.api.name}: ${r.error || `Status ${r.status}`}`);
    });
  }
  
  return { working, failed };
}

testAllAPIs().catch(console.error);