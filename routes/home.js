const express = require('express');
const router = express.Router();
const instagram = require('../services/instagram');
const seo = require('../utils/seo');
const config = require('../config');

// Homepage
router.get('/', async (req, res) => {
  try {
    const metaData = seo.getHomeMeta();
    const structuredData = seo.getHomeStructuredData();

    // Quick mock trending (no async fetch needed for mock)
    const trendingProfiles = config.TRENDING_PROFILES.slice(0, 8).map(username => ({
      username,
      profile: null,
      success: false,
    }));

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
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query || !query.trim()) return res.redirect('/');

  try {
    const metaData = seo.getHomeMeta();
    metaData.title = `Search Results for "${query}" - InstaViewer`;
    metaData.description = `Search results for Instagram users matching "${query}".`;
    const structuredData = seo.getHomeStructuredData();

    const searchResults = await instagram.searchUsers(query.trim());

    res.render('home', {
      metaData,
      structuredData,
      trendingProfiles: [],
      searchQuery: query,
      searchResults,
      pageTitle: `Search: ${query}`,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.render('home', {
      metaData: seo.getHomeMeta(),
      structuredData: seo.getHomeStructuredData(),
      trendingProfiles: [],
      searchQuery: query,
      searchResults: null,
      searchError: 'Search is temporarily unavailable. Please try again later.',
      pageTitle: `Search: ${query}`,
    });
  }
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
