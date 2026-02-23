/**
 * Instagram Direct API — Uses burner accounts to call Instagram's private mobile API
 * No RapidAPI dependency. This is how storiesig, picnob, etc. work.
 * 
 * Accounts are stored in .env as IG_ACCOUNTS=user1:pass1,user2:pass2,...
 * Rotates through accounts to avoid rate limits.
 */

const { IgApiClient } = require('instagram-private-api');
const fs = require('fs');
const path = require('path');

const SESSION_DIR = path.join(__dirname, '..', '.ig-sessions');

class InstagramDirect {
  constructor() {
    this.accounts = this._parseAccounts();
    this.currentIdx = 0;
    this.clients = new Map(); // username -> { ig, lastUsed, cooldownUntil }
    
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
    }
  }

  _parseAccounts() {
    const raw = process.env.IG_ACCOUNTS || '';
    if (!raw) return [];
    return raw.split(',').map(pair => {
      const [username, password] = pair.split(':');
      return { username: username.trim(), password: password.trim() };
    }).filter(a => a.username && a.password);
  }

  _getNextAccount() {
    if (!this.accounts.length) return null;
    // Round-robin with cooldown check
    for (let i = 0; i < this.accounts.length; i++) {
      const idx = (this.currentIdx + i) % this.accounts.length;
      const acc = this.accounts[idx];
      const client = this.clients.get(acc.username);
      if (client && client.cooldownUntil && Date.now() < client.cooldownUntil) continue;
      this.currentIdx = (idx + 1) % this.accounts.length;
      return acc;
    }
    // All on cooldown, use first anyway
    this.currentIdx = (this.currentIdx + 1) % this.accounts.length;
    return this.accounts[this.currentIdx];
  }

  async _getClient(account) {
    const existing = this.clients.get(account.username);
    if (existing && existing.ig) return existing.ig;

    const ig = new IgApiClient();
    ig.state.generateDevice(account.username);

    // Try to restore session
    const sessionFile = path.join(SESSION_DIR, `${account.username}.json`);
    try {
      if (fs.existsSync(sessionFile)) {
        const saved = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        await ig.state.deserialize(saved);
        // Verify session works
        await ig.account.currentUser();
        console.log(`📱 Restored session for @${account.username}`);
        this.clients.set(account.username, { ig, lastUsed: Date.now() });
        return ig;
      }
    } catch (e) {
      console.log(`⚠️ Session expired for @${account.username}, re-logging in...`);
    }

    // Fresh login
    try {
      ig.state.generateDevice(account.username);
      await ig.simulate.preLoginFlow();
      const loggedIn = await ig.account.login(account.username, account.password);
      console.log(`✅ Logged in as @${account.username} (pk: ${loggedIn.pk})`);
      
      // Save session
      const serialized = await ig.state.serialize();
      delete serialized.constants; // Remove non-serializable
      fs.writeFileSync(sessionFile, JSON.stringify(serialized));
      
      this.clients.set(account.username, { ig, lastUsed: Date.now() });
      await ig.simulate.postLoginFlow();
      return ig;
    } catch (e) {
      console.error(`❌ Login failed for @${account.username}:`, e.message);
      // Put on cooldown (30 min)
      this.clients.set(account.username, { ig: null, cooldownUntil: Date.now() + 30 * 60 * 1000 });
      return null;
    }
  }

  async getProfile(username) {
    const account = this._getNextAccount();
    if (!account) {
      console.log('❌ No IG accounts configured. Set IG_ACCOUNTS env var.');
      return null;
    }

    const ig = await this._getClient(account);
    if (!ig) return null;

    try {
      // Get user info
      const userId = await ig.user.getIdByUsername(username);
      const [userInfo, userFeed] = await Promise.all([
        ig.user.info(userId),
        ig.feed.user(userId).items().catch(() => []),
      ]);

      return {
        id: userInfo.pk.toString(),
        username: userInfo.username,
        full_name: userInfo.full_name || userInfo.username,
        biography: userInfo.biography || '',
        profile_pic_url: userInfo.profile_pic_url || '',
        profile_pic_url_hd: userInfo.hd_profile_pic_url_info?.url || userInfo.profile_pic_url || '',
        followers_count: userInfo.follower_count || 0,
        following_count: userInfo.following_count || 0,
        posts_count: userInfo.media_count || 0,
        is_verified: userInfo.is_verified || false,
        is_private: userInfo.is_private || false,
        external_url: userInfo.external_url || '',
        recent_posts: (userFeed || []).slice(0, 12).map((post, i) => ({
          id: post.pk?.toString() || `post_${i}`,
          shortcode: post.code || `code_${i}`,
          display_url: post.image_versions2?.candidates?.[0]?.url || '',
          thumbnail_url: post.image_versions2?.candidates?.slice(-1)?.[0]?.url || post.image_versions2?.candidates?.[0]?.url || '',
          is_video: post.media_type === 2 || !!post.video_versions,
          video_url: post.video_versions?.[0]?.url || null,
          likes_count: post.like_count || 0,
          comments_count: post.comment_count || 0,
          caption: post.caption?.text || '',
          timestamp: post.taken_at || Math.floor(Date.now() / 1000),
        })),
      };
    } catch (e) {
      console.error(`❌ Profile fetch failed via @${account.username}:`, e.message);
      if (e.message.includes('rate') || e.message.includes('429') || e.message.includes('challenge')) {
        // Rate limited or challenge — cooldown this account
        this.clients.set(account.username, { 
          ...this.clients.get(account.username), 
          cooldownUntil: Date.now() + 60 * 60 * 1000 // 1hr cooldown
        });
      }
      return null;
    }
  }

  async getStories(username) {
    const account = this._getNextAccount();
    if (!account) return null;

    const ig = await this._getClient(account);
    if (!ig) return null;

    try {
      const userId = await ig.user.getIdByUsername(username);
      const reelsFeed = ig.feed.reelsMedia({ userIds: [userId] });
      const storyItems = await reelsFeed.items();

      if (!storyItems || !storyItems.length) return { user: { username }, stories: [] };

      return {
        user: { username, profile_pic_url: '' },
        stories: storyItems.map((s, i) => ({
          id: s.pk?.toString() || `story_${i}`,
          display_url: s.image_versions2?.candidates?.[0]?.url || '',
          is_video: s.media_type === 2 || !!s.video_versions,
          video_url: s.video_versions?.[0]?.url || null,
          timestamp: s.taken_at || Math.floor(Date.now() / 1000),
        })),
      };
    } catch (e) {
      console.error(`❌ Stories fetch failed:`, e.message);
      return null;
    }
  }

  get isConfigured() {
    return this.accounts.length > 0;
  }

  get accountCount() {
    return this.accounts.length;
  }
}

module.exports = new InstagramDirect();
