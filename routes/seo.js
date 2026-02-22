const express = require('express');
const router = express.Router();
const seo = require('../utils/seo');
const config = require('../config');

router.get('/instagram-story-viewer', (req, res) => {
  const metaData = {
    title: 'Instagram Story Viewer - View Stories Anonymously Without Login (2026)',
    description: 'Free Instagram story viewer. Watch Instagram stories anonymously without an account. No login needed. View, download, and save stories privately.',
    canonical: `${config.SEO.SITE_URL}/instagram-story-viewer`,
    keywords: 'instagram story viewer, view instagram stories anonymously, anonymous story viewer, instagram stories without account, watch ig stories',
    ogTitle: 'Instagram Story Viewer - 100% Anonymous & Free',
    ogDescription: 'View anyone\'s Instagram stories without them knowing. Free, fast, no login required.',
    ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
    ogUrl: `${config.SEO.SITE_URL}/instagram-story-viewer`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Free Instagram Story Viewer - Anonymous',
    twitterDescription: 'Watch Instagram stories anonymously without login.',
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Can I view Instagram stories without an account?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! InstaViewer lets you view any public Instagram story without logging in or creating an account. Simply enter the username and browse their stories anonymously." }},
      { "@type": "Question", "name": "Will the user know I viewed their story?", "acceptedAnswer": { "@type": "Answer", "text": "No. When you view stories through InstaViewer, your visit is completely anonymous. The story owner will not see you in their viewers list." }},
      { "@type": "Question", "name": "Can I download Instagram stories?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, InstaViewer allows you to download both photo and video stories directly to your device with one click." }},
      { "@type": "Question", "name": "Is the Instagram story viewer free?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. InstaViewer is 100% free with no hidden fees, subscriptions, or premium tiers." }},
      { "@type": "Question", "name": "Does this work with private accounts?", "acceptedAnswer": { "@type": "Answer", "text": "No. InstaViewer can only access stories from public Instagram accounts. We respect user privacy settings." }},
    ]
  };

  res.render('seo-story-viewer', { metaData, structuredData, searchQuery: '' });
});

router.get('/anonymous-instagram-viewer', (req, res) => {
  const metaData = {
    title: 'Anonymous Instagram Viewer - View Profiles & Posts Without Login (2026)',
    description: 'Browse Instagram profiles, posts, and stories completely anonymously. No account needed. Free anonymous Instagram viewer with download support.',
    canonical: `${config.SEO.SITE_URL}/anonymous-instagram-viewer`,
    keywords: 'anonymous instagram viewer, view instagram without account, instagram viewer no login, private instagram viewer, browse instagram anonymously',
    ogTitle: 'Anonymous Instagram Viewer - Browse Without Being Seen',
    ogDescription: 'View Instagram profiles and posts anonymously. No login, no traces.',
    ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
    ogUrl: `${config.SEO.SITE_URL}/anonymous-instagram-viewer`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Anonymous Instagram Viewer',
    twitterDescription: 'Browse Instagram without an account or login.',
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is an anonymous Instagram viewer?", "acceptedAnswer": { "@type": "Answer", "text": "An anonymous Instagram viewer is a web tool that lets you browse Instagram profiles, posts, and stories without logging into Instagram. Your identity remains completely hidden from the content creator." }},
      { "@type": "Question", "name": "Is anonymous Instagram viewing legal?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Viewing publicly available content on the internet is legal. InstaViewer only accesses content that users have made public on Instagram." }},
      { "@type": "Question", "name": "Do I need to install anything?", "acceptedAnswer": { "@type": "Answer", "text": "No installation needed. InstaViewer works entirely in your web browser on any device — phone, tablet, or computer." }},
    ]
  };

  res.render('seo-anonymous-viewer', { metaData, structuredData, searchQuery: '' });
});

router.get('/picuki-alternative', (req, res) => {
  const metaData = {
    title: 'Best Picuki Alternative 2026 - InstaViewer (Faster & More Reliable)',
    description: 'Looking for a Picuki alternative that actually works? InstaViewer is faster, more reliable, and ad-friendly. View Instagram stories and profiles anonymously.',
    canonical: `${config.SEO.SITE_URL}/picuki-alternative`,
    keywords: 'picuki alternative, picuki replacement, sites like picuki, picuki not working, instagram viewer like picuki, picnob alternative, imginn alternative, dumpor alternative',
    ogTitle: 'Best Picuki Alternative - InstaViewer (2026)',
    ogDescription: 'Picuki down? Try InstaViewer — faster, more reliable Instagram viewer.',
    ogImage: `${config.SEO.SITE_URL}${config.SEO.DEFAULT_IMAGE}`,
    ogUrl: `${config.SEO.SITE_URL}/picuki-alternative`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Best Picuki Alternative - InstaViewer',
    twitterDescription: 'Faster & more reliable than Picuki. View Instagram anonymously.',
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Why is Picuki not working?", "acceptedAnswer": { "@type": "Answer", "text": "Picuki frequently experiences downtime due to Instagram API changes and high traffic. InstaViewer uses multiple data sources and fallback methods to stay online even when other viewers go down." }},
      { "@type": "Question", "name": "What makes InstaViewer better than Picuki?", "acceptedAnswer": { "@type": "Answer", "text": "InstaViewer offers faster loading times, a cleaner dark-mode interface, story viewing with auto-advance, better mobile experience, and more reliable uptime than Picuki." }},
      { "@type": "Question", "name": "Is InstaViewer free like Picuki?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! InstaViewer is completely free to use, just like Picuki. We support our service through non-intrusive advertisements." }},
      { "@type": "Question", "name": "What other Picuki alternatives exist?", "acceptedAnswer": { "@type": "Answer", "text": "Other alternatives include Picnob, Imginn, Dumpor, and StoriesIG. However, InstaViewer offers the most reliable and feature-rich experience among all these tools." }},
    ]
  };

  res.render('seo-picuki-alternative', { metaData, structuredData, searchQuery: '' });
});

module.exports = router;
