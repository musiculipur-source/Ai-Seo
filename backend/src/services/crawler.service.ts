import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '../utils/logger';
import { Validator } from '../utils/validator';

export interface CrawlResult {
  html: string;
  loadTimeMs: number;
  pageSizeKb: number;
  isHttps: boolean;
  status: number;
  redirects: string[];
  robotsText: string;
  hasRobots: boolean;
  sitemapXml: string;
  hasSitemap: boolean;
  contentType: string;
}

export class CrawlerService {
  private static DEFAULT_TIMEOUT = 10000; // 10 seconds
  private static MAX_RETRIES = 2;

  /**
   * Fetches a target URL with robust timeout, retries, redirect handling, and page statistics.
   */
  static async crawl(targetUrl: string): Promise<CrawlResult> {
    const normalizedUrl = Validator.sanitizeAndNormalizeUrl(targetUrl);
    Logger.info(`Starting crawl for target: ${normalizedUrl}`);

    const startTime = Date.now();
    let response: AxiosResponse | null = null;
    let attempts = 0;
    let errorToThrow: any = null;
    const redirects: string[] = [];

    // Custom request config with retry loop
    while (attempts <= this.MAX_RETRIES) {
      try {
        attempts++;
        const config: AxiosRequestConfig = {
          timeout: this.DEFAULT_TIMEOUT,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SEO-Audit-AI-Pro-Engine/2.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
          // Keep track of redirect path
          beforeRedirect: (options: any) => {
            if (options.href) {
              redirects.push(options.href);
              Logger.info(`Following redirect to: ${options.href}`);
            }
          }
        };

        response = await axios.get(normalizedUrl, config);
        break; // Success, exit retry loop
      } catch (error: any) {
        errorToThrow = error;
        Logger.warn(`Crawl attempt ${attempts} failed for ${normalizedUrl}: ${error.message}`);
        
        // Don't retry if it's a 4xx client error
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          break;
        }

        // Delay before retry
        if (attempts <= this.MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
      }
    }

    if (!response) {
      Logger.error(`Crawl completely failed for ${normalizedUrl} after ${attempts} attempts`);
      throw new Error(`Failed to crawl URL: ${errorToThrow?.message || 'Unknown network error'}`);
    }

    const loadTimeMs = Date.now() - startTime;
    const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const pageSizeKb = Math.round((Buffer.byteLength(html, 'utf-8') / 1024) * 10) / 10;
    const isHttps = response.request?.res?.responseUrl?.startsWith('https://') || normalizedUrl.startsWith('https://');
    const contentType = String(response.headers['content-type'] || '');

    // Parallel scanning for robots.txt and sitemap.xml
    const parsedDomain = Validator.getDomain(normalizedUrl);
    const protocol = isHttps ? 'https://' : 'http://';
    const robotsUrl = `${protocol}${parsedDomain}/robots.txt`;
    const sitemapUrl = `${protocol}${parsedDomain}/sitemap.xml`;

    Logger.info(`Fetching secondary assets in parallel for ${parsedDomain}`);
    const [robotsRes, sitemapRes] = await Promise.allSettled([
      axios.get(robotsUrl, { timeout: 3000 }).catch(() => null),
      axios.get(sitemapUrl, { timeout: 3000 }).catch(() => null)
    ]);

    const robotsText = robotsRes.status === 'fulfilled' && robotsRes.value && typeof robotsRes.value.data === 'string'
      ? robotsRes.value.data
      : '';
    const hasRobots = robotsRes.status === 'fulfilled' && !!robotsRes.value && robotsRes.value.status === 200;

    let sitemapXml = sitemapRes.status === 'fulfilled' && sitemapRes.value && typeof sitemapRes.value.data === 'string'
      ? sitemapRes.value.data
      : '';
    let hasSitemap = sitemapRes.status === 'fulfilled' && !!sitemapRes.value && sitemapRes.value.status === 200;

    // Fallback: search within robotsText for Sitemap declarations
    if (!hasSitemap && robotsText) {
      const sitemapMatch = robotsText.match(/Sitemap:\s*(https?:\/\/[^\s]+)/i);
      if (sitemapMatch) {
        hasSitemap = true;
        sitemapXml = `Discovered sitemap URL in robots.txt: ${sitemapMatch[1]}`;
      }
    }

    return {
      html,
      loadTimeMs,
      pageSizeKb,
      isHttps,
      status: response.status,
      redirects,
      robotsText,
      hasRobots,
      sitemapXml,
      hasSitemap,
      contentType
    };
  }
}
