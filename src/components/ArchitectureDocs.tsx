import { useState } from 'react';
import { FileCode, Sparkles, CreditCard, Key, ShieldCheck, HelpCircle, Network, Layers } from 'lucide-react';

export default function ArchitectureDocs() {
  const [activeTab, setActiveTab] = useState<'overview' | 'auth' | 'payments' | 'crawlers'>('overview');

  return (
    <div className="py-12 bg-gray-950 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="flex items-center space-x-3 mb-8 border-b border-gray-900 pb-5">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Layers className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">Engineering Architecture</h2>
            <p className="text-xs text-gray-500 font-sans mt-0.5">SaaS blueprint & integration guides designed for horizontal scaling.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-900 mb-8 overflow-x-auto gap-1">
          {[
            { id: 'overview', label: 'Architecture Overview', icon: FileCode },
            { id: 'auth', label: 'Auth & Login', icon: Key },
            { id: 'payments', label: 'Stripe Payments', icon: CreditCard },
            { id: 'crawlers', label: 'Apify Spider Spawns', icon: Network },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
                id={`doc-tab-btn-${tab.id}`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6" id="doc-content-overview">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                  System Blueprint
                </span>
                <h3 className="text-lg font-display font-extrabold text-white mt-3 mb-2">Clean Multi-Tier Architecture</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  SEO Audit AI Pro is designed utilizing a classic layered architecture pattern. Front-end React assets compile into the `/dist` bundle, while the backend Express container handles API requests, file-based persistence, and telemetry pipelines.
                </p>
              </div>

              {/* Bento Directory Map */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Directory Organization & Purpose</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
                    <span className="font-mono text-emerald-400 font-bold block mb-1">/backend/src/services/</span>
                    <p className="text-gray-400 leading-relaxed">Hosts scraping engines, response formatters, and Google GenAI LLM prompt structures.</p>
                  </div>
                  <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
                    <span className="font-mono text-violet-400 font-bold block mb-1">/database/index.ts</span>
                    <p className="text-gray-400 leading-relaxed">Handles file persistence. Easily replaceable with Cloud Firestore, Prisma or Cloud SQL models.</p>
                  </div>
                  <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
                    <span className="font-mono text-blue-400 font-bold block mb-1">/reports/ & /exports/</span>
                    <p className="text-gray-400 leading-relaxed">Temporary system memory zones used for saving structured audit files and csv downloads.</p>
                  </div>
                  <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl">
                    <span className="font-mono text-amber-400 font-bold block mb-1">/shared/types.ts</span>
                    <p className="text-gray-400 leading-relaxed">Single Source of Truth (SSOT) data contracts to prevent front/back compilation mismatching.</p>
                  </div>
                </div>
              </div>

              {/* PDF and CSV info */}
              <div className="p-4.5 bg-gray-950 border border-emerald-500/10 rounded-xl flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Pre-architected PDF & CSV Pipelines</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                    Export buttons are wired with loading states and helper tips. Integration consists of triggering `POST /api/audits/:id/export` where a backend server service uses libraries like `json2csv` to output spreadsheets, or `puppeteer` to render the DOM directly into high-fidelity PDF layouts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUTH & LOGIN */}
          {activeTab === 'auth' && (
            <div className="space-y-6" id="doc-content-auth">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                  User Management
                </span>
                <h3 className="text-lg font-display font-extrabold text-white mt-3 mb-2">Firebase Auth & JWT Verification</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  To protect audits and support premium accounts, you can bind Firebase Authentication or a simple JWT strategy in our routes.
                </p>
              </div>

              {/* Code Snippet Box */}
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-2 font-mono">Suggested Auth Middleware Boilerplate</span>
                <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl overflow-x-auto">
                  <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed">
{`// /backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin'; // or jwt.verify

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(411).json({ error: 'Auth token missing.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Bind user metadata
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication signature expired.' });
  }
}`}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl flex items-start space-x-3">
                <HelpCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Integrating user authorization links reports directly to unique User IDs, converting your general public auditor into a high-retention personalized SEO dashboard.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: STRIPE PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6" id="doc-content-payments">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                  SaaS monetization
                </span>
                <h3 className="text-lg font-display font-extrabold text-white mt-3 mb-2">Stripe Checkout Integration</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Monetize premium audits by locking deep AI features under credit counts or subscription tiers. We structure checkouts through simple endpoint handshakes.
                </p>
              </div>

              {/* Code Snippet Box */}
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-2 font-mono">Suggested Payments Checkout Route</span>
                <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl overflow-x-auto">
                  <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed">
{`// /backend/src/routes/payments.ts
import { Router } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const router = Router();

router.post('/checkout-session', async (req, res) => {
  const { priceId, userId } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    client_reference_id: userId,
    success_url: \`\${process.env.APP_URL}/dashboard?checkout=success\`,
    cancel_url: \`\${process.env.APP_URL}/dashboard?checkout=fail\`,
  });
  res.json({ id: session.id });
});`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APIFY CRAWLERS */}
          {activeTab === 'crawlers' && (
            <div className="space-y-6" id="doc-content-crawlers">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                  Advanced Spiders
                </span>
                <h3 className="text-lg font-display font-extrabold text-white mt-3 mb-2">Apify Integration & Deep Spiders</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Our local fetch auditor works excellently on meta element tag scraping. However, to extract deep pages (like crawling 500 pages of a site recursively), you can spawn Apify cloud tasks asynchronously.
                </p>
              </div>

              {/* Code Snippet Box */}
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-2 font-mono">Suggested Apify Spawn Pipeline</span>
                <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl overflow-x-auto">
                  <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed">
{`// /backend/src/services/apifyCrawler.ts
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

export async function runApifyDeepScrape(targetUrl: string) {
  // Spawn the Web Scraper actor
  const run = await client.actor('apify/web-scraper').call({
    startUrls: [{ url: targetUrl }],
    crawlerType: 'cheerio',
    maxPagesPerCrawl: 100,
  });

  // Fetch parsed dataset results
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items; // Returns complete array of 100 parsed child pages!
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
