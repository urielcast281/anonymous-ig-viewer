const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const config = require('./config');
const cache = require('./services/cache');

// Import routes
const homeRoutes = require('./routes/home');
const profileRoutes = require('./routes/profile');
const storyRoutes = require('./routes/stories');
const postRoutes = require('./routes/post');
const aboutRoutes = require('./routes/about');
const apiRoutes = require('./routes/api');
const seoRoutes = require('./routes/seo');
const blogRoutes = require('./routes/blog');

const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "ui-avatars.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'",
        "*.googleadservices.com", "*.googlesyndication.com", "*.googletagmanager.com",
        "www.google-analytics.com", "www.googletagmanager.com",
        "*.adsterra.com", "*.propellerads.com", "*.monetag.com"],
      imgSrc: ["'self'", "data:", "blob:", "*.cdninstagram.com", "*.fbcdn.net",
        "scontent.cdninstagram.com", "*.googleapis.com", "*.adsterra.com",
        "picsum.photos", "ui-avatars.com", "*.picsum.photos"],
      connectSrc: ["'self'", "*.google-analytics.com", "*.adsterra.com"],
      frameSrc: ["'self'", "*.googlesyndication.com", "*.adsterra.com"],
    },
  },
}));

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: config.RATE_LIMIT.MAX_REQUESTS,
  duration: config.RATE_LIMIT.WINDOW_MS / 1000,
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ error: 'Too Many Requests', message: 'Please try again later' });
  }
});

// Static files
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Template locals
const seo = require('./utils/seo');
app.use((req, res, next) => {
  res.locals.config = config;
  res.locals.currentPath = req.path;
  res.locals.seo = seo;
  next();
});

// Routes
app.use('/', homeRoutes);
app.use('/profile', profileRoutes);
app.use('/stories', storyRoutes);
app.use('/post', postRoutes);
app.use('/about', aboutRoutes);
app.use('/api', apiRoutes);
app.use('/', seoRoutes);
app.use('/blog', blogRoutes);

// Dynamic sitemap
app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = config.SEO.SITE_URL;
  let urls = [
    { loc: baseUrl, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/about`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/instagram-story-viewer`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/anonymous-instagram-viewer`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/picuki-alternative`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/blog`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/blog/view-instagram-stories-anonymously`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/blog/best-picuki-alternatives`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/blog/is-anonymous-instagram-viewing-safe`, priority: '0.7', changefreq: 'monthly' },
  ];

  // Add cached profile pages
  try {
    const stats = await cache.getStats();
    if (stats.types && stats.types.profile) {
      const fs = require('fs').promises;
      const cacheDir = path.join(__dirname, 'cache');
      const files = await fs.readdir(cacheDir);
      for (const file of files) {
        if (file.startsWith('profile_') && file.endsWith('.json')) {
          const username = file.replace('profile_', '').replace('.json', '');
          urls.push({ loc: `${baseUrl}/profile/${username}`, priority: '0.6', changefreq: 'daily' });
        }
      }
    }
  } catch { /* ignore */ }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /cache/

Sitemap: ${config.SEO.SITE_URL}/sitemap.xml`);
});

// 404
app.use('*', (req, res) => {
  res.status(404).render('error', {
    error: { status: 404, message: 'Page not found' },
    title: '404 - Page Not Found',
    description: 'The page you are looking for could not be found.',
    metaData: seo.getHomeMeta(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    error: { status: 500, message: 'Internal server error' },
    title: '500 - Internal Server Error',
    description: 'Something went wrong.',
    metaData: seo.getHomeMeta(),
  });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 InstaViewer running on http://localhost:${PORT}`);
  console.log(`📊 Mock data: ${config.USE_MOCK_DATA ? 'ON' : 'OFF'}`);
  console.log(`🎯 Ads: ${config.ADS.ENABLE_ADS ? 'Enabled' : 'Disabled'}`);
  console.log(`🔧 Environment: ${config.NODE_ENV}`);
});
