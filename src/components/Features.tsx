import { Sparkles, Terminal, Activity, FileJson, Gauge, Heart } from 'lucide-react';

export default function Features() {
  const list = [
    {
      title: 'Gemini AI Insights',
      description: 'Understands your exact niche. Receives raw page data and generates customized semantic headings and action summaries.',
      icon: Sparkles,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20 hover:border-violet-500/40'
    },
    {
      title: 'Structural Content Scraper',
      description: 'Crawls title character bounds, meta description snippets, images missing alt descriptive tags, and heading hierarchy schemas.',
      icon: Terminal,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20 hover:border-emerald-500/40'
    },
    {
      title: 'Speed & Core Web Vitals',
      description: 'Measures page response latency and asset weights in real-time, matching Google-standard page experience benchmarks.',
      icon: Gauge,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20 hover:border-blue-500/40'
    },
    {
      title: 'Durable Local DB Logs',
      description: 'Saves reports to secure local JSON tables. Tracks previous scores and supports historic diagnostic audits chronologically.',
      icon: FileJson,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20 hover:border-amber-500/40'
    },
    {
      title: 'B2B Scalability Foundations',
      description: 'Pre-architected server controllers designed to integrate Stripe checkouts, user authentication accounts, and automated sitemap scrapers.',
      icon: Activity,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20 hover:border-rose-500/40'
    },
    {
      title: 'Crawl Accessibility checks',
      description: 'Identifies broken internal links, redirects, secure SSL states, and crawl blockages before indexing is disrupted.',
      icon: Heart,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20 hover:border-cyan-500/40'
    }
  ];

  return (
    <div className="py-16 sm:py-24 bg-gray-950 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16" id="features-header">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight mb-4">
            Engineered For Modern Organic Growth
          </h2>
          <p className="text-gray-400 text-sm sm:text-base font-sans">
            A comprehensive diagnostic platform. We scrape tags, measure responsiveness, and issue pro-grade SEO audits to boost your search authority.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="features-bento-grid">
          {list.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`p-6 bg-gray-900 border ${item.border} rounded-2xl transition-all duration-300 group hover:-translate-y-1.5 hover:shadow-xl`}
                id={`feature-card-${index}`}
              >
                {/* Icon Container */}
                <div className={`p-3 ${item.bg} rounded-xl inline-flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
                {/* Content */}
                <h3 className="text-lg font-display font-bold text-white mb-2.5">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
