import { GoogleGenAI } from '@google/genai';
import { SEOAuditReport } from '../../../shared/types';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. Falling back to rule-based SEO recommendations.');
    }
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

async function generateContentWithRetry(ai: any, params: any, retries = 2, delay = 1000): Promise<any> {
  const originalModel = params.model || 'gemini-3.5-flash';
  const modelsToTry = [
    originalModel,
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite'
  ];

  // Keep unique model names in order
  const uniqueModels = [...new Set(modelsToTry.filter(Boolean))];

  for (let mIdx = 0; mIdx < uniqueModels.length; mIdx++) {
    const currentModel = uniqueModels[mIdx];
    const currentParams = { ...params, model: currentModel };
    let currentDelay = delay;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[Gemini Request] Trying model ${currentModel} (attempt ${attempt + 1}/${retries + 1})...`);
        return await ai.models.generateContent(currentParams);
      } catch (err: any) {
        const isTransient = err?.status === 503 || err?.code === 503 || 
                            err?.message?.includes('503') || 
                            err?.message?.includes('high demand') ||
                            err?.message?.includes('UNAVAILABLE') ||
                            err?.message?.includes('Resource exhausted') ||
                            err?.status === 429;
        
        if (isTransient) {
          if (attempt < retries) {
            console.warn(`[Gemini Retry] Transient error on ${currentModel} (attempt ${attempt + 1}): ${err.message || err}. Retrying in ${currentDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            currentDelay *= 2;
            continue;
          } else {
            console.warn(`[Gemini Fallback] All ${retries + 1} attempts failed for model ${currentModel} with transient error.`);
            if (mIdx < uniqueModels.length - 1) {
              console.log(`[Gemini Fallback] Falling back to next model: ${uniqueModels[mIdx + 1]}`);
              break; // Break the attempt loop to move to the next model
            } else {
              throw err; // Last model failed, propagate error
            }
          }
        } else {
          // If it's a structural error (like schema or bad arguments), throw immediately
          throw err;
        }
      }
    }
  }
}

export async function generateAIRecommendations(report: SEOAuditReport): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return generateLocalFallbackRecommendations(report);
  }

  try {
    const ai = getAIClient();
    
    const prompt = `
You are SEO Audit AI Pro, a senior search marketing executive. Analyze the following SEO audit metrics for "${report.url}" and generate a comprehensive, highly strategic SEO Audit and Action Plan.

### AUDIT DATA SUMMARY:
- URL: ${report.url}
- Overall Score: ${report.overallScore}/100
- Category Scores:
  - On-Page SEO: ${report.scores.onPage}/100
  - Technical SEO: ${report.scores.technical}/100
  - Performance: ${report.scores.performance}/100
- Specific Metrics:
  - Title Tag: "${report.metrics.title.value}" (Length: ${report.metrics.title.length}, Status: ${report.metrics.title.status})
  - Meta Description: "${report.metrics.description.value}" (Length: ${report.metrics.description.length}, Status: ${report.metrics.description.status})
  - Headings: ${report.metrics.headings.value} (Status: ${report.metrics.headings.status})
  - Image ALT Tags: ${report.metrics.images.value} (Missing ALTs: ${report.metrics.images.missingAlt}, Status: ${report.metrics.images.status})
  - Link Health: ${report.metrics.links.value} (Status: ${report.metrics.links.status})
  - Technical SSL/HTTPS: ${report.metrics.technical.value} (Status: ${report.metrics.technical.status})
  - Load Time: ${report.metrics.performance.value} (Page Size: ${report.metrics.performance.pageSizeKb}KB, Status: ${report.metrics.performance.status})

### INSTRUCTIONS:
Produce a professional, detailed, and visually elegant Markdown report. Do NOT use generic placeholder text. Format it with:
1. **Executive Summary**: A high-level view of the site's search health, highlighting its main issues.
2. **Prioritized Quick Wins (Table)**: A markdown table containing 3-4 high-impact, low-effort changes. Columns: "Priority", "SEO Area", "Issue", "Recommended Action", "Expected Impact".
3. **On-Page SEO Optimization**: Deep dive analysis of Title, Meta Description, Headings, and Images, specifying exact revisions.
4. **Technical & Crawlability Blueprint**: Steps to resolve SSL, Sitemap, Robots.txt, and semantic structure.
5. **Speed & Core Web Vitals Roadmap**: Direct recommendations to speed up the load times and page size.
6. **Future Content Strategy**: A 3-bullet content plan leveraging modern search queries for their domain.

Make the tone authoritative, actionable, and encouraging.
`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    if (response.text) {
      return response.text;
    } else {
      return generateLocalFallbackRecommendations(report);
    }
  } catch (error) {
    console.error('Error generating recommendations from Gemini:', error);
    return generateLocalFallbackRecommendations(report);
  }
}

