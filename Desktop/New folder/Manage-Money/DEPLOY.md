# Deployment Guide for Manage Money Online

**Version:** 1.0  
**Last Updated:** December 10, 2025  
**Status:** READY TO DEPLOY

---

## Overview

This guide walks you through deploying Manage Money Online to a production environment. The site is built with React + Vite and can be deployed to multiple platforms (Vercel, Cloudflare Pages, Netlify, or a custom server).

**Recommended:** Vercel or Cloudflare Pages (easiest, free tier available, optimal for Vite)

---

## Prerequisites

- Git repository initialized and pushed to GitHub (recommended)
- Custom domain registered (e.g., manage-money.online)
- SSL certificate (auto-provided by most platforms)
- GitHub account (for deployment automation)
- Build verified locally: `npm run build` succeeds without errors

---

## Option 1: Vercel (Recommended)

**Pros:** Optimal for Vite, easiest setup, automatic HTTPS, free tier generous  
**Cons:** Limited to 100GB bandwidth/month on free tier  
**Cost:** Free (with limitations), $20/month Pro for unlimited

### Step 1: Prepare Git Repository

```bash
git add .
git commit -m "feat: initialize Manage Money Online for production"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. Click "Add New Project"
5. Select your GitHub repository (Manage-Money)
6. Click "Import"

### Step 3: Configure Build Settings

In the Vercel import dialog:

- **Project Name:** manage-money-online
- **Framework Preset:** Vite (should auto-detect)
- **Root Directory:** ./ (default)
- **Build Command:** `npm run build`
- **Output Directory:** `dist` (auto-filled)
- **Install Command:** `npm install`

**Environment Variables:** (if using .env)
- Click "Add Environment Variable"
- Add any variables from `.env.example` (e.g., `VITE_GA4_ID`)
- Values added here, NOT in code

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build (typically 1–2 minutes)
3. Vercel provides live URL: `https://manage-money-online.vercel.app`

### Step 5: Connect Custom Domain

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your domain: `manage-money.online`
4. Vercel shows DNS records to add (CNAME or A record)
5. Go to your domain registrar (GoDaddy, Namecheap, etc.)
6. Add DNS records as shown
7. Wait 24–48 hours for propagation (usually faster)
8. Verify in Vercel dashboard (shows "Valid Configuration")

### Step 6: Enable Automatic Deployments

Vercel automatically deploys on every `git push` to main branch. To disable:

1. Go to "Settings" → "Git"
2. Toggle "Deploy on push" on/off as needed

### Testing Live Deployment

```bash
# Test the live URL
curl https://manage-money.online
# Should return HTML (not 404 or error)
```

---

## Option 2: Cloudflare Pages

**Pros:** Fast CDN, generous free tier (500 builds/month), good SEO  
**Cons:** Build time limited to 15 minutes  
**Cost:** Free (with limitations), paid plans for additional features

### Step 1: Connect GitHub to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Log in (create account if needed)
3. Click "Create a project" → "Connect to Git"
4. Authorize Cloudflare to access GitHub
5. Select your repository (Manage-Money)

### Step 2: Configure Build Settings

- **Project name:** manage-money-online
- **Production branch:** main
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 18 (or latest LTS)

### Step 3: Environment Variables (Optional)

1. Click "Environment Variables"
2. Add any variables from `.env.example`
3. Add for "Production" environment

### Step 4: Deploy

1. Click "Save and Deploy"
2. Wait for build (typically 1–2 minutes)
3. Live URL: `https://manage-money-online.pages.dev`

### Step 5: Connect Custom Domain

1. Go to "Custom Domain"
2. Enter your domain: `manage-money.online`
3. Choose setup method:
   - **Nameservers:** Cloudflare manages your entire domain DNS
   - **CNAME:** Your existing registrar keeps DNS, Cloudflare just hosts your site
4. Follow on-screen instructions
5. SSL enabled automatically

---

## Option 3: Netlify

**Pros:** Good free tier, simple setup, great docs  
**Cons:** Slightly slower builds than Vercel  
**Cost:** Free (with limitations), $19/month for CI/CD priority

