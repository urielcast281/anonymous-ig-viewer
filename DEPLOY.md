# InstaViewer Deployment Guide

## Prerequisites
- Domain name (e.g., instaviewer.net)
- Cloudflare account (free) for DNS

---

## Option A: DigitalOcean Droplet ($4-6/mo)

### 1. Create Droplet
- Size: Basic $4/mo (512MB RAM) or $6/mo (1GB)
- Image: Ubuntu 22.04
- Region: nearest to target audience

### 2. Initial Setup
```bash
ssh root@YOUR_IP
apt update && apt upgrade -y
apt install -y docker.io docker-compose git
systemctl enable docker
```

### 3. Deploy
```bash
git clone YOUR_REPO /opt/instaviewer
cd /opt/instaviewer
cp .env.production .env
nano .env  # edit SITE_URL, ad IDs, etc.
docker-compose up -d
```

### 4. SSL with Let's Encrypt
```bash
apt install -y certbot
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
# Update nginx.conf with your domain
docker-compose restart nginx
```

### 5. Auto-Renewal
```bash
crontab -e
# Add: 0 3 * * * certbot renew --quiet && docker-compose restart nginx
```

---

## Option B: Railway.app (Free Tier / $5/mo)

### 1. Push to GitHub

### 2. Connect to Railway
- Go to railway.app → New Project → Deploy from GitHub
- Select your repo

### 3. Set Environment Variables
In Railway dashboard → Variables:
```
PORT=3000
NODE_ENV=production
SITE_URL=https://yourdomain.com
USE_MOCK_DATA=true
ENABLE_ADS=true
```

### 4. Custom Domain
- Railway Settings → Custom Domain → Add your domain
- Point DNS to Railway's provided CNAME

---

## Option C: Render.com (Free Tier)

### 1. Create Web Service
- Go to render.com → New → Web Service
- Connect GitHub repo
- Build Command: `npm install`
- Start Command: `node server.js`

### 2. Environment Variables
Add same vars as Railway

### 3. Custom Domain
- Render dashboard → Settings → Custom Domains
- Add your domain and update DNS

---

## Domain Setup with Cloudflare

### 1. Add Domain to Cloudflare
- Create free Cloudflare account
- Add your domain → Update nameservers at registrar

### 2. DNS Records
For VPS:
```
A    @    YOUR_VPS_IP    (Proxied)
A    www  YOUR_VPS_IP    (Proxied)
```

For Railway/Render:
```
CNAME  @    your-app.railway.app   (Proxied)
CNAME  www  your-app.railway.app   (Proxied)
```

### 3. Cloudflare Settings (Recommended)
- SSL/TLS: Full (Strict)
- Always Use HTTPS: On
- Auto Minify: JS, CSS, HTML
- Brotli: On
- Caching Level: Standard
- Browser Cache TTL: 4 hours

---

## Post-Deployment Checklist

- [ ] Site loads at https://yourdomain.com
- [ ] Search works (returns mock data)
- [ ] Profile pages load
- [ ] Story viewer works
- [ ] SEO pages load (/instagram-story-viewer, /anonymous-instagram-viewer, /picuki-alternative)
- [ ] Blog loads (/blog)
- [ ] sitemap.xml accessible
- [ ] robots.txt accessible
- [ ] Submit sitemap to Google Search Console
- [ ] Sign up for Adsterra and add ad IDs to .env
- [ ] Set up Google Analytics and add tracking ID
- [ ] (Optional) Get RapidAPI key for real Instagram data

## Monetization Setup

1. **Adsterra** (Day 1): Sign up at adsterra.com → Get approved → Add banner/native/popunder IDs to .env
2. **Google Analytics**: Create GA4 property → Add tracking ID to GA_TRACKING_ID
3. **Google AdSense** (After traffic): Apply at adsense.google.com when you have consistent traffic
4. **RapidAPI** (Optional): Sign up at rapidapi.com → Subscribe to Instagram Scraper API → Add key to RAPIDAPI_KEY
