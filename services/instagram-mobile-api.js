/**
 * Instagram Mobile Private API — Authenticates as Android device
 * Separate rate limit pool from web API, much higher limits
 * Uses burner account credentials from env vars
 * 
 * Endpoints hit i.instagram.com (mobile API) not www.instagram.com (web API)
 */

const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');
const zlib = require('zlib');

// Android device constants
const API_URL = 'i.instagram.com';
const API_VERSION = 'v1';
const APP_VERSION = '357.0.0.32.105';
const VERSION_CODE = '614349670';
const USER_AGENT = `Instagram ${APP_VERSION} Android (34/14; 480dpi; 1080x2400; samsung; SM-S918B; dm3q; qcom; en_US; ${VERSION_CODE})`;
const X_IG_APP_ID = '567067343352427'; // Android app ID
const BLOKS_VERSION = '0f0dfc44950c4a3d55e45cae1ae3ec3c8bb998b9d37d60edf3a9e11e7a72ad6a';

class InstagramMobileAPI {
  constructor() {
    this.username = process.env.IG_BURNER_USER || '';
    this.password = process.env.IG_BURNER_PASS || '';
    this.sessionId = null;
    this.csrfToken = null;
    this.userId = null;
    this.authToken = null;
    this.cookies = {};
    this.deviceId = this._generateDeviceId();
    this.uuid = this._generateUUID();
    this.phoneId = this._generateUUID();
    this.adId = this._generateUUID();
    this._loginPromise = null;
  }

  get isConfigured() {
    return !!(this.username && this.password);
  }

  _generateDeviceId() {
    const seed = (this.username || 'ipeep') + 'device';
    return 'android-' + crypto.createHash('md5').update(seed).digest('hex').slice(0, 16);
  }

  _generateUUID() {
    return crypto.randomUUID();
  }

