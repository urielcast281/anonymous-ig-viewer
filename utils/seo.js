const config = require('../config');

class SEOUtils {
  // Generate meta tags for homepage
  getHomeMeta() {
    return {
      title: 'iPeep - Anonymous Instagram Story Viewer & Downloader | Free IG Viewer 2026',
      description: 'View Instagram stories anonymously without login. Free Instagram story viewer, profile viewer & downloader. Best Picuki alternative. Watch IG stories without account. Save Instagram stories, reels & posts privately.',
      canonical: config.SEO.SITE_URL,
      keywords: 'instagram story viewer, anonymous instagram viewer, view instagram stories anonymously, instagram story downloader, picuki alternative, ig story viewer, watch instagram stories without account, instagram viewer without login, free instagram viewer, insta story viewer, storiesig alternative, view ig stories anonymously, instagram anonymous viewer, download instagram stories, instagram profile viewer, instagram reels downloader, view instagram without account, instagram stalker, ig viewer, anonyig alternative, instagram story saver, best instagram viewer 2026, ver historias de instagram, ver stories de instagram anonimamente, descargar historias de instagram, ver perfil de instagram sin cuenta, visor de historias de instagram, instagram historias anonimo, ver instagram sin cuenta, baixar stories instagram, ver stories instagram anonimo, visualizador de instagram',
      ogTitle: 'iPeep - Free Anonymous Instagram Story Viewer & Downloader',
      ogDescription: 'View Instagram stories, profiles, reels and posts anonymously without creating an account. Download and save IG content. Best Picuki & StoriesIG alternative.',
      ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
      ogUrl: config.SEO.SITE_URL,
      twitterCard: 'summary_large_image',
      twitterTitle: 'Anonymous Instagram Viewer',
      twitterDescription: 'View Instagram content anonymously without login'
    };
  }

  // Generate meta tags for profile pages
  getProfileMeta(username, profile = null) {
    const title = profile 
      ? `${profile.full_name} (@${username}) Instagram Profile - Anonymous Viewer`
      : `@${username} Instagram Profile - View Anonymously`;
    
    const description = profile
      ? `View ${profile.full_name} (@${username}) Instagram profile anonymously. ${profile.posts_count} posts, ${profile.followers_count.toLocaleString()} followers. ${profile.biography ? profile.biography.substring(0, 100) : 'View stories and posts without logging in.'}`
      : `View @${username} Instagram profile, stories, and posts anonymously without creating an account.`;

    const image = profile && profile.profile_pic_url_hd
      ? profile.profile_pic_url_hd
      : `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`;

    return {
      title,
      description,
      canonical: `${config.SEO.SITE_URL}/profile/${username}`,
      keywords: `${username}, instagram profile, instagram stories, view ${username} instagram, ${username} posts, anonymous instagram viewer`,
      ogTitle: title,
      ogDescription: description,
      ogImage: image,
      ogUrl: `${config.SEO.SITE_URL}/profile/${username}`,
      twitterCard: 'summary_large_image',
      twitterTitle: `@${username} Instagram Profile`,
      twitterDescription: description
    };
  }

  // Generate meta tags for story viewer pages
  getStoriesMeta(username) {
    const title = `${username} Instagram Stories - View & Download Anonymously | iPeep`;
    const description = `View @${username} Instagram stories anonymously without login. Download and save @${username}'s IG stories privately. Free anonymous story viewer — they'll never know.`;

    return {
      title,
      description,
      canonical: `${config.SEO.SITE_URL}/stories/${username}`,
      keywords: `${username} stories, ${username} instagram stories, view ${username} stories anonymously, anonymous story viewer, instagram story downloader, ${username} ig stories, download ${username} stories`,
      ogTitle: title,
      ogDescription: description,
      ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
      ogUrl: `${config.SEO.SITE_URL}/stories/${username}`,
      twitterCard: 'summary_large_image',
      twitterTitle: `@${username} Instagram Stories`,
      twitterDescription: description
    };
  }

  // Generate meta tags for individual post pages
  getPostMeta(shortcode, post = null) {
    const title = post
      ? `Instagram Post by @${post.owner.username} - Anonymous Viewer`
      : `Instagram Post ${shortcode} - View Anonymously`;
    
    const description = post
      ? `View Instagram post by @${post.owner.username} anonymously. ${post.likes_count.toLocaleString()} likes, ${post.comments_count.toLocaleString()} comments. ${post.caption ? post.caption.substring(0, 100) : 'View without logging in.'}`
      : `View Instagram post ${shortcode} anonymously without creating an account.`;

    const image = post && post.display_url
      ? post.display_url
      : `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`;

    return {
      title,
      description,
      canonical: `${config.SEO.SITE_URL}/post/${shortcode}`,
      keywords: `instagram post, ${shortcode}, anonymous instagram, instagram viewer, instagram downloader`,
      ogTitle: title,
      ogDescription: description,
      ogImage: image,
      ogUrl: `${config.SEO.SITE_URL}/post/${shortcode}`,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description
    };
  }

