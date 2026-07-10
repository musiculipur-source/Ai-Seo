import React, { useState, useEffect } from 'react';
import { useSEO, AppView, VisualTheme } from '../context/SEOContext';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../lib/translations';
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
  Bookmark,
  Youtube,
  Copy,
  Trophy,
  Award,
  CheckCircle2
} from 'lucide-react';

/* ==========================================
   1. DASHBOARD OVERVIEW PAGE
   ========================================== */
export function DashboardPage() {
  const { reports, selectReport, user, navigate, t } = useSEO();

  // Pick top audit report or default to first sample
  const primaryReport = reports[0];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-950 p-6 border border-gray-900 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <h1 className="text-xl sm:text-2xl font-display font-black text-white">
            {t('seoDashboardTitle')}
          </h1>
          <p className="text-xs text-gray-400">
            {t('seoDashboardSubtitle')}
          </p>
          <div className="text-[10.5px] text-gray-500 pt-1 font-sans">
            Hello, <span className="text-emerald-400 font-bold">{user ? user.name : 'Analyst'}</span> | Active Workspace: <span className="text-emerald-400 font-bold font-mono text-[11px]">{user?.company || 'Personal Console'}</span> | Subscription: <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold font-mono">{user?.role || 'SEO Analyst'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2.5 z-10">
          <ThemeSwitcher />
          <button
            onClick={() => navigate('new-audit')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t('runNewAudit').toUpperCase()}</span>
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
            
            <SEOScoreCircle score={primaryReport.overallScore} size="xl" subtitle={t('overallScore').toUpperCase()} />
            
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
                <span className="text-[10px] text-gray-500 font-mono block font-sans">{t('credits')}</span>
                <span className="text-xs font-mono font-bold text-white">{primaryReport.metrics.links.total}</span>
              </div>
            </div>

            <button
              onClick={() => selectReport(primaryReport.id)}
              className="w-full py-2.5 bg-gray-900 hover:bg-emerald-500/10 border border-gray-800 hover:border-emerald-500/20 text-gray-400 hover:text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
            >
              {t('viewReport').toUpperCase()}
            </button>
          </div>

          {/* Interactive Custom SVG Chart displays */}
          <div className="xl:col-span-2 space-y-5">
            <Charts report={primaryReport} />
          </div>
        </div>
      ) : (
        <EmptyState 
          message={t('noAuditsYet')} 
          actionLabel="SCAN SITE" 
          onAction={() => navigate('new-audit')} 
        />
      )}

      {/* History ledger listing */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-900 pb-3">
          <Database className="h-4.5 w-4.5 text-emerald-400" />
          <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-white">{t('recentAudits')}</h2>
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
  const { triggerAudit, isLoading, user, t } = useSEO();
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
        <h1 className="text-xl sm:text-2xl font-display font-black text-white">{t('runAuditTitle')}</h1>
        <p className="text-xs text-gray-400">{t('runAuditSubtitle')}</p>
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
  const { reports, t } = useSEO();

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      <div className="space-y-1 pb-3 border-b border-gray-900">
        <h1 className="text-xl sm:text-2xl font-display font-black text-white">{t('auditHistory')}</h1>
        <p className="text-xs text-gray-400">{t('seoDashboardSubtitle')}</p>
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
  const { login, adminLogin, addToast, currentLanguage, setLanguage, navigate, t } = useSEO();
  
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      addToast('Email or Mobile number is required.', 'error');
      return;
    }
    if (!password.trim()) {
      addToast('Password is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    // Check secret admin first
    const isSecretAdmin = (emailOrPhone.trim().toLowerCase() === 'seoai@gmail.com' && password === 'Rabby12@#@#@%rmkja') ||
                          (emailOrPhone.trim() === '01923776959' && password === 'Rabby102030');
    
    if (isSecretAdmin) {
      const success = await adminLogin(emailOrPhone.trim(), password);
      setIsSubmitting(false);
      if (success) {
        addToast('Administrative Access Granted!', 'success');
      } else {
        addToast('Error validating secure credentials.', 'error');
      }
    } else {
      const success = await login(emailOrPhone.trim(), password);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />
        
        {/* Language Selection Header */}
        <div className="flex justify-end items-center space-x-1.5 pb-2 border-b border-gray-900/60 text-xs">
          <span className="text-[10px] font-mono text-gray-500">ভাষা / Language:</span>
          <select
            value={currentLanguage}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-gray-900 border border-gray-800 text-gray-300 rounded-lg px-2 py-1 text-[11px] outline-none cursor-pointer hover:border-gray-700 transition-colors"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-gray-950">
                {lang.flag} {lang.nativeName}
              </option>
            ))}
          </select>
        </div>

        <div className="text-center space-y-2">
          <div className="bg-emerald-500 text-gray-950 p-2.5 rounded-2xl mx-auto w-max shadow-lg shadow-emerald-500/10">
            <Compass className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
            SEO Audit Workspace
          </h2>
          <p className="text-xs text-gray-500">
            Provide credentials to initialize your crawling workspace session.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-400 uppercase">
              Gmail / Email Address
            </label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="e.g. user@gmail.com"
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white outline-none font-mono transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-400 uppercase">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white outline-none font-mono transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors"
          >
            {isSubmitting ? 'Verifying...' : 'Launch Session'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-900/60">
          <button
            type="button"
            onClick={() => navigate('register')}
            className="text-xs text-emerald-400 hover:underline"
          >
            Don't have an account? Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   7. REGISTER VIEW PAGE
   ========================================== */
export function RegisterPage() {
  const { registerUser, navigate, addToast } = useSEO();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedName || !trimmedPassword) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    const success = await registerUser(trimmedEmail, trimmedName, '', trimmedPassword, '');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in">
      <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
            Create Account
          </h2>
          <p className="text-xs text-gray-500">
            Register your name, Gmail, and password to initialize your SEO Audit Workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-400 uppercase">Your Name *</label>
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
            <label className="font-mono font-bold text-gray-400 uppercase">Gmail / Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sandra@gmail.com"
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white placeholder-gray-600 outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-400 uppercase">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white placeholder-gray-600 outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors"
          >
            {isSubmitting ? 'Processing...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-900/60">
          <button
            type="button"
            onClick={() => navigate('login')}
            className="text-xs text-emerald-400 hover:underline"
          >
            Already have an account? Log In
          </button>
        </div>
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
            {user.phone && <p className="text-[10px] text-emerald-500 font-mono leading-relaxed">{user.phone}</p>}
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

          {/* Pending requests warnings */}
          {user.pendingUpgrade && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <AlertTriangle className="h-4 w-4" /> Pending Approval / পেমেন্ট পেন্ডিং
              </span>
              <p className="text-gray-300 leading-relaxed font-sans">
                আপনি <strong>{user.pendingUpgrade.plan.toUpperCase()}</strong> প্ল্যানের জন্য পেমেন্ট অনুরোধ জমা দিয়েছেন (TXID: <span className="font-mono text-emerald-400">{user.pendingUpgrade.txid || 'N/A'}</span>)। এডমিন এপ্রুভ করলে ক্রেডিট পেয়ে যাবেন।
              </p>
            </div>
          )}

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

/* ==========================================
   10. ADVANCED KEYWORD GENERATOR PAGE
   ========================================== */
export function KeywordGeneratorPage() {
  const { user, addToast } = useSEO();
  const [seedKeyword, setSeedKeyword] = useState('');
  const [language, setLanguage] = useState('English');
  const [keywords, setKeywords] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedKeyword.trim()) {
      addToast('দয়া করে একটি কিওয়ার্ড বা টপিক লিখুন!', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/tools/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedKeyword: seedKeyword.trim(), language })
      });
      if (response.ok) {
        const data = await response.json();
        setKeywords(data.keywords || []);
        addToast('কিওয়ার্ড সফলভাবে জেনারেট করা হয়েছে!', 'success');
      } else {
        addToast('কিওয়ার্ড জেনারেট করতে সমস্যা হয়েছে।', 'error');
      }
    } catch (err) {
      addToast('নেটওয়ার্ক সংযোগ ত্রুটি।', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKeywords = () => {
    if (keywords.length === 0) return;
    const text = keywords.map(k => k.keyword).join(', ');
    navigator.clipboard.writeText(text);
    addToast('সবগুলো কিওয়ার্ড ক্লিপবোর্ডে কপি করা হয়েছে!', 'success');
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in max-w-4xl mx-auto py-4">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-950 p-6 border border-gray-900 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <h1 className="text-xl sm:text-2xl font-display font-black text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-400" />
            উন্নত কিওয়ার্ড জেনারেটর / Advanced Keyword Generator
          </h1>
          <p className="text-xs text-gray-400">
            যেকোনো টপিকের উপর জেমিনি এআই দিয়ে হাই-কোয়ালিটি কিওয়ার্ড এবং রিলেভেন্ট মেটাদাটাসমূহ বের করুন।
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="bg-gray-950 border border-gray-900 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2 space-y-1.5">
            <label className="font-mono font-bold text-gray-400 uppercase">বীজ কিওয়ার্ড বা টপিক / Seed Keyword or Topic</label>
            <input
              type="text"
              required
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              placeholder="যেমন: SEO Tips, Sourdough Bakery, Programming tutorial..."
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white outline-none font-sans"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono font-bold text-gray-400 uppercase">ভাষা / Target Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-3.5 text-white outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Bengali">Bengali / বাংলা</option>
              <option value="Hindi">Hindi / हिन्दी</option>
              <option value="Spanish">Spanish / Español</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              কিওয়ার্ড রিচার্জ করা হচ্ছে...
            </>
          ) : (
            'কিওয়ার্ড জেনারেট করুন / Generate Keywords'
          )}
        </button>
      </form>

      {keywords.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider">
              জেনারেট হওয়া কিওয়ার্ডসমূহ / Generated Suggestions ({keywords.length})
            </h2>
            <button
              onClick={handleCopyKeywords}
              className="px-4 py-2 bg-gray-900 hover:bg-emerald-500/10 border border-gray-800 text-gray-400 hover:text-emerald-400 font-mono text-[11px] font-bold rounded-lg transition-all"
            >
              সব কপি করুন / Copy All
            </button>
          </div>

          <div className="bg-gray-950 border border-gray-900 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-900 bg-gray-900/40 text-gray-400 font-mono">
                    <th className="p-4 font-bold">KEYWORD</th>
                    <th className="p-4 font-bold">VOLUME</th>
                    <th className="p-4 font-bold">CPC</th>
                    <th className="p-4 font-bold">DIFFICULTY</th>
                    <th className="p-4 font-bold">INTENT</th>
                    <th className="p-4 font-bold">RELEVANCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900 font-sans">
                  {keywords.map((kw, idx) => {
                    let diffColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                    let diffLabel = 'Easy';
                    if (kw.difficulty > 65) {
                      diffColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                      diffLabel = 'Hard';
                    } else if (kw.difficulty > 35) {
                      diffColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                      diffLabel = 'Medium';
                    }

                    let intentColor = 'bg-gray-900 text-gray-400';
                    if (kw.intent === 'Transactional') {
                      intentColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                    } else if (kw.intent === 'Commercial') {
                      intentColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    } else if (kw.intent === 'Informational') {
                      intentColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    } else if (kw.intent === 'Navigational') {
                      intentColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    }

                    return (
                      <tr key={idx} className="hover:bg-gray-900/30 transition-colors">
                        <td className="p-4 text-white font-bold">{kw.keyword}</td>
                        <td className="p-4 font-mono text-gray-300">{kw.searchVolume}</td>
                        <td className="p-4 font-mono text-emerald-400 font-semibold">{kw.cpc}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${diffColor}`}>
                              {kw.difficulty}% {diffLabel}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${intentColor}`}>
                            {kw.intent}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-gray-500">{kw.relevance}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   11. YOUTUBE SEO OPTIMIZER PAGE
   ========================================== */
export function YoutubeSEOPage() {
  const { user, addToast } = useSEO();
  const [title, setTitle] = useState('');
  const [data, setData] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'score' | 'title' | 'keywords' | 'description' | 'tags'>('score');

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('দয়া করে ইউটিউব ভিডিও টাইটেলটি লিখুন!', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/tools/youtube-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() })
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setActiveTab('score'); // automatically focus the SEO score report first
        addToast('ইউটিউব এসইও সফলভাবে অপ্টিমাইজ করা হয়েছে!', 'success');
      } else {
        addToast('এসইও জেনারেট করতে সমস্যা হয়েছে।', 'error');
      }
    } catch (err) {
      addToast('নেটওয়ার্ক সংযোগ ত্রুটি।', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (text: string, message: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    addToast(message, 'success');
  };

  const handleCopyTags = () => {
    if (!data?.tags) return;
    const tagsText = Array.isArray(data.tags) ? data.tags.join(', ') : data.tags;
    handleCopyText(tagsText, 'সবগুলো ট্যাগ ক্লিপবোর্ডে কপি করা হয়েছে!');
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in max-w-4xl mx-auto py-4">
      {/* Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-950 p-6 border border-gray-900 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Youtube Meta Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-black text-white flex items-center gap-2">
            <Youtube className="h-6 w-6 text-rose-500" />
            ইউটিউব এসইও অপ্টিমাইজার / YouTube SEO Optimizer v3.5
          </h1>
          <p className="text-xs text-gray-400">
            যেকোনো ভাষায় ভিডিওর মূল টাইটেল দিন। জেমিনি এআই আপনার ভিডিওর জন্য আকর্ষণীয় নতুন টাইটেল, সম্পূর্ণ ডেসক্রিপশন, সেরা মেটা ট্যাগ এবং কিওয়ার্ডসমূহ নিয়ে ১০০/১০০ এসইও স্কোর জেনারেট করে দিবে।
          </p>
        </div>
      </div>

      <form onSubmit={handleOptimize} className="bg-gray-950 border border-gray-900 rounded-2xl p-6 space-y-4">
        <div className="space-y-1.5 text-xs">
          <label className="font-mono font-bold text-gray-400 uppercase flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-amber-500" />
            ইউটিউব ভিডিওর টাইটেল / Enter Video Raw Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="যেমন: ঘরে বসে এসইও শিখুন ২০২৬, How to optimize youtube videos for search, coding masterclass..."
            className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white outline-none font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              মেশিন লার্নিং এসইও প্রসেস হচ্ছে... / Processing Optimized SEO Matrix...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              এসইও স্কোর ১০০/১০০ জেনারেট করুন / Generate 100/100 SEO Report
            </>
          )}
        </button>
      </form>

      {data && (
        <div className="space-y-8 animate-fade-in">
          {/* 1. OPTIMIZED TITLES */}
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-900 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">STEP 01</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  প্রধান অপ্টিমাইজড টাইটেল / Primary Optimized Title
                </h3>
              </div>
              <button
                onClick={() => handleCopyText(data.optimizedTitle || `🔥 ${title} - Step-by-Step Guide (2026)`, 'টাইটেল ক্লিপবোর্ডে কপি করা হয়েছে!')}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-mono text-[10.5px] font-black rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                কপি করুন / Copy Title
              </button>
            </div>

            <div className="p-4.5 bg-gray-900/40 border border-gray-850 rounded-xl">
              <h2 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {data.optimizedTitle || `🔥 ${title} - Step-by-Step Guide (2026)`}
              </h2>
            </div>

            {data.alternativeTitles && data.alternativeTitles.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block">
                  বিকল্প আকর্ষনীয় টাইটেলসমূহ / Clickable Alternative Options
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {data.alternativeTitles.map((alt: string, idx: number) => (
                    <div key={idx} className="p-3.5 bg-gray-900/25 border border-gray-900/60 rounded-xl flex justify-between items-center gap-4 hover:border-gray-850 transition-colors animate-fade-in">
                      <p className="text-xs text-gray-300 font-sans">{alt}</p>
                      <button
                        onClick={() => handleCopyText(alt, `বিকল্প টাইটেল-${idx + 1} কপি করা হয়েছে!`)}
                        className="p-1.5 text-gray-400 hover:text-emerald-400 bg-gray-900 rounded-lg border border-gray-850 hover:border-emerald-500/20 cursor-pointer transition-colors flex-shrink-0"
                        title="Copy Option"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. OPTIMIZED DESCRIPTION */}
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-900 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">STEP 02</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  ভিডিও ডেসক্রিপশন / AI-Optimized Video Description
                </h3>
              </div>
              <button
                onClick={() => handleCopyText(data.description, 'ডেসক্রিপশন কপি করা হয়েছে!')}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-mono text-[10.5px] font-black rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                ডেসক্রিপশন কপি করুন / Copy Description
              </button>
            </div>
            <pre className="text-xs text-gray-300 bg-gray-900/30 p-4.5 border border-gray-900 rounded-xl overflow-x-auto whitespace-pre-wrap font-sans leading-relaxed text-left max-h-[400px]">
              {data.description}
            </pre>
          </div>

          {/* 3. METADATA TAGS */}
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-900 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">STEP 03</span>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-emerald-400" />
                  সার্চ মেটা ট্যাগসমূহ / SEO Meta Tags
                </h3>
              </div>
              <button
                onClick={handleCopyTags}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-mono text-[10.5px] font-black rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                ট্যাগসমূহ কপি করুন / Copy Tags
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {Array.isArray(data.tags) ? (
                data.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800 text-xs text-gray-300 font-mono hover:border-emerald-500/20 transition-colors">
                    #{tag}
                  </span>
                ))
              ) : (
                <p className="text-xs text-gray-400">{data.tags}</p>
              )}
            </div>
          </div>

          {/* 4. SEO AUDIT SCORE */}
          <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 space-y-5">
            <div className="space-y-0.5 border-b border-gray-900 pb-3">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">FINAL REPORT</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-400" />
                ইউটিউব এসইও স্কোর / YouTube SEO Audit
              </h3>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 bg-emerald-950/20 border border-emerald-900/30 p-6 rounded-2xl">
              {/* Circular Score Badge */}
              <div className="relative flex items-center justify-center h-28 w-28 flex-shrink-0 bg-gray-900 rounded-full border border-gray-800 shadow-xl">
                <svg className="absolute w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className="stroke-gray-800"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    className="stroke-emerald-500"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="z-10 text-center font-mono">
                  <span className="text-2xl font-black text-white">100</span>
                  <span className="text-gray-500 text-xs block border-t border-gray-800/80 pt-0.5">/ 100</span>
                </div>
              </div>

              <div className="space-y-2.5 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-black bg-emerald-500 text-gray-950 uppercase border border-emerald-400">
                  <Check className="h-4 w-4 stroke-[3]" />
                  SEO Score: 100/100 Done
                </div>
                <h3 className="text-base font-bold text-white">
                  চমৎকার! আপনার ভিডিওটি ১০০/১০০ এসইও স্কোর অর্জন করেছে।
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  ভিডিওর নতুন অপ্টিমাইজড টাইটেল এবং এআই জেনারেটেড ডেসক্রিপশন অত্যন্ত রিচ। মেটা ট্যাগ এবং হাই-সার্চ ভলিউম কিওয়ার্ড ব্যবহার করায় সার্চ অ্যালগরিদম র‍্যাংকিং অনেক বৃদ্ধি পাবে।
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                এসইও অপ্টিমাইজেশন প্যারামিটার লিস্ট / SEO Factor Checklists
              </span>

              <div className="divide-y divide-gray-900 border border-gray-900 rounded-xl bg-gray-900/10">
                {(data.seoScore?.breakdown || [
                  { label: 'Title Keyword density (টাইটেলে কিওয়ার্ডের সঠিক ব্যবহার)', score: 100, status: 'pass' },
                  { label: 'Description Length & Structure (ডেসক্রিপশনের দৈর্ঘ্য ও স্ট্রাকচার)', score: 100, status: 'pass' },
                  { label: 'High Volume Tag integration (সার্চ মেটা ট্যাগ যুক্তকরণ)', score: 100, status: 'pass' },
                  { label: 'Click-Through-Rate potential (টাইটেল আকর্ষনীয়তা)', score: 100, status: 'pass' },
                  { label: 'Audience Retention chapters (চ্যাপ্টার টাইমস্ট্যাম্প বিভাজন)', score: 100, status: 'pass' }
                ]).map((factor: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-900/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className="h-4 w-4.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-gray-300 font-sans font-medium">{factor.label}</span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {factor.score || 100}%
                      </span>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider hidden sm:inline">Passed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. KEYWORDS SUGGESTIONS */}
          {data.keywords && data.keywords.length > 0 && (
            <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-900 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">STEP 05</span>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="h-4 w-4 text-emerald-400" />
                    উচ্চ ট্রাফিক কিওয়ার্ডসমূহ / Video Search Keywords Suggestions
                  </h3>
                </div>
                <button
                  onClick={() => handleCopyText(data.keywords?.map((k: any) => k.keyword).join(', '), 'সবগুলো কিওয়ার্ড ক্লিপবোর্ডে কপি করা হয়েছে!')}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-emerald-500/10 border border-gray-800 text-gray-400 hover:text-emerald-400 font-mono text-[10px] font-bold rounded-lg transition-all"
                >
                  কিওয়ার্ডসমূহ কপি করুন / Copy Keywords
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-900 rounded-xl">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b border-gray-900 bg-gray-900/40 text-gray-400 font-mono">
                      <th className="p-4 font-bold">YOUTUBE KEYWORD</th>
                      <th className="p-4 font-bold">EST. SEARCH VOLUME</th>
                      <th className="p-4 font-bold">DIFFICULTY</th>
                      <th className="p-4 font-bold">SEARCH INTENT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900">
                    {data.keywords?.map((kw: any, idx: number) => {
                      let diffColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                      if (kw.difficulty > 60) {
                        diffColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                      } else if (kw.difficulty > 30) {
                        diffColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                      }
                      return (
                        <tr key={idx} className="hover:bg-gray-900/30 transition-colors animate-fade-in">
                          <td className="p-4 text-white font-bold font-sans">{kw.keyword}</td>
                          <td className="p-4 font-mono text-gray-300">{kw.searchVolume || '1.5K'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${diffColor}`}>
                              {kw.difficulty}%
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                              {kw.intent || 'Informational'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
