import { useSEO } from '../context/SEOContext';
import { SEOAuditReport } from '../../shared/types';
import { Trash2, ExternalLink, Calendar, Link2, Sparkles, AlertCircle } from 'lucide-react';

export default function AuditTable() {
  const { 
    reports, 
    selectReport, 
    deleteAuditReport, 
    searchQuery, 
    filterStatus,
    setSearchQuery,
    setFilterStatus
  } = useSEO();

  // 1. Apply Search Filter
  let filtered = reports.filter(r => {
    return r.url.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 2. Apply Status/Score Filters
  if (filterStatus === 'high-score') {
    filtered = filtered.filter(r => r.overallScore >= 80);
  } else if (filterStatus === 'low-score') {
    filtered = filtered.filter(r => r.overallScore < 60);
  } else if (filterStatus === 'warnings') {
    filtered = filtered.filter(r => r.overallScore >= 60 && r.overallScore < 80);
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const getSitemapIndicator = (report: SEOAuditReport) => {
    return report.metrics.technical.hasSitemap 
      ? <span className="text-emerald-400 font-bold">XML</span>
      : <span className="text-gray-600 font-normal">No</span>;
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Filters Panel */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-950 p-4 border border-gray-900 rounded-xl">
        {/* Simple Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audited websites..."
            className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-lg py-2 pl-3.5 pr-8 text-xs text-white placeholder-gray-500 outline-none"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto py-1">
          {(['all', 'high-score', 'low-score', 'warnings'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold transition-all border cursor-pointer ${
                filterStatus === status
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Element */}
      {filtered.length === 0 ? (
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-12 text-center space-y-3.5">
          <AlertCircle className="h-10 w-10 text-gray-700 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-300">No audited websites found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              No crawls match your filters. Enter a new domain in the New Audit page to populate your report catalog.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-950 border border-gray-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-900 bg-gray-900/10 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">Audited Domain</th>
                  <th className="p-4 text-center">SEO Score</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-center">Links</th>
                  <th className="p-4 text-center">Sitemap</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/60 text-xs text-gray-300">
                {filtered.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-gray-900/20 transition-colors"
                  >
                    {/* Domain Href link */}
                    <td className="p-4 pl-6 font-semibold text-white">
                      <div className="flex items-center space-x-2 max-w-xs md:max-w-sm">
                        <span className="truncate" title={item.url}>{item.url.replace(/^https?:\/\//, '')}</span>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-gray-500 hover:text-emerald-400 flex-shrink-0"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>

                    {/* Overall Score Dial */}
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 border rounded-lg font-mono font-bold ${getScoreBadge(item.overallScore)}`}>
                        {item.overallScore} / 100
                      </span>
                    </td>

                    {/* Timestamp Calendar */}
                    <td className="p-4 text-gray-400 font-mono">
                      <div className="flex items-center space-x-1.5 text-[11px]">
                        <Calendar className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
                        <span>{formatTimestamp(item.timestamp)}</span>
                      </div>
                    </td>

                    {/* Outbound Link count details */}
                    <td className="p-4 text-center text-gray-400 font-mono text-[11px]">
                      <div className="flex items-center justify-center space-x-1">
                        <Link2 className="h-3.5 w-3.5 text-gray-600" />
                        <span>{item.metrics.links.total} Out</span>
                      </div>
                    </td>

                    {/* Technical status flags */}
                    <td className="p-4 text-center font-mono text-[11px]">
                      {getSitemapIndicator(item)}
                    </td>

                    {/* Actions and Triggers */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => selectReport(item.id)}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-emerald-500/10 border border-gray-800 hover:border-emerald-500/20 text-gray-400 hover:text-emerald-400 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors"
                        >
                          OPEN SHEET
                        </button>
                        <button
                          onClick={() => deleteAuditReport(item.id)}
                          className="p-2 bg-gray-900/40 hover:bg-rose-950/20 border border-gray-800/40 hover:border-rose-500/30 text-gray-500 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                          title="Purge Report"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
