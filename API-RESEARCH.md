# Instagram API Research

## Overview of Options

### 1. Official Instagram Graph API
- **Requires:** Facebook Developer account, approved app
- **Access:** Only YOUR OWN account data or accounts that authorize your app
- **Can fetch:** Your posts, insights, comments, mentions
- **CANNOT fetch:** Other users' stories, arbitrary profiles, private content
- **Rate Limits:** 200 calls/user/hour
- **Cost:** Free
- **Verdict:** ❌ NOT suitable for a viewer site - requires user OAuth consent

### 2. Instagram Basic Display API
- **Status:** DEPRECATED (Meta shutting it down)
- **Verdict:** ❌ Dead, don't use

### 3. Web Scraping (Direct)
Your current approach in `instagram.js`:
- **Method:** Hit Instagram's internal web endpoints (`/api/v1/users/web_profile_info/`, `/?__a=1&__d=dis`)
- **Pros:** Free, no API key needed
- **Cons:** 
  - Instagram actively blocks scrapers
  - Rate limited aggressively (429 errors)
  - Requires rotating proxies + user agents
  - Can break anytime Instagram changes their endpoints
  - Stories require authentication (session cookies)
- **Verdict:** ⚠️ Works for profiles/posts but unreliable. Stories are very hard without auth.

### 4. ⭐ RapidAPI Instagram Scrapers (RECOMMENDED)
Multiple third-party APIs on RapidAPI that scrape Instagram for you:

#### a) Instagram Scraper 2025 (by DavidGelling)
- **Endpoint:** rapidapi.com/DavidGelling/api/instagram-scraper-20251
- **Features:** Profiles, posts, stories, reels, search
- **Free Tier:** 100 requests/month
- **Paid:** $10/mo for 10K requests, $50/mo for 100K
- **Reliability:** Claims 100% success rate (3x backend retry)

#### b) Instagram Scraper Stable API
- **Endpoint:** rapidapi.com/thetechguy32744/api/instagram-scraper-stable-api
- **Features:** User info, posts, stories, reels, highlights
- **Free Tier:** 50 requests/month
- **Paid:** Starts ~$10/mo

#### c) Instagram API Fast & Reliable
- **Endpoint:** rapidapi.com/mediacrawlers/api/instagram-api-fast-reliable
- **Features:** Full scraping suite
- **Rate Limits:** Varies by plan

**Pros of RapidAPI approach:**
- Handles all the proxy rotation, rate limiting, session management FOR you
- Much more reliable than DIY scraping
- Easy to swap providers if one breaks
- Pay per use scales with your traffic

**Cons:**
- Costs money ($10-50/mo for decent volume)
- Still depends on third party maintaining their scraper
- API can go down

### 5. Instaloader (Python)
- **GitHub:** github.com/instaloader/instaloader
- **Language:** Python (not ideal for Node.js app)
- **Features:** Download profiles, stories, posts, IGTV, reels
- **Auth:** Supports login for stories/private content
- **Rate Limits:** Instagram's own limits apply
- **Verdict:** Great for batch downloads, not ideal for real-time web app

### 6. instagram-private-api (Node.js)
- **GitHub:** github.com/dilame/instagram-private-api
- **Language:** JavaScript/Node.js
- **Features:** Full Instagram mobile API access
- **Auth:** REQUIRES Instagram account credentials
- **Risk:** Account can get banned by Instagram
- **Verdict:** ⚠️ Powerful but risky. Need burner accounts.

### 7. Bright Data / ScraperAPI / Oxylabs
- **Type:** Enterprise scraping infrastructure
- **Cost:** $100-500+/month
- **Features:** Residential proxies, SERP scraping, pre-built IG scrapers
- **Verdict:** Overkill for starting out, consider when scaling

## 🏆 Recommended Strategy

### Phase 1 (MVP Launch)
1. Keep your current **direct scraping** for basic profile data
2. Add a **RapidAPI scraper** as primary data source (Instagram Scraper 2025)
3. Use **mock/cached data** as fallback when APIs fail
4. Store heavily in cache (profiles: 1hr, stories: 15min)

### Phase 2 (Growing)
1. Add **instagram-private-api** with burner accounts for stories
2. Set up **proxy rotation** (buy residential proxies)
3. Implement request queueing to manage rate limits
4. Multiple RapidAPI providers for redundancy

### Phase 3 (Scale)
1. Consider **Bright Data** or similar enterprise solution
2. Build your own scraping infra with residential proxies
3. Implement CDN caching for media files
4. Consider legal review for terms of service compliance

## Implementation Notes

### For your current `services/instagram.js`:
```javascript
// Add RapidAPI as primary, fall back to direct scraping
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'instagram-scraper-20251.p.rapidapi.com';

async function getProfileViaRapidAPI(username) {
  const response = await axios.get(`https://${RAPIDAPI_HOST}/v1/info`, {
    params: { username_or_id_or_url: username },
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST
    }
  });
  return response.data;
}
```

### Cost Estimate
- **RapidAPI Basic:** ~$10/mo (10K requests)
- At 1000 daily visitors, ~3K API calls/day = ~90K/month
- Need Pro plan: ~$50/mo
- **ROI:** If ads make $2-5 CPM on 1K daily visitors = $60-150/mo → profitable
