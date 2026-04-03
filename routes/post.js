const express = require('express');
const router = express.Router();
const instagram = require('../services/instagram');
const seo = require('../utils/seo');
const config = require('../config');

// Individual post viewer page
router.get('/:shortcode', async (req, res) => {
  const shortcode = req.params.shortcode.trim();
  
  // Validate shortcode format (Instagram shortcodes are alphanumeric with _ and -)
  if (!shortcode.match(/^[a-zA-Z0-9_-]{11}$/)) {
    return res.status(400).render('error', {
      error: { status: 400, message: 'Invalid post shortcode format' },
      title: 'Invalid Post Code - InstaViewer',
      description: 'The post shortcode provided is not valid.',
      metaData: seo.getHomeMeta()
    });
  }

  try {
    console.log(`📮 Loading post: ${shortcode}`);
    
    // Fetch post data
    const post = await instagram.getPost(shortcode);
    
    if (!post) {
      return res.status(404).render('error', {
        error: { status: 404, message: 'Post not found' },
        title: `Post ${shortcode} - Not Found`,
        description: `The Instagram post ${shortcode} could not be found or is no longer available.`,
        metaData: seo.getHomeMeta()
      });
    }

    // Generate SEO meta data
    const metaData = seo.getPostMeta(shortcode, post);
    const structuredData = seo.getPostStructuredData(shortcode, post);

    // Try to get author's profile for related content
    let authorProfile = null;
    let relatedPosts = [];
    
    if (post.owner && post.owner.username) {
      try {
        authorProfile = await instagram.getProfile(post.owner.username);
        if (authorProfile && authorProfile.recent_posts) {
          // Get other posts from same user (exclude current post)
          relatedPosts = authorProfile.recent_posts
            .filter(p => p.shortcode !== shortcode)
            .slice(0, 6);
        }
      } catch (error) {
        console.log(`Could not load author profile: ${error.message}`);
      }
    }

    // Trending profiles — static to avoid burning API calls
    const successfulTrending = config.TRENDING_PROFILES.slice(0, 4).map(u => ({
      username: u,
      profile: {
        username: u,
        full_name: u.charAt(0).toUpperCase() + u.slice(1),
        profile_pic_url: `https://ui-avatars.com/api/?name=${u}&background=E1306C&color=fff&size=150`,
        is_verified: true,
      },
      success: true,
    }));

    res.render('post', {
      metaData,
      structuredData,
      post,
      authorProfile,
      relatedPosts,
      trendingProfiles: successfulTrending,
      shortcode,
      pageTitle: `Post by @${post.owner.username}`
    });

  } catch (error) {
    console.error(`❌ Post error for ${shortcode}:`, error);
    
    // Generate basic SEO for error page
    const metaData = seo.getPostMeta(shortcode);
    metaData.title = `Post ${shortcode} - Unavailable`;
    metaData.description = `The Instagram post ${shortcode} is currently unavailable.`;

    res.status(500).render('error', {
      error: { 
        status: 500, 
        message: 'Post temporarily unavailable',
        details: `We're having trouble loading this Instagram post. This could be due to:
        • The post being deleted or made private
        • Instagram rate limiting
        • Temporary server issues
        
        Please try again in a few minutes or check if the post still exists on Instagram.`
      },
      title: `Post ${shortcode} - Unavailable`,
      description: 'Post temporarily unavailable',
      metaData,
      shortcode
    });
  }
});

// Post API endpoint (JSON data)
router.get('/:shortcode/api', async (req, res) => {
  const shortcode = req.params.shortcode.trim();
  
  try {
    const post = await instagram.getPost(shortcode);
    
    if (!post) {
      return res.status(404).json({ 
        error: 'Post not found',
        message: 'The requested post could not be found or is no longer available.'
      });
    }

    // Return clean JSON data
    res.json({
      shortcode: post.shortcode,
      id: post.id,
      display_url: post.display_url,
      is_video: post.is_video,
      video_url: post.video_url,
      caption: post.caption,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      timestamp: post.timestamp,
      date: new Date(post.timestamp * 1000).toISOString(),
      owner: post.owner,
      instagram_url: `https://instagram.com/p/${shortcode}/`
    });

  } catch (error) {
    console.error(`❌ Post API error for ${shortcode}:`, error);
    res.status(500).json({ 
      error: 'Post unavailable',
      message: error.message
    });
  }
});

// Post download endpoint
router.get('/:shortcode/download', async (req, res) => {
  const shortcode = req.params.shortcode.trim();
  
  try {
    const post = await instagram.getPost(shortcode);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Return download info
    const downloadUrl = post.is_video ? post.video_url : post.display_url;
    const extension = post.is_video ? 'mp4' : 'jpg';
    const filename = `${post.owner.username}_${shortcode}.${extension}`;

    res.json({
      download_url: downloadUrl,
      filename: filename,
      is_video: post.is_video,
      file_size: 'Unknown',
      shortcode: shortcode,
      owner: post.owner.username,
      instagram_url: `https://instagram.com/p/${shortcode}/`
    });

  } catch (error) {
    console.error(`❌ Post download error for ${shortcode}:`, error);
    res.status(500).json({ error: 'Download unavailable' });
  }
});

// Post embed endpoint (for iframe embeds)
router.get('/:shortcode/embed', async (req, res) => {
  const shortcode = req.params.shortcode.trim();
  
  try {
    const post = await instagram.getPost(shortcode);
    
    if (!post) {
      return res.status(404).render('error', {
        error: { status: 404, message: 'Post not found' },
        title: 'Post Not Found',
        description: 'The requested post could not be found.'
      });
    }

    // Render minimal embed inline (no separate template needed)
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh}img,video{max-width:100%;max-height:100vh;object-fit:contain}</style></head><body>${post.is_video && post.video_url ? `<video src="${post.video_url}" poster="${post.display_url}" autoplay loop muted playsinline controls></video>` : `<img src="${post.display_url}" alt="Post">`}</body></html>`;
    res.send(html);

  } catch (error) {
    console.error(`❌ Post embed error for ${shortcode}:`, error);
    res.status(500).send('Post unavailable');
  }
});

// Get post comments (if available)
router.get('/:shortcode/comments', async (req, res) => {
  const shortcode = req.params.shortcode.trim();
  
  try {
    // Note: Comments would require additional API endpoints and possibly authentication
    // This is a placeholder for future implementation
    
    res.json({
      shortcode,
      comments: [],
      message: 'Comments feature is not yet available. This would require additional Instagram API access.'
    });

  } catch (error) {
    console.error(`❌ Comments error for ${shortcode}:`, error);
    res.status(500).json({ error: 'Comments unavailable' });
  }
});

// Post statistics
router.get('/:shortcode/stats', async (req, res) => {
  const shortcode = req.params.shortcode.trim();
  
  try {
    const post = await instagram.getPost(shortcode);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      shortcode: post.shortcode,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      is_video: post.is_video,
      timestamp: post.timestamp,
      owner: {
        username: post.owner.username,
        full_name: post.owner.full_name
      }
    });

  } catch (error) {
    console.error(`❌ Post stats error for ${shortcode}:`, error);
    res.status(500).json({ error: 'Stats unavailable' });
  }
});

module.exports = router;