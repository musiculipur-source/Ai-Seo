import * as cheerio from 'cheerio';
import axios from 'axios';
import { Logger } from '../utils/logger';
import { Validator } from '../utils/validator';

export interface LinkItem {
  href: string;
  text: string;
  isExternal: boolean;
  status?: number | string;
  isBroken?: boolean;
}

export interface ImageItem {
  src: string;
  alt: string;
  missingAlt: boolean;
}

export interface SEOAnalysisResult {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  hasCanonical: boolean;
  favicon: string;
  language: string;
  wordCount: number;
  pageSizeKb: number;
  viewport: string;
  isMobileFriendly: boolean;
  
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  
  images: ImageItem[];
  totalImages: number;
  missingAltCount: number;
  
  links: LinkItem[];
  totalLinks: number;
  internalCount: number;
  externalCount: number;
  brokenLinks: LinkItem[];
  
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
  schemas: any[];
}

export class SEOService {
  /**
   * Parses HTML content and extracts comprehensive SEO diagnostics.
   */
  static async analyze(html: string, baseUrl: string, pageSizeKb: number): Promise<SEOAnalysisResult> {
    Logger.info(`Parsing HTML elements for URL: ${baseUrl}`);
    const $ = cheerio.load(html);
    const domain = Validator.getDomain(baseUrl);

    // 1. Basic Metadata
    const title = $('title').first().text().trim() || '';
    const description = $('meta[name="description"]').first().attr('content')?.trim() || 
                        $('meta[name="Description"]').first().attr('content')?.trim() || '';
    const canonical = $('link[rel="canonical"]').first().attr('href')?.trim() || '';
    const favicon = $('link[rel*="icon"]').first().attr('href')?.trim() || '';
    const language = $('html').first().attr('lang')?.trim() || '';

    // 2. Viewport & Mobile Friendly Check
    const viewport = $('meta[name="viewport"]').first().attr('content')?.trim() || '';
    const isMobileFriendly = viewport.toLowerCase().includes('width=device-width') || viewport.length > 0;

    // 3. Headings structure
    const headings = {
      h1: [] as string[],
      h2: [] as string[],
      h3: [] as string[],
      h4: [] as string[],
      h5: [] as string[],
      h6: [] as string[]
    };

    $('h1').each((_, el) => { const txt = $(el).text().trim(); if (txt) headings.h1.push(txt); });
    $('h2').each((_, el) => { const txt = $(el).text().trim(); if (txt) headings.h2.push(txt); });
    $('h3').each((_, el) => { const txt = $(el).text().trim(); if (txt) headings.h3.push(txt); });
    $('h4').each((_, el) => { const txt = $(el).text().trim(); if (txt) headings.h4.push(txt); });
    $('h5').each((_, el) => { const txt = $(el).text().trim(); if (txt) headings.h5.push(txt); });
    $('h6').each((_, el) => { const txt = $(el).text().trim(); if (txt) headings.h6.push(txt); });

    // 4. Images diagnostics
    const images: ImageItem[] = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src') || '';
      const alt = $(el).attr('alt')?.trim() || '';
      const missingAlt = !$(el).attr('alt') || alt === '';
      if (src) {
        images.push({ src, alt, missingAlt });
      }
    });
    const totalImages = images.length;
    const missingAltCount = images.filter(img => img.missingAlt).length;

    // 5. Links analysis
    const links: LinkItem[] = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href')?.trim() || '';
      const text = $(el).text().trim().substring(0, 80) || '';
      
      if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        let isExternal = false;
        let absoluteHref = href;

        try {
          if (href.startsWith('/') || href.startsWith('.')) {
            const urlObj = new URL(href, baseUrl);
            absoluteHref = urlObj.toString();
            isExternal = false;
          } else {
            const urlObj = new URL(href);
            isExternal = urlObj.hostname !== domain;
            absoluteHref = urlObj.toString();
          }
        } catch {
          // If parsing fails, use fallback checks
          isExternal = href.startsWith('http') && !href.includes(domain);
        }

        links.push({
          href: absoluteHref,
          text,
          isExternal
        });
      }
    });

    // De-duplicate links to avoid spamming target sites
    const uniqueLinksMap = new Map<string, LinkItem>();
    links.forEach(l => {
      if (!uniqueLinksMap.has(l.href)) {
        uniqueLinksMap.set(l.href, l);
      }
    });
    const uniqueLinks = Array.from(uniqueLinksMap.values());

    // Take up to 5 unique links (preferring external or a mix) to do a lightweight "Broken Links" check in parallel
    const linksToTest = uniqueLinks.slice(0, 5);
    Logger.info(`Executing live parallel HTTP status checks on ${linksToTest.length} unique sample links`);
    
    await Promise.allSettled(
      linksToTest.map(async (link) => {
        try {
          const checkRes = await axios.head(link.href, { timeout: 3000, validateStatus: () => true });
          link.status = checkRes.status;
          link.isBroken = checkRes.status >= 400;
        } catch {
          try {
            // Fallback to GET if HEAD method is blocked
            const checkResGet = await axios.get(link.href, { timeout: 3000, validateStatus: () => true });
            link.status = checkResGet.status;
            link.isBroken = checkResGet.status >= 400;
          } catch {
            link.status = 'Network Error';
            link.isBroken = true;
          }
        }
      })
    );

    // Apply checked details back to complete unique list
    const brokenLinks = uniqueLinks.filter(l => l.isBroken);

    // 6. Open Graph & Twitter Cards
    const openGraph: Record<string, string> = {};
    $('meta[property^="og:"]').each((_, el) => {
      const prop = $(el).attr('property') || '';
      const val = $(el).attr('content') || '';
      if (prop && val) {
        openGraph[prop] = val;
      }
    });

    const twitterCard: Record<string, string> = {};
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name') || '';
      const val = $(el).attr('content') || '';
      if (name && val) {
        twitterCard[name] = val;
      }
    });

    // 7. Schema.org structured data extraction
    const schemas: any[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const rawJson = $(el).html();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          schemas.push(parsed);
        }
      } catch {
        // Ignore invalid JSON-LD formats
      }
    });

    // 8. Content Analysis & Word Count
    // Remove scripts, styles, and other layout elements to count actual readable words
    const clone$ = cheerio.load(html);
    clone$('script, style, iframe, noscript, svg, path, link, meta, head').remove();
    const bodyText = clone$('body').text() || '';
    const words = bodyText.replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length > 0);
    const wordCount = words.length;

    return {
      title,
      titleLength: title.length,
      description,
      descriptionLength: description.length,
      canonical,
      hasCanonical: !!canonical,
      favicon,
      language,
      wordCount,
      pageSizeKb,
      viewport,
      isMobileFriendly,
      headings,
      images,
      totalImages,
      missingAltCount,
      links: uniqueLinks,
      totalLinks: uniqueLinks.length,
      internalCount: uniqueLinks.filter(l => !l.isExternal).length,
      externalCount: uniqueLinks.filter(l => l.isExternal).length,
      brokenLinks,
      openGraph,
      twitterCard,
      schemas
    };
  }
}
