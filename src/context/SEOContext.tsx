import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SEOAuditReport, AuditHistoryItem } from '../../shared/types';
import { getHistoryList, deleteReport, getReportDetails, runSEOAudit } from '../services/api';

export type VisualTheme = 'dark' | 'light' | 'midnight';

export type AppView = 
  | 'dashboard' 
  | 'new-audit' 
  | 'history' 
  | 'reports' 
  | 'settings' 
  | 'login' 
  | 'register' 
  | 'profile'
  | '404';

export interface UserSession {
  email: string;
  name: string;
  role: 'Premium Developer' | 'SEO Analyst' | 'Guest Explorer';
  credits: number;
  company?: string;
  avatarUrl?: string;
}

export interface CrawlSettings {
  maxDepth: number;
  userAgent: string;
  checkBrokenLinks: boolean;
  concurrencyLimit: number;
  autoAnalyzeWithGemini: boolean;
  alertEmail: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface SEOContextType {
  currentView: AppView;
  navigate: (view: AppView) => void;
  user: UserSession | null;
  login: (email: string, name: string, role?: string) => void;
  logout: () => void;
  registerUser: (email: string, name: string, company: string) => void;
  theme: VisualTheme;
  setTheme: (t: VisualTheme) => void;
  settings: CrawlSettings;
  updateSettings: (s: Partial<CrawlSettings>) => void;
  reports: SEOAuditReport[];
  selectedReportId: string | null;
  selectReport: (id: string | null) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  triggerAudit: (url: string) => Promise<SEOAuditReport>;
  deleteAuditReport: (id: string) => Promise<void>;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  historyList: AuditHistoryItem[];
  reloadHistory: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterStatus: 'all' | 'high-score' | 'low-score' | 'warnings';
  setFilterStatus: (status: 'all' | 'high-score' | 'low-score' | 'warnings') => void;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

// Generate deep sample report to seed visual components in Dashboard/Reports view when there are no real reports yet
const SAMPLE_REPORTS: SEOAuditReport[] = [
  {
    id: "sample-google",
    url: "https://google.com",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    overallScore: 94,
    scores: {
      onPage: 92,
      technical: 96,
      performance: 94
    },
    metrics: {
      title: {
        value: "Google",
        length: 6,
        status: "pass",
        message: "Meta title is present but quite compact (6 characters). Highly authoritative.",
      },
      description: {
        value: "Search the world's information, including webpages, images, videos and more.",
        length: 76,
        status: "pass",
        message: "Meta description is well formulated, providing excellent search indexing context.",
      },
      headings: {
        value: "H1 present",
        h1Count: 1,
        list: [
          { type: "h1", text: "Google Web Services" },
          { type: "h2", text: "Explore Search Utilities" },
          { type: "h2", text: "Privacy and Policy Guidelines" }
        ],
        status: "pass",
        message: "Exactly one primary H1 header defines the page's topical scope."
      },
      images: {
        value: "1 of 1 with alt tags",
        total: 1,
        missingAlt: 0,
        status: "pass",
        message: "All images include descriptive alternative alt attributes for accessibility."
      },
      links: {
        value: "12 links",
        total: 12,
        internal: 8,
        external: 4,
        status: "pass",
        message: "All outbound link channels are responding with healthy status codes."
      },
      technical: {
        value: "Secure HTTPS",
        hasSitemap: true,
        hasRobots: true,
        isHttps: true,
        status: "pass",
        message: "Secure SSL verified. Robots.txt rules and Sitemap channels are visible."
      },
      performance: {
        value: "210ms load",
        loadTimeMs: 210,
        pageSizeKb: 142,
        status: "pass",
        message: "Server responsive. Payload sizes are highly optimized."
      }
    },
    aiRecommendations: "### SEO Tactical Action Plan\n\n1. **Expand Content Density**: Your landing page features a low text-to-code ratio. Adding 150-300 words of rich, semantic indexable copy will bolster long-tail keyword associations.\n\n2. **Extend Meta Title**: While 'Google' is highly recognizable, targeting 40-60 characters incorporating localized intent can capture higher regional relevance.\n\n3. **Structured Schema Mapping**: Leverage specific WebSite schemas rather than basic inline declarations to empower Rich Snippets displays."
  },
  {
    id: "sample-startup",
    url: "https://my-local-bakery-draft.dev",
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    overallScore: 54,
    scores: {
      onPage: 45,
      technical: 50,
      performance: 67
    },
    metrics: {
      title: {
        value: "Home Page",
        length: 9,
        status: "error",
        message: "Title is generic ('Home Page') and fails to include brand or key services.",
        recommendation: "Change page title to 'Artisanal Bakery & Fresh Pastries | [City Name] Bread Co.'"
      },
      description: {
        value: "",
        length: 0,
        status: "error",
        message: "Meta description tag is missing completely. Search engines will pull random content.",
        recommendation: "Create an elegant meta description summary under 155 characters highlighting warm organic breads."
      },
      headings: {
        value: "0 H1 tags detected",
        h1Count: 0,
        list: [
          { type: "h2", text: "Welcome to Our Oven!" },
          { type: "h2", text: "Daily Specialties" },
          { type: "h3", text: "Our Sourdough Recipe" }
        ],
        status: "error",
        message: "No top-level H1 heading was found. Structural hierarchy is compromised.",
        recommendation: "Wrap the main brand greeting in a single <h1> tag near the top of the viewport."
      },
      images: {
        value: "2 of 9 with alt tags",
        total: 9,
        missingAlt: 7,
        status: "warning",
        message: "7 image assets are missing 'alt' descriptions. Crawlers cannot index these visual resources.",
        recommendation: "Introduce precise alt properties like alt=\"fresh baked organic sourdough boule on rustic cutting board\"."
      },
      links: {
        value: "14 links (2 broken)",
        total: 14,
        internal: 10,
        external: 4,
        status: "error",
        message: "2 unique links returned error responses (404 Not Found). This increases bounce rate.",
        recommendation: "Update links targeting /our-menu-old.html and /partners-draft to live destination URLs."
      },
      technical: {
        value: "Insecure Connection",
        hasSitemap: false,
        hasRobots: true,
        isHttps: false,
        status: "error",
        message: "The page does not enforce secure HTTPS connections. Robots.txt is present but Sitemap is missing.",
        recommendation: "Install a Let's Encrypt SSL certificate and host a sitemap.xml listing all menu pages."
      },
      performance: {
        value: "1850ms load",
        loadTimeMs: 1850,
        pageSizeKb: 1205,
        status: "warning",
        message: "Payload weight exceeds 1.2MB. High load times damage mobile traffic conversion rates.",
        recommendation: "Optimize massive header images into WebP formats to reduce overall payload sizes."
      }
    },
    aiRecommendations: "### SEO Tactical Action Plan\n\n1. **Resolve Security Protocols**: Immediately configure HTTPS redirect filters to prevent browser alerts labeling your bakery site insecure.\n\n2. **H1 & On-Page Titles**: Restructure the heading hierarchy. Make sure \"Artisanal Sourdough & Pastries\" is wrapped inside a single <h1> element.\n\n3. **Content Expansion**: Write localized copy describing daily oven schedules. Aim for at least 450 words of rich content targeting local search intents."
  }
];

export function SEOProvider({ children }: { children: ReactNode }) {
  const [currentView, setView] = useState<AppView>('dashboard');
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('seo_user');
    return saved ? JSON.parse(saved) : {
      email: 'analyst@seopro.com',
      name: 'Alex Sterling',
      role: 'Premium Developer',
      credits: 88,
      company: 'Growth Labs LLC',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
    };
  });
  
