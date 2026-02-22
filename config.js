module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  CACHE_TTL: {
    PROFILE: 3600,
    STORIES: 900,
    POSTS: 1800,
    SEARCH: 1800,
  },

  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 1000,
  },

  INSTAGRAM: {
    BASE_URL: 'https://www.instagram.com',
    GRAPHQL_URL: 'https://www.instagram.com/graphql/query/',
    WEB_PROFILE_INFO: '/api/v1/users/web_profile_info/?username=',
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  },

  ADS: {
    PROVIDER: process.env.AD_PROVIDER || 'adsterra',
    ENABLE_ADS: process.env.ENABLE_ADS !== 'false',

    // Adsterra
    ADSTERRA_BANNER_ID: process.env.ADSTERRA_BANNER_ID || '',
    ADSTERRA_NATIVE_ID: process.env.ADSTERRA_NATIVE_ID || '',
    ADSTERRA_SOCIAL_BAR_ID: process.env.ADSTERRA_SOCIAL_BAR_ID || '',
    ADSTERRA_POPUNDER_ID: process.env.ADSTERRA_POPUNDER_ID || '',

    // Google AdSense
    GOOGLE_ADSENSE_CLIENT: process.env.ADSENSE_CLIENT || '',
    GOOGLE_ADSENSE_SLOT_BANNER: process.env.ADSENSE_SLOT_BANNER || '',
    GOOGLE_ADSENSE_SLOT_SIDEBAR: process.env.ADSENSE_SLOT_SIDEBAR || '',
    GOOGLE_ADSENSE_SLOT_INFEED: process.env.ADSENSE_SLOT_INFEED || '',
    GOOGLE_ADSENSE_SLOT_ANCHOR: process.env.ADSENSE_SLOT_ANCHOR || '',
    GOOGLE_ADSENSE_SLOT_INTERSTITIAL: process.env.ADSENSE_SLOT_INTERSTITIAL || '',
    GOOGLE_ADSENSE_SLOT_NATIVE: process.env.ADSENSE_SLOT_NATIVE || '',
  },

  // Google Analytics
  GA_TRACKING_ID: process.env.GA_TRACKING_ID || '',

  SEO: {
    SITE_NAME: process.env.SITE_NAME || 'InstaViewer - Anonymous Instagram Story & Profile Viewer',
    SITE_DESCRIPTION: 'View Instagram stories, profiles, and posts anonymously. No login required. Download Instagram content easily and safely.',
    SITE_URL: process.env.SITE_URL || 'https://instaviewer.net',
    DEFAULT_IMAGE: '/images/og-default.jpg',
    TWITTER_HANDLE: process.env.TWITTER_HANDLE || '@instaviewer',
  },

  USE_MOCK_DATA: process.env.USE_MOCK_DATA !== 'false', // default TRUE

  TRENDING_PROFILES: [
    'instagram', 'cristiano', 'therock', 'kyliejenner',
    'selenagomez', 'kimkardashian', 'arianagrande', 'beyonce',
    'justinbieber', 'taylorswift', 'neymarjr', 'nickiminaj',
  ],

  PROXY: {
    ENABLE: process.env.PROXY_ENABLE === 'true',
    ROTATION_INTERVAL: 300000,
    MAX_RETRIES: 3,
  },
};