  _buildCookieString() {
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  _parseCookies(setCookieHeaders) {
    if (!setCookieHeaders) return;
    const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    for (const h of headers) {
      const match = h.match(/^([^=]+)=([^;]*)/);
      if (match) {
        this.cookies[match[1].trim()] = match[2].trim();
      }
    }
    if (this.cookies.sessionid) this.sessionId = this.cookies.sessionid;
    if (this.cookies.csrftoken) this.csrfToken = this.cookies.csrftoken;
  }

  _request(method, path, body = null, retries = 1) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: API_URL,
        path: `/api/${API_VERSION}${path}`,
        method,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': '*/*',
          'Accept-Language': 'en-US',
          'Accept-Encoding': 'gzip, deflate',
          'X-IG-App-ID': X_IG_APP_ID,
          'X-IG-App-Locale': 'en_US',
          'X-IG-Device-Locale': 'en_US',
          'X-IG-Mapped-Locale': 'en_US',
          'X-IG-Capabilities': '3brTv10=',
          'X-IG-Connection-Type': 'WIFI',
          'X-IG-Connection-Speed': '3700kbps',
          'X-IG-Bandwidth-Speed-KBPS': '7060.000',
          'X-IG-Bandwidth-TotalBytes-B': '8242048',
          'X-IG-Bandwidth-TotalTime-MS': '1167',
          'X-IG-Device-ID': this.uuid,
          'X-IG-Android-ID': this.deviceId,
          'X-FB-HTTP-Engine': 'Liger',
          'X-FB-Client-IP': 'True',
          'X-FB-Server-Cluster': 'True',
          'X-Bloks-Version-Id': BLOKS_VERSION,
          'X-Bloks-Is-Layout-RTL': 'false',
          'X-Bloks-Is-Panorama-Enabled': 'true',
          'Connection': 'keep-alive',
        },
        timeout: 20000,
      };

      if (this.csrfToken) {
        options.headers['X-CSRFToken'] = this.csrfToken;
      }
      if (Object.keys(this.cookies).length) {
        options.headers['Cookie'] = this._buildCookieString();
      }
      if (this.authToken) {
        options.headers['Authorization'] = this.authToken;
      }

      if (body && method === 'POST') {
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        if (typeof body === 'object') body = querystring.stringify(body);
        options.headers['Content-Length'] = Buffer.byteLength(body);
      }

      const req = https.request(options, res => {
        let stream = res;
        if (res.headers['content-encoding'] === 'gzip') {
          stream = res.pipe(zlib.createGunzip());
        } else if (res.headers['content-encoding'] === 'deflate') {
          stream = res.pipe(zlib.createInflate());
        }
        const chunks = [];
        stream.on('data', c => chunks.push(c));
        stream.on('end', () => {
          this._parseCookies(res.headers['set-cookie']);
          if (res.headers['ig-set-authorization']) {
            this.authToken = res.headers['ig-set-authorization'];
          }
          const raw = Buffer.concat(chunks).toString();
          
          if (res.statusCode === 429 && retries > 0) {
            console.log('⏳ Mobile API rate limited, retrying in 3s...');
            return setTimeout(() => {
              this._request(method, path, body, retries - 1).then(resolve).catch(reject);
            }, 3000);
          }
          
          try {
            const data = JSON.parse(raw);
            if (res.statusCode >= 400) {
              return reject(new Error(`HTTP ${res.statusCode}: ${data.message || raw.slice(0, 200)}`));
            }
            resolve(data);
          } catch {
            if (res.statusCode >= 400) {
              return reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
            }
            reject(new Error('JSON parse failed'));
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      if (body && method === 'POST') req.write(typeof body === 'string' ? body : '');
      req.end();
    });
  }

  async login() {
    if (this.authToken || this.sessionId) return true;
    if (!this.isConfigured) throw new Error('Burner credentials not configured');
    
    // Singleton login — prevent concurrent login attempts
    if (this._loginPromise) return this._loginPromise;
    this._loginPromise = this._doLogin();
    try {
      return await this._loginPromise;
    } finally {
      this._loginPromise = null;
    }
  }

  async _doLogin() {
    console.log(`📱 Mobile API: logging in as @${this.username}...`);
    
    const time = Math.floor(Date.now() / 1000);
    const encPassword = `#PWD_INSTAGRAM:0:${time}:${this.password}`;

    const loginData = {
      jazoest: '22' + Math.floor(Math.random() * 100000),
      phone_id: this.phoneId,
      enc_password: encPassword,
      username: this.username,
      adid: this.adId,
      guid: this.uuid,
      device_id: this.deviceId,
      google_tokens: '[]',
      login_attempt_count: '0',
    };

    try {
      const resp = await this._request('POST', '/accounts/login/', loginData);
      if (resp.logged_in_user) {
        this.userId = String(resp.logged_in_user.pk);
        console.log(`✅ Mobile API: logged in as @${this.username} (uid: ${this.userId})`);
        return true;
      }
      throw new Error(resp.message || 'Login failed');
    } catch (e) {
      if (e.message.includes('challenge_required') || e.message.includes('checkpoint')) {
        console.log('⚠️ Mobile API: challenge/checkpoint required — account may need verification');
      }
      throw e;
    }
  }

  async _ensureLoggedIn() {
    if (!this.authToken && !this.sessionId) await this.login();
  }

  // ─── Public API Methods ───

  async getProfile(username) {
    await this._ensureLoggedIn();
    const data = await this._request('GET', `/users/${encodeURIComponent(username)}/usernameinfo/`);
    if (!data.user) throw new Error('User not found');
    const u = data.user;
    
    // Get full info with follower counts
    const fullInfo = await this._request('GET', `/users/${u.pk}/info/`).catch(() => ({ user: u }));
    const fu = fullInfo.user || u;
    
    return {
      id: String(fu.pk),
      username: fu.username,
      full_name: fu.full_name || fu.username,
      biography: fu.biography || '',
      profile_pic_url: fu.hd_profile_pic_url_info?.url || fu.profile_pic_url || '',
      profile_pic_url_hd: fu.hd_profile_pic_url_info?.url || fu.profile_pic_url || '',
      followers_count: fu.follower_count || 0,
      following_count: fu.following_count || 0,
      posts_count: fu.media_count || 0,
      is_verified: fu.is_verified || false,
      is_private: fu.is_private || false,
      external_url: fu.external_url || '',
    };
  }

  async getPosts(userId, count = 12) {
    await this._ensureLoggedIn();
    const data = await this._request('GET', `/feed/user/${userId}/?count=${count}`);
    const items = data.items || [];
    return items.slice(0, count).map((item, i) => ({
      id: String(item.pk || item.id),
      shortcode: item.code || '',
      display_url: item.image_versions2?.candidates?.[0]?.url || '',
      thumbnail_url: item.image_versions2?.candidates?.slice(-1)?.[0]?.url || item.image_versions2?.candidates?.[0]?.url || '',
      is_video: item.media_type === 2,
      video_url: item.video_versions?.[0]?.url || null,
      likes_count: item.like_count || 0,
      comments_count: item.comment_count || 0,
      caption: item.caption?.text || '',
      timestamp: item.taken_at || (Date.now() / 1000 - i * 86400),
    }));
  }

  async getProfileWithPosts(username, postCount = 12) {
    const profile = await this.getProfile(username);
    let posts = [];
    try {
      posts = await this.getPosts(profile.id, postCount);
    } catch (e) {
      console.log(`Mobile API: posts fetch failed for ${username}: ${e.message}`);
    }
    return { profile, posts };
  }

  async getStories(userId) {
    await this._ensureLoggedIn();
    const data = await this._request('GET', `/feed/reels_media/?user_ids=${userId}`);
    const reel = data.reels?.[userId] || data.reels_media?.[0];
    if (!reel?.items?.length) return [];
    
    return reel.items.map((item, i) => {
      const hasVideo = !!(item.video_versions?.length);
      const isVideo = item.media_type === 2 || hasVideo;
      const videoUrl = item.video_versions?.[0]?.url || null;
      console.log(`📱 Story ${i}: media_type=${item.media_type}, hasVideoVersions=${hasVideo}, video_url=${videoUrl ? 'YES (' + videoUrl.substring(0, 60) + '...)' : 'null'}`);
      return {
        id: String(item.pk || item.id),
        type: isVideo ? 'video' : 'image',
        display_url: item.image_versions2?.candidates?.[0]?.url || '',
        video_url: videoUrl,
        is_video: isVideo,
        timestamp: item.taken_at || (Date.now() / 1000 - i * 3600),
        expires_at: item.expiring_at || (Date.now() / 1000 + 86400),
      };
    });
  }

  async getReels(userId, count = 12) {
    await this._ensureLoggedIn();
    const body = {
      target_user_id: userId,
      page_size: count,
      include_feed_video: true,
    };
    const data = await this._request('POST', '/clips/user/', body);
    const items = data.items || [];
    return items.slice(0, count).map((item, i) => {
      const media = item.media || item;
      return {
        id: String(media.pk || media.id),
        shortcode: media.code || '',
        display_url: media.image_versions2?.candidates?.[0]?.url || '',
        video_url: media.video_versions?.[0]?.url || null,
        is_video: true,
        likes_count: media.like_count || 0,
        comments_count: media.comment_count || 0,
        caption: media.caption?.text || '',
        timestamp: media.taken_at || (Date.now() / 1000 - i * 86400),
        play_count: media.play_count || 0,
      };
    });
  }

  async search(query) {
    await this._ensureLoggedIn();
    const data = await this._request('GET', `/users/search/?q=${encodeURIComponent(query)}&count=20`);
    return (data.users || []).map(u => ({
      username: u.username,
      full_name: u.full_name || u.username,
      profile_pic_url: u.profile_pic_url || '',
      is_verified: u.is_verified || false,
      is_private: u.is_private || false,
      follower_count: u.follower_count || 0,
    }));
  }

  // Get highlights for a user
  async getHighlights(userId) {
    await this._ensureLoggedIn();
    const data = await this._request('GET', `/highlights/${userId}/highlights_tray/`);
    return (data.tray || []).map(h => ({
      id: h.id,
      title: h.title || '',
      cover_url: h.cover_media?.cropped_image_version?.url || '',
      item_count: h.media_count || 0,
    }));
  }
}

module.exports = new InstagramMobileAPI();
