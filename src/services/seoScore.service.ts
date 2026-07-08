import { DetailedScores } from '../types/recommendation.types';

export interface ScoreInputData {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  h1Count: number;
  totalImages: number;
  missingAltCount: number;
  hasSchema: boolean;
  isHttps: boolean;
  hasRobots: boolean;
  hasSitemap: boolean;
  hasCanonical: boolean;
  loadTimeMs: number;
  pageSizeKb: number;
  brokenLinksCount: number;
  wordCount: number;
  isMobileFriendly: boolean;
}

export class SEOScoreService {
  /**
   * Calculates detailed scores based on the weighted scoring system:
   * Total Possible Points: 105 (normalized to 100 for overall score)
   * 
   * Weights:
   * - Performance (15)
   * - Title (10)
   * - Meta (10)
   * - H1 (10)
   * - Accessibility (10)
   * - Schema (10)
   * - Images (10)
   * - Security (10)
   * - Internal Links (10)
   * - Content (5)
   * - Robots (5)
   * - Sitemap (5)
   * - Canonical (5)
   */
  static calculateScores(data: ScoreInputData): DetailedScores {
    // 1. Performance Points (Max 15)
    let performancePoints = 15;
    if (data.loadTimeMs > 2500) {
      performancePoints -= 10;
    } else if (data.loadTimeMs > 1500) {
      performancePoints -= 6;
    } else if (data.loadTimeMs > 800) {
      performancePoints -= 3;
    }
    if (data.pageSizeKb > 1500) {
      performancePoints -= 3;
    } else if (data.pageSizeKb > 800) {
      performancePoints -= 1.5;
    }
    performancePoints = Math.max(0, performancePoints);

    // 2. Title Points (Max 10)
    let titlePoints = 10;
    if (!data.title) {
      titlePoints = 0;
    } else if (data.titleLength < 30 || data.titleLength > 60) {
      titlePoints = 5;
    }

    // 3. Meta Points (Max 10)
    let metaPoints = 10;
    if (!data.description) {
      metaPoints = 0;
    } else if (data.descriptionLength < 100 || data.descriptionLength > 160) {
      metaPoints = 5;
    }

    // 4. H1 Points (Max 10)
    let h1Points = 10;
    if (data.h1Count === 0) {
      h1Points = 0;
    } else if (data.h1Count > 1) {
      h1Points = 5;
    }

    // 5. Accessibility Points (Max 10)
    let accessibilityPoints = 10;
    if (data.totalImages > 0) {
      const missingRatio = data.missingAltCount / data.totalImages;
      accessibilityPoints = Math.round((1 - missingRatio) * 10);
    }
    if (!data.isMobileFriendly) {
      accessibilityPoints = Math.max(0, accessibilityPoints - 3);
    }

    // 6. Schema Points (Max 10)
    const schemaPoints = data.hasSchema ? 10 : 0;

    // 7. Images Points (Max 10)
    let imagesPoints = 10;
    if (data.totalImages > 0) {
      const missingRatio = data.missingAltCount / data.totalImages;
      imagesPoints = Math.round((1 - missingRatio) * 10);
    }

    // 8. Security Points (Max 10)
    const securityPoints = data.isHttps ? 10 : 0;

    // 9. Internal Links Points (Max 10)
    let internalLinksPoints = 10;
    if (data.brokenLinksCount > 0) {
      internalLinksPoints = Math.max(0, 10 - data.brokenLinksCount * 2);
    }

    // 10. Content Points (Max 5)
    let contentPoints = 5;
    if (data.wordCount < 200) {
      contentPoints = 1;
    } else if (data.wordCount < 500) {
      contentPoints = 3;
    }

    // 11. Robots Points (Max 5)
    const robotsPoints = data.hasRobots ? 5 : 0;

    // 12. Sitemap Points (Max 5)
    const sitemapPoints = data.hasSitemap ? 5 : 0;

    // 13. Canonical Points (Max 5)
    const canonicalPoints = data.hasCanonical ? 5 : 0;

    // Calculate individual category scores (normalized to 0-100)
    const technicalScore = Math.round(
      ((securityPoints + robotsPoints + sitemapPoints + canonicalPoints + schemaPoints) / 35) * 100
    );

    const onPageScore = Math.round(
      ((titlePoints + metaPoints + h1Points) / 30) * 100
    );

    const contentScore = Math.round(
      (contentPoints / 5) * 100
    );

    const accessibilityScore = Math.round(
      (accessibilityPoints / 10) * 100
    );

    const performanceScore = Math.round(
      (performancePoints / 15) * 100
    );

    const securityScore = data.isHttps ? 100 : 0;

    // Overall Score (Sum of all points, max 105, normalized to 100)
    const totalAchievedPoints =
      performancePoints +
      titlePoints +
      metaPoints +
      h1Points +
      accessibilityPoints +
      schemaPoints +
      imagesPoints +
      securityPoints +
      internalLinksPoints +
      contentPoints +
      robotsPoints +
      sitemapPoints +
      canonicalPoints;

    const overallScore = Math.round((totalAchievedPoints / 105) * 100);

    return {
      overall: Math.min(100, Math.max(0, overallScore)),
      technical: Math.min(100, Math.max(0, technicalScore)),
      onPage: Math.min(100, Math.max(0, onPageScore)),
      content: Math.min(100, Math.max(0, contentScore)),
      accessibility: Math.min(100, Math.max(0, accessibilityScore)),
      performance: Math.min(100, Math.max(0, performanceScore)),
      security: Math.min(100, Math.max(0, securityScore))
    };
  }
}
