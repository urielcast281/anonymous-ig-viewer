const express = require('express');
const router = express.Router();
const instagram = require('../services/instagram');
const seo = require('../utils/seo');
const config = require('../config');

// Stories viewer page
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
    console.log(`📸 Loading stories for: ${username}`);
    
    // First try to get basic profile info
    let profile = null;
    try {
      profile = await instagram.getProfile(username);
    } catch (error) {
      console.log(`Profile unavailable for ${username}, continuing with stories only`);
    }

    // Try to get stories
    let stories = await instagram.getStories(username);
    
    // If no real stories, convert recent posts into stories-style view
    if ((!stories || !stories.stories || stories.stories.length === 0) && profile && profile.recent_posts && profile.recent_posts.length > 0) {
      stories = {
        user: { 
          username: profile.username, 
          profile_pic_url: profile.profile_pic_url 
        },
        stories: profile.recent_posts.slice(0, 6).map((post, i) => ({
          id: post.id || `post_story_${i}`,
          display_url: post.display_url || post.thumbnail_url,
          is_video: post.is_video || false,
          video_url: null,
          timestamp: post.timestamp || (Date.now() / 1000 - i * 3600),
          expires_at: Date.now() / 1000 + 86400,
          caption: post.caption || '',
        })),
      };
    }

    if (!stories || !stories.stories || stories.stories.length === 0) {
      // Generate SEO meta data for no stories page
      const metaData = seo.getStoriesMeta(username);
      metaData.title = `@${username} - No Active Stories`;
      metaData.description = `@${username} currently has no active Instagram stories. Stories expire after 24 hours.`;

      return res.render('stories', {
        metaData,
        structuredData: seo.getHomeStructuredData(),
        profile,
        stories: null,
        username,
        pageTitle: `@${username} Stories`,
        noStoriesMessage: 'This user currently has no active stories. Stories disappear after 24 hours.'
      });
    }

    // Generate SEO meta data
    const metaData = seo.getStoriesMeta(username);
    if (profile) {
      metaData.title = `${profile.full_name} (@${username}) Stories - Anonymous Viewer`;
      metaData.description = `View ${profile.full_name} (@${username}) Instagram stories anonymously. ${stories.stories.length} active stories available.`;
    }

    const structuredData = seo.getHomeStructuredData();

    // Get related profiles
    const relatedProfiles = await Promise.allSettled(
      config.TRENDING_PROFILES
        .filter(u => u !== username)
        .slice(0, 4)
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
      .map(result => result.value);

    res.render('stories', {
      metaData,
      structuredData,
      profile,
      stories,
      relatedProfiles: successfulRelated,
      username,
      pageTitle: `@${username} Stories`
    });

  } catch (error) {
    console.error(`❌ Stories error for ${username}:`, error);
    
    // Generate basic SEO for error page
    const metaData = seo.getStoriesMeta(username);
    metaData.title = `@${username} Stories - Unavailable`;
    metaData.description = `Instagram stories for @${username} are currently unavailable.`;

    res.status(500).render('error', {
      error: { 
        status: 500, 
        message: 'Stories unavailable',
        details: `We're having trouble loading stories for @${username}. This could be due to:
        • No active stories (stories expire after 24 hours)
        • The profile being private
        • Instagram authentication requirements
        • Temporary server issues
        
        Try viewing the profile instead, or check back later.`
      },
      title: `@${username} Stories - Unavailable`,
      description: 'Stories temporarily unavailable',
      metaData,
      username,
      showProfileButton: true
    });
  }
});

// API endpoint for stories data (JSON)
router.get('/:username/api', async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  
  try {
    const stories = await instagram.getStories(username);
    
    if (!stories || !stories.stories) {
      return res.status(404).json({ 
        error: 'No stories found',
        message: 'This user has no active stories or the profile is not accessible.'
      });
    }

    res.json({
      user: stories.user,
      stories: stories.stories,
      count: stories.stories.length,
      expires_info: 'Stories expire after 24 hours'
    });

  } catch (error) {
    console.error(`❌ Stories API error for ${username}:`, error);
    res.status(500).json({ 
      error: 'Stories unavailable',
      message: error.message
    });
  }
});

// Individual story viewer
router.get('/:username/:storyId', async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const storyId = req.params.storyId;
  
  try {
    const stories = await instagram.getStories(username);
    
    if (!stories || !stories.stories) {
      return res.status(404).render('error', {
        error: { status: 404, message: 'Stories not found' },
        title: `@${username} Stories - Not Found`,
        description: 'The requested stories could not be found.'
      });
    }

    const story = stories.stories.find(s => s.id === storyId);
    
    if (!story) {
      return res.status(404).render('error', {
        error: { status: 404, message: 'Story not found' },
        title: `@${username} Story - Not Found`,
        description: 'The requested story could not be found or has expired.'
      });
    }

    // Generate SEO meta data for individual story
    const metaData = seo.getStoriesMeta(username);
    metaData.title = `@${username} Story - Anonymous Viewer`;
    metaData.description = `View @${username} Instagram story anonymously without logging in.`;
    metaData.ogImage = story.display_url;

    res.render('story-single', {
      metaData,
      structuredData: seo.getHomeStructuredData(),
      profile: stories.user,
      story,
      stories: stories.stories,
      username,
      pageTitle: `@${username} Story`
    });

  } catch (error) {
    console.error(`❌ Individual story error for ${username}/${storyId}:`, error);
    res.status(500).render('error', {
      error: { status: 500, message: 'Story unavailable' },
      title: `@${username} Story - Unavailable`,
      description: 'The requested story is temporarily unavailable.'
    });
  }
});

// Story download endpoint
router.get('/:username/:storyId/download', async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const storyId = req.params.storyId;
  
  try {
    const stories = await instagram.getStories(username);
    
    if (!stories || !stories.stories) {
      return res.status(404).json({ error: 'Stories not found' });
    }

    const story = stories.stories.find(s => s.id === storyId);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Return download info
    const downloadUrl = story.is_video ? story.video_url : story.display_url;
    const extension = story.is_video ? 'mp4' : 'jpg';
    const filename = `${username}_story_${storyId}.${extension}`;

    res.json({
      download_url: downloadUrl,
      filename: filename,
      is_video: story.is_video,
      file_size: 'Unknown',
      expires_at: story.expires_at
    });

  } catch (error) {
    console.error(`❌ Story download error for ${username}/${storyId}:`, error);
    res.status(500).json({ error: 'Download unavailable' });
  }
});

module.exports = router;