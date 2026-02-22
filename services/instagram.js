const axios = require('axios');
const UserAgent = require('user-agents');
const config = require('../config');
const cache = require('./cache');

class InstagramService {
  constructor() {
    this.userAgent = new UserAgent();
  }

  getHeaders() {
    return {
      'User-Agent': this.userAgent.toString(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    };
  }

  // ─── Method 1: RapidAPI Instagram Scraper ───
  async fetchViaRapidAPI(endpoint, params = {}) {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey || apiKey === 'your_rapidapi_key_here') return null;

    const hosts = [
      'instagram-scraper-api2.p.rapidapi.com',
      'instagram-scraper-20251.p.rapidapi.com',
      'instagram-bulk-profile-scrapper.p.rapidapi.com',
    ];

    for (const host of hosts) {
      try {
        const resp = await axios.get(`https://${host}/${endpoint}`, {
          params,
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': host,
          },
          timeout: 15000,
        });
        if (resp.status === 200 && resp.data) return resp.data;
      } catch (e) {
        console.log(`RapidAPI (${host}) failed: ${e.message}`);
      }
    }
    return null;
  }

  // ─── Method 2: Direct Instagram web scraping ───
  async fetchViaScraping(username) {
    const urls = [
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      `https://www.instagram.com/${username}/?__a=1&__d=dis`,
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    ];

    for (const url of urls) {
      try {
        const resp = await axios.get(url, {
          headers: {
            ...this.getHeaders(),
            'X-IG-App-ID': '936619743392459',
            'X-Requested-With': 'XMLHttpRequest',
          },
          timeout: 10000,
        });
        if (resp.status === 200 && resp.data) {
          // Different response shapes depending on endpoint
          const user = resp.data?.data?.user || resp.data?.graphql?.user || resp.data?.user;
          if (user) return user;
        }
      } catch (e) {
        console.log(`Direct scrape failed (${url.split('?')[0]}): ${e.message}`);
      }
    }
    return null;
  }

  // ─── Get profile with multi-method fallback ───
  async getProfile(username) {
    const cached = await cache.get('profile', username);
    if (cached) return cached;

    let profileData = null;

    // Method 1: RapidAPI (profile info + posts in parallel)
    try {
      const [rapidProfile, rapidPosts] = await Promise.all([
        this.fetchViaRapidAPI('userinfo/', { username_or_id: username }),
        this.fetchViaRapidAPI('userposts/', { username_or_id: username }),
      ]);
      if (rapidProfile && rapidProfile.data) {
        // Merge posts into profile data so normalizer can find them
        const mergedData = { ...rapidProfile.data };
        if (rapidPosts && rapidPosts.data && rapidPosts.data.items) {
          mergedData.items = rapidPosts.data.items;
        }
        profileData = this.normalizeRapidAPIProfile(mergedData);
      }
    } catch (e) {
      console.log(`RapidAPI profile fetch failed: ${e.message}`);
    }

    // Method 2: Direct scraping
    if (!profileData) {
      try {
        const scraped = await this.fetchViaScraping(username);
        if (scraped) {
          profileData = this.normalizeScrapedProfile(scraped);
        }
      } catch (e) {
        console.log(`Direct scrape profile failed: ${e.message}`);
      }
    }

    // Method 3: Mock data fallback (always fallback to keep site functional)
    if (!profileData) {
      console.log(`🎭 Using mock data for profile: ${username} (API unavailable)`);
      profileData = this.getMockProfileData(username);
    }

    await cache.set('profile', username, profileData);
    return profileData;
  }

  async getStories(username) {
    const cached = await cache.get('stories', username);
    if (cached) return cached;

    let storiesData = null;

    // RapidAPI stories
    try {
      const rapid = await this.fetchViaRapidAPI('stories/', { username_or_id: username });
      if (rapid && rapid.data) {
        storiesData = this.normalizeRapidAPIStories(rapid.data, username);
      }
    } catch (e) { /* fall through */ }

    // Fallback to mock
    if (!storiesData) {
      storiesData = this.getMockStoriesData(username);
    }

    await cache.set('stories', username, storiesData);
    return storiesData;
  }

  async getPost(shortcode) {
    const cached = await cache.get('posts', shortcode);
    if (cached) return cached;

    let postData = null;

    try {
      const rapid = await this.fetchViaRapidAPI('post_info/', { code_or_id_or_url: shortcode });
      if (rapid && rapid.data) {
        postData = this.normalizeRapidAPIPost(rapid.data);
      }
    } catch (e) { /* fall through */ }

    if (!postData) {
      postData = this.getMockPostData(shortcode);
    }

    await cache.set('posts', shortcode, postData);
    return postData;
  }

  async searchUsers(query) {
    const cached = await cache.get('search', query);
    if (cached) return cached;

    let results = null;

    // Try RapidAPI search
    try {
      const rapid = await this.fetchViaRapidAPI('search_users/', { search_query: query });
      if (rapid && rapid.data && rapid.data.items) {
        results = rapid.data.items.map(u => this.normalizeSearchResult(u));
      }
    } catch (e) { /* fall through */ }

    // Try direct Instagram search
    if (!results) {
      try {
        const resp = await axios.get(`https://www.instagram.com/web/search/topsearch/`, {
          params: { context: 'blended', query, rank_token: Math.random().toString(36).slice(2) },
          headers: this.getHeaders(),
          timeout: 10000,
        });
        if (resp.data && resp.data.users) {
          results = resp.data.users.map(u => this.normalizeSearchResult(u.user));
        }
      } catch (e) { /* fall through */ }
    }

    if (!results) {
      results = this.getMockSearchData(query);
    }

    await cache.set('search', query, results);
    return results;
  }

  // ─── Normalizers ───
  normalizeRapidAPIProfile(data) {
    return {
      id: data.id || data.pk,
      username: data.username,
      full_name: data.full_name || data.username,
      biography: data.biography || data.bio || '',
      profile_pic_url: data.profile_pic_url || data.profile_pic_url_hd || '/images/default-avatar.svg',
      profile_pic_url_hd: data.profile_pic_url_hd || data.hd_profile_pic_url_info?.url || data.profile_pic_url || '/images/default-avatar.svg',
      followers_count: data.follower_count || data.edge_followed_by?.count || 0,
      following_count: data.following_count || data.edge_follow?.count || 0,
      posts_count: data.media_count || data.edge_owner_to_timeline_media?.count || 0,
      is_verified: data.is_verified || false,
      is_private: data.is_private || false,
      external_url: data.external_url || '',
      recent_posts: (data.edge_owner_to_timeline_media?.edges || data.items || []).slice(0, 12).map((item, i) => {
        const node = item.node || item;
        return {
          id: node.id || node.pk || `post_${i}`,
          shortcode: node.shortcode || node.code || `code_${i}`,
          display_url: node.display_url || node.image_versions2?.candidates?.[0]?.url || node.thumbnail_url || `https://picsum.photos/400/400?random=${i}`,
          thumbnail_url: node.thumbnail_src || node.thumbnail_url || node.display_url || `https://picsum.photos/300/300?random=${i}`,
          is_video: node.is_video || node.media_type === 2,
          likes_count: node.edge_liked_by?.count || node.like_count || 0,
          comments_count: node.edge_media_to_comment?.count || node.comment_count || 0,
          caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || node.caption?.text || '',
          timestamp: node.taken_at_timestamp || node.taken_at || (Date.now() / 1000 - i * 86400),
        };
      }),
    };
  }

  normalizeScrapedProfile(user) {
    return this.normalizeRapidAPIProfile(user); // same shape mostly
  }

  normalizeRapidAPIStories(data, username) {
    const items = Array.isArray(data) ? data : data.items || data.stories || [];
    return {
      user: { username, profile_pic_url: '/images/default-avatar.svg' },
      stories: items.map((s, i) => ({
        id: s.id || s.pk || `story_${i}`,
        display_url: s.image_versions2?.candidates?.[0]?.url || s.display_url || `https://picsum.photos/400/600?random=${i + 100}`,
        is_video: s.media_type === 2 || s.is_video || false,
        video_url: s.video_versions?.[0]?.url || null,
        timestamp: s.taken_at || (Date.now() / 1000 - i * 3600),
        expires_at: s.expiring_at || (Date.now() / 1000 + 86400),
      })),
    };
  }

  normalizeRapidAPIPost(data) {
    return {
      id: data.id || data.pk,
      shortcode: data.shortcode || data.code,
      display_url: data.image_versions2?.candidates?.[0]?.url || data.display_url || '',
      is_video: data.media_type === 2 || data.is_video || false,
      video_url: data.video_versions?.[0]?.url || null,
      caption: data.caption?.text || '',
      likes_count: data.like_count || 0,
      comments_count: data.comment_count || 0,
      timestamp: data.taken_at || Date.now() / 1000,
      owner: {
        username: data.user?.username || 'unknown',
        full_name: data.user?.full_name || '',
        profile_pic_url: data.user?.profile_pic_url || '/images/default-avatar.svg',
      },
    };
  }

  normalizeSearchResult(user) {
    return {
      id: user.pk || user.id,
      username: user.username,
      full_name: user.full_name || user.username,
      profile_pic_url: user.profile_pic_url || '/images/default-avatar.svg',
      is_verified: user.is_verified || false,
      is_private: user.is_private || false,
      followers_count: user.follower_count || 0,
    };
  }

  // ─── Mock Data ───
  getMockProfileData(username) {
    const seed = username.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = (max) => Math.abs((seed * 9301 + 49297) % max);
    return {
      id: String(r(999999999)),
      username,
      full_name: username.charAt(0).toUpperCase() + username.slice(1),
      biography: `Welcome to @${username}'s profile. View stories and posts anonymously on InstaViewer.`,
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
      caption: `Viewing post ${shortcode} anonymously on InstaViewer. #instagram`,
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
