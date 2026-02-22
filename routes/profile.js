const express = require('express');
const router = express.Router();
const instagram = require('../services/instagram');
const seo = require('../utils/seo');
const config = require('../config');

// Profile page
router.get('/:username', async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  
  // Validate username format
  if (!username.match(/^[a-zA-Z0-9._]{1,30}$/)) {
    return res.status(400).render('error', {
      error: { status: 400, message: 'Invalid username format' },
      title: 'Invalid Username - InstaViewer',
      description: 'The username provided is not valid.'
    });
  }

  try {
    console.log(`🔍 Loading profile page for: ${username}`);
    
    // Fetch profile data
    const profile = await instagram.getProfile(username);
    
    if (!profile) {
      return res.status(404).render('error', {
        error: { status: 404, message: 'Profile not found' },
        title: `@${username} - Profile Not Found`,
        description: `The Instagram profile @${username} could not be found or is not accessible.`
      });
    }

    // Generate SEO meta data
    const metaData = seo.getProfileMeta(username, profile);
    const structuredData = seo.getProfileStructuredData(username, profile);

    // Try to get stories data (might fail if requires auth)
    let stories = null;
    try {
      stories = await instagram.getStories(username);
    } catch (error) {
      console.log(`📸 Stories not available for ${username}: ${error.message}`);
    }

    // Related/suggested profiles (trending profiles as fallback)
    const relatedProfiles = await Promise.allSettled(
      config.TRENDING_PROFILES
        .filter(u => u !== username)
        .slice(0, 6)
        .map(async relatedUsername => {
          try {
            const relatedProfile = await instagram.getProfile(relatedUsername);
            return { username: relatedUsername, profile: relatedProfile, success: true };
          } catch (error) {
            return { username: relatedUsername, profile: null, success: false };
          }
        })
    );

    const successfulRelated = relatedProfiles
      .filter(result => result.status === 'fulfilled' && result.value.success)
      .map(result => result.value)
      .slice(0, 4);

    res.render('profile', {
      metaData,
      structuredData,
      profile,
      stories,
      relatedProfiles: successfulRelated,
      username,
      pageTitle: `@${username} - ${profile.full_name || username}`
    });

  } catch (error) {
    console.error(`❌ Profile error for ${username}:`, error);
    
    // Generate basic SEO for error page
    const metaData = seo.getProfileMeta(username);
    metaData.title = `@${username} - Profile Unavailable`;
    metaData.description = `The Instagram profile @${username} is currently unavailable. Please try again later.`;

    res.status(500).render('error', {
      error: { 
        status: 500, 
        message: 'Profile temporarily unavailable',
        details: `We're having trouble loading @${username}'s profile. This could be due to:
        • The profile being private
        • Instagram rate limiting
        • Temporary server issues
        
        Please try again in a few minutes.`
      },
      title: `@${username} - Profile Unavailable`,
      description: 'Profile temporarily unavailable',
      metaData,
      username
    });
  }
});

// Profile posts page (paginated)
router.get('/:username/posts', async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  try {
    const profile = await instagram.getProfile(username);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const posts = profile.recent_posts.slice(startIndex, endIndex);
    
    const totalPosts = profile.recent_posts.length;
    const totalPages = Math.ceil(totalPosts / limit);

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      // API response
      res.json({
        posts,
        pagination: {
          page,
          limit,
          totalPosts,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } else {
      // HTML response
      const metaData = seo.getProfileMeta(username, profile);
      metaData.title = `@${username} Posts - Page ${page}`;
      
      res.render('profile-posts', {
        metaData,
        profile,
        posts,
        username,
        pagination: {
          page,
          limit,
          totalPosts,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        pageTitle: `@${username} Posts - Page ${page}`
      });
    }

  } catch (error) {
    console.error(`❌ Profile posts error for ${username}:`, error);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// Profile followers/following info (basic info only, numbers)
router.get('/:username/stats', async (req, res) => {
  const username = req.params.username.toLowerCase().trim();

  try {
    const profile = await instagram.getProfile(username);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      username: profile.username,
      followers_count: profile.followers_count,
      following_count: profile.following_count,
      posts_count: profile.posts_count,
      is_verified: profile.is_verified,
      is_private: profile.is_private
    });

  } catch (error) {
    console.error(`❌ Profile stats error for ${username}:`, error);
    res.status(500).json({ error: 'Failed to load profile stats' });
  }
});

module.exports = router;