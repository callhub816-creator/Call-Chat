<div align="center">
<img width="1200" height="475" alt="Manage Money Online" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Manage Money Online

A comprehensive financial education platform helping users master budgeting, saving, investing, and debt management. Built for accessibility, performance, and AdSense approval-readiness.

## Mission

Manage Money Online is dedicated to making financial literacy accessible, understandable, and actionable for everyone. We provide objective, non-personalized financial education to empower individuals worldwide to take control of their financial destiny.

---

## Local Development Setup

### Prerequisites
- **Node.js** (v16 or higher) [Download](https://nodejs.org/)
- **npm** (v8 or higher, included with Node.js)

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Manage-Money
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Local: `http://localhost:3000`
   - Network: Check terminal output for network URL

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Preview production build locally:**
   ```bash
   npm run preview
   ```

---

## Framework & Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6.2
- **Routing:** React Router v7
- **Styling:** Tailwind CSS (via CDN in development)
- **Icons:** Lucide React

### Build Configuration
- **Dev Port:** 3000
- **Dev Host:** localhost
- **Build Output:** `dist/`
- **Entry:** `index.html` → `index.tsx`

---

## Environment Variables

For optional features (analytics, API keys), copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

**Never commit `.env` files to git.** The `.gitignore` prevents accidental commits.

### Available Variables
- `VITE_GA4_ID` – Google Analytics 4 ID (optional)
- `VITE_API_BASE_URL` – API base URL if using server endpoints (optional)

---

## Project Structure

```
├── index.html              # Main HTML entry (SEO meta tags)
├── index.tsx               # React app entry point
├── App.tsx                 # Router and layout wrapper
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── components/
│   ├── Layout.tsx          # Header, nav, footer with ARIA landmarks
│   └── SavingsCalculator.tsx
├── pages/
│   ├── Home.tsx            # Homepage with hero and trust sections
│   ├── About.tsx           # About page
│   ├── Guides.tsx          # Guides list & detail view
│   ├── Blog.tsx            # Blog list & detail view
│   └── Contact.tsx         # Contact form
├── data/
│   └── content.ts          # Guides and blog posts data
├── public/
│   ├── robots.txt          # Search engine crawling rules
│   ├── sitemap.xml         # Static XML sitemap
│   └── manifest.json       # PWA manifest
├── scripts/
│   └── generate-sitemap.js # Sitemap generation script (build-time)
└── static/
    └── ads.txt             # AdSense verification file

```

---

## Key Features

✅ **SEO-Optimized**
- Meta tags (title, description, OG, Twitter cards) on homepage
- Robots.txt and sitemap.xml for crawling
- Proper heading hierarchy (H1/H2/H3)
- Internal linking structure

✅ **AdSense-Ready**
- Ad placeholder comments in layout for approved placement
- Mobile-first responsive design
- Fast load times (Vite-optimized)
- No user-generated content or scraped material

✅ **Accessibility (a11y)**
- Semantic HTML (`<main>`, `<header>`, `<footer>`)
- ARIA landmarks where needed
- Alt text on images
- Proper color contrast

✅ **Security**
- No client-side API keys or secrets
- `.env` file support for safe configuration
- Contact form uses client-side state (no external API calls)
- No user login or payment features

✅ **Performance**
- Vite for fast builds and HMR
- Lazy-loaded images
- Optimized React components
- Tailwind CSS for minimal CSS

---

## Content & Compliance

### Financial Disclaimer
**This site provides educational information only and is NOT personal financial advice.** All content includes clear disclaimers. See `Disclaimer & Legal` page for full terms.

### Privacy Policy
Review our [Privacy Policy](./privacy-policy.md) for information on data collection and third-party services (Google Analytics, Google AdSense).

### Content Standards
- All guides and articles are original, factual, and neutral (no country-specific advice)
- Each article includes sources, citations, and estimated read time
- FAQ sections and internal linking for improved UX and SEO
- See [CONTENT_CHECKLIST.md](./CONTENT_CHECKLIST.md) for article requirements

---

## Deployment

For deploying to production (Vercel, Cloudflare Pages, Netlify), see [DEPLOY.md](./DEPLOY.md).

### Recommended Hosts
- **Vercel** – Automatic GitHub integration, optimal for Vite
- **Cloudflare Pages** – CDN + build + free tier
- **Netlify** – Traditional hosting, easy configuration

---

## Quality Assurance & Checklists

Before submitting to Google AdSense or pushing to production:

1. Review [AD_SENSE_CHECKLIST.md](./AD_SENSE_CHECKLIST.md) – 25+ items to verify
2. Check [CONTENT_CHECKLIST.md](./CONTENT_CHECKLIST.md) – Per-article standards
3. Run `npm audit` – Check for security vulnerabilities
4. Test `npm run build` – Ensure production build succeeds
5. Verify local performance with browser DevTools (Lighthouse)

---

## Contributing & Content Submission

To add a new guide or blog post:

1. Add entry to `/data/content.ts` following existing structure
2. Include title, summary, sections with full content
3. Ensure 900+ words for guides, with sources and FAQs (see samples in docs)
4. Add internal links to related guides
5. Test locally before committing

---

## Support & Questions

- Email: hello@manage-money.online
- [Contact Page](http://localhost:3000/contact)
- GitHub Issues (for bugs/feature requests)

---

## License

© Manage Money Online. All rights reserved. See LICENSE file for details.

---

## Changelog

### v0.0.0 (Initial)
- Foundation: React + Vite + TypeScript
- Core pages: Home, About, Guides, Blog, Contact
- SEO: Meta tags, sitemap, robots.txt
- Security: Removed hardcoded API keys; added .env support
- Accessibility: ARIA landmarks, semantic HTML
- AdSense-ready: Placeholder comments, mobile-optimized

