import { SEOAuditReport } from '../../shared/types';
import { 
  FileText, 
  ShieldAlert, 
  Zap, 
  Layers, 
  Image, 
  Link2, 
  Hourglass, 
  AlertCircle,
  HelpCircle,
  FolderLock
} from 'lucide-react';

interface StatisticsCardsProps {
  report: SEOAuditReport;
}

export default function StatisticsCards({ report }: StatisticsCardsProps) {
  const { scores, metrics } = report;

  // Calculate some helper variables
  const imageCount = metrics.images.total;
  const imageMissingAlt = metrics.images.missingAlt;
  const h1Count = metrics.headings.h1Count;
  const headingList = metrics.headings.list;
  const h2Count = headingList ? headingList.filter(h => h.type === 'h2').length : 0;
  
  const totalLinks = metrics.links.total;
  const internalLinks = metrics.links.internal;
  const externalLinks = metrics.links.external;

  const cards: { title: string; value: string; subtitle: string; icon: any; status: 'pass' | 'warning' | 'error'; details: string }[] = [
    {
      title: 'Performance Score',
      value: `${scores.performance}%`,
      subtitle: String(metrics.performance.value),
      icon: Zap,
      status: scores.performance >= 90 ? 'pass' : (scores.performance >= 60 ? 'warning' : 'error'),
      details: `Loaded in ${metrics.performance.loadTimeMs}ms. Size: ${metrics.performance.pageSizeKb}KB.`
    },
    {
      title: 'On-Page SEO Score',
      value: `${scores.onPage}%`,
      subtitle: `${h1Count} H1 | ${h2Count} H2 headings`,
      icon: FileText,
      status: scores.onPage >= 90 ? 'pass' : (scores.onPage >= 60 ? 'warning' : 'error'),
      details: metrics.headings.message
    },
    {
      title: 'Technical Compliance',
      value: `${scores.technical}%`,
      subtitle: String(metrics.technical.value),
      icon: FolderLock,
      status: scores.technical >= 90 ? 'pass' : (scores.technical >= 60 ? 'warning' : 'error'),
      details: `Sitemap: ${metrics.technical.hasSitemap ? 'Found' : 'Missing'} | Robots: ${metrics.technical.hasRobots ? 'Found' : 'Missing'}`
    },
    {
      title: 'Broken Outbound Links',
      value: report.metrics.links.status === 'error' ? 'Broken detected' : 'Fully healthy',
      subtitle: `${totalLinks} Checked Outbound Links`,
      icon: Link2,
      status: metrics.links.status as 'pass' | 'warning' | 'error',
      details: `${internalLinks} Internal, ${externalLinks} External. Checked via head requests.`
    },
    {
      title: 'Image Alt Descriptions',
      value: imageCount === 0 ? 'No Images' : `${imageCount - imageMissingAlt} / ${imageCount}`,
      subtitle: imageMissingAlt > 0 ? `${imageMissingAlt} missing alt values` : '100% descriptive alt tags',
      icon: Image,
      status: metrics.images.status as 'pass' | 'warning' | 'error',
      details: metrics.images.message
    },
    {
      title: 'Crawl Statistics',
      value: `${metrics.performance.pageSizeKb} KB`,
      subtitle: `Download speed: ${metrics.performance.loadTimeMs} ms`,
      icon: Hourglass,
      status: 'pass',
      details: 'HTML body scraped, parsed and weighed successfully.'
    }
  ];

  const getStatusColor = (status: 'pass' | 'warning' | 'error') => {
    switch (status) {
      case 'pass':
        return 'border-emerald-500/10 bg-emerald-500/[0.02] text-emerald-400 hover:border-emerald-500/30';
      case 'warning':
        return 'border-amber-500/10 bg-amber-500/[0.02] text-amber-400 hover:border-amber-500/30';
      case 'error':
        return 'border-rose-500/10 bg-rose-500/[0.02] text-rose-400 hover:border-rose-500/30';
      default:
        return 'border-gray-800 bg-gray-900/[0.02] text-gray-400';
    }
  };

  const getIndicatorDot = (status: 'pass' | 'warning' | 'error') => {
    switch (status) {
      case 'pass':
        return 'bg-emerald-500 shadow-emerald-500/20';
      case 'warning':
        return 'bg-amber-500 shadow-amber-500/20';
      case 'error':
        return 'bg-rose-500 shadow-rose-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`border rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-lg ${getStatusColor(
              card.status
            )}`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 min-w-0">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
                  {card.title}
                </span>
                <h3 className="text-xl sm:text-2xl font-mono font-black text-white truncate">
                  {card.value}
                </h3>
              </div>
              <div className="p-2.5 bg-gray-900/50 rounded-xl border border-gray-800">
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-gray-900/40 flex flex-col space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className={`h-1.5 w-1.5 rounded-full shadow ${getIndicatorDot(card.status)}`} />
                <span className="text-[11px] font-bold text-gray-300 truncate">{card.subtitle}</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-normal truncate">{card.details}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
