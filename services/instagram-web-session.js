/**
 * Instagram Web Session API — Uses browser cookies to call IG's web API
 * No instagram-private-api needed. Just session cookies from a logged-in browser.
 * 
 * Cookies stored in .ig-sessions/web-cookies.json
 * Refresh by logging in via browser and re-extracting cookies.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SESSION_FILE = path.join(__dirname, '..', '.ig-sessions', 'web-cookies.json');
const IG_APP_ID = '936619743392459';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

class InstagramWebSession {
  constructor() {
    this.cookies = this._loadCookies();
  }

  _loadCookies() {
    // Priority 1: Environment variable (for Render/production)
    if (process.env.IG_WEB_COOKIES) {
      try {
        return JSON.parse(process.env.IG_WEB_COOKIES);
      } catch {}
    }
    // Priority 2: File (for local dev)
    try {
      if (fs.existsSync(SESSION_FILE)) {
        return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      }
    } catch {}
    return null;
  }

  saveCookies(cookies) {
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SESSION_FILE, JSON.stringify(cookies, null, 2));
    this.cookies = cookies;
  }

  isReady() {
    return !!(this.cookies?.sessionid && this.cookies?.csrftoken && this.cookies?.ds_user_id);
  }

  _buildCookieString() {
    if (!this.cookies) return '';
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  _request(urlPath, timeout = 15000, retries = 1) {
    return new Promise((resolve, reject) => {
      const req = https.get(`https://www.instagram.com${urlPath}`, {
        headers: {
          'User-Agent': UA,
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cookie': this._buildCookieString() + '; ig_nrcb=1',
          'X-IG-App-ID': IG_APP_ID,
          'X-CSRFToken': this.cookies?.csrftoken || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://www.instagram.com/',
          'Origin': 'https://www.instagram.com',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
        },
        timeout
      }, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          if (res.statusCode === 401 || res.statusCode === 403) {
            return reject(new Error('Session expired — need to re-login'));
          }
          if (res.statusCode === 429 && retries > 0) {
            console.log('⏳ IG rate limited, retrying in 2s...');
            return setTimeout(() => {
              this._request(urlPath, timeout, retries - 1).then(resolve).catch(reject);
            }, 2000);
          }
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
          }
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('JSON parse failed')); }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
  }

  async getProfile(username) {
    // Try web_profile_info API first
    let data;
    try {
      data = await this._request(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`, 15000, 0);
    } catch (e) {
      if (e.message.includes('429')) {
        // API rate limited — try HTML scrape (different rate limit)
        console.log(`⏳ API 429'd, trying HTML scrape for @${username}...`);
        try {
          const scraped = await this._scrapeProfile(username);
          if (scraped) return scraped;
        } catch (scrapeErr) {
          console.log(`HTML scrape failed: ${scrapeErr.message}`);
        }
      }
      throw e;
    }
    if (data.status !== 'ok' || !data.data?.user) throw new Error('Profile not found');
    
    const u = data.data.user;
    return {
      id: u.id,
      username: u.username,
      full_name: u.full_name,
      biography: u.biography,
      profile_pic_url: u.profile_pic_url_hd || u.profile_pic_url,
      follower_count: u.edge_followed_by?.count || 0,
      following_count: u.edge_follow?.count || 0,
      post_count: u.edge_owner_to_timeline_media?.count || 0,
      is_private: u.is_private,
      is_verified: u.is_verified,
      external_url: u.external_url,
      category: u.category_name,
    };
  }

  async getUserId(username) {
    const profile = await this.getProfile(username);
    return profile.id;
  }

  async getPosts(username, count = 12) {
    // Same endpoint as getProfile — reuse if possible
    const data = await this._request(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`);
    if (data.status !== 'ok' || !data.data?.user) throw new Error('Profile not found');
    
    const edges = data.data.user.edge_owner_to_timeline_media?.edges || [];
    return edges.slice(0, count).map(e => {
      const n = e.node;
      return {
        id: n.id,
        shortcode: n.shortcode,
        type: n.__typename,
        display_url: n.display_url,
        thumbnail: n.thumbnail_src,
        caption: n.edge_media_to_caption?.edges?.[0]?.node?.text || '',
        like_count: n.edge_liked_by?.count || 0,
        comment_count: n.edge_media_to_comment?.count || 0,
        timestamp: n.taken_at_timestamp,
        is_video: n.is_video,
        video_url: n.video_url || null,
        accessibility_caption: n.accessibility_caption,
      };
    });
  }

  // Combined profile + posts in a single API call (avoids double requests)
  async getProfileWithPosts(username, postCount = 12) {
    let data;
    try {
      data = await this._request(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`, 15000, 0);
    } catch (e) {
      if (e.message.includes('429')) {
        console.log(`⏳ API 429'd, trying HTML scrape for @${username}...`);
        try {
          const scraped = await this._scrapeProfile(username);
          if (scraped) return { profile: scraped, posts: [] };
        } catch (scrapeErr) {
          console.log(`HTML scrape failed: ${scrapeErr.message}`);
        }
      }
      throw e;
    }
    if (data.status !== 'ok' || !data.data?.user) throw new Error('Profile not found');
    
    const u = data.data.user;
    const edges = u.edge_owner_to_timeline_media?.edges || [];
    
    return {
      profile: {
        id: u.id,
        username: u.username,
        full_name: u.full_name,
        biography: u.biography,
        profile_pic_url: u.profile_pic_url_hd || u.profile_pic_url,
        follower_count: u.edge_followed_by?.count || 0,
        following_count: u.edge_follow?.count || 0,
        post_count: u.edge_owner_to_timeline_media?.count || 0,
        is_private: u.is_private,
        is_verified: u.is_verified,
        external_url: u.external_url,
        category: u.category_name,
      },
      posts: edges.slice(0, postCount).map(e => {
        const n = e.node;
        return {
          id: n.id,
          shortcode: n.shortcode,
          type: n.__typename,
          display_url: n.display_url,
          thumbnail: n.thumbnail_src,
          caption: n.edge_media_to_caption?.edges?.[0]?.node?.text || '',
          like_count: n.edge_liked_by?.count || 0,
          comment_count: n.edge_media_to_comment?.count || 0,
          timestamp: n.taken_at_timestamp,
          is_video: n.is_video,
          video_url: n.video_url || null,
          accessibility_caption: n.accessibility_caption,
        };
      }),
    };
  }

  async getStories(userId) {
    // Stories require the reels tray endpoint
    const data = await this._request(`/api/v1/feed/reels_media/?reel_ids=${userId}`);
    if (!data.reels_media?.length) return [];
    
    const reel = data.reels_media[0];
    return (reel.items || []).map(item => ({
      id: item.id,
      type: item.media_type === 2 ? 'video' : 'image',
      image_url: item.image_versions2?.candidates?.[0]?.url || '',
      video_url: item.video_versions?.[0]?.url || null,
      timestamp: item.taken_at,
      expiring_at: item.expiring_at,
    }));
  }

  // Scrape public profile page HTML — different rate limit than API endpoints
  async _scrapeProfile(username) {
    return new Promise((resolve, reject) => {
      const req = https.get(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cookie': this._buildCookieString() + '; ig_nrcb=1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
        },
        timeout: 15000
      }, res => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          return reject(new Error('Redirect — login required'));
        }
        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        let html = '';
        res.on('data', c => html += c);
        res.on('end', () => {
          try {
            // Try to extract JSON from script tags
            // Method 1: window._sharedData
            let match = html.match(/window\._sharedData\s*=\s*(\{.+?\});<\/script>/s);
            if (match) {
              const shared = JSON.parse(match[1]);
              const u = shared?.entry_data?.ProfilePage?.[0]?.graphql?.user;
              if (u) return resolve(this._parseGraphqlUser(u));
            }
            // Method 2: __NEXT_DATA__ (newer IG)
            match = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(\{.+?\})<\/script>/s);
            if (match) {
              const next = JSON.parse(match[1]);
              // Navigate the Next.js data structure
              const userData = this._findUserInNextData(next);
              if (userData) return resolve(userData);
            }
            // Method 3: look for xdt_api__v1__users__web_profile_info in any script
            match = html.match(/"xdt_api__v1__users__web_profile_info":\s*(\{.+?\})\s*[,}]/s);
            if (match) {
              const info = JSON.parse(match[1]);
              const u = info?.user;
              if (u) return resolve(this._parseGraphqlUser(u));
            }
            reject(new Error('Could not parse profile from HTML'));
          } catch (e) {
            reject(new Error('HTML parse failed: ' + e.message));
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
  }

  _parseGraphqlUser(u) {
    return {
      id: u.id,
      username: u.username,
      full_name: u.full_name,
      biography: u.biography,
      profile_pic_url: u.profile_pic_url_hd || u.profile_pic_url,
      follower_count: u.edge_followed_by?.count || 0,
      following_count: u.edge_follow?.count || 0,
      post_count: u.edge_owner_to_timeline_media?.count || 0,
      is_private: u.is_private,
      is_verified: u.is_verified,
      external_url: u.external_url,
      category: u.category_name,
    };
  }

  _findUserInNextData(data) {
    // Recursively search for user object in Next.js data
    const str = JSON.stringify(data);
    const match = str.match(/"username":"[^"]+","full_name":"[^"]*"/);
    if (!match) return null;
    // Find the containing user object
    try {
      const userMatch = str.match(/\{"id":"(\d+)","username":"([^"]+)","full_name":"([^"]*)"/);
      if (userMatch) {
        // Extract what we can from the string
        return {
          id: userMatch[1],
          username: userMatch[2],
          full_name: userMatch[3],
          biography: '',
          profile_pic_url: '',
          follower_count: 0,
          following_count: 0,
          post_count: 0,
          is_private: false,
          is_verified: false,
          external_url: '',
        };
      }
    } catch {}
    return null;
  }

  async search(query) {
    const data = await this._request(`/web/search/topsearch/?query=${encodeURIComponent(query)}&context=blended`);
    return (data.users || []).map(u => ({
      username: u.user.username,
      full_name: u.user.full_name,
      profile_pic_url: u.user.profile_pic_url,
      is_verified: u.user.is_verified,
      is_private: u.user.is_private,
      follower_count: u.user.follower_count,
    }));
  }
}

module.exports = InstagramWebSession;
