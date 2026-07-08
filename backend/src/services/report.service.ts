import { CrawlResult } from './crawler.service';
import { SEOAnalysisResult } from './seo.service';
import { SEOAuditReport, AuditStatus, SEOMetric } from '../../../shared/types';

export interface Part2AuditResponse {
  seoScore: number;
  title: string;
  description: string;
  h1: string[];
  h2: string[];
  images: string[];
  internalLinks: string[];
  externalLinks: string[];
  robots: boolean;
  sitemap: boolean;
  https: boolean;
  mobileFriendly: boolean;
  recommendations: string[];
}

export class ReportService {
  /**
   * Translates raw crawler results and parsed elements into detailed metrics and scores.
   */
  static compileDashboardReport(
    url: string,
    crawl: CrawlResult,
    seo: SEOAnalysisResult
  ): SEOAuditReport {
    // 1. Calculate section scores (On-page, Technical, Performance)
    let onPageScore = 100;
    
    // Title checks
    if (!seo.title) {
      onPageScore -= 25;
    } else if (seo.titleLength < 30 || seo.titleLength > 60) {
      onPageScore -= 10;
    }

    // Description checks
    if (!seo.description) {
      onPageScore -= 20;
    } else if (seo.descriptionLength < 100 || seo.descriptionLength > 160) {
      onPageScore -= 8;
    }

    // Heading hierarchy checks
    const h1Count = seo.headings.h1.length;
    if (h1Count === 0) {
      onPageScore -= 20;
    } else if (h1Count > 1) {
      onPageScore -= 10;
    }

    // Image alt attributes check
    if (seo.totalImages > 0 && seo.missingAltCount > 0) {
      const missingPct = seo.missingAltCount / seo.totalImages;
      onPageScore -= Math.round(missingPct * 15);
    }

    onPageScore = Math.max(10, onPageScore);

    // Technical score
    let technicalScore = 100;
    if (!crawl.isHttps) {
      technicalScore -= 35;
    }
    if (!crawl.hasRobots) {
      technicalScore -= 15;
    }
    if (!crawl.hasSitemap) {
      technicalScore -= 15;
    }
    if (seo.brokenLinks.length > 0) {
      technicalScore -= Math.min(25, seo.brokenLinks.length * 10);
    }
    technicalScore = Math.max(10, technicalScore);

    // Performance score
    let performanceScore = 100;
    if (crawl.loadTimeMs > 2000) {
      performanceScore -= 40;
    } else if (crawl.loadTimeMs > 800) {
      performanceScore -= 20;
    } else if (crawl.loadTimeMs > 300) {
      performanceScore -= 5;
    }

    if (crawl.pageSizeKb > 1000) {
      performanceScore -= 25;
    } else if (crawl.pageSizeKb > 400) {
      performanceScore -= 10;
    }
    performanceScore = Math.max(10, performanceScore);

    const overallScore = Math.round((onPageScore + technicalScore + performanceScore) / 3);

    // 2. Generate standard SEOMetric objects for the React dashboard
    const titleMetric: SEOMetric & { length: number } = {
      value: seo.title || 'None',
      length: seo.titleLength,
      status: !seo.title ? 'error' : (seo.titleLength < 30 || seo.titleLength > 60 ? 'warning' : 'pass'),
      message: !seo.title 
        ? 'Meta title tag is missing completely.' 
        : (seo.titleLength < 30 
          ? `Title is too short (${seo.titleLength} chars). Prefer 50-60 chars.` 
          : (seo.titleLength > 60 
            ? `Title is too long (${seo.titleLength} chars) and will get clipped by search engines.` 
            : 'Meta title is perfectly optimized.')),
      recommendation: !seo.title 
        ? 'Add a <title> tag in the HTML head describing the main topic of your page.' 
        : (seo.titleLength < 30 || seo.titleLength > 60 ? 'Refine the title to be between 50 and 60 characters long.' : undefined)
    };

    const descMetric: SEOMetric & { length: number } = {
      value: seo.description || 'None',
      length: seo.descriptionLength,
      status: !seo.description ? 'error' : (seo.descriptionLength < 100 || seo.descriptionLength > 160 ? 'warning' : 'pass'),
      message: !seo.description 
        ? 'Meta description is missing completely.' 
        : (seo.descriptionLength < 100 
          ? `Meta description is very brief (${seo.descriptionLength} chars).` 
          : (seo.descriptionLength > 160 
            ? `Meta description exceeds limits (${seo.descriptionLength} chars).` 
            : 'Meta description length is excellent.')),
      recommendation: !seo.description 
        ? 'Create a descriptive meta description summary of 120-150 characters to increase user search click-throughs.' 
        : (seo.descriptionLength < 100 || seo.descriptionLength > 160 ? 'Adjust description length to sit between 110 and 150 characters.' : undefined)
    };

    // Prepare clean list of all headings
    const headingsList: { type: string; text: string }[] = [];
    seo.headings.h1.forEach(text => headingsList.push({ type: 'h1', text }));
    seo.headings.h2.forEach(text => headingsList.push({ type: 'h2', text }));
    seo.headings.h3.forEach(text => headingsList.push({ type: 'h3', text }));

    const headingsMetric: SEOMetric & { h1Count: number; list: { type: string; text: string }[] } = {
      value: h1Count === 1 ? 'Healthy H1 Structure' : `${h1Count} H1 tags detected`,
      h1Count,
      list: headingsList,
      status: h1Count === 1 ? 'pass' : (h1Count === 0 ? 'error' : 'warning'),
      message: h1Count === 0 
        ? 'Page has no H1 header. Google needs an H1 to verify content context.' 
        : (h1Count > 1 
          ? `Found multiple (${h1Count}) H1 elements. Only one primary H1 should represent a page.` 
          : 'Exactly one H1 title tag is present.'),
      recommendation: h1Count === 0 
        ? 'Add a single, descriptive H1 heading at the top of your layout.' 
        : (h1Count > 1 ? 'Consolidate headings so there is only one top-level H1, converting others to H2 tags.' : undefined)
    };

    const imagesMetric: SEOMetric & { total: number; missingAlt: number } = {
      value: seo.totalImages === 0 ? 'No Images found' : `${seo.totalImages - seo.missingAltCount} of ${seo.totalImages} with alt tags`,
      total: seo.totalImages,
      missingAlt: seo.missingAltCount,
      status: seo.totalImages === 0 ? 'warning' : (seo.missingAltCount > 0 ? 'warning' : 'pass'),
      message: seo.totalImages === 0 
        ? 'No image elements detected on the page.' 
        : (seo.missingAltCount > 0 
          ? `${seo.missingAltCount} images are missing descriptive 'alt' attribute strings.` 
          : 'All images on the page have alt text attributes.'),
      recommendation: seo.missingAltCount > 0 
        ? 'Inject descriptive, keyword-rich and accessible "alt" tags to image elements for visually impaired visitors and image SEO.' 
        : undefined
    };

    const linksMetric: SEOMetric & { total: number; internal: number; external: number } = {
      value: `${seo.totalLinks} links`,
      total: seo.totalLinks,
      internal: seo.internalCount,
      external: seo.externalCount,
      status: seo.brokenLinks.length > 0 ? 'error' : (seo.totalLinks === 0 ? 'warning' : 'pass'),
      message: seo.brokenLinks.length > 0 
        ? `Found ${seo.brokenLinks.length} broken links during verification.` 
        : (seo.totalLinks === 0 ? 'No internal or external links found.' : 'Outbound links are fully functional.'),
      recommendation: seo.brokenLinks.length > 0 
        ? 'Review and replace broken target links on your page to avoid UX friction and crawl budget loss.' 
        : undefined
    };

    const techMetric: SEOMetric & { hasSitemap: boolean; hasRobots: boolean; isHttps: boolean } = {
      value: crawl.isHttps ? 'Secure HTTPS' : 'Insecure Connection',
      hasSitemap: crawl.hasSitemap,
      hasRobots: crawl.hasRobots,
      isHttps: crawl.isHttps,
      status: (!crawl.isHttps || seo.brokenLinks.length > 2) ? 'error' : ((!crawl.hasRobots || !crawl.hasSitemap) ? 'warning' : 'pass'),
      message: !crawl.isHttps 
        ? 'The connection to this server does not use SSL encryption.' 
        : `HTTPS secure. Robots.txt: ${crawl.hasRobots ? 'Found' : 'Missing'}. Sitemap: ${crawl.hasSitemap ? 'Found' : 'Missing'}.`,
      recommendation: !crawl.isHttps 
        ? 'Install and enforce Let’s Encrypt or other SSL certificates across your server.' 
        : ((!crawl.hasRobots || !crawl.hasSitemap) ? 'Create and host robots.txt and sitemap.xml files in your public web root.' : undefined)
    };

    const perfMetric: SEOMetric & { loadTimeMs: number; pageSizeKb: number } = {
      value: `${crawl.loadTimeMs}ms load`,
      loadTimeMs: crawl.loadTimeMs,
      pageSizeKb: crawl.pageSizeKb,
      status: crawl.loadTimeMs > 1500 ? 'error' : (crawl.loadTimeMs > 600 || crawl.pageSizeKb > 500 ? 'warning' : 'pass'),
      message: `Crawl response loaded in ${crawl.loadTimeMs}ms. Page download weight: ${crawl.pageSizeKb}KB.`,
      recommendation: crawl.loadTimeMs > 600 
        ? 'Enable GZIP compression, leverage caching, defer unused JavaScript assets, and optimize large imagery.' 
        : undefined
    };

    const id = Math.random().toString(36).substring(2, 11);

    return {
      id,
      url,
      timestamp: new Date().toISOString(),
      overallScore,
      scores: {
        onPage: onPageScore,
        technical: technicalScore,
        performance: performanceScore,
      },
      metrics: {
        title: titleMetric,
        description: descMetric,
        headings: headingsMetric,
        images: imagesMetric,
        links: linksMetric,
        technical: techMetric,
        performance: perfMetric
      }
    };
  }