  const [theme, setThemeState] = useState<VisualTheme>(() => {
    return (localStorage.getItem('seo_theme') as VisualTheme) || 'midnight';
  });

  const [settings, setSettings] = useState<CrawlSettings>(() => {
    const saved = localStorage.getItem('seo_settings');
    return saved ? JSON.parse(saved) : {
      maxDepth: 3,
      userAgent: 'SEO-Audit-AI-Pro-Engine/2.0',
      checkBrokenLinks: true,
      concurrencyLimit: 4,
      autoAnalyzeWithGemini: true,
      alertEmail: 'alerts@growthlabs.com'
    };
  });

  const [reports, setReports] = useState<SEOAuditReport[]>(SAMPLE_REPORTS);
  const [selectedReportId, setSelectedReportId] = useState<string | null>('sample-google');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [historyList, setHistoryList] = useState<AuditHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'high-score' | 'low-score' | 'warnings'>('all');

  // Load history from express database container
  const reloadHistory = async () => {
    try {
      const data = await getHistoryList();
      setHistoryList(data);
      
      // Load all available full reports from the database in the background to join with SAMPLE_REPORTS
      if (data.length > 0) {
        const fullReports: SEOAuditReport[] = [];
        for (const item of data.slice(0, 5)) { // Get up to 5 full reports to join
          try {
            const detail = await getReportDetails(item.id);
            fullReports.push(detail);
          } catch {
            // Ignore single failing fetches
          }
        }
        
        setReports(prev => {
          const merged = [...fullReports, ...prev.filter(p => !p.id.startsWith('sample-'))];
          // Ensure we always keep sample reports if there's no real ones, or append them
          const finalReportList = merged.length > 0 ? merged : SAMPLE_REPORTS;
          
          // Deduplicate by ID
          const uniqueMap = new Map<string, SEOAuditReport>();
          finalReportList.forEach(r => uniqueMap.set(r.id, r));
          return Array.from(uniqueMap.values());
        });
      }
    } catch {
      // Quiet fail if server is starting up or disconnected
    }
  };