### Step 1: Connect GitHub

1. Go to [netlify.com](https://netlify.com)
2. Sign up / Log in
3. Click "Add new site" → "Import an existing project"
4. Choose "GitHub"
5. Authorize and select your repository

### Step 2: Configure Build

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** Set to 18 (or latest LTS) in netlify.toml (optional)

**Create `netlify.toml` in repo root (optional but recommended):**

```toml
[build]
command = "npm run build"
publish = "dist"

[build.environment]
NODE_VERSION = "18"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### Step 3: Deploy

1. Click "Deploy"
2. Wait for build and deployment
3. Live URL: `https://manage-money-online.netlify.app`

### Step 4: Connect Custom Domain

1. Go to "Domain Settings"
2. Click "Add custom domain"
3. Enter: `manage-money.online`
4. Update DNS at your registrar (CNAME or nameservers)
5. SSL auto-enabled by Netlify

---

## Option 4: Self-Hosted (Advanced)

**Pros:** Full control, can customize server setup  
**Cons:** Requires server administration knowledge, ongoing maintenance  
**Cost:** $5–$50+/month depending on provider (DigitalOcean, AWS, Linode, etc.)

### Step 1: Provision Server

1. Choose provider: DigitalOcean, AWS EC2, Linode, Hetzner
2. Provision Ubuntu 22.04 server (2GB RAM minimum, 20GB disk)
3. SSH into server:

```bash
ssh root@your_server_ip
```

### Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Install Certbot (SSL certificates)
apt install -y certbot python3-certbot-nginx
```

### Step 3: Clone Repository

```bash
cd /var/www
git clone https://github.com/your-username/Manage-Money.git manage-money-online
cd manage-money-online
npm install
npm run build
```

### Step 4: Configure PM2

```bash
# Create start script
pm2 start "npm run preview" --name "manage-money"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/manage-money`:

```nginx
server {
    listen 80;
    server_name manage-money.online www.manage-money.online;
    
    root /var/www/manage-money-online/dist;
    index index.html;
    
    location / {
        try_files $uri /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:

```bash
ln -s /etc/nginx/sites-available/manage-money /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 6: Enable HTTPS with Let's Encrypt

```bash
certbot --nginx -d manage-money.online -d www.manage-money.online
```

Follow prompts to auto-renew. Certbot auto-modifies Nginx config.

### Step 7: Update DNS

Point your domain's DNS records (A or CNAME) to your server IP:

```
A record: manage-money.online -> your_server_ip
A record: www.manage-money.online -> your_server_ip
```

### Step 8: Verify Deployment

```bash
curl https://manage-money.online
# Should return HTML
```

---

## Post-Deployment Setup

### 1. Set Up Google Analytics

1. Create GA4 property at [google.com/analytics](https://google.com/analytics)
2. Get Measurement ID (e.g., G-XXXXXXXXXX)
3. Add to environment variables or .env (not hardcoded):

```typescript
// analytics.example.ts (template for your future implementation)
const GA_ID = process.env.VITE_GA4_ID || '';

export function initializeGA() {
  if (!GA_ID) {
    console.warn('GA4 ID not configured');
    return;
  }
  
  // Add Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
}
```

### 2. Submit to Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your domain
3. Verify ownership (via DNS, HTML file, or Google Tag Manager)
4. Submit sitemap: `https://manage-money.online/sitemap.xml`
5. Wait for indexing (24–48 hours typically)

### 3. Monitor Performance

**Vercel/Netlify/Cloudflare:**
- Dashboard → Analytics shows traffic, performance, errors
- Set up email alerts for downtime or errors

**Self-Hosted:**
- Log into server and monitor:
```bash
pm2 monit  # Monitor PM2 processes
pm2 logs manage-money  # View app logs
```

### 4. Set Up Backup Strategy

**Vercel/Cloudflare/Netlify:**
- Automatic backups included
- Git repository is your version control

**Self-Hosted:**
- Automated daily backups of `/var/www/manage-money-online/dist`
- Back up Git repository to GitHub (version control)
- Consider snapshot backups of entire server (via provider)

---

## AdSense Application (After Going Live)

1. **Wait 30+ days** with live traffic and content indexed
2. Review [AD_SENSE_CHECKLIST.md](./AD_SENSE_CHECKLIST.md)
3. Go to [google.com/adsense](https://google.com/adsense)
4. Sign up and enter your domain
5. Follow approval process (24–48 hours typical)
6. Once approved, add ad code (replace placeholders in Layout.tsx)
7. Monitor earnings in AdSense dashboard

---

## Monitoring & Maintenance

### Weekly
- [ ] Check analytics for traffic trends
- [ ] Review error logs (if self-hosted)
- [ ] Test key pages load correctly

### Monthly
- [ ] Run PageSpeed Insights
- [ ] Check Search Console for errors
- [ ] Review AdSense earnings (if applicable)
- [ ] Publish new content

### Quarterly
- [ ] Security: Run `npm audit`
- [ ] Update dependencies (if needed)
- [ ] Backup verification
- [ ] Site audit via Lighthouse

---

## Troubleshooting

### Build Fails on Deployment
**Error:** "Build failed" in deployment logs

**Solution:**
1. Run locally: `npm run build`
2. Check output for errors
3. Fix errors locally
4. Commit and push
5. Deployment will retry automatically

### Site Shows Blank Page After Deployment
**Error:** Homepage loads but shows blank

**Solution:**
1. Check browser console (F12) for errors
2. Verify build output: `npm run build` then check `dist/` folder
3. Clear browser cache (Ctrl+Shift+Del)
4. Check network tab for failed requests
5. For self-hosted: verify Nginx config points to `dist/` folder

### Domain Not Working After DNS Change
**Error:** Domain shows "address not found" or Vercel/Netlify default page

**Solution:**
1. DNS takes 24–48 hours to propagate
2. Check DNS records are correctly added:
   ```bash
   nslookup manage-money.online
   dig manage-money.online
   ```
3. Verify with provider's DNS checker tool
4. Clear local DNS cache if needed

### HTTPS Certificate Errors
**Error:** "Your connection is not private" or certificate warning

**Solution:**
- Vercel/Cloudflare/Netlify: Automatic, no action needed (wait 5 min)
- Self-Hosted: Run `certbot renew --dry-run` to test

---

## Rolling Back a Deployment

### Vercel
1. Dashboard → Deployments
2. Find previous working deployment
3. Click the 3-dot menu
4. Select "Rollback to this deployment"

### Netlify
1. Dashboard → Deploys
2. Click previous working deploy
3. Click "Publish deploy"

### Cloudflare Pages
1. Dashboard → Deployments
2. Find previous working deployment
3. Click "View" → "Rollback to this deployment"

### Self-Hosted
```bash
cd /var/www/manage-money-online
git reset --hard <commit_hash_of_working_version>
npm run build
pm2 restart manage-money
```

---

## Performance Optimization Tips

1. **Image Optimization:**
   - Compress images before adding (use TinyPNG or similar)
   - Target <100KB per image
   - Use WebP format where possible

2. **Lazy Loading:**
   - Images below fold should be lazy-loaded
   - Use `loading="lazy"` attribute in `<img>` tags

3. **Caching Headers:**
   - Static assets should have 1-year cache headers
   - HTML should have short cache (5–10 min)

4. **CDN Usage:**
   - Vercel/Cloudflare/Netlify all use CDN automatically
   - Static assets served from global CDN

5. **Monitoring:**
   - Use WebPageTest for detailed performance analysis
   - Monitor Core Web Vitals in Google Search Console

---

## Support & Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Cloudflare Pages Docs:** [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)
- **Vite Deployment Guide:** [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy.html)

---

## Deployment History Log

| Date | Deployment | Platform | Status | Notes |
|------|------------|----------|--------|-------|
| | | | | |

---

**Deployment Guide Last Updated:** December 10, 2025

**Next Review:** After first production deployment or in 3 months (whichever comes first)