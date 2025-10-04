# Deployment Guide for Meteor Madness 🚀

## Vercel Deployment (Recommended)

### Method 1: Deploy from GitHub (Easiest)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Select the `Yatishgrandhe/meteormadness` repository
   - Click "Import"

3. **Configure Environment Variables**
   - In the deployment settings, add:
     ```
     NEXT_PUBLIC_NASA_API_KEY=your_nasa_api_key_here
     NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
     ```
   - Get NASA API key from: [api.nasa.gov](https://api.nasa.gov/)
   - Get Gemini API key from: [ai.google.dev](https://ai.google.dev/) (optional)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://meteormadness-[random].vercel.app`

### Method 2: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd meteor-madness
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_NASA_API_KEY
   vercel env add NEXT_PUBLIC_GEMINI_API_KEY
   ```

## Environment Variables Required

| Variable | Description | Required | Where to Get |
|----------|-------------|----------|--------------|
| `NEXT_PUBLIC_NASA_API_KEY` | NASA API key for NEO data | ✅ Yes | [api.nasa.gov](https://api.nasa.gov/) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Gemini AI API key | ❌ Optional | [ai.google.dev](https://ai.google.dev/) |

## Getting API Keys

### NASA API Key
1. Go to [api.nasa.gov](https://api.nasa.gov/)
2. Fill out the form with your details
3. Check your email for the API key
4. Free tier allows 1000 requests per hour

### Gemini API Key (Optional)
1. Go to [ai.google.dev](https://ai.google.dev/)
2. Sign in with Google account
3. Create a new project or select existing
4. Enable Gemini API
5. Generate API key
6. Free tier available

## Post-Deployment Checklist

- [ ] Verify NASA API key is working (check dashboard loads data)
- [ ] Test NEO page loads asteroid and comet data
- [ ] Confirm AI analysis works (if Gemini key provided)
- [ ] Check mobile responsiveness
- [ ] Test all navigation links
- [ ] Verify no console errors

## Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to project settings
   - Click "Domains"
   - Add your custom domain

2. **Update DNS**
   - Add CNAME record pointing to Vercel
   - Wait for SSL certificate (automatic)

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check environment variables are set
   - Ensure all dependencies are in package.json
   - Check for TypeScript errors

2. **API Errors**
   - Verify NASA API key is correct
   - Check API rate limits
   - Ensure network connectivity

3. **Styling Issues**
   - Clear browser cache
   - Check CSS imports
   - Verify Tailwind config

### Performance Optimization

- Images are automatically optimized by Vercel
- API routes have 30-second timeout
- Static assets are cached automatically
- Edge functions for global performance

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Console Logs**: Check Vercel dashboard for errors
- **API Monitoring**: NASA API status at [status.nasa.gov](https://status.nasa.gov/)

## Support

- **GitHub Issues**: Report bugs and feature requests
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

Your Meteor Madness app is now live! 🌟