  useEffect(() => {
    reloadHistory();
  }, []);

  // Sync theme to document body
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'midnight');
    
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'midnight') {
      root.classList.add('midnight');
    } else {
      root.classList.add('dark');
    }
    
    localStorage.setItem('seo_theme', theme);
  }, [theme]);

  const setTheme = (t: VisualTheme) => {
    setThemeState(t);
    addToast(`Visual palette updated to ${t.toUpperCase()}`, 'info');
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = (email: string, name: string, role = 'Premium Developer') => {
    const newSession: UserSession = {
      email,
      name,
      role: role as any,
      credits: 99,
      company: 'Growth Labs LLC',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    };
    setUser(newSession);
    localStorage.setItem('seo_user', JSON.stringify(newSession));
    addToast(`Welcome back, ${name}! Session initialized.`, 'success');
    setView('dashboard');
  };

  const registerUser = (email: string, name: string, company: string) => {
    const newSession: UserSession = {
      email,
      name,
      role: 'SEO Analyst',
      credits: 50,
      company,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    };
    setUser(newSession);
    localStorage.setItem('seo_user', JSON.stringify(newSession));
    addToast(`Registration complete! Active workspace: ${company}`, 'success');
    setView('dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('seo_user');
    addToast('Logged out. Session cleared.', 'info');
    setView('login');
  };

  const updateSettings = (newSet: Partial<CrawlSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSet };
      localStorage.setItem('seo_settings', JSON.stringify(merged));
      return merged;
    });
    addToast('Crawl parameters saved successfully.', 'success');
  };

  const triggerAudit = async (url: string): Promise<SEOAuditReport> => {
    setIsLoading(true);
    try {
      addToast(`Initiating crawl of ${url}...`, 'info');
      const report = await runSEOAudit(url);
      
      setReports(prev => [report, ...prev]);
      setSelectedReportId(report.id);
      
      // Deduct client-side mock credits for realism
      if (user) {
        const updatedUser = { ...user, credits: Math.max(0, user.credits - 1) };
        setUser(updatedUser);
        localStorage.setItem('seo_user', JSON.stringify(updatedUser));
      }

      addToast(`Audit complete! Score: ${report.overallScore}/100`, 'success');
      await reloadHistory();
      return report;
    } catch (err: any) {
      addToast(err.message || 'Audit failed.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAuditReport = async (id: string) => {
    try {
      if (!id.startsWith('sample-')) {
        await deleteReport(id);
      }
      setReports(prev => prev.filter(r => r.id !== id));
      if (selectedReportId === id) {
        setSelectedReportId(reports.find(r => r.id !== id)?.id || null);
      }
      addToast('Audit removed from vault.', 'success');
      await reloadHistory();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete report.', 'error');
    }
  };

  const selectReport = (id: string | null) => {
    setSelectedReportId(id);
    if (id) {
      setView('reports');
    }
  };

  const navigate = (view: AppView) => {
    setView(view);
  };

  return (
    <SEOContext.Provider value={{
      currentView,
      navigate,
      user,
      login,
      logout,
      registerUser,
      theme,
      setTheme,
      settings,
      updateSettings,
      reports,
      selectedReportId,
      selectReport,
      isLoading,
      setIsLoading,
      triggerAudit,
      deleteAuditReport,
      toasts,
      addToast,
      removeToast,
      historyList,
      reloadHistory,
      searchQuery,
      setSearchQuery,
      filterStatus,
      setFilterStatus
    }}>
      {children}
    </SEOContext.Provider>
  );
}

export function useSEO() {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEO must be used within an SEOProvider');
  }
  return context;
}