  /**
   * Compiles the flat response requested by Part 2 of the prompt.
   */
  static compilePart2Response(
    url: string,
    crawl: CrawlResult,
    seo: SEOAnalysisResult
  ): Part2AuditResponse {
    // Compile recommendations
    const recommendations: string[] = [];

    if (!seo.title) {
      recommendations.push('Critical: Add a descriptive meta <title> tag (50-60 characters).');
    } else if (seo.titleLength < 30) {
      recommendations.push(`Warning: Page title "${seo.title}" is too short (${seo.titleLength} characters). Expand to improve click-through rates.`);
    } else if (seo.titleLength > 60) {
      recommendations.push(`Warning: Page title is too long (${seo.titleLength} characters) and may get cut off on search engines.`);
    }

    if (!seo.description) {
      recommendations.push('Critical: Add a meta description between 110 and 150 characters to summarize your content.');
    } else if (seo.descriptionLength < 100) {
      recommendations.push(`Warning: Meta description is too short (${seo.descriptionLength} characters). Add more detail.`);
    } else if (seo.descriptionLength > 160) {
      recommendations.push(`Warning: Meta description is too long (${seo.descriptionLength} characters) and will truncate in search results.`);
    }

    const h1Count = seo.headings.h1.length;
    if (h1Count === 0) {
      recommendations.push('Critical: Missing main H1 tag. Ensure there is exactly one H1 tag defining the page topic.');
    } else if (h1Count > 1) {
      recommendations.push(`Warning: Multiple H1 tags found (${h1Count}). Consolidate into a single H1 and turn secondary ones to H2.`);
    }

    if (seo.missingAltCount > 0) {
      recommendations.push(`Warning: ${seo.missingAltCount} image elements lack 'alt' alt-attribute strings. Add descriptive tags.`);
    }

    if (seo.brokenLinks.length > 0) {
      recommendations.push(`Critical: Found ${seo.brokenLinks.length} broken links. Repair links targeting: ${seo.brokenLinks.map(l => l.href).join(', ')}.`);
    }

    if (!crawl.isHttps) {
      recommendations.push('Critical: Site does not use HTTPS encryption. Security is a critical ranking signal.');
    }

    if (!crawl.hasRobots) {
      recommendations.push('Warning: robots.txt file was not found. Crawlers need this to safely navigate directories.');
    }

    if (!crawl.hasSitemap) {
      recommendations.push('Warning: sitemap.xml file was not found. Sitemaps are required for quick indexing of new pages.');
    }

    if (!seo.isMobileFriendly) {
      recommendations.push('Warning: No responsive viewport meta tag detected. Add a viewport meta tag to optimize mobile readability.');
    }

    if (seo.wordCount < 200) {
      recommendations.push(`Warning: Very low word count (${seo.wordCount} words). Thin content may face ranking difficulties. Expand body copy.`);
    }

    // Combine score components to match requested `seoScore` overall score
    const report = this.compileDashboardReport(url, crawl, seo);

    return {
      seoScore: report.overallScore,
      title: seo.title,
      description: seo.description,
      h1: seo.headings.h1,
      h2: seo.headings.h2,
      images: seo.images.map(img => img.src),
      internalLinks: seo.links.filter(l => !l.isExternal).map(l => l.href),
      externalLinks: seo.links.filter(l => l.isExternal).map(l => l.href),
      robots: crawl.hasRobots,
      sitemap: crawl.hasSitemap,
      https: crawl.isHttps,
      mobileFriendly: seo.isMobileFriendly,
      recommendations
    };
  }
}
