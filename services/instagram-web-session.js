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

  _request(urlPath, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const req = https.get(`https://www.instagram.com${urlPath}`, {
        headers: {
          'User-Agent': UA,
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cookie': this._buildCookieString(),
          'X-IG-App-ID': IG_APP_ID,
          'X-CSRFToken': this.cookies?.csrftoken || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://www.instagram.com/',
          'Origin': 'https://www.instagram.com',
        },
        timeout
      }, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          if (res.statusCode === 401 || res.statusCode === 403) {
            return reject(new Error('Session expired — need to re-login'));
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
    const data = await this._request(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`);
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
