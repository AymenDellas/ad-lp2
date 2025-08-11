import { chromium } from 'playwright';

export async function scrapeWithPlaywright(url) {
  let browser;
  
  try {
    console.log(`Launching Playwright browser for ${url}`);
    
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true
    });
    
    const page = await context.newPage();
    
    console.log(`Navigating to ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for content to load and any dynamic elements
    await page.waitForTimeout(3000);
    
    console.log('Extracting content with Playwright...');
    
    const scrapedData = await page.evaluate(() => {
      // Helper function to get text content safely
      const getTextContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : '';
      };
      
      // Helper function to get all text contents
      const getAllTextContents = (selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements)
          .map(el => el.textContent.trim())
          .filter(text => text.length > 0);
      };
      
      // Extract title
      const title = document.title || '';
      
      // Extract headlines with priority order
      const h1Elements = getAllTextContents('h1');
      const h2Elements = getAllTextContents('h2');
      const h3Elements = getAllTextContents('h3');
      
      const headline = h1Elements[0] || h2Elements[0] || h3Elements[0] || title;
      const subheadline = h1Elements[1] || h2Elements[0] || h3Elements[0] || '';
      
      // Extract CTAs with comprehensive selectors
      const ctaSelectors = [
        'button',
        'a[href*="signup"]',
        'a[href*="demo"]',
        'a[href*="trial"]',
        'a[href*="free"]',
        'a[href*="get"]',
        'a[href*="start"]',
        'a[href*="buy"]',
        'a[href*="purchase"]',
        'a[href*="order"]',
        'a[href*="book"]',
        'a[href*="schedule"]',
        '.cta',
        '.btn',
        '.button',
        '[class*="button"]',
        '[class*="cta"]',
        '[class*="btn"]',
        '[role="button"]',
        'input[type="submit"]',
        '[data-testid*="button"]',
        '[data-cy*="button"]'
      ];
      
      const ctas = [];
      ctaSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const text = el.textContent?.trim();
          const ariaLabel = el.getAttribute('aria-label');
          const title = el.getAttribute('title');
          const value = el.getAttribute('value');
          
          const ctaText = text || ariaLabel || title || value;
          if (ctaText && ctaText.length < 100 && ctaText.length > 2) {
            ctas.push(ctaText);
          }
        });
      });
      
      // Extract offers and value propositions
      const offerKeywords = [
        'free', 'discount', 'save', '%', 'trial', 'limited', 'bonus', 
        'exclusive', 'special', 'offer', 'deal', 'promotion', 'coupon',
        'off', 'reduction', 'sale', 'clearance', 'bargain', 'guarantee',
        'money back', 'risk free', 'no commitment'
      ];
      
      const offers = [];
      const textElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, strong, em');
      
      textElements.forEach(element => {
        const text = element.textContent?.trim() || '';
        const lowerText = text.toLowerCase();
        
        // Check if text contains offer keywords and is reasonable length
        if (text.length > 10 && text.length < 300) {
          offerKeywords.forEach(keyword => {
            if (lowerText.includes(keyword)) {
              offers.push(text);
            }
          });
        }
      });
      
      // Extract images with better filtering
      const images = Array.from(document.querySelectorAll('img'))
        .map(img => ({
          src: img.src,
          alt: img.alt || '',
          title: img.title || '',
          width: img.width || 0,
          height: img.height || 0
        }))
        .filter(img => 
          img.src && 
          !img.src.includes('data:image') && 
          !img.src.includes('tracking') &&
          !img.src.includes('pixel') &&
          (img.width > 50 || img.height > 50) // Filter out tiny images
        );
      
      // Extract urgency cues
      const urgencyKeywords = [
        'limited time', 'hurry', 'today only', 'expires', 'countdown', 
        'spots left', 'act fast', 'don\'t miss', 'last chance', 
        'ending soon', 'while supplies last', 'urgent', 'immediate',
        'now or never', 'final hours', 'deadline', 'running out'
      ];
      
      const urgencyCues = [];
      textElements.forEach(element => {
        const text = element.textContent?.trim() || '';
        const lowerText = text.toLowerCase();
        
        urgencyKeywords.forEach(keyword => {
          if (lowerText.includes(keyword) && text.length < 200) {
            urgencyCues.push(text);
          }
        });
      });
      
      // Extract body text (main content)
      const contentSelectors = [
        'main', 'article', '.content', '.main-content', 
        '[role="main"]', '.post-content', '.entry-content',
        '.description', '.summary', '.intro'
      ];
      
      let bodyText = '';
      for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          bodyText = element.textContent?.trim() || '';
          break;
        }
      }
      
      // Fallback to paragraphs if no main content found
      if (!bodyText) {
        const paragraphs = getAllTextContents('p');
        bodyText = paragraphs.slice(0, 15).join(' ');
      }
      
      // Limit body text length
      bodyText = bodyText.substring(0, 3000);
      
      // Extract target audience indicators
      const audienceKeywords = [
        'developer', 'cto', 'devops', 'engineer', 'business', 'enterprise', 
        'startup', 'agency', 'freelancer', 'consultant', 'manager', 'director',
        'ceo', 'founder', 'entrepreneur', 'professional', 'team', 'company',
        'marketer', 'designer', 'analyst', 'executive', 'owner'
      ];
      
      let targetAudience = '';
      const fullText = (title + ' ' + headline + ' ' + bodyText).toLowerCase();
      
      audienceKeywords.forEach(keyword => {
        if (fullText.includes(keyword) && !targetAudience) {
          targetAudience = keyword;
        }
      });
      
      // Extract meta description
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || 
                             document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
      
      // Extract pricing information with better detection
      const priceSelectors = [
        '[class*="price"]', '[class*="cost"]', '[class*="dollar"]',
        '[data-price]', '.pricing', '.amount', '.fee'
      ];
      
      const pricing = [];
      priceSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.match(/[\$€£¥₹]/)) {
            pricing.push(text);
          }
        });
      });
      
      // Also search for price patterns in text
      const pricePattern = /[\$€£¥₹]\s*\d+(?:[.,]\d{2})?(?:\s*\/\s*\w+)?/g;
      const priceMatches = bodyText.match(pricePattern) || [];
      pricing.push(...priceMatches);
      
      // Extract social proof elements
      const socialProofSelectors = [
        '[class*="testimonial"]', '[class*="review"]', '[class*="rating"]',
        '[class*="customer"]', '[class*="client"]', '.quote', '.feedback',
        '[data-testid*="testimonial"]', '[data-testid*="review"]'
      ];
      
      const socialProof = [];
      socialProofSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 20 && text.length < 500) {
            socialProof.push(text);
          }
        });
      });
      
      // Extract trust indicators
      const trustIndicators = [];
      const trustSelectors = [
        '[class*="trust"]', '[class*="secure"]', '[class*="guarantee"]',
        '[class*="certified"]', '[class*="verified"]', '.badge', '.seal'
      ];
      
      trustSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const text = el.textContent?.trim();
          const alt = el.querySelector('img')?.alt;
          const trustText = text || alt;
          if (trustText && trustText.length < 100) {
            trustIndicators.push(trustText);
          }
        });
      });
      
      return {
        url: window.location.href,
        title,
        headline,
        subheadline,
        cta: [...new Set(ctas)].slice(0, 15), // Remove duplicates, limit to 15
        offers: [...new Set(offers)].slice(0, 15),
        images: images.slice(0, 20),
        bodyText,
        targetAudience,
        urgencyCues: [...new Set(urgencyCues)].slice(0, 15),
        metaDescription,
        pricing: [...new Set(pricing)].slice(0, 10),
        wordCount: bodyText.split(' ').length,
        hasVideo: document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="wistia"]').length > 0,
        hasForm: document.querySelectorAll('form, input[type="email"], input[type="text"]').length > 0,
        socialProof: [...new Set(socialProof)].slice(0, 8),
        trustIndicators: [...new Set(trustIndicators)].slice(0, 5),
        pageLoadTime: Date.now() - window.performance.timing.navigationStart,
        hasChat: document.querySelectorAll('[class*="chat"], [class*="messenger"], [id*="intercom"]').length > 0
      };
    });
    
    console.log(`Successfully scraped ${url} with Playwright`);
    return scrapedData;
    
  } catch (error) {
    console.error(`Error scraping ${url} with Playwright:`, error);
    throw new Error(`Failed to scrape ${url}: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}