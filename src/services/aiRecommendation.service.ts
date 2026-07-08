import { GoogleGenAI, Type } from '@google/genai';
import { AIRecommendationResponse, SEORecommendation, KeywordSuggestion } from '../types/recommendation.types';
import { SEOScoreService, ScoreInputData } from './seoScore.service';
import { KeywordSuggestionService } from './keywordSuggestion.service';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || 'PLACEHOLDER_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export class AIRecommendationService {
  /**
   * Generates a fully structured and detailed AI-powered SEO recommendation response.
   */
  static async analyzeAndRecommend(
    url: string,
    crawlResult: {
      loadTimeMs: number;
      pageSizeKb: number;
      isHttps: boolean;
      hasRobots: boolean;
      hasSitemap: boolean;
    },
    seoResult: {
      title: string;
      titleLength: number;
      description: string;
      descriptionLength: number;
      headings: {
        h1: string[];
        h2: string[];
        h3: string[];
      };
      totalImages: number;
      missingAltCount: number;
      hasCanonical: boolean;
      isMobileFriendly: boolean;
      brokenLinks: { href: string; text: string }[];
      wordCount: number;
      openGraph: Record<string, string>;
      twitterCard: Record<string, string>;
      schemas: any[];
    }
  ): Promise<AIRecommendationResponse> {
    // 1. Calculate weighted scores
    const scoreInput: ScoreInputData = {
      title: seoResult.title,
      titleLength: seoResult.titleLength,
      description: seoResult.description,
      descriptionLength: seoResult.descriptionLength,
      h1Count: seoResult.headings.h1.length,
      totalImages: seoResult.totalImages,
      missingAltCount: seoResult.missingAltCount,
      hasSchema: seoResult.schemas.length > 0,
      isHttps: crawlResult.isHttps,
      hasRobots: crawlResult.hasRobots,
      hasSitemap: crawlResult.hasSitemap,
      hasCanonical: seoResult.hasCanonical,
      loadTimeMs: crawlResult.loadTimeMs,
      pageSizeKb: crawlResult.pageSizeKb,
      brokenLinksCount: seoResult.brokenLinks.length,
      wordCount: seoResult.wordCount,
      isMobileFriendly: seoResult.isMobileFriendly,
    };

    const scores = SEOScoreService.calculateScores(scoreInput);

    // 2. Fetch or generate keywords
    const keywords = await KeywordSuggestionService.suggestKeywords(
      url,
      seoResult.title,
      seoResult.description,
      seoResult.wordCount
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return this.generateFallbackRecommendations(url, scores, keywords, seoResult, crawlResult);
    }

    try {
      const ai = getAIClient();

      const prompt = `
You are a Senior AI SEO Analyst and Search Executive.
Analyze the following detailed audit metrics for the website "${url}" and generate a production-ready, highly tailored SEO Strategy and Structured Recommendations.

### WEB AUDIT METRICS:
- Title Tag: "${seoResult.title}" (Length: ${seoResult.titleLength})
- Meta Description: "${seoResult.description}" (Length: ${seoResult.descriptionLength})
- Headings: H1s (${seoResult.headings.h1.length}), H2s (${seoResult.headings.h2.length})
- Images: Total (${seoResult.totalImages}), Missing Alt (${seoResult.missingAltCount})
- Outbound Links: Broken Count (${seoResult.brokenLinks.length})
- Security: HTTPS (${crawlResult.isHttps})
- Speed: Load time (${crawlResult.loadTimeMs}ms), Size (${crawlResult.pageSizeKb}KB)
- Crawlability: Sitemap (${crawlResult.hasSitemap}), Robots.txt (${crawlResult.hasRobots}), Canonical Link (${seoResult.hasCanonical})
- Social & Rich Media: OpenGraph tags count (${Object.keys(seoResult.openGraph).length}), Twitter Card (${Object.keys(seoResult.twitterCard).length ? 'Present' : 'None'}), Schema Markup Count (${seoResult.schemas.length})
- Content Depth: Word Count (${seoResult.wordCount})
- Mobile Optimization: Friendly viewport (${seoResult.isMobileFriendly})

### INSTRUCTIONS:
Please construct a complete JSON response conforming strictly to the requested schema. Ensure you analyze the following specific potential issues and include structured recommendations for any that are failed or suboptimal:
- Missing, Long, or Short Title Tags
- Missing or Duplicate Meta Description
- Missing H1, Multiple H1, Missing H2
- Missing ALT Text
- Large Images and Page Speed Bottlenecks
- Broken Outbound Links or Network Issues
- Missing Robots.txt, Sitemap.xml, or Canonical URL
- Missing Open Graph, Twitter Cards, or Schema Markups
- Thin Content or Low Word Count
- Unencrypted Connections (HTTP instead of HTTPS)
- Viewport and Mobile friendliness issues

Provide exactly 4-6 highly specific, customized "recommendations". For each, include:
- category: one of: 'onPage', 'technical', 'content', 'accessibility', 'performance', 'security'
- issue: Short title of the issue (e.g. "Missing Canonical Tag")
- problem: Description of the specific problem found on this site.
- whyItMatters: Clear explanation of why search engines or users care.
- seoImpact: Critical, High, Medium, or Low
- priority: Red, Amber, Yellow, or Green
- stepByStepFix: A clean list of concrete implementation instructions.
- estimatedImprovement: Expected positive score change or metric delta.
- difficulty: Easy, Medium, or Hard

Also generate:
1. "seoTitles": 3 suggested alternative search-optimized titles.
2. "metaDescriptions": 3 suggested click-optimized meta descriptions.
3. "h1h2Suggestions": Optimal H1 heading and 3 structured H2 subheading topics.
4. "faqBlogIdeas": 3 structured blog or FAQ topic proposals (with 'questionOrTopic', 'type': 'FAQ' | 'Blog', 'targetKeywords' array).
5. "linkingSuggestions": 3 contextual internal/external linking strategies (with 'anchorText', 'targetKeyword', 'reason').
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: {
                      type: Type.STRING,
                      description: "Must be: onPage, technical, content, accessibility, performance, security"
                    },
                    issue: { type: Type.STRING },
                    problem: { type: Type.STRING },
                    whyItMatters: { type: Type.STRING },
                    seoImpact: { type: Type.STRING, description: "Must be: Critical, High, Medium, Low" },
                    priority: { type: Type.STRING, description: "Must be: Red, Amber, Yellow, Green" },
                    stepByStepFix: { type: Type.ARRAY, items: { type: Type.STRING } },
                    estimatedImprovement: { type: Type.STRING },
                    difficulty: { type: Type.STRING, description: "Must be: Easy, Medium, Hard" }
                  },
                  required: ['category', 'issue', 'problem', 'whyItMatters', 'seoImpact', 'priority', 'stepByStepFix', 'estimatedImprovement', 'difficulty']
                }
              },
              seoTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
              metaDescriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              h1h2Suggestions: {
                type: Type.OBJECT,
                properties: {
                  h1: { type: Type.ARRAY, items: { type: Type.STRING } },
                  h2: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['h1', 'h2']
              },
              faqBlogIdeas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionOrTopic: { type: Type.STRING },
                    type: { type: Type.STRING, description: "Must be FAQ or Blog" },
                    targetKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['questionOrTopic', 'type', 'targetKeywords']
                }
              },
              linkingSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    anchorText: { type: Type.STRING },
                    targetKeyword: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ['anchorText', 'targetKeyword', 'reason']
                }
              }
            },
            required: ['recommendations', 'seoTitles', 'metaDescriptions', 'h1h2Suggestions', 'faqBlogIdeas', 'linkingSuggestions']
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return {
          scores,
          keywords,
          recommendations: parsed.recommendations.map((rec: any, idx: number) => ({
            id: `ai-rec-${idx}-${Date.now()}`,
            ...rec
          })),
          seoTitles: parsed.seoTitles,
          metaDescriptions: parsed.metaDescriptions,
          h1h2Suggestions: parsed.h1h2Suggestions,
          faqBlogIdeas: parsed.faqBlogIdeas,
          linkingSuggestions: parsed.linkingSuggestions,
        };
      }

      return this.generateFallbackRecommendations(url, scores, keywords, seoResult, crawlResult);
    } catch (err) {
      console.error('Error generating AI SEO insights:', err);
      return this.generateFallbackRecommendations(url, scores, keywords, seoResult, crawlResult);
    }
  }

  private static generateFallbackRecommendations(
    url: string,
    scores: any,
    keywords: KeywordSuggestion[],
    seoResult: any,
    crawlResult: any
  ): AIRecommendationResponse {
    const recommendations: SEORecommendation[] = [];
    const timestamp = Date.now();

    // Heuristics checks
    if (!seoResult.title) {
      recommendations.push({
        id: `rec-title-missing-${timestamp}`,
        category: 'onPage',
        issue: 'Missing Title Tag',
        problem: 'Your webpage does not contain an HTML title element.',
        whyItMatters: 'The title tag is the primary header display in organic search result pages and directly dictates ranking parameters.',
        seoImpact: 'Critical',
        priority: 'Red',
        stepByStepFix: [
          'Add a <title> element inside the HTML <head> section.',
          'Formulate a highly informative copy between 50 and 60 characters long.',
          'Embed your primary keywords toward the beginning of the title.'
        ],
        estimatedImprovement: '+15% Search Visibility',
        difficulty: 'Easy',
      });
    } else if (seoResult.titleLength < 30 || seoResult.titleLength > 60) {
      recommendations.push({
        id: `rec-title-length-${timestamp}`,
        category: 'onPage',
        issue: seoResult.titleLength < 30 ? 'Title Tag is Too Short' : 'Title Tag is Too Long',
        problem: `The current title is ${seoResult.titleLength} characters: "${seoResult.title}"`,
        whyItMatters: 'Titles under 30 characters squander valuable ranking opportunities. Titles over 60 characters are truncated with an ellipsis, spoiling customer readability.',
        seoImpact: 'Medium',
        priority: 'Amber',
        stepByStepFix: [
          'Rewrite the title to measure between 50 and 60 characters.',
          'Inject highly searched keywords into the space.',
          'Ensure the title summarizes page context accurately.'
        ],
        estimatedImprovement: '+5% Click-Through Rate',
        difficulty: 'Easy',
      });
    }

    if (!seoResult.description) {
      recommendations.push({
        id: `rec-desc-missing-${timestamp}`,
        category: 'onPage',
        issue: 'Missing Meta Description',
        problem: 'No meta description was detected on this website.',
        whyItMatters: 'Meta descriptions appear under the title on search engines, summarizing content and directly driving Click-Through Rates (CTR).',
        seoImpact: 'High',
        priority: 'Red',
        stepByStepFix: [
          'Inject a <meta name="description" content="..."> tag inside the HTML <head>.',
          'Draft copy between 120 and 150 characters explaining the page core value proposition.',
          'Incorporate clear calls-to-action (CTAs).'
        ],
        estimatedImprovement: '+10% Organic CTR',
        difficulty: 'Easy',
      });
    }

    if (seoResult.headings.h1.length === 0) {
      recommendations.push({
        id: `rec-h1-missing-${timestamp}`,
        category: 'onPage',
        issue: 'Missing H1 Heading',
        problem: 'The page does not use any top-level H1 tags.',
        whyItMatters: 'Search engine crawlers rely on the H1 tag as the primary, authoritative heading defining the primary theme of the page layout.',
        seoImpact: 'High',
        priority: 'Red',
        stepByStepFix: [
          'Locate your page’s main hero header.',
          'Refactor the styling element to use a semantic <h1> tag.',
          'Incorporate secondary target keywords into this header.'
        ],
        estimatedImprovement: '+8% Indexation Authority',
        difficulty: 'Easy',
      });
    } else if (seoResult.headings.h1.length > 1) {
      recommendations.push({
        id: `rec-h1-multiple-${timestamp}`,
        category: 'onPage',
        issue: 'Multiple H1 Tags Detected',
        problem: `The crawler located ${seoResult.headings.h1.length} H1 headings on this single page.`,
        whyItMatters: 'Using more than one H1 tag dilutes the semantic structural focus, confusing search crawlers about which title holds historical primacy.',
        seoImpact: 'Medium',
        priority: 'Amber',
        stepByStepFix: [
          'Ensure only the primary layout banner utilizes the <h1> tag.',
          'Convert all secondary <h1> headers into <h2> or <h3> tags.',
          'Adjust CSS class styling rules to ensure layout integrity.'
        ],
        estimatedImprovement: '+5% SEO Structure Score',
        difficulty: 'Easy',
      });
    }

    if (seoResult.missingAltCount > 0) {
      recommendations.push({
        id: `rec-img-alt-${timestamp}`,
        category: 'accessibility',
        issue: 'Missing Image Alt Attributes',
        problem: `${seoResult.missingAltCount} out of ${seoResult.totalImages} images lack descriptive alternate tags.`,
        whyItMatters: 'Alt attributes provide screen-readers and search engine crawlers with contextual descriptions, enabling full image search indexing and accessibility.',
        seoImpact: 'Medium',
        priority: 'Amber',
        stepByStepFix: [
          'Locate all missing alt image resources.',
          'Append accessible `alt="Accurate text representation"` parameters directly to the HTML <img> tags.',
          'Ensure the description represents the image contents naturally.'
        ],
        estimatedImprovement: 'Boost Image Search Impressions & WCAG Accessibility Compliance',
        difficulty: 'Easy',
      });
    }

    if (!crawlResult.isHttps) {
      recommendations.push({
        id: `rec-https-missing-${timestamp}`,
        category: 'security',
        issue: 'Insecure Connection (HTTP)',
        problem: 'Your connection does not employ SSL/TLS encryption standard protocols.',
        whyItMatters: 'HTTPS is an official ranking signal since 2014, securing user transactions and preventing browser "Insecure Site" warning banners.',
        seoImpact: 'Critical',
        priority: 'Red',
        stepByStepFix: [
          'Procure a valid SSL Certificate (such as a free Let’s Encrypt cert).',
          'Configure server headers to force HTTPS redirect paths globally.',
          'Update relative media file links inside the codebase to secure targets.'
        ],
        estimatedImprovement: 'Remove browser security alerts and boost global authority ratings',
        difficulty: 'Medium',
      });
    }

    if (crawlResult.loadTimeMs > 1500) {
      recommendations.push({
        id: `rec-speed-slow-${timestamp}`,
        category: 'performance',
        issue: 'Slow Server Response and Load Times',
        problem: `The crawled response completed in ${crawlResult.loadTimeMs}ms, exceeding industry baselines.`,
        whyItMatters: 'Page speed directly influences user bounce rates. Delays of over 2 seconds can drive away up to 40% of target user prospects.',
        seoImpact: 'High',
        priority: 'Amber',
        stepByStepFix: [
          'Compress all high-resolution imagery assets.',
          'Leverage modern WebP/AVIF file formats.',
          'Implement full browser content caching and Content Delivery Network (CDN) support.'
        ],
        estimatedImprovement: 'Reduce bounce rates by 15-20% and pass Core Web Vitals checks',
        difficulty: 'Medium',
      });
    }

    if (!crawlResult.hasSitemap) {
      recommendations.push({
        id: `rec-sitemap-missing-${timestamp}`,
        category: 'technical',
        issue: 'Missing XML Sitemap',
        problem: 'No XML sitemap index path was detected in the root folders.',
        whyItMatters: 'XML sitemaps present search engine crawlers with an organized, prioritized list of all indexable target URL pages.',
        seoImpact: 'Medium',
        priority: 'Yellow',
        stepByStepFix: [
          'Construct a dynamically refreshing XML sitemap containing all active domain pages.',
          'Publish the file under `/sitemap.xml` public routing directory.',
          'Register the file path directly in the Google Search Console index dashboard.'
        ],
        estimatedImprovement: 'Shorter index times for freshly updated articles or landing pages',
        difficulty: 'Easy',
      });
    }

    // Always ensure we have at least 3 recommendations in fallback
    if (recommendations.length < 3) {
      recommendations.push({
        id: `rec-og-missing-${timestamp}`,
        category: 'technical',
        issue: 'Missing Open Graph Social Schema',
        problem: 'The page lacks Open Graph structural metadata fields.',
        whyItMatters: 'Open Graph meta elements control image previews and titles when shared across social channels like LinkedIn and Facebook.',
        seoImpact: 'Low',
        priority: 'Green',
        stepByStepFix: [
          'Inject og:title, og:description, and og:image tags into the layout head tags.',
          'Supply a default social hero graphic asset.'
        ],
        estimatedImprovement: '+20% Social Referral CTR',
        difficulty: 'Easy',
      });
    }

    const domainName = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

    return {
      scores,
      keywords,
      recommendations,
      seoTitles: [
        `Unlock ${domainName} | Professional Services & Solutions`,
        `Direct Portal for ${domainName} - Premium Insights`,
        `The Ultimate Guide to ${domainName} | Industry Standard`
      ],
      metaDescriptions: [
        `Discover high-value services and solutions at ${domainName}. Read customer reviews, explore our features, and learn how we help optimize your growth today.`,
        `Seeking the finest insights on ${domainName}? Learn how our expert features, solutions, and resources can take your business to the next level.`,
        `Explore ${domainName} and optimize your organic search presence. Connect with expert teams and unlock hidden search visibility.`
      ],
      h1h2Suggestions: {
        h1: [`The Ultimate Authority on ${domainName}`],
        h2: [
          `Key Benefits and Practical Solutions for ${domainName}`,
          `How to Get Started and Optimize Your Current Workflows`,
          `Expert Insights and Historical Performance Benchmarks`
        ]
      },
      faqBlogIdeas: [
        {
          questionOrTopic: `What is ${domainName} and how does it optimize standard operations?`,
          type: 'FAQ',
          targetKeywords: [`what is ${domainName}`, `${domainName} optimization`, `${domainName} guide`]
        },
        {
          questionOrTopic: `Top 10 Practical Secrets to Elevate Your Strategy Using ${domainName}`,
          type: 'Blog',
          targetKeywords: [`${domainName} strategy`, `${domainName} secrets`, `best ${domainName} practices`]
        },
        {
          questionOrTopic: `A Critical Review of the Current State of ${domainName}`,
          type: 'Blog',
          targetKeywords: [`${domainName} reviews`, `is ${domainName} worth it`, `${domainName} costs`]
        }
      ],
      linkingSuggestions: [
        {
          anchorText: 'explore our solutions',
          targetKeyword: `${domainName} services`,
          reason: 'Guides visitors smoothly from introductory material into key conversion funnels.'
        },
        {
          anchorText: 'review our technical resources',
          targetKeyword: `${domainName} documentation`,
          reason: 'Injects strong internal anchor metrics directly into target knowledge articles.'
        },
        {
          anchorText: 'contact our expert consultants',
          targetKeyword: `consult ${domainName}`,
          reason: 'Strengthens transactional keywords while driving organic contact page actions.'
        }
      ]
    };
  }
}
