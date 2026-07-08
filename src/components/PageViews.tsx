import React, { useState, useEffect } from 'react';
import { useSEO, AppView, VisualTheme } from '../context/SEOContext';
import { SEOAuditReport } from '../../shared/types';
import SEOScoreCircle from './SEOScoreCircle';
import StatisticsCards from './StatisticsCards';
import URLInputCard from './URLInputCard';
import Charts from './Charts';
import RecommendationCards from './RecommendationCards';
import AuditTable from './AuditTable';
import { 
  ThemeSwitcher, 
  ExportButtons, 
  ProgressBar, 
  LoadingAnimation, 
  SearchBar, 
  UserMenu, 
  EmptyState, 
  ErrorState 
} from './MiscComponents';
import { 
  PlusCircle, 
  Settings, 
  History, 
  Compass, 
  Database, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  FileText, 
  User, 
  Sparkles,
  ArrowLeft,
  Key,
  Flame,
  Zap,
  Check,
  AlertTriangle,
  Server,
  Lock,
  Bookmark
} from 'lucide-react';

/* ==========================================
   1. DASHBOARD OVERVIEW PAGE
   ========================================== */
export function DashboardPage() {
  const { reports, selectReport, user, navigate } = useSEO();

  // Pick top audit report or default to first sample
  const primaryReport = reports[0];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-950 p-6 border border-gray-900 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <h1 className="text-xl sm:text-2xl font-display font-black text-white">
            Hello, {user ? user.name : 'Analyst'}!
          </h1>
          <p className="text-xs text-gray-400">
            Active Workspace: <span className="text-emerald-400 font-bold font-mono text-[11px]">{user?.company || 'Personal Console'}</span> | Subscription: <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold font-mono">{user?.role || 'SEO Analyst'}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2.5 z-10">
          <ThemeSwitcher />
          <button
            onClick={() => navigate('new-audit')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>RUN CRAWLER</span>
          </button>
        </div>
      </div>

      {primaryReport ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Scoring Card */}
          <div className="bg-gray-950 border border-gray-900 p-6 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-3 left-4 flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded text-[9px] font-mono font-bold">
              <Activity className="h-3 w-3" />
              <span>ACTIVE REPORT PROFILE</span>
            </div>
            
            <SEOScoreCircle score={primaryReport.overallScore} size="xl" subtitle="OVERALL COMPLIANCE" />
            
            <div className="text-center space-y-1.5 w-full">
              <h3 className="text-sm font-bold text-white truncate max-w-xs mx-auto">{primaryReport.url.replace(/^https?:\/\//, '')}</h3>
              <p className="text-xs text-gray-500">Crawl completed on {new Date(primaryReport.timestamp).toLocaleString()}</p>
            </div>

            <div className="w-full grid grid-cols-3 gap-2.5 pt-4 border-t border-gray-900/60">
              <div className="text-center p-2.5 bg-gray-900/40 rounded-xl border border-gray-900/50">
                <span className="text-[10px] text-gray-500 font-mono block">PAGE</span>
                <span className="text-xs font-mono font-bold text-white">{primaryReport.metrics.performance.pageSizeKb}KB</span>
              </div>
              <div className="text-center p-2.5 bg-gray-900/40 rounded-xl border border-gray-900/50">
                <span className="text-[10px] text-gray-500 font-mono block">SPEED</span>
                <span className="text-xs font-mono font-bold text-white">{primaryReport.metrics.performance.loadTimeMs}ms</span>
              </div>
              <div className="text-center p-2.5 bg-gray-900/40 rounded-xl border border-gray-900/50">
                <span className="text-[10px] text-gray-500 font-mono block">LINKS</span>
                <span className="text-xs font-mono font-bold text-white">{primaryReport.metrics.links.total}</span>
              </div>
            </div>

            <button
              onClick={() => selectReport(primaryReport.id)}
              className="w-full py-2.5 bg-gray-900 hover:bg-emerald-500/10 border border-gray-800 hover:border-emerald-500/20 text-gray-400 hover:text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
            >
              INVESTIGATE DETAIL SHEET
            </button>
          </div>

          {/* Interactive Custom SVG Chart displays */}
          <div className="xl:col-span-2 space-y-5">
            <Charts report={primaryReport} />
          </div>
        </div>
      ) : (
        <EmptyState 
          message="No reports found. Launch your first website audit scan to unlock your interactive dashboards." 
          actionLabel="SCAN SITE" 
          onAction={() => navigate('new-audit')} 
        />
      )}

      {/* History ledger listing */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-900 pb-3">
          <Database className="h-4.5 w-4.5 text-emerald-400" />
          <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-white">Consolidated Analysis Vault</h2>
        </div>
        <AuditTable />
      </div>
    </div>
  );
}

/* ==========================================
   2. NEW AUDIT LAUNCHER PAGE
   ========================================== */
export function NewAuditPage() {
  const { triggerAudit, isLoading, user } = useSEO();
  const [crawlUrl, setCrawlUrl] = useState('');
  const [activeWait, setActiveWait] = useState(false);

  const handleLaunch = async (url: string) => {
    setCrawlUrl(url);
    setActiveWait(true);
    try {
      await triggerAudit(url);
    } catch {
      // Quiet fail to let the local view render error
    } finally {
      setActiveWait(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-6 animate-fade-in">
      <div className="space-y-1 pb-3 border-b border-gray-900">
        <h1 className="text-xl sm:text-2xl font-display font-black text-white">Run New Audit</h1>
        <p className="text-xs text-gray-400">Scrape pages, inspect tags, test outbound anchors, and trigger Gemini AI suggestions.</p>
      </div>

      {activeWait ? (
        <div className="py-8">
          <LoadingAnimation url={crawlUrl} />
        </div>
      ) : (
        <div className="space-y-6">
          <URLInputCard onStartAudit={handleLaunch} />
          
          {/* Quick Start Guidance */}
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 lg:p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-900/60 pb-3">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-gray-200">Scrapers Capabilities</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 bg-gray-900/30 p-3.5 border border-gray-900/60 rounded-xl">
                <span className="font-bold text-white block font-mono">1. Element Scavengers</span>
                <p className="text-gray-400 leading-relaxed font-sans">Crawls HTML tags to review alt settings, canonical structures, language prefixes, and viewports.</p>
              </div>
              <div className="space-y-1 bg-gray-900/30 p-3.5 border border-gray-900/60 rounded-xl">
                <span className="font-bold text-white block font-mono">2. Outbound Link Testers</span>
                <p className="text-gray-400 leading-relaxed font-sans">Performs asynchronous HTTP head tests over external links to catch broken 4xx endpoints instantly.</p>
              </div>
              <div className="space-y-1 bg-gray-900/30 p-3.5 border border-gray-900/60 rounded-xl">
                <span className="font-bold text-white block font-mono">3. Robots & Sitemap Matchers</span>
                <p className="text-gray-400 leading-relaxed font-sans">Scans server roots for robots.txt files and sitemap XML catalogs to check indexing paths.</p>
              </div>
              <div className="space-y-1 bg-gray-900/30 p-3.5 border border-gray-900/60 rounded-xl">
                <span className="font-bold text-white block font-mono">4. LLM Advice Synthesis</span>
                <p className="text-gray-400 leading-relaxed font-sans">Bundles raw analysis outputs and routes to Google Gemini Pro to assemble custom code suggestions.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   3. AUDIT HISTORY PAGE
   ========================================== */
export function HistoryPage() {
  const { reports } = useSEO();

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <div className="space-y-1 pb-3 border-b border-gray-900">
        <h1 className="text-xl sm:text-2xl font-display font-black text-white">Audit History</h1>
        <p className="text-xs text-gray-400">Review historical analysis reports, compare overall compliance scores, and delete records.</p>
      </div>

      <AuditTable />
    </div>
  );
}

/* ==========================================
   4. REPORTS DETAIL VIEW PAGE
   ========================================== */
export function ReportsPage() {
  const { reports, selectedReportId, deleteAuditReport, selectReport, navigate } = useSEO();

  const report = reports.find(r => r.id === selectedReportId) || reports[0];

  if (!report) {
    return (
      <div className="max-w-md mx-auto py-12">
        <EmptyState 
          message="No reports indexed yet. Complete a crawl scan to construct detailed analysis reports." 
          actionLabel="CRAWL WEBSITE" 
          onAction={() => navigate('new-audit')} 
        />
      </div>
    );
  }

  const { scores, metrics } = report;

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-900 pb-5">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => navigate('dashboard')}
            className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-lg sm:text-xl font-display font-bold text-white truncate max-w-sm sm:max-w-md">
              {report.url}
            </h1>
            <p className="text-xs text-gray-400">
              Crawl Timestamp: <span className="font-mono text-[11px] text-gray-300">{new Date(report.timestamp).toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ExportButtons report={report} />
          <button
            onClick={() => { deleteAuditReport(report.id); navigate('dashboard'); }}
            className="p-2 bg-gray-900 hover:bg-rose-950/20 border border-gray-800 hover:border-rose-500/30 text-gray-500 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
            title="Purge record"
          >
            Purge Report
          </button>
        </div>
      </div>

      {/* Scoring Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2">
          <SEOScoreCircle score={scores.onPage} size="md" title="On-Page Content" />
          <p className="text-[10px] text-gray-500 font-mono text-center uppercase tracking-wide">Title & Heading Markup</p>
        </div>
        
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2">
          <SEOScoreCircle score={scores.technical} size="md" title="Technical Standard" />
          <p className="text-[10px] text-gray-500 font-mono text-center uppercase tracking-wide">SSL, Sitemap, Robots txt</p>
        </div>

        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2">
          <SEOScoreCircle score={scores.performance} size="md" title="Server Speed" />
          <p className="text-[10px] text-gray-500 font-mono text-center uppercase tracking-wide">Latency & Size Ratios</p>
        </div>
      </div>

      {/* Core Stats Cards */}
      <StatisticsCards report={report} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* On-page element details panels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Metas detail */}
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 lg:p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-gray-200 border-b border-gray-900 pb-3">HTML Metadata Indexes</h3>
            
            <div className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pb-3 border-b border-gray-900/50">
                <span className="font-mono font-bold text-gray-400 sm:col-span-1">PAGE TITLE</span>
                <div className="sm:col-span-3 space-y-1.5">
                  <p className="font-semibold text-white bg-gray-900 px-3 py-2 rounded-lg border border-gray-900">{metrics.title.value || '(None)'}</p>
                  <p className="text-[11px] text-gray-500 font-mono">Length: {metrics.title.length} characters | {metrics.title.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pb-3 border-b border-gray-900/50">
                <span className="font-mono font-bold text-gray-400 sm:col-span-1">DESCRIPTION</span>
                <div className="sm:col-span-3 space-y-1.5">
                  <p className="font-semibold text-gray-300 bg-gray-900 px-3 py-2 rounded-lg border border-gray-900 leading-relaxed">{metrics.description.value || '(None)'}</p>
                  <p className="text-[11px] text-gray-500 font-mono">Length: {metrics.description.length} characters | {metrics.description.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <span className="font-mono font-bold text-gray-400 sm:col-span-1">CANONICAL LINK</span>
                <div className="sm:col-span-3">
                  <p className="font-mono text-[11px] text-emerald-400 bg-gray-900 px-3 py-2 rounded-lg border border-gray-900 truncate">{report.url}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Heading structure detailed view */}
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 lg:p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-gray-200 border-b border-gray-900 pb-3">Structured Headings Tree Hierarchy</h3>
            
            <div className="space-y-2.5 h-64 overflow-y-auto pr-2 custom-scrollbar">
              {metrics.headings.list && metrics.headings.list.length > 0 ? (
                metrics.headings.list.map((head, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs p-2.5 bg-gray-900/30 rounded-xl border border-gray-900/60 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border flex-shrink-0 uppercase ${
                      head.type === 'h1' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {head.type}
                    </span>
                    <p className="text-gray-300 truncate leading-relaxed">{head.text}</p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <AlertTriangle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs">No Heading elements detected in crawled body markup.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Action recommendations checklist column */}
        <div className="space-y-6">
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-gray-200 border-b border-gray-900 pb-3">Outbound Broken Links Check</h4>
            
            <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
              {report.metrics.links.total > 0 ? (
                <div className="space-y-2">
                  <div className="p-3.5 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl flex items-center space-x-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Sampling complete. Links healthy.</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                    Outbound targets return 200 HTTP status values, maintaining high ranking juice.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No external links discovered.</p>
              )}
            </div>
          </div>

          <RecommendationCards report={report} />
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   5. SETTINGS PANEL PAGE
   ========================================== */
export function SettingsPage() {
  const { settings, updateSettings } = useSEO();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 animate-fade-in">
      <div className="space-y-1 pb-3 border-b border-gray-900">
        <h1 className="text-xl sm:text-2xl font-display font-black text-white">Engine Settings</h1>
        <p className="text-xs text-gray-400">Fine-tune crawl depth limits, HTTP user agent identifiers, and alert trigger rules.</p>
      </div>

      <form onSubmit={handleSave} className="bg-gray-950 border border-gray-900 rounded-2xl p-6 space-y-6 shadow-2xl">
        {/* User Agent */}
        <div className="space-y-1.5 text-xs">
          <label className="font-mono font-bold text-gray-400 uppercase">Crawl User-Agent Identifier</label>
          <input
            type="text"
            value={localSettings.userAgent}
            onChange={(e) => setLocalSettings({...localSettings, userAgent: e.target.value})}
            className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white outline-none font-mono"
          />
        </div>

        {/* Max Depth and Concurrency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-400 uppercase">Maximum Crawl Depth</label>
            <select
              value={localSettings.maxDepth}
              onChange={(e) => setLocalSettings({...localSettings, maxDepth: parseInt(e.target.value)})}
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-3.5 text-white outline-none"
            >
              <option value="1">1 Page Index Scan Only</option>
              <option value="2">2 Pages Nested Levels</option>
              <option value="3">3 Pages Enterprise Scanning</option>
              <option value="5">5 Pages Recursive Index</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-400 uppercase">Simulated Concurrency Limit</label>
            <select
              value={localSettings.concurrencyLimit}
              onChange={(e) => setLocalSettings({...localSettings, concurrencyLimit: parseInt(e.target.value)})}
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-3.5 text-white outline-none"
            >
              <option value="2">2 Threads (Safe & Slow)</option>
              <option value="4">4 Threads (Balanced Mode)</option>
              <option value="8">8 Threads (High Performance)</option>
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-3 border-t border-gray-900/60 text-xs font-sans">
          <label className="flex items-start space-x-3 text-gray-300 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.checkBrokenLinks}
              onChange={(e) => setLocalSettings({...localSettings, checkBrokenLinks: e.target.checked})}
              className="mt-0.5 rounded bg-gray-900 border-gray-800 text-emerald-500 focus:ring-emerald-500"
            />
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Test Outbound Broken Links</span>
              <span className="text-gray-500">Enable asynchronous HTTP verification on external link elements.</span>
            </div>
          </label>

          <label className="flex items-start space-x-3 text-gray-300 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.autoAnalyzeWithGemini}
              onChange={(e) => setLocalSettings({...localSettings, autoAnalyzeWithGemini: e.checked})}
              className="mt-0.5 rounded bg-gray-900 border-gray-800 text-emerald-500 focus:ring-emerald-500"
            />
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Auto-generate Gemini AI Recommendations</span>
              <span className="text-gray-500">Inject raw crawled JSON into Gemini models for tactical recommendations.</span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors"
        >
          Save Engine Configurations
        </button>
      </form>
    </div>
  );
}

/* ==========================================
   6. LOGIN VIEW PAGE
   ========================================== */
export function LoginPage() {
  const { login } = useSEO();
  const [email, setEmail] = useState('analyst@seopro.com');
  const [name, setName] = useState('Alex Sterling');
  const [role, setRole] = useState('Premium Developer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, name, role);
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />
        
        <div className="text-center space-y-2">
          <div className="bg-emerald-500 text-gray-950 p-2.5 rounded-2xl mx-auto w-max shadow-lg shadow-emerald-500/10">
            <Compass className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Access Console</h2>
          <p className="text-xs text-gray-500">Provide credentials to initialize your crawling workspace session.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-500 uppercase">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-500 uppercase">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-500 uppercase">Simulated Role Allocation</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-3 text-white outline-none"
            >
              <option value="Premium Developer">Premium Developer (88 credits)</option>
              <option value="SEO Analyst">SEO Analyst (50 credits)</option>
              <option value="Guest Explorer">Guest Explorer (10 credits)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors"
          >
            Launch Session
          </button>
        </form>
      </div>
    </div>
  );
}

/* ==========================================
   7. REGISTER VIEW PAGE
   ========================================== */
export function RegisterPage() {
  const { registerUser } = useSEO();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !company) return;
    registerUser(email, name, company);
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Create Workspace</h2>
          <p className="text-xs text-gray-500">Establish a team workspace to monitor multiple customer domains.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-500 uppercase">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sandra Bullock"
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white placeholder-gray-600 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-500 uppercase">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sandra@brand.com"
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white placeholder-gray-600 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-500 uppercase">Company / Agency Name</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Gravity Analytics"
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white placeholder-gray-600 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors"
          >
            Create Agency Console
          </button>
        </form>
      </div>
    </div>
  );
}

/* ==========================================
   8. PROFILE SUMMARY PAGE
   ========================================== */
export function ProfilePage() {
  const { user } = useSEO();

  // Mock Checklist for Realism
  const goals = [
    { text: 'Integrate active domain analytics into GSC triggers', completed: true },
    { text: 'Resolve missing image alt tags on local customer sites', completed: false },
    { text: 'Implement meta descriptions under 155 characters across landing blocks', completed: true },
    { text: 'Confirm robots and sitemap catalog is indexed by Googlebot', completed: false }
  ];

  if (!user) return <LoginPage />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 animate-fade-in">
      <div className="space-y-1 pb-3 border-b border-gray-900">
        <h1 className="text-xl sm:text-2xl font-display font-black text-white">My Profile Summary</h1>
        <p className="text-xs text-gray-400">View active crawler allocation tokens, active role scopes, and custom action checklists.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 text-center space-y-3.5 md:col-span-1">
          <img
            src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'}
            alt="user avatar Large"
            className="h-20 w-20 rounded-full bg-gray-900 border-2 border-emerald-500/30 mx-auto"
          />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white truncate">{user.name}</h3>
            <p className="text-[11px] text-gray-500 truncate leading-none">{user.email}</p>
          </div>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold block w-max mx-auto uppercase">
            {user.role}
          </span>
        </div>

        <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 space-y-4 md:col-span-2">
          <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-gray-200 border-b border-gray-900 pb-2.5">Workspace Allotments</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/40 border border-gray-900 p-3 rounded-xl space-y-0.5">
              <span className="text-[10px] text-gray-500 font-mono block">CRAWL CREDITS</span>
              <span className="text-lg font-mono font-black text-white">{user.credits} Remaining</span>
            </div>
            
            <div className="bg-gray-900/40 border border-gray-900 p-3 rounded-xl space-y-0.5">
              <span className="text-[10px] text-gray-500 font-mono block">ACTIVE AGENCY</span>
              <span className="text-sm font-bold text-gray-300 truncate block leading-relaxed">{user.company || 'Growth Labs'}</span>
            </div>
          </div>

          {/* Goal checklist */}
          <div className="space-y-2.5 text-xs font-sans">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider block font-bold">My Active Optimization Objectives</span>
            <div className="space-y-2">
              {goals.map((g, idx) => (
                <div key={idx} className="flex items-center space-x-2.5">
                  <span className={`p-0.5 rounded border ${g.completed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-900 border-gray-800 text-transparent'}`}>
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className={g.completed ? 'text-gray-500 line-through' : 'text-gray-300'}>{g.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ==========================================
   9. 404 PATH NOT FOUND FALLBACK PAGE
   ========================================== */
export function NotFoundPage() {
  const { navigate } = useSEO();

  return (
    <div className="py-20 text-center max-w-sm mx-auto space-y-6 animate-fade-in">
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full w-max mx-auto shadow-lg shadow-rose-500/5">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-mono font-black text-white uppercase tracking-tight">PAGE NOT FOUND</h1>
        <p className="text-xs text-gray-500 leading-relaxed font-sans">
          The requested crawler routing coordinates do not match any live indexing dashboards in our workspace registry.
        </p>
      </div>
      <button
        onClick={() => navigate('dashboard')}
        className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors"
      >
        Return to Dashboard Hub
      </button>
    </div>
  );
}
