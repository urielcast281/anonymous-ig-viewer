const axios = require('axios');
const UserAgent = require('user-agents');
const config = require('../config');
const cache = require('./cache');
const igDirect = require('./instagram-direct');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'instagram120.p.rapidapi.com';

class InstagramService {
  constructor() {
    this.userAgent = new UserAgent();
  }

  // ─── Primary: instagram120 API (POST-based) ───
  async apiCall(endpoint, body) {
    if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') return null;
    try {
      const r = await axios.post(`https://${RAPIDAPI_HOST}/api/instagram/${endpoint}`, body, {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });
      if (r.status === 200 && r.data) return r.data;
    } catch (e) {
      console.log(`API (instagram120) ${endpoint} failed: ${e.response?.status || e.message}`);
    }
    return null;
  }

  // ─── Fallback: instagram-scraper-api2 (GET-based) ───
  async apiCallV2(endpoint, params) {
    if (!RAPIDAPI_KEY) return null;
    const HOST2 = 'instagram-scraper-api2.p.rapidapi.com';
    try {
      const r = await axios.get(`https://${HOST2}${endpoint}`, {
        params,
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': HOST2,
        },
        timeout: 15000,
      });
      if (r.status === 200 && r.data) return r.data;
    } catch (e) {
      console.log(`API (scraper-v2) ${endpoint} failed: ${e.response?.status || e.message}`);
    }
    return null;
  }

  // ─── Get profile ───
  async getProfile(username) {
    const cached = await cache.get('profile', username);
    if (cached) return cached;

    let profileData = null;

    // Priority 1: Direct Instagram API (burner accounts) — most reliable
    if (igDirect.isConfigured) {
      try {
        console.log(`📱 Trying direct IG API for: ${username} (${igDirect.accountCount} accounts)`);
        profileData = await igDirect.getProfile(username);
        if (profileData) {
          console.log(`✅ Got real data for @${username} via direct API`);
          await cache.set('profile', username, profileData);
          return profileData;
        }
      } catch (e) {
        console.log(`Direct API failed: ${e.message}`);
      }
    }

    // Priority 2: RapidAPI instagram120
    try {
      const [profileResp, postsResp] = await Promise.all([
        this.apiCall('profile', { username }),
        this.apiCall('posts', { username, maxId: '' }),
      ]);

      if (profileResp && profileResp.result) {
        const p = profileResp.result;
        const posts = postsResp?.result?.edges || [];

        profileData = {
          id: p.id || p.pk,
          username: p.username,
          full_name: p.full_name || p.username,
          biography: p.biography || p.bio || '',
          profile_pic_url: p.profile_pic_url || '/images/default-avatar.svg',
          profile_pic_url_hd: p.profile_pic_url_hd || p.hd_profile_pic_url_info?.url || p.profile_pic_url || '/images/default-avatar.svg',
          followers_count: p.edge_followed_by?.count || p.follower_count || 0,
          following_count: p.edge_follow?.count || p.following_count || 0,
          posts_count: p.edge_owner_to_timeline_media?.count || p.media_count || 0,
          is_verified: p.is_verified || false,
          is_private: p.is_private || false,
          external_url: p.external_url || '',
          recent_posts: posts.slice(0, 12).map((item, i) => {
            const node = item.node || item;
            const imgUrl = node.image_versions2?.candidates?.[0]?.url || node.display_url || node.thumbnail_src || `https://picsum.photos/400/400?random=${i}`;
            return {
              id: node.id || node.pk || `post_${i}`,
              shortcode: node.code || node.shortcode || `code_${i}`,
              display_url: imgUrl,
              thumbnail_url: node.thumbnail_src || node.thumbnail_url || imgUrl,
              is_video: node.video_versions != null || node.is_video || node.media_type === 2,
              likes_count: node.like_count || node.edge_liked_by?.count || 0,
              comments_count: node.comment_count || node.edge_media_to_comment?.count || 0,
              caption: node.caption?.text || node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
              timestamp: node.taken_at || node.taken_at_timestamp || (Date.now() / 1000 - i * 86400),
            };
          }),
        };
      }
    } catch (e) {
      console.log(`Profile fetch failed: ${e.message}`);
    }

    // Fallback: try instagram-scraper-api2
    if (!profileData) {
      try {
        console.log(`🔄 Trying fallback API (scraper-v2) for: ${username}`);
        const v2Resp = await this.apiCallV2('/v1/info', { username_or_id_or_url: username });
        if (v2Resp && v2Resp.data) {
          const p = v2Resp.data;
          const posts = p.edge_owner_to_timeline_media?.edges || [];
          profileData = {
            id: p.id || p.pk,
            username: p.username,
            full_name: p.full_name || p.username,
            biography: p.biography || '',
            profile_pic_url: p.profile_pic_url || '/images/default-avatar.svg',
            profile_pic_url_hd: p.profile_pic_url_hd || p.profile_pic_url || '/images/default-avatar.svg',
            followers_count: p.edge_followed_by?.count || p.follower_count || 0,
            following_count: p.edge_follow?.count || p.following_count || 0,
            posts_count: p.edge_owner_to_timeline_media?.count || p.media_count || 0,
            is_verified: p.is_verified || false,
            is_private: p.is_private || false,
            external_url: p.external_url || '',
            recent_posts: posts.slice(0, 12).map((item, i) => {
              const node = item.node || item;
              return {
                id: node.id || node.pk || `post_${i}`,
                shortcode: node.shortcode || `code_${i}`,
                display_url: node.display_url || node.thumbnail_src || '',
                thumbnail_url: node.thumbnail_src || node.display_url || '',
                is_video: node.is_video || false,
                likes_count: node.edge_liked_by?.count || node.like_count || 0,
                comments_count: node.edge_media_to_comment?.count || node.comment_count || 0,
                caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
                timestamp: node.taken_at_timestamp || (Date.now() / 1000 - i * 86400),
              };
            }),
          };
        }
      } catch (e) {
        console.log(`Fallback API failed: ${e.message}`);
      }
    }

    // Fallback to mock
    if (!profileData) {
      console.log(`🎭 Using mock data for profile: ${username}`);
      profileData = this.getMockProfileData(username);
    }

    await cache.set('profile', username, profileData);
    return profileData;
  }

  async getStories(username, userId) {
    const cached = await cache.get('stories', username);
    if (cached) return cached;

    let storiesData = null;

    // Priority 1: Direct API
    if (igDirect.isConfigured) {
      try {
        storiesData = await igDirect.getStories(username);
        if (storiesData) {
          await cache.set('stories', username, storiesData);
          return storiesData;
        }
      } catch (e) {
        console.log(`Direct stories failed: ${e.message}`);
      }
    }

    // Need userId for stories endpoint — get from profile if not provided
    if (!userId) {
      try {
        const profileResp = await this.apiCall('profile', { username });
        if (profileResp && profileResp.result) {
          userId = profileResp.result.id;
        }
      } catch (e) { /* fall through */ }
    }

    // Fetch stories using userId
    if (userId) {
      try {
        const resp = await this.apiCall('stories', { userId });
        if (resp && resp.result && Array.isArray(resp.result) && resp.result.length > 0) {
          storiesData = {
            user: { username, profile_pic_url: '/images/default-avatar.svg' },
            stories: resp.result.map((s, i) => ({
              id: s.id || s.pk || `story_${i}`,
              display_url: s.image_versions2?.candidates?.[0]?.url || s.display_url || `https://picsum.photos/400/600?random=${i + 100}`,
              is_video: s.media_type === 2 || s.is_video || false,
              video_url: s.video_versions?.[0]?.url || null,
              timestamp: s.taken_at || (Date.now() / 1000 - i * 3600),
              expires_at: s.expiring_at || (Date.now() / 1000 + 86400),
            })),
          };
        }
      } catch (e) { /* fall through */ }
    }

    // No active stories — return null (let routes handle fallback to posts)
    if (!storiesData) {
      storiesData = { user: { username, profile_pic_url: '/images/default-avatar.svg' }, stories: [] };
    }

    await cache.set('stories', username, storiesData);
    return storiesData;
  }

  // ─── Get Reels ───
  async getReels(username, userId) {
    const cached = await cache.get('reels', username);
    if (cached) return cached;

    if (!userId) {
      try {
        const profileResp = await this.apiCall('profile', { username });
        if (profileResp && profileResp.result) userId = profileResp.result.id;
      } catch (e) { /* fall through */ }
    }

    let reelsData = [];
    if (userId) {
      try {
        const resp = await this.apiCall('reels', { userId });
        if (resp && resp.result && resp.result.edges) {
          reelsData = resp.result.edges.slice(0, 12).map((item, i) => {
            const node = item.node?.media || item.node || item;
            return {
              id: node.id || node.pk || `reel_${i}`,
              shortcode: node.code || node.shortcode || `reel_${i}`,
              display_url: node.image_versions2?.candidates?.[0]?.url || `https://picsum.photos/400/600?random=${i}`,
              video_url: node.video_versions?.[0]?.url || null,
              is_video: true,
              likes_count: node.like_count || 0,
              comments_count: node.comment_count || 0,
              caption: node.caption?.text || '',
              timestamp: node.taken_at || (Date.now() / 1000 - i * 86400),
              play_count: node.play_count || 0,
            };
          });
        }
      } catch (e) { /* fall through */ }
    }

    await cache.set('reels', username, reelsData);
    return reelsData;
  }

  async getPost(shortcode) {
    const cached = await cache.get('posts', shortcode);
    if (cached) return cached;

    // No single post endpoint on this API — use mock
    const postData = this.getMockPostData(shortcode);
    await cache.set('posts', shortcode, postData);
    return postData;
  }

  async searchUsers(query) {
    const cached = await cache.get('search', query);
    if (cached) return cached;

    // No search endpoint on this API — try direct Instagram search
    let results = null;
    try {
      const resp = await axios.get('https://www.instagram.com/web/search/topsearch/', {
        params: { context: 'blended', query, rank_token: Math.random().toString(36).slice(2) },
        headers: {
          'User-Agent': this.userAgent.toString(),
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
      if (resp.data && resp.data.users) {
        results = resp.data.users.map(u => ({
          id: u.user.pk || u.user.id,
          username: u.user.username,
          full_name: u.user.full_name || u.user.username,
          profile_pic_url: u.user.profile_pic_url || '/images/default-avatar.svg',
          is_verified: u.user.is_verified || false,
          is_private: u.user.is_private || false,
          followers_count: u.user.follower_count || 0,
        }));
      }
    } catch (e) { /* fall through */ }

    if (!results) {
      results = this.getMockSearchData(query);
    }

    await cache.set('search', query, results);
    return results;
  }

  // ─── Mock Data ───
  getMockProfileData(username) {
    const seed = username.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = (max) => Math.abs((seed * 9301 + 49297) % max);
    return {
      id: String(r(999999999)),
      username,
      full_name: username.charAt(0).toUpperCase() + username.slice(1),
      biography: `Welcome to @${username}'s profile. View stories and posts anonymously on iPeep.`,
      profile_pic_url: `https://ui-avatars.com/api/?name=${username}&background=E1306C&color=fff&size=150`,
      profile_pic_url_hd: `https://ui-avatars.com/api/?name=${username}&background=E1306C&color=fff&size=320`,
      followers_count: r(10000000),
      following_count: r(5000),
      posts_count: r(3000),
      is_verified: r(10) > 7,
      is_private: false,
      external_url: '',
      recent_posts: Array.from({ length: 12 }, (_, i) => ({
        id: `${username}_${i}`,
        shortcode: `${username.slice(0, 5)}${String(i).padStart(6, '0')}`,
        display_url: `https://picsum.photos/seed/${username}${i}/600/600`,
        thumbnail_url: `https://picsum.photos/seed/${username}${i}/300/300`,
        is_video: i % 5 === 0,
        likes_count: r(50000) + i * 100,
        comments_count: r(2000) + i * 10,
        caption: `Post ${i + 1} by @${username} #instagram #explore`,
        timestamp: Date.now() / 1000 - i * 86400,
      })),
    };
  }

  getMockStoriesData(username) {
    const count = 1 + Math.floor(Math.random() * 4);
    return {
      user: {
        username,
        profile_pic_url: `https://ui-avatars.com/api/?name=${username}&background=E1306C&color=fff&size=150`,
      },
      stories: Array.from({ length: count }, (_, i) => ({
        id: `story_${username}_${i}`,
        display_url: `https://picsum.photos/seed/${username}story${i}/400/700`,
        is_video: i === 0,
        video_url: null,
        timestamp: Date.now() / 1000 - i * 3600,
        expires_at: Date.now() / 1000 + 86400 - i * 3600,
      })),
    };
  }

  getMockPostData(shortcode) {
    return {
      id: `post_${shortcode}`,
      shortcode,
      display_url: `https://picsum.photos/seed/${shortcode}/600/600`,
      is_video: false,
      video_url: null,
      caption: `Viewing post ${shortcode} anonymously on iPeep. #instagram`,
      likes_count: Math.floor(Math.random() * 50000),
      comments_count: Math.floor(Math.random() * 2000),
      timestamp: Date.now() / 1000 - 86400,
      owner: { username: 'instagram', full_name: 'Instagram', profile_pic_url: '/images/default-avatar.svg' },
    };
  }

  getMockSearchData(query) {
    return Array.from({ length: 8 }, (_, i) => ({
      id: String(1000 + i),
      username: i === 0 ? query : `${query}${['official', '_real', '.page', 'fan', '_daily', 'hq', 'clips'][i - 1] || i}`,
      full_name: `${query.charAt(0).toUpperCase() + query.slice(1)} ${i === 0 ? '' : ['Official', 'Fan Page', 'Daily', 'Clips', 'HQ', 'Updates', 'Best'][i - 1] || ''}`.trim(),
      profile_pic_url: `https://ui-avatars.com/api/?name=${query}${i}&background=833AB4&color=fff&size=150`,
      is_verified: i === 0,
      is_private: i === 3,
      followers_count: Math.floor(Math.random() * 1000000),
    }));
  }
}

module.exports = new InstagramService();
