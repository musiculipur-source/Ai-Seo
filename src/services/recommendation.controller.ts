import { Request, Response, NextFunction } from 'express';
import { AIRecommendationService } from './aiRecommendation.service';
import { getReportById } from '../../database/index';
import { CrawlerService } from '../../backend/src/services/crawler.service';
import { SEOService } from '../../backend/src/services/seo.service';
import { Logger } from '../../backend/src/utils/logger';

export async function getRecommendationsForReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Audit Report ID parameter is required.' });
    }

    Logger.info(`[RecommendationController] Fetching AI strategy analysis for report: ${id}`);
    const report = await getReportById(id);
    if (!report) {
      return res.status(404).json({ error: 'SEO Audit Report not found.' });
    }

    // Adapt SEOAuditReport metrics back to raw parameters for the recommendation engine
    const crawlResult = {
      loadTimeMs: report.metrics.performance.loadTimeMs,
      pageSizeKb: report.metrics.performance.pageSizeKb,
      isHttps: report.metrics.technical.isHttps,
      hasRobots: report.metrics.technical.hasRobots,
      hasSitemap: report.metrics.technical.hasSitemap,
    };

    const h1List = report.metrics.headings.list
      ? report.metrics.headings.list.filter(h => h.type === 'h1').map(h => h.text)
      : [];
    const h2List = report.metrics.headings.list
      ? report.metrics.headings.list.filter(h => h.type === 'h2').map(h => h.text)
      : [];
    const h3List = report.metrics.headings.list
      ? report.metrics.headings.list.filter(h => h.type === 'h3').map(h => h.text)
      : [];

    const seoResult = {
      title: report.metrics.title.value === 'None' ? '' : String(report.metrics.title.value),
      titleLength: report.metrics.title.length,
      description: report.metrics.description.value === 'None' ? '' : String(report.metrics.description.value),
      descriptionLength: report.metrics.description.length,
      headings: {
        h1: h1List,
        h2: h2List,
        h3: h3List,
      },
      totalImages: report.metrics.images.total,
      missingAltCount: report.metrics.images.missingAlt,
      hasCanonical: !!report.metrics.title.value, // Fallback check or assumption
      isMobileFriendly: true, // Defaulting as fallback
      brokenLinks: report.metrics.links.status === 'error' ? [{ href: '', text: 'Broken links found' }] : [],
      wordCount: report.metrics.performance.pageSizeKb > 100 ? 850 : 250, // Realistic estimated content count from page size
      openGraph: {},
      twitterCard: {},
      schemas: [{}], // Seed default schema indicator
    };

    const insights = await AIRecommendationService.analyzeAndRecommend(report.url, crawlResult, seoResult);

    Logger.info(`[RecommendationController] AI Strategy generated successfully for report: ${id}`);
    res.json(insights);
  } catch (error) {
    Logger.error('[RecommendationController] Error generating recommendations from report', error);
    next(error);
  }
}

export async function generateNewRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Please provide a valid website URL.' });
    }

    const cleanUrl = url.trim();
    Logger.info(`[RecommendationController] Running real-time crawler + AI Recommendations for: ${cleanUrl}`);

    // 1. Crawler download HTML
    const crawlResult = await CrawlerService.crawl(cleanUrl);

    // 2. SEO parser extraction
    const seoResult = await SEOService.analyze(crawlResult.html, cleanUrl, crawlResult.pageSizeKb);

    // 3. AI recommendation analysis
    const insights = await AIRecommendationService.analyzeAndRecommend(
      cleanUrl,
      {
        loadTimeMs: crawlResult.loadTimeMs,
        pageSizeKb: crawlResult.pageSizeKb,
        isHttps: crawlResult.isHttps,
        hasRobots: crawlResult.hasRobots,
        hasSitemap: crawlResult.hasSitemap,
      },
      {
        title: seoResult.title,
        titleLength: seoResult.titleLength,
        description: seoResult.description,
        descriptionLength: seoResult.descriptionLength,
        headings: {
          h1: seoResult.headings.h1,
          h2: seoResult.headings.h2,
          h3: seoResult.headings.h3,
        },
        totalImages: seoResult.totalImages,
        missingAltCount: seoResult.missingAltCount,
        hasCanonical: seoResult.hasCanonical,
        isMobileFriendly: seoResult.isMobileFriendly,
        brokenLinks: seoResult.brokenLinks.map(bl => ({ href: bl.href, text: bl.text })),
        wordCount: seoResult.wordCount,
        openGraph: seoResult.openGraph,
        twitterCard: seoResult.twitterCard,
        schemas: seoResult.schemas,
      }
    );

    Logger.info(`[RecommendationController] Real-time AI analysis complete. Target: ${cleanUrl}`);
    res.status(200).json(insights);
  } catch (error) {
    Logger.error('[RecommendationController] Error in real-time AI recommendations', error);
    next(error);
  }
}