function generateLocalFallbackRecommendations(report: SEOAuditReport): string {
  return `
# Executive SEO Report & Action Plan for ${report.url}

*Note: Since the Gemini API key is offline or pending activation, this report has been generated using SEO Audit AI Pro's local heuristic recommendation engine.*

## 1. Executive Summary
The domain **${report.url}** has an overall SEO health rating of **${report.overallScore}/100**. This demonstrates a foundational presence but indicates significant optimization pathways to fully capture organic Google Search market share.
- **On-Page SEO (${report.scores.onPage}/100)**: ${report.metrics.title.status === 'pass' ? 'Title tags are in a solid position' : 'On-page title tags and metadata require immediate adjustment'}.
- **Technical SEO (${report.scores.technical}/100)**: Security features and connection protocols show a score of ${report.scores.technical}/100.
- **Performance & Load Times (${report.scores.performance}/100)**: The measured loading time of **${report.metrics.performance.loadTimeMs}ms** is rated **${report.metrics.performance.status.toUpperCase()}**.

---

## 2. Priority Action Items (Quick Wins)

| Priority | SEO Area | Identified Issue | Recommended Action | Expected Impact |
| :--- | :--- | :--- | :--- | :--- |
| 🔴 **High** | On-Page | Title/Description Meta Checks | ${report.metrics.title.status !== 'pass' ? 'Revise the page title tag to be exactly 50-60 chars.' : 'Ensure meta description is between 120-160 chars and contains secondary keywords.'} | Increase Search Engine CTR by 15-25% |
| 🟡 **Medium** | Accessibility | Image Alt Attributes | ${report.metrics.images.missingAlt > 0 ? `Add alt descriptions to the ${report.metrics.images.missingAlt} missing images.` : 'Ensure all alt text uses structured, semantic content rather than plain filenames.'} | Double crawl indexation rate for image searches |
| 🟡 **Medium** | Core Web Vitals | Load Time Optimization | Compress media assets and use modern WebP/AVIF images to reduce the **${report.metrics.performance.pageSizeKb}KB** footprint. | Boost Core Web Vitals mobile page score |

---

## 3. On-Page SEO Deep Dive

### A. Title Tag & Meta Description
- **Current Title**: \`${report.metrics.title.value || 'None'}\` (${report.metrics.title.length} characters)
- **Current Meta Description**: \`${report.metrics.description.value || 'None'}\` (${report.metrics.description.length} characters)
- **Strategy**: Your title tag is the first point of contact for search users. It should be written in a "Problem-Action-Result" format or target major commercial keywords.

### B. Heading Structure
Your heading tags provide structural context to semantic parsers.
- **Current Configuration**: ${report.metrics.headings.h1Count} x H1, and ${report.metrics.headings.list.length} subheadings.
- **Strategy**: Convert multiple H1 tags into H2 headers. Use structured bullet points and structured schemas (e.g. Schema.org JSON-LD FAQ lists) to secure quick-answer Rich Snippets.

---

## 4. Technical SEO & Performance Roadmap
1. **SSL Check**: Your SSL status is **${report.metrics.technical.isHttps ? 'PASSED (HTTPS)' : 'FAILED (HTTP)'}**. Ensure force redirection is activated in your \`.htaccess\` or Nginx configuration.
2. **Sitemaps**: Submit a standard XML sitemap at \`/sitemap.xml\` in Google Search Console to register indexation paths.
3. **Caching & CDN**: Implement Edge Caching (via Cloudflare or Cloudfront) to distribute the page contents globally, reducing First Contentful Paint (FCP).
`;
}
