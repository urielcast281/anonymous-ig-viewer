const express = require('express');
const router = express.Router();
const seo = require('../utils/seo');
const config = require('../config');

const articles = [
  {
    slug: 'view-instagram-stories-anonymously',
    title: 'How to View Instagram Stories Anonymously in 2026',
    description: 'Complete guide to viewing Instagram stories without being seen. Learn the best methods and tools for anonymous story viewing.',
    date: '2026-01-15',
    readTime: '5 min read',
  },
  {
    slug: 'best-picuki-alternatives',
    title: 'Best Picuki Alternatives That Actually Work in 2026',
    description: 'Picuki down again? Here are the top working alternatives for anonymous Instagram viewing, including InstaViewer.',
    date: '2026-01-20',
    readTime: '6 min read',
  },
  {
    slug: 'is-anonymous-instagram-viewing-safe',
    title: 'Is It Safe to View Instagram Anonymously? Everything You Need to Know',
    description: 'Safety, legality, and privacy of anonymous Instagram viewers explained. What you need to know before using these tools.',
    date: '2026-02-01',
    readTime: '7 min read',
  },
];

// Blog index
router.get('/', (req, res) => {
  const metaData = {
    title: 'Blog - InstaViewer | Instagram Tips, Guides & News',
    description: 'Read the latest articles about Instagram anonymous viewing, story downloading, privacy tips, and the best tools for browsing Instagram without an account.',
    canonical: `${config.SEO.SITE_URL}/blog`,
    keywords: 'instagram tips, anonymous instagram, instagram story viewer guide, picuki alternatives, instagram privacy',
    ogTitle: 'InstaViewer Blog - Instagram Tips & Guides',
    ogDescription: 'Tips, guides, and news about anonymous Instagram viewing.',
    ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
    ogUrl: `${config.SEO.SITE_URL}/blog`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'InstaViewer Blog',
    twitterDescription: 'Instagram viewing tips and guides.',
  };

  res.render('blog-index', { metaData, structuredData: null, articles, searchQuery: '' });
});

// Individual articles
router.get('/:slug', (req, res) => {
  const article = articles.find(a => a.slug === req.params.slug);
  if (!article) {
    return res.status(404).render('error', {
      error: { status: 404, message: 'Article not found' },
      title: '404 - Article Not Found',
      description: 'Blog article not found.',
      metaData: seo.getHomeMeta(),
    });
  }

  const metaData = {
    title: `${article.title} | InstaViewer Blog`,
    description: article.description,
    canonical: `${config.SEO.SITE_URL}/blog/${article.slug}`,
    keywords: `instagram, anonymous viewing, ${article.slug.replace(/-/g, ', ')}`,
    ogTitle: article.title,
    ogDescription: article.description,
    ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
    ogUrl: `${config.SEO.SITE_URL}/blog/${article.slug}`,
    twitterCard: 'summary_large_image',
    twitterTitle: article.title,
    twitterDescription: article.description,
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.description,
    "datePublished": article.date,
    "author": { "@type": "Organization", "name": "InstaViewer" },
    "publisher": { "@type": "Organization", "name": "InstaViewer", "url": config.SEO.SITE_URL },
    "mainEntityOfPage": `${config.SEO.SITE_URL}/blog/${article.slug}`,
  };

  res.render(`blog-${article.slug}`, { metaData, structuredData, article, articles, searchQuery: '' });
});

module.exports = router;
