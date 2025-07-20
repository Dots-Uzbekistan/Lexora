# Zento Legal AI - Deployment Guide

This guide covers deploying the Zento Legal AI website to various platforms.

## 🚀 Quick Deploy Options

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `npm run deploy:vercel`
3. Follow the prompts to connect your repository

### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `npm run deploy:netlify`
3. Follow the prompts to connect your repository

## 📋 Pre-deployment Checklist

- [ ] All translations are complete (en.json, ru.json, uz.json)
- [ ] Environment variables are configured
- [ ] Build passes locally: `npm run build`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="Zento Legal AI"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_GTM_ID=your-google-tag-manager-id

# Contact Forms (Optional)
NEXT_PUBLIC_CONTACT_EMAIL=contact@your-domain.com
```

## 🏗️ Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Build analysis
npm run build:analyze
```

## 🌐 Platform-Specific Deployment

### Vercel

- Automatic deployments from Git
- Built-in CDN and edge functions
- Zero configuration required
- Supports Next.js 15 features

### Netlify

- Automatic deployments from Git
- Custom domain support
- Form handling included
- Redirects in `netlify.toml`

### Railway

- Container-based deployment
- Automatic scaling
- Database support if needed

### DigitalOcean App Platform

- Container-based deployment
- Automatic scaling
- Custom domain support

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/           # Next.js 15 app router
│   ├── components/    # React components
│   ├── i18n/         # Internationalization
│   └── lib/          # Utilities
├── translations/     # Language files
├── public/          # Static assets
└── package.json     # Dependencies and scripts
```

## 🔍 Performance Optimization

The project includes:

- ✅ Next.js 15 with App Router
- ✅ Tailwind CSS for styling
- ✅ Image optimization with WebP/AVIF
- ✅ Internationalization (i18n)
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Compression enabled
- ✅ SWC minification

## 🛠️ Troubleshooting

### Build Errors

1. Check Node.js version (18+ required)
2. Clear cache: `rm -rf .next node_modules/.cache`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

### Translation Issues

1. Verify all translation files exist: `en.json`, `ru.json`, `uz.json`
2. Check JSON syntax validity
3. Ensure all keys are present in all languages

### Performance Issues

1. Run build analysis: `npm run build:analyze`
2. Check bundle size in build output
3. Optimize images and assets

## 📞 Support

For deployment issues:

1. Check the platform's documentation
2. Review build logs for errors
3. Verify environment variables
4. Test locally before deploying

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - run: npm run deploy:vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## 📊 Monitoring

After deployment:

1. Set up uptime monitoring
2. Configure error tracking (Sentry, LogRocket)
3. Set up analytics (Google Analytics, Plausible)
4. Monitor Core Web Vitals
5. Set up performance alerts