  // Generate meta tags for about/FAQ page
  getAboutMeta() {
    return {
      title: 'About InstaViewer - How to View Instagram Anonymously',
      description: 'Learn how to use InstaViewer to view Instagram stories, profiles, and posts anonymously. Frequently asked questions and privacy information.',
      canonical: `${config.SEO.SITE_URL}/about`,
      keywords: 'instagram viewer guide, how to view instagram anonymously, instagram privacy, instagram FAQ, anonymous instagram viewing',
      ogTitle: 'About InstaViewer - Anonymous Instagram Viewing Guide',
      ogDescription: 'Learn how to view Instagram content anonymously and safely without creating an account.',
      ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
      ogUrl: `${config.SEO.SITE_URL}/about`,
      twitterCard: 'summary_large_image',
      twitterTitle: 'About InstaViewer',
      twitterDescription: 'Anonymous Instagram viewing guide and FAQ'
    };
  }

  // Generate JSON-LD structured data for homepage
  getHomeStructuredData() {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": config.SEO.SITE_NAME,
      "description": "View Instagram stories, profiles, and posts anonymously without login. Free Instagram viewer tool.",
      "url": config.SEO.SITE_URL,
      "applicationCategory": "SocialNetworkingApplication",
      "operatingSystem": "Any",
      "permissions": "No login required",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "provider": {
        "@type": "Organization",
        "name": config.SEO.SITE_NAME,
        "url": config.SEO.SITE_URL
      }
    };
  }

  // Generate JSON-LD structured data for profile pages
  getProfileStructuredData(username, profile = null) {
    if (!profile) {
      return {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "mainEntity": {
          "@type": "Person",
          "identifier": username,
          "url": `https://instagram.com/${username}`
        }
      };
    }

    return {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "identifier": profile.username,
        "name": profile.full_name,
        "description": profile.biography,
        "url": `https://instagram.com/${profile.username}`,
        "image": profile.profile_pic_url_hd,
        "interactionStatistic": [
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/FollowAction",
            "userInteractionCount": profile.followers_count
          }
        ]
      }
    };
  }

  // Generate JSON-LD structured data for posts
  getPostStructuredData(shortcode, post = null) {
    if (!post) {
      return {
        "@context": "https://schema.org",
        "@type": "SocialMediaPosting",
        "identifier": shortcode
      };
    }

    return {
      "@context": "https://schema.org",
      "@type": "SocialMediaPosting",
      "identifier": post.shortcode,
      "headline": post.caption ? post.caption.substring(0, 100) : `Post by @${post.owner.username}`,
      "author": {
        "@type": "Person",
        "name": post.owner.full_name || post.owner.username,
        "identifier": post.owner.username
      },
      "datePublished": new Date(post.timestamp * 1000).toISOString(),
      "image": post.display_url,
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/LikeAction",
          "userInteractionCount": post.likes_count
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/CommentAction",
          "userInteractionCount": post.comments_count
        }
      ]
    };
  }

  // Generate complete meta tags HTML
  generateMetaHTML(metaData) {
    let html = `
    <!-- Basic Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metaData.title}</title>
    <meta name="description" content="${metaData.description}">
    <meta name="keywords" content="${metaData.keywords}">
    <link rel="canonical" href="${metaData.canonical}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${metaData.ogTitle}">
    <meta property="og:description" content="${metaData.ogDescription}">
    <meta property="og:image" content="${metaData.ogImage}">
    <meta property="og:url" content="${metaData.ogUrl}">
    <meta property="og:site_name" content="${config.SEO.SITE_NAME}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="${metaData.twitterCard}">
    <meta name="twitter:title" content="${metaData.twitterTitle}">
    <meta name="twitter:description" content="${metaData.twitterDescription}">
    <meta name="twitter:image" content="${metaData.ogImage}">
    ${config.SEO.TWITTER_HANDLE ? `<meta name="twitter:site" content="${config.SEO.TWITTER_HANDLE}">` : ''}
    
    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow">
    <meta name="author" content="${config.SEO.SITE_NAME}">
    <meta name="theme-color" content="#262626">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    `;

    return html.trim();
  }

  // Generate structured data script tag
  generateStructuredDataHTML(structuredData) {
    return `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`;
  }

  // Clean text for meta descriptions (remove HTML, limit length)
  cleanMetaText(text, maxLength = 160) {
    if (!text) return '';
    
    // Remove HTML tags and decode entities
    const cleaned = text
      .replace(/<[^>]*>/g, '')
      .replace(/&[^;]+;/g, '')
      .trim();
    
    if (cleaned.length <= maxLength) return cleaned;
    
    // Truncate at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > maxLength * 0.8 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }

  // Format numbers for display
  formatCount(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }
}

module.exports = new SEOUtils();