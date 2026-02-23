const express = require('express');
const router = express.Router();
const instagram = require('../services/instagram');
const cache = require('../services/cache');
const proxy = require('../services/proxy');
const config = require('../config');

// API middleware for JSON responses
router.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// API status endpoint
router.get('/status', async (req, res) => {
  try {
    const cacheStats = await cache.getStats();
    const proxyStats = proxy.getStats();
    
    res.json({
      status: 'online',
      version: '1.0.0',
      environment: config.NODE_ENV,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      cache: cacheStats,
      proxy: proxyStats,
      features: {
        profiles: true,
        stories: true,
        posts: true,
        search: true,
        download: true
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get system status',
      error: error.message
    });
  }
});

// Search users API
router.get('/search', async (req, res) => {
  const query = req.query.q;
  
  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      error: 'Missing query parameter',
      message: 'Please provide a search query using the "q" parameter'
    });
  }

  if (query.length < 2) {
    return res.status(400).json({
      error: 'Query too short',
      message: 'Search query must be at least 2 characters long'
    });
  }

  try {
    const results = await instagram.searchUsers(query.trim());
    
    res.json({
      query: query.trim(),
      results,
      count: results.length,
      cached: false // This would be true if from cache
    });
  } catch (error) {
    console.error(`API search error for "${query}":`, error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Unable to search users at this time',
      query: query.trim()
    });
  }
});

// Profile API
router.get('/profile/:username', async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  
  if (!username.match(/^[a-zA-Z0-9._]{1,30}$/)) {
    return res.status(400).json({
      error: 'Invalid username',
      message: 'Username contains invalid characters or is too long'
    });
  }

  try {
    const profile = await instagram.getProfile(username);
    
    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: `The profile @${username} could not be found or is not accessible`
      });
    }

    res.json({
      username: profile.username,
      profile,
      instagram_url: `https://instagram.com/${username}/`,
      viewer_url: `${config.SEO.SITE_URL}/profile/${username}`
    });
  } catch (error) {
    console.error(`API profile error for ${username}:`, error);
    res.status(500).json({
      error: 'Profile unavailable',
      message: 'Unable to fetch profile data at this time',
      username
    });
  }
});

// Stories API
router.get('/stories/:username', async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  
  if (!username.match(/^[a-zA-Z0-9._]{1,30}$/)) {
    return res.status(400).json({
      error: 'Invalid username',
      message: 'Username contains invalid characters or is too long'
    });
  }

  try {
    const stories = await instagram.getStories(username);
    
    if (!stories || !stories.stories || stories.stories.length === 0) {
      return res.status(404).json({
        error: 'No stories found',
        message: `@${username} has no active stories or the profile is not accessible`
      });
    }

    res.json({
      username,
      user: stories.user,
      stories: stories.stories,
      count: stories.stories.length,
      viewer_url: `${config.SEO.SITE_URL}/stories/${username}`
    });
  } catch (error) {
    console.error(`API stories error for ${username}:`, error);
    res.status(500).json({
      error: 'Stories unavailable',
      message: 'Unable to fetch stories at this time',
      username
    });
  }
});

// Post API
router.get('/post/:shortcode', async (req, res) => {
  const shortcode = req.params.shortcode.trim();
  
  if (!shortcode.match(/^[a-zA-Z0-9_-]{11}$/)) {
    return res.status(400).json({
      error: 'Invalid shortcode',
      message: 'Post shortcode format is invalid'
    });
  }

  try {
    const post = await instagram.getPost(shortcode);
    
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: `The post ${shortcode} could not be found or is no longer available`
      });
    }

    res.json({
      shortcode,
      post,
      instagram_url: `https://instagram.com/p/${shortcode}/`,
      viewer_url: `${config.SEO.SITE_URL}/post/${shortcode}`
    });
  } catch (error) {
    console.error(`API post error for ${shortcode}:`, error);
    res.status(500).json({
      error: 'Post unavailable',
      message: 'Unable to fetch post data at this time',
      shortcode
    });
  }
});

