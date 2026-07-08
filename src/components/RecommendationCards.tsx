import { useState } from 'react';
import { useSEO } from '../context/SEOContext';
import { SEOAuditReport } from '../../shared/types';
import { 
  Check, 
  Copy, 
  Sparkles, 
  AlertOctagon, 
  AlertTriangle, 
  Info,
  ShieldCheck
} from 'lucide-react';

interface RecommendationCardsProps {
  report: SEOAuditReport;
}

export default function RecommendationCards({ report }: RecommendationCardsProps) {
  const { addToast } = useSEO();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Compile standard rule-based recommendation objects
  const list: { text: string; priority: 'high' | 'medium' | 'low'; type: string; solution: string }[] = [];

  // 1. Title Checks
  const titleMet = report.metrics.title;
  if (titleMet.status === 'error') {
    list.push({
      text: titleMet.message,
      priority: 'high',
      type: 'On-Page',
      solution: 'Inject a <title>Your Keyword-Rich Title</title> tag inside the <head> element. Keep it between 50 and 60 characters long.'
    });
  } else if (titleMet.status === 'warning') {
    list.push({
      text: titleMet.message,
      priority: 'medium',
      type: 'On-Page',
      solution: 'Modify the title to sit cleanly between 50 and 60 characters long. Avoid generic filler words.'
    });
  }

  // 2. Description Checks
  const descMet = report.metrics.description;
  if (descMet.status === 'error') {
    list.push({
      text: descMet.message,
      priority: 'high',
      type: 'On-Page',
      solution: 'Add a <meta name="description" content="A compelling summary of your content under 155 characters."> in your head tag.'
    });
  } else if (descMet.status === 'warning') {
    list.push({
      text: descMet.message,
      priority: 'medium',
      type: 'On-Page',
      solution: 'Adjust description size to sit between 110 and 150 characters long for optimum search page snippet rendering.'
    });
  }

  // 3. Heading hierarchy checks
  const headMet = report.metrics.headings;
  if (headMet.status === 'error') {
    list.push({
      text: headMet.message,
      priority: 'high',
      type: 'Markup Structure',
      solution: 'Ensure there is exactly one top-level <h1> tag on the page describing the primary focus. Convert other <h1> tags to <h2> elements.'
    });
  } else if (headMet.status === 'warning') {
    list.push({
      text: headMet.message,
      priority: 'medium',
      type: 'Markup Structure',
      solution: 'Review your heading order. Make sure <h2> subsection divisions follow <h1> and precede nested <h3> tags.'
    });
  }

  // 4. Broken Link Checks
  const linkMet = report.metrics.links;
  if (linkMet.status === 'error') {
    list.push({
      text: linkMet.message,
      priority: 'high',
      type: 'Crawling',
      solution: 'Inspect outbound link hrefs returning 4xx error codes. Replace outdated URLs or remove broken target anchor nodes.'
    });
  }

  // 5. Image Alt attributes checks
  const imgMet = report.metrics.images;
  if (imgMet.status === 'warning' && imgMet.missingAlt > 0) {
    list.push({
      text: imgMet.message,
      priority: 'medium',
      type: 'Accessibility',
      solution: 'Add descriptive alt="accessible context" properties to all <img> tags to assist screen readers and image-search bots.'
    });
  }

  // 6. Security and Tech checks
  const techMet = report.metrics.technical;
  if (!techMet.isHttps) {
    list.push({
      text: 'Insecure server connection detected (HTTP).',
      priority: 'high',
      type: 'Security',
      solution: 'Obtain an SSL certificate (e.g. from Let’s Encrypt) and enforce HTTP-to-HTTPS redirect rules in your server routing config.'
    });
  }
  if (!techMet.hasRobots) {
    list.push({
      text: 'Robots.txt configuration is missing.',
      priority: 'medium',
      type: 'Crawling',
      solution: 'Host a robots.txt file at your web root (e.g. yourdomain.com/robots.txt) declaring search engine User-agent permissions.'
    });
  }
  if (!techMet.hasSitemap) {
    list.push({
      text: 'Sitemap XML mapping index is missing.',
      priority: 'medium',
      type: 'Indexing',
      solution: 'Construct an XML sitemap listing your site’s URLs, and upload it as sitemap.xml to make content indexation immediate.'
    });
  }

  // Fallback defaults if the site is perfectly optimized
  if (list.length === 0) {
    list.push({
      text: 'Your page passes all core automated metric gates successfully.',
      priority: 'low',
      type: 'General',
      solution: 'Keep content updated, continue monitoring bounce rates, and consider structuring JSON-LD schema definitions.'
    });
  }

  const handleCopy = (solutionText: string, index: number) => {
    navigator.clipboard.writeText(solutionText);
    setCopiedIndex(index);
    addToast('Actionable solution copied to clipboard!', 'success');
    
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2500);
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <AlertOctagon className="h-4 w-4 text-rose-400 flex-shrink-0" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />;
      case 'low':
        return <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: Automated Rule Warnings */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-gray-400">
          Metric Corrections ({list.length})
        </h3>

        <div className="space-y-3">
          {list.map((item, index) => (
            <div
              key={index}
              className="bg-gray-950 border border-gray-900 rounded-2xl p-5 hover:border-gray-800 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-3">
                <div className="flex items-center space-x-2.5">
                  {getPriorityIcon(item.priority)}
                  <span className="text-xs font-bold text-white leading-tight">
                    {item.text}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`text-[10px] font-mono px-2 py-0.5 border rounded-full uppercase font-bold ${getPriorityBadge(item.priority)}`}>
                    {item.priority} Priority
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 bg-gray-900 border border-gray-800/60 px-2 py-0.5 rounded-full">
                    {item.type}
                  </span>
                </div>
              </div>

              <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-900/60 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Action Plan:</span>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">{item.solution}</p>
                </div>
                
                <button
                  onClick={() => handleCopy(item.solution, index)}
                  className="p-2 bg-gray-950 border border-gray-800 hover:border-emerald-500/20 hover:bg-gray-900 rounded-xl text-gray-400 hover:text-emerald-400 cursor-pointer flex-shrink-0 transition-colors"
                  title="Copy snippet"
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: AI Gemini Custom Analysis */}
      {report.aiRecommendations && (
        <div className="bg-gray-950 border border-emerald-500/10 rounded-2xl p-6 lg:p-7 shadow-xl space-y-4 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />
          
          <div className="flex items-center space-x-2 border-b border-gray-900 pb-3">
            <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-400">
              Gemini AI Pro Tactical Assessment
            </h3>
          </div>

          <div className="prose prose-invert prose-xs text-gray-300 leading-relaxed max-w-none space-y-3 font-sans">
            {report.aiRecommendations.split('\n\n').map((paragraph, index) => {
              // Simple parser to make headings and list bullets look neat
              const isHeading = paragraph.startsWith('#');
              const isBullet = paragraph.startsWith('*') || paragraph.startsWith('-');
              
              if (isHeading) {
                const text = paragraph.replace(/#/g, '').trim();
                return (
                  <h4 key={index} className="text-xs sm:text-sm font-semibold tracking-wide text-white font-mono uppercase mt-4 block border-l-2 border-emerald-500 pl-2">
                    {text}
                  </h4>
                );
              }
              
              if (isBullet) {
                const bullets = paragraph.split('\n').filter(b => b.trim());
                return (
                  <ul key={index} className="space-y-1.5 list-disc pl-5">
                    {bullets.map((b, i) => (
                      <li key={i} className="text-xs text-gray-300">
                        {b.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                      </li>
                    ))}
                  </ul>
                );
              }

              // Normal text, render with bold styling where needed
              return (
                <p key={index} className="text-xs sm:text-sm leading-relaxed text-gray-400">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
