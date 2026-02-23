const express = require('express');
const router = express.Router();
const instagram = require('../services/instagram');
const seo = require('../utils/seo');
const config = require('../config');

// Simple in-memory cache for trending profiles (refresh every 6 hours)
let trendingCache = { data: null, ts: 0 };
const TRENDING_CACHE_MS = 6 * 60 * 60 * 1000;

async function getTrendingProfiles() {
  if (trendingCache.data && Date.now() - trendingCache.ts < TRENDING_CACHE_MS) {
    return trendingCache.data;
  }
  const usernames = config.TRENDING_PROFILES.slice(0, 8);
  const results = await Promise.allSettled(
    usernames.map(u => instagram.getProfile(u).then(p => ({ username: u, profile: p || null, success: !!p })))
  );
  const profiles = results.map((r, i) => 
    r.status === 'fulfilled' && r.value.profile ? r.value : { username: usernames[i], profile: null, success: false }
  );
  trendingCache = { data: profiles, ts: Date.now() };
  return profiles;
}

// Homepage
router.get('/', async (req, res) => {
  try {
    const metaData = seo.getHomeMeta();
    const structuredData = seo.getHomeStructuredData();

    let trendingProfiles;
    try {
      trendingProfiles = await getTrendingProfiles();
    } catch (e) {
      trendingProfiles = config.TRENDING_PROFILES.slice(0, 8).map(u => ({ username: u, profile: null, success: false }));
    }

    res.render('home', {
      metaData,
      structuredData,
      trendingProfiles,
      searchQuery: '',
      searchResults: null,
      pageTitle: 'Anonymous Instagram Viewer',
    });
  } catch (error) {
    console.error('Homepage error:', error);
    res.status(500).render('error', {
      error: { status: 500, message: 'Failed to load homepage' },
      title: 'Error - InstaViewer',
      description: 'An error occurred.',
      metaData: seo.getHomeMeta(),
    });
  }
});

// Search
router.get('/search', (req, res) => {
  const query = (req.query.q || '').trim().replace(/^@/, '');
  if (!query) return res.redirect('/');
  // Usernames are unique — go directly to the profile page
  res.redirect(`/profile/${encodeURIComponent(query.toLowerCase())}`);
});

// Quick profile redirect
router.get('/:username([a-zA-Z0-9._]{1,30})', (req, res, next) => {
  const username = req.params.username.toLowerCase();
  const reserved = ['profile', 'stories', 'post', 'about', 'api', 'search', 'blog',
    'instagram-story-viewer', 'anonymous-instagram-viewer', 'picuki-alternative',
    'sitemap.xml', 'robots.txt', 'favicon.ico'];
  if (reserved.includes(username)) return next('route');
  res.redirect(301, `/profile/${username}`);
});

module.exports = router;