// Trending profiles API
router.get('/trending', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    
    const trendingResults = await Promise.allSettled(
      config.TRENDING_PROFILES.slice(0, limit).map(async username => {
        try {
          const profile = await instagram.getProfile(username);
          return { username, profile, success: true };
        } catch (error) {
          return { username, profile: null, success: false, error: error.message };
        }
      })
    );

    const successful = trendingResults
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => ({
        username: result.value.username,
        profile: result.value.profile
      }));

    const failed = trendingResults
      .filter(result => result.status === 'fulfilled' && !result.value.success)
      .length;

    res.json({
      trending: successful,
      count: successful.length,
      failed_count: failed,
      total_requested: limit
    });
  } catch (error) {
    console.error('API trending error:', error);
    res.status(500).json({
      error: 'Trending unavailable',
      message: 'Unable to fetch trending profiles at this time'
    });
  }
});

// Cache management API (admin)
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = await cache.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Cache stats unavailable',
      message: error.message
    });
  }
});

router.post('/cache/clear', async (req, res) => {
  const type = req.body.type || req.query.type;
  
  try {
    if (type && type !== 'all') {
      await cache.clearType(type);
      res.json({
        message: `Cleared ${type} cache`,
        type
      });
    } else {
      await cache.clearAll();
      res.json({
        message: 'Cleared all cache'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Cache clear failed',
      message: error.message
    });
  }
});

// Bulk profile API (for getting multiple profiles at once)
router.post('/profiles', async (req, res) => {
  const usernames = req.body.usernames;
  
  if (!Array.isArray(usernames)) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Please provide an array of usernames in the request body'
    });
  }

  if (usernames.length === 0) {
    return res.status(400).json({
      error: 'Empty request',
      message: 'Please provide at least one username'
    });
  }

  if (usernames.length > 10) {
    return res.status(400).json({
      error: 'Too many usernames',
      message: 'Maximum 10 usernames allowed per request'
    });
  }

  try {
    const results = await Promise.allSettled(
      usernames.map(async username => {
        const cleanUsername = username.toLowerCase().trim();
        
        if (!cleanUsername.match(/^[a-zA-Z0-9._]{1,30}$/)) {
          throw new Error('Invalid username format');
        }

        const profile = await instagram.getProfile(cleanUsername);
        return { username: cleanUsername, profile, success: true };
      })
    );

    const profiles = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          username: usernames[index],
          profile: null,
          success: false,
          error: result.reason.message
        };
      }
    });

    const successful = profiles.filter(p => p.success).length;
    const failed = profiles.length - successful;

    res.json({
      profiles,
      summary: {
        total: profiles.length,
        successful,
        failed
      }
    });
  } catch (error) {
    console.error('API bulk profiles error:', error);
    res.status(500).json({
      error: 'Bulk fetch failed',
      message: 'Unable to fetch profiles at this time'
    });
  }
});

// Image proxy — Instagram CDN URLs expire, so we proxy them server-side
router.get('/img', async (req, res) => {
  // Extract the raw url param — grab everything after ?url= or &url= 
  // since the Instagram URL itself contains & chars
  const idx = req.originalUrl.indexOf('url=');
  const url = idx !== -1 ? decodeURIComponent(req.originalUrl.substring(idx + 4)) : null;
  
  if (!url || !url.startsWith('https://')) {
    return res.status(400).send('Invalid URL');
  }
  // Only allow Instagram CDN domains
  const allowed = ['scontent', 'instagram', 'video', 'cdninstagram.com'];
  const hostname = new URL(url).hostname;
  if (!allowed.some(a => hostname.includes(a))) {
    return res.status(403).send('Domain not allowed');
  }
  try {
    const https = require('https');
    const parsed = new URL(url);
    const proxyReq = https.get(parsed, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': 'image/webp,image/avif,image/*,*/*'
      }
    }, (proxyRes) => {
      if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        return res.redirect(proxyRes.headers.location);
      }
      // Override the JSON content-type from middleware
      res.removeHeader('Content-Type');
      res.set('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      proxyRes.pipe(res);
    });
    proxyReq.on('error', () => res.status(502).send('Proxy error'));
    proxyReq.setTimeout(15000, () => { proxyReq.destroy(); res.status(504).send('Timeout'); });
  } catch (e) {
    res.status(500).send('Error');
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: 'The requested API endpoint does not exist',
    available_endpoints: [
      '/api/status',
      '/api/search?q=username',
      '/api/profile/:username',
      '/api/stories/:username',
      '/api/post/:shortcode',
      '/api/trending',
      '/api/health'
    ]
  });
});

module.exports = router;