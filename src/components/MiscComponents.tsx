import { useState } from 'react';
import { useSEO, VisualTheme, AppView } from '../context/SEOContext';
import { SEOAuditReport } from '../../shared/types';
import { 
  Sun, 
  Moon, 
  Palette, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  User, 
  LogOut, 
  RefreshCw, 
  AlertOctagon, 
  Layout, 
  Loader2,
  Sparkles
} from 'lucide-react';

/* ==========================================
   1. Theme Switcher Component
   ========================================== */
export function ThemeSwitcher() {
  const { theme, setTheme } = useSEO();

  const themes: { id: VisualTheme; icon: any; label: string; bg: string }[] = [
    { id: 'light', icon: Sun, label: 'Light', bg: 'hover:text-amber-500' },
    { id: 'dark', icon: Moon, label: 'Dark Void', bg: 'hover:text-indigo-400' },
    { id: 'midnight', icon: Palette, label: 'Midnight Slate', bg: 'hover:text-emerald-400' }
  ];

  return (
    <div className="flex items-center space-x-1.5 bg-gray-900 border border-gray-800 p-1 rounded-xl">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`p-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${t.bg} ${
              isActive
                ? 'bg-gray-950 text-emerald-400 border border-gray-800/80 shadow'
                : 'text-gray-500 hover:bg-gray-950/40'
            }`}
            title={t.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden lg:inline text-[10px] font-mono font-bold uppercase tracking-wider">{t.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ==========================================
   2. Export Buttons Component
   ========================================== */
export function ExportButtons({ report }: { report: SEOAuditReport }) {
  const { addToast } = useSEO();
  const [downloading, setDownloading] = useState<'csv' | 'pdf' | null>(null);

  const exportCSV = () => {
    setDownloading('csv');
    addToast('Parsing meta tags & structural layout into spreadsheet metrics...', 'info');

    setTimeout(() => {
      // Create CSV mock string
      const dataRows = [
        ['SEO AUDIT REPORT', report.url],
        ['CRAWL TIMESTAMP', report.timestamp],
        ['OVERALL COMPLIANCE', `${report.overallScore}/100`],
        [],
        ['METRIC', 'SCORE/VALUE', 'DIAGNOSTIC MESSAGE'],
        ['On-page SEO', `${report.scores.onPage}/100`, report.metrics.title.message],
        ['Technical SEO', `${report.scores.technical}/100`, report.metrics.technical.message],
        ['Performance SEO', `${report.scores.performance}/100`, report.metrics.performance.message],
        ['Title Tag', report.metrics.title.value, report.metrics.title.message],
        ['Description Tag', report.metrics.description.value, report.metrics.description.message],
        ['H1 Header Count', report.metrics.headings.h1Count, report.metrics.headings.message],
        ['Image Alt Tag Status', report.metrics.images.value, report.metrics.images.message],
        ['Crawl Load Time', report.metrics.performance.value, report.metrics.performance.message]
      ];

      const csvContent = "data:text/csv;charset=utf-8," 
        + dataRows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `seo_audit_${report.url.replace(/^https?:\/\//, '').replace(/\//g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloading(null);
      addToast('SEO audit spreadsheet downloaded successfully!', 'success');
    }, 1500);
  };

  const exportPDF = () => {
    setDownloading('pdf');
    addToast('Composing printable optimization blueprint details...', 'info');

    setTimeout(() => {
      // Simulate client-side print layout trigger
      window.print();
      setDownloading(null);
      addToast('Print layout formatted. Download complete.', 'success');
    }, 1500);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={exportCSV}
        disabled={!!downloading}
        className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
      >
        {downloading === 'csv' ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
        )}
        <span className="hidden sm:inline">EXPORT CSV</span>
      </button>

      <button
        onClick={exportPDF}
        disabled={!!downloading}
        className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors"
      >
        {downloading === 'pdf' ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
        ) : (
          <FileText className="h-4 w-4 text-blue-400" />
        )}
        <span className="hidden sm:inline">EXPORT PDF</span>
      </button>
    </div>
  );
}

/* ==========================================
   3. Progressive Gauge / Progress Bar
   ========================================== */
export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const getColors = (v: number) => {
    if (v >= 80) return 'bg-emerald-500';
    if (v >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-1 w-full">
      {label && (
        <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">
          <span>{label}</span>
          <span className="text-white">{value}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-gray-900 border border-gray-800/60 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${getColors(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/* ==========================================
   4. Loading Stream / Animation Component
   ========================================== */
export function LoadingAnimation({ url }: { url: string }) {
  const [streamIdx, setStreamIdx] = useState(0);

  const streams = [
    `Connecting via TLS handshake to target node: ${url}`,
    'Negotiating SEO-Audit-AI-Pro-Engine user agent configurations',
    'HTML body successfully fetched (status 200). Length calculated',
    'Executing element scavengers over meta structures...',
    'Analyzing Title, Description and Canonical links',
    'Walking Document Object Model to build heading tree hierarchy',
    'Evaluating accessibility metadata tags across images',
    'Firing out live HEAD requests to test outbound broken links',
    'Reading root files for Robots.txt rules and Sitemap channels',
    'Feeding diagnostic report structures to Gemini Pro LLM engine...',
    'Synthesizing ultimate tactical recommendations blueprint'
  ];

  // Increment console text sequentially for realism
  useState(() => {
    const timer = setInterval(() => {
      setStreamIdx(prev => {
        if (prev < streams.length - 1) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 1200);
    return () => clearInterval(timer);
  });

  return (
    <div className="bg-gray-950 border border-gray-900 rounded-2xl p-6 md:p-10 text-center space-y-6 max-w-xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 animate-pulse" />
      
      <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
        <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Running SEO Index Scrapers</h3>
        <p className="text-xs text-gray-500">Scanning metadata, broken anchors, and compiling optimization scores.</p>
      </div>

      {/* Retro Crawler Console log output */}
      <div className="bg-black/80 border border-gray-900 rounded-xl p-4 text-left font-mono text-[10px] text-emerald-400 space-y-1.5 h-36 overflow-y-auto leading-relaxed shadow-inner">
        <div className="text-gray-600 border-b border-gray-900 pb-1.5 flex justify-between uppercase">
          <span>PRO-ENGINE CONSOLE v2.0</span>
          <span className="animate-pulse">● CRAWLING</span>
        </div>
        {streams.slice(0, streamIdx + 1).map((log, idx) => (
          <div key={idx} className="flex items-start space-x-2 animate-fade-in">
            <span className="text-emerald-600 select-none">&gt;&gt;</span>
            <span className={idx === streamIdx ? 'text-white' : ''}>{log}</span>
          </div>
        ))}
        {streamIdx < streams.length - 1 && (
          <div className="w-1.5 h-3.5 bg-emerald-400 animate-pulse inline-block mt-0.5" />
        )}
      </div>
    </div>
  );
}

/* ==========================================
   5. Search Bar Component
   ========================================== */
export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search ledger records..."}
        className="w-full bg-gray-900/60 border border-gray-800 focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none outline-0 transition-colors"
      />
    </div>
  );
}

/* ==========================================
   6. User Profile Menu Dropdown Component
   ========================================== */
export function UserMenu() {
  const { user, logout, navigate } = useSEO();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2.5 p-1.5 hover:bg-gray-900 border border-transparent hover:border-gray-900 rounded-xl transition-all cursor-pointer"
      >
        <img 
          src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'} 
          alt="User Profile avatar" 
          className="h-8 w-8 rounded-lg bg-gray-950 border border-gray-900"
        />
        <div className="hidden sm:block text-left max-w-[100px]">
          <p className="text-[11px] font-bold text-white truncate leading-tight">{user.name}</p>
          <span className="text-[9px] text-emerald-400 font-mono font-bold block">{user.credits} CR</span>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2.5 w-52 bg-gray-950 border border-gray-900 rounded-xl shadow-2xl p-2 z-50 animate-fade-in text-xs font-sans">
            <div className="p-3 border-b border-gray-900 space-y-1">
              <p className="font-bold text-white leading-none">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate leading-none">{user.email}</p>
            </div>

            <div className="p-1 space-y-0.5">
              <button
                onClick={() => { navigate('profile'); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <User className="h-4 w-4 text-emerald-400" />
                <span>My Profile Summary</span>
              </button>
              
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/20 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ==========================================
   7. Empty State Component
   ========================================== */
export function EmptyState({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="bg-gray-950 border border-gray-900 rounded-2xl p-10 text-center space-y-4 max-w-md mx-auto shadow-sm">
      <div className="bg-gray-900/60 p-3.5 rounded-full border border-gray-900 w-max mx-auto text-gray-600">
        <Layout className="h-7 w-7" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-gray-200">Catalog entry empty</h4>
        <p className="text-xs text-gray-500 leading-relaxed font-sans">{message}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-lg text-xs tracking-wide cursor-pointer transition-colors uppercase font-mono"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ==========================================
   8. Error State Component
   ========================================== */
export function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="bg-rose-950/10 border border-rose-500/20 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto shadow-lg">
      <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/20 w-max mx-auto text-rose-400">
        <AlertOctagon className="h-6 w-6" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider font-mono">System Diagnostic Warning</h4>
        <p className="text-xs text-gray-400 leading-relaxed font-sans">{error || 'An unexpected socket exception was caught.'}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-1.5 mx-auto px-4 py-2 bg-rose-950/30 hover:bg-rose-900/20 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 font-bold tracking-wide cursor-pointer transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>RETRY SCANNING SEQUENCE</span>
        </button>
      )}
    </div>
  );
}
