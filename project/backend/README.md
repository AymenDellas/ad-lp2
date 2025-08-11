# Ad Alignment Backend Service with Playwright

A Node.js backend service with Playwright for extremely accurate web scraping and Groq AI analysis.

## Features

- **Playwright Web Scraping**: Extremely accurate content extraction using real browser automation
- **Groq AI Analysis**: Advanced misalignment detection using Llama 3.1
- **Comprehensive Content Extraction**: Headlines, CTAs, offers, urgency cues, pricing, social proof, trust indicators
- **RESTful API**: Clean endpoints for scraping and analysis
- **Better Cloud Support**: Playwright has superior cloud deployment capabilities
- **Multi-Browser Support**: Can use Chromium, Firefox, or WebKit

## Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Production Deployment

#### Deploy to Railway
1. Connect your GitHub repo to Railway
2. Railway automatically installs Playwright browsers
3. Set environment variables in Railway dashboard
4. Railway will auto-deploy on push

#### Deploy to Render
1. Connect repo to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Render automatically handles Playwright installation
5. Add environment variables

#### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```
Note: Vercel has excellent Playwright support with automatic browser installation

## API Endpoints

### Health Check
```
GET /health
```

### Scrape Single URL
```
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Full Analysis
```
POST /api/analyze
Content-Type: application/json

{
  "adUrl": "https://facebook.com/ads/...",
  "landingPageUrl": "https://example.com"
}
```

## Environment Variables

- `GROQ_API_KEY`: Your Groq API key
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `PLAYWRIGHT_BROWSERS_PATH`: Custom browser path (rarely needed)

## Cloud Platform Notes

### Railway
- Automatically installs Playwright browsers
- No additional configuration needed
- Excellent performance

### Render
- Playwright browsers install automatically
- No buildpack needed (unlike Puppeteer)
- Better memory management than Puppeteer

### Vercel
- Excellent Playwright support
- Automatic browser installation
- Serverless functions work great with Playwright

### Google Cloud Run
- Playwright has better GCR support than Puppeteer
- Increase memory allocation to 2GB+
- Consider using official Playwright Docker images

## Performance Tips

- Playwright is generally faster than Puppeteer
- Better memory management and cleanup
- Each request launches fresh browser instance for maximum accuracy
- Typical response time: 8-20 seconds per analysis
- Consider implementing request queuing for high traffic
- Playwright's auto-wait features reduce timing issues

## Playwright Advantages

- **Better Cloud Support**: Most platforms have native Playwright support
- **Faster Execution**: Generally 10-20% faster than Puppeteer
- **Better Reliability**: More stable browser automation
- **Auto-waiting**: Built-in smart waiting for elements
- **Multi-browser**: Can switch between Chromium, Firefox, WebKit
- **Better Error Handling**: More descriptive error messages