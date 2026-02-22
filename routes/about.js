const express = require('express');
const router = express.Router();
const seo = require('../utils/seo');
const cache = require('../services/cache');
const config = require('../config');

// About/FAQ page
router.get('/', async (req, res) => {
  try {
    // Generate SEO meta data
    const metaData = seo.getAboutMeta();
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I view Instagram stories anonymously?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Simply enter the Instagram username in the search box on our homepage. Our tool will fetch and display their stories without revealing your identity to the user."
          }
        },
        {
          "@type": "Question",
          "name": "Is InstaViewer completely free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, InstaViewer is completely free to use. We support our service through advertisements while providing unlimited access to Instagram content."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need to log in or create an account?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, you don't need to create an account or log in. Our service works completely anonymously without requiring any personal information."
          }
        },
        {
          "@type": "Question",
          "name": "Can I download Instagram stories and posts?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, you can download Instagram stories, posts, and profile pictures directly through our interface. Just click the download button on any content."
          }
        },
        {
          "@type": "Question",
          "name": "Is it safe to use InstaViewer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, InstaViewer is completely safe. We don't store your data, don't require login credentials, and all viewing is done anonymously through our servers."
          }
        },
        {
          "@type": "Question",
          "name": "Can I view private Instagram profiles?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, private Instagram profiles cannot be viewed through InstaViewer. We respect user privacy and can only access publicly available content."
          }
        }
      ]
    };

    // Get cache statistics for display
    const cacheStats = await cache.getStats();

    res.render('about', {
      metaData,
      structuredData,
      cacheStats,
      pageTitle: 'About InstaViewer - FAQ & Privacy Information'
    });

  } catch (error) {
    console.error('About page error:', error);
    res.status(500).render('error', {
      error: { status: 500, message: 'Failed to load about page' },
      title: 'Error - InstaViewer',
      description: 'An error occurred while loading the about page'
    });
  }
});

// Privacy policy page
router.get('/privacy', (req, res) => {
  const metaData = {
    title: 'Privacy Policy - InstaViewer',
    description: 'InstaViewer privacy policy - How we handle your data and protect your privacy while viewing Instagram content anonymously.',
    canonical: `${config.SEO.SITE_URL}/about/privacy`,
    keywords: 'privacy policy, data protection, instagram viewer privacy, anonymous viewing',
    ogTitle: 'InstaViewer Privacy Policy',
    ogDescription: 'Learn how InstaViewer protects your privacy while viewing Instagram content.',
    ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
    ogUrl: `${config.SEO.SITE_URL}/about/privacy`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'InstaViewer Privacy Policy',
    twitterDescription: 'Privacy protection for anonymous Instagram viewing'
  };

  res.render('privacy', {
    metaData,
    pageTitle: 'Privacy Policy'
  });
});

// Terms of service page
router.get('/terms', (req, res) => {
  const metaData = {
    title: 'Terms of Service - InstaViewer',
    description: 'InstaViewer terms of service and conditions for using our anonymous Instagram viewing service.',
    canonical: `${config.SEO.SITE_URL}/about/terms`,
    keywords: 'terms of service, usage terms, instagram viewer terms, service conditions',
    ogTitle: 'InstaViewer Terms of Service',
    ogDescription: 'Terms and conditions for using InstaViewer anonymous Instagram viewing service.',
    ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
    ogUrl: `${config.SEO.SITE_URL}/about/terms`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'InstaViewer Terms of Service',
    twitterDescription: 'Service terms for anonymous Instagram viewing'
  };

  res.render('terms', {
    metaData,
    pageTitle: 'Terms of Service'
  });
});

// Contact page
router.get('/contact', (req, res) => {
  const metaData = {
    title: 'Contact Us - InstaViewer',
    description: 'Get in touch with InstaViewer support team. Report issues, ask questions, or provide feedback about our Instagram viewing service.',
    canonical: `${config.SEO.SITE_URL}/about/contact`,
    keywords: 'contact, support, instagram viewer help, customer service',
    ogTitle: 'Contact InstaViewer Support',
    ogDescription: 'Get help with InstaViewer or report issues with our anonymous Instagram viewing service.',
    ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
    ogUrl: `${config.SEO.SITE_URL}/about/contact`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Contact InstaViewer',
    twitterDescription: 'Support and contact information'
  };

  res.render('contact', {
    metaData,
    pageTitle: 'Contact Us'
  });
});

// How it works page
router.get('/how-it-works', (req, res) => {
  const metaData = {
    title: 'How It Works - InstaViewer Anonymous Instagram Viewer',
    description: 'Learn how InstaViewer works to let you view Instagram stories, profiles, and posts anonymously without login or registration.',
    canonical: `${config.SEO.SITE_URL}/about/how-it-works`,
    keywords: 'how instagram viewer works, anonymous instagram viewing, instagram stories viewer guide',
    ogTitle: 'How InstaViewer Works - Anonymous Instagram Viewing',
    ogDescription: 'Step-by-step guide to viewing Instagram content anonymously with InstaViewer.',
    ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
    ogUrl: `${config.SEO.SITE_URL}/about/how-it-works`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'How InstaViewer Works',
    twitterDescription: 'Guide to anonymous Instagram viewing'
  };

  res.render('how-it-works', {
    metaData,
    pageTitle: 'How It Works'
  });
});

// Features page
router.get('/features', (req, res) => {
  const metaData = {
    title: 'Features - InstaViewer Instagram Viewer Tool',
    description: 'Discover all InstaViewer features: anonymous story viewing, profile browsing, post downloading, and more Instagram tools.',
    canonical: `${config.SEO.SITE_URL}/about/features`,
    keywords: 'instagram viewer features, anonymous viewing, story downloader, profile viewer features',
    ogTitle: 'InstaViewer Features - Complete Instagram Viewer',
    ogDescription: 'All the features you need for anonymous Instagram viewing and downloading.',
    ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
    ogUrl: `${config.SEO.SITE_URL}/about/features`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'InstaViewer Features',
    twitterDescription: 'Complete Instagram viewing and download features'
  };

  const features = [
    {
      icon: '👁️',
      title: 'Anonymous Viewing',
      description: 'View Instagram stories and profiles without revealing your identity'
    },
    {
      icon: '📱',
      title: 'No Login Required',
      description: 'Access Instagram content without creating an account or logging in'
    },
    {
      icon: '📥',
      title: 'Download Content',
      description: 'Download stories, posts, and profile pictures in high quality'
    },
    {
      icon: '🔍',
      title: 'Search Users',
      description: 'Search for any public Instagram user by username'
    },
    {
      icon: '📊',
      title: 'Profile Statistics',
      description: 'View follower count, post count, and other profile statistics'
    },
    {
      icon: '🚀',
      title: 'Fast Loading',
      description: 'Optimized for speed with intelligent caching system'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Works perfectly on all devices - phone, tablet, or desktop'
    },
    {
      icon: '🔒',
      title: 'Privacy Protected',
      description: 'We don\'t store your data or track your viewing history'
    }
  ];

  res.render('features', {
    metaData,
    features,
    pageTitle: 'Features'
  });
});

module.exports = router;