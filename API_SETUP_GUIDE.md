# API Setup Guide for NEOWatch

## Required API Keys

### 1. NASA API Key (Required)
- **URL**: https://api.nasa.gov/
- **Steps**:
  1. Visit https://api.nasa.gov/
  2. Fill out the simple form with your name and email
  3. Check your email for the API key
  4. Free tier: 1000 requests per hour
  5. Add to `.env.local`: `NEXT_PUBLIC_NASA_API_KEY=your_key_here`

### 2. Gemini AI API Key (Optional - for AI analysis)
- **URL**: https://ai.google.dev/
- **Steps**:
  1. Visit https://ai.google.dev/
  2. Sign in with Google account
  3. Create a new project or select existing
  4. Enable Gemini API
  5. Generate API key
  6. Free tier available
  7. Add to `.env.local`: `NEXT_PUBLIC_GEMINI_API_KEY=your_key_here`

### 3. TomTom Maps API Key (Optional - for interactive maps)
- **URL**: https://developer.tomtom.com/
- **Steps**:
  1. Visit https://developer.tomtom.com/
  2. Sign up for free account
  3. Create a new project
  4. Get API key from dashboard
  5. Free tier: 2500 requests per day
  6. Add to `.env.local`: `NEXT_PUBLIC_TOMTOM_API_KEY=your_key_here`

## Environment Setup

1. **Copy the example environment file**:
   ```bash
   cp .env.local .env.local.backup
   ```

2. **Edit `.env.local` with your actual API keys**:
   ```env
   NEXT_PUBLIC_NASA_API_KEY=your_actual_nasa_api_key_here
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here
   NEXT_PUBLIC_TOMTOM_API_KEY=your_actual_tomtom_api_key_here
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

## Testing API Keys

### Test NASA API Key
```bash
curl "https://api.nasa.gov/neo/rest/v1/feed?api_key=YOUR_NASA_API_KEY"
```

### Test Gemini API Key
```bash
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_GEMINI_API_KEY"
```

### Test TomTom API Key
```bash
curl "https://api.tomtom.com/search/2/geocode/New York.json?key=YOUR_TOMTOM_API_KEY"
```

## Troubleshooting

### Common Issues

1. **404 Errors from Gemini API**
   - The model name might be incorrect
   - Use `gemini-1.5-flash` instead of `gemini-1.5-pro`
   - Check if your API key has access to the model

2. **NASA API Returns Empty Results**
   - Verify your API key is correct
   - Check if you've exceeded rate limits
   - Ensure the date range is valid

3. **TomTom Maps Not Loading**
   - Verify API key is correct
   - Check browser console for CORS errors
   - Ensure you haven't exceeded daily limits

4. **Universal-Federated-Analytics Errors**
   - These are typically from browser extensions
   - Disable ad blockers temporarily
   - Not related to your application code

### Fallback Behavior

The application is designed to work even without API keys:

- **Without Gemini API**: Falls back to mock AI analysis
- **Without TomTom API**: Shows placeholder map
- **Without NASA API**: Shows mock asteroid/comet data

## Security Notes

- Never commit API keys to version control
- Use environment variables for all API keys
- Rotate API keys regularly
- Monitor API usage to avoid exceeding limits

## Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Verify API keys are correctly set
3. Test API endpoints directly
4. Check API provider documentation
5. Review rate limits and quotas

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Add environment variables in your hosting platform
2. Use the same variable names as in `.env.local`
3. Never expose API keys in client-side code
4. Monitor API usage and costs
