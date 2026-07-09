import { Request, Response, NextFunction } from 'express';
import { CrawlerService } from '../services/crawler.service';
import { SEOService } from '../services/seo.service';
import { ReportService } from '../services/report.service';
import { generateAIRecommendations } from '../services/geminiService';
import { saveReport, getReportById, getHistory, deleteReportFromDb } from '../../../database/index';
import { Logger } from '../utils/logger';

/**
 * Controller for the React Frontend App (Plural endpoint /api/audits)
 */
export async function createAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const { url } = req.body;
    
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Please provide a valid website URL.' });
    }

    const cleanUrl = url.trim();

    // 24-hour rate limit check for Basic Plan users
    const userEmail = req.headers['x-user-email'] as string;
    if (userEmail) {
      const { getUserByEmail, saveUser } = await import('../../../database/index');
      const userRec = await getUserByEmail(userEmail);
      if (userRec) {
        if (userRec.plan === 'basic') {
          const now = Date.now();
          if (userRec.lastAuditTimestamp) {
            const lastAudit = new Date(userRec.lastAuditTimestamp).getTime();
            const hoursPassed = (now - lastAudit) / (1000 * 60 * 60);
            if (hoursPassed < 24) {
              const remainingHours = Math.ceil(24 - hoursPassed);
              return res.status(403).json({ 
                error: `Basic Plan Limit: You can only run 1 SEO Audit per 24 hours. Please wait ${remainingHours} hours or upgrade your plan to unlock unlimited crawls!`,
                limitReached: true,
                remainingHours
              });
            }
          }
          // Mark audit run
          userRec.lastAuditTimestamp = new Date().toISOString();
          userRec.credits = Math.max(0, userRec.credits - 1);
          await saveUser(userRec);
        } else {
          // Deduct credits for paid plans if they are limited, or keep unlimited
          const { saveUser: saveUserDb } = await import('../../../database/index');
          userRec.credits = Math.max(0, userRec.credits - 1);
          await saveUserDb(userRec);
        }
      }
    }

    Logger.info(`[AuditController] Launching full dashboard audit for URL: ${cleanUrl}`);

    // 1. Fetch page using Axios crawler with timeout and retries
    const crawlResult = await CrawlerService.crawl(cleanUrl);

    // 2. Parse elements using Cheerio SEO parser
    const seoResult = await SEOService.analyze(crawlResult.html, cleanUrl, crawlResult.pageSizeKb);

    // 3. Compile report matching full dashboards contracts
    const report = ReportService.compileDashboardReport(cleanUrl, crawlResult, seoResult);

    // 4. Query Gemini to produce high-value tactical action plan
    try {
      Logger.info(`[AuditController] Requesting Gemini AI recommendations for: ${cleanUrl}`);
      const aiRecommendations = await generateAIRecommendations(report);
      report.aiRecommendations = aiRecommendations;
    } catch (aiErr: any) {
      Logger.warn(`[AuditController] Optional Gemini AI analysis skipped or failed: ${aiErr.message}`);
      report.aiRecommendations = '### AI Tactical Action Plan\n\n*(Service momentarily unavailable. Standard local rules applied successfully)*';
    }

    // 5. Save report to server-side directory for history access
    await saveReport(report);

    Logger.info(`[AuditController] Dashboard audit completed successfully. ID: ${report.id} | Score: ${report.overallScore}`);
    res.status(201).json(report);
  } catch (error) {
    Logger.error('[AuditController] Error creating dashboard audit', error);
    next(error);
  }
}

/**
 * Controller for Part 2 API requirements (Singular endpoint /api/audit)
 */
export async function createPart2Audit(req: Request, res: Response, next: NextFunction) {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Please provide a valid website URL.' });
    }

    const cleanUrl = url.trim();
    Logger.info(`[AuditController] Launching flat audit for URL: ${cleanUrl}`);

    // 1. Download HTML payload
    const crawlResult = await CrawlerService.crawl(cleanUrl);

    // 2. Perform element parsing and validation
    const seoResult = await SEOService.analyze(crawlResult.html, cleanUrl, crawlResult.pageSizeKb);

    // 3. Compile Part 2 specific JSON structure
    const part2Response = ReportService.compilePart2Response(cleanUrl, crawlResult, seoResult);

    Logger.info(`[AuditController] Part 2 audit completed. Score: ${part2Response.seoScore}`);
    res.status(200).json(part2Response);
  } catch (error) {
    Logger.error('[AuditController] Error creating flat audit', error);
    next(error);
  }
}

export async function getAuditHistory(req: Request, res: Response, next: NextFunction) {
  try {
    Logger.info('[AuditController] Fetching historical audit list');
    const history = await getHistory();
    res.json(history);
  } catch (error) {
    Logger.error('[AuditController] Error loading history', error);
    next(error);
  }
}

export async function getAuditReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Audit ID parameter is required.' });
    }

    Logger.info(`[AuditController] Retrieving full report details for ID: ${id}`);
    const report = await getReportById(id);
    if (!report) {
      return res.status(404).json({ error: 'SEO Audit Report not found.' });
    }

    res.json(report);
  } catch (error) {
    Logger.error('[AuditController] Error retrieving report', error);
    next(error);
  }
}

export async function deleteAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Audit ID parameter is required.' });
    }

    Logger.info(`[AuditController] Deleting report: ${id}`);
    await deleteReportFromDb(id);
    res.json({ message: 'SEO Audit Report deleted successfully.' });
  } catch (error) {
    Logger.error('[AuditController] Error deleting report', error);
    next(error);
  }
}
