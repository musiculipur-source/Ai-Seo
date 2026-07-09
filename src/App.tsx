import { SEOProvider, useSEO } from './context/SEOContext';
import Sidebar from './components/Sidebar';
import ToastNotification from './components/ToastNotification';
import { 
  DashboardPage, 
  NewAuditPage, 
  HistoryPage, 
  ReportsPage, 
  SettingsPage, 
  LoginPage, 
  RegisterPage, 
  ProfilePage, 
  NotFoundPage,
  KeywordGeneratorPage,
  YoutubeSEOPage
} from './components/PageViews';
import PlansPage from './components/PlansPage';
import AdminPanel from './components/AdminPanel';

function AppContent() {
  const { currentView, user } = useSEO();

  // If user is not logged in, force Login screen layout unless registering
  const renderView = () => {
    if (!user) {
      if (currentView === 'register') {
        return <RegisterPage />;
      }
      return <LoginPage />;
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'new-audit':
        return <NewAuditPage />;
      case 'history':
        return <HistoryPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'profile':
        return <ProfilePage />;
      case 'plans':
        return <PlansPage />;
      case 'admin':
        return <AdminPanel />;
      case 'keyword-generator':
        return <KeywordGeneratorPage />;
      case 'youtube-seo':
        return <YoutubeSEOPage />;
      case '404':
        return <NotFoundPage />;
      default:
        return <NotFoundPage />;
    }
  };

  const isAuthPage = !user || currentView === 'login' || currentView === 'register';

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col md:flex-row selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* 1. Sidebar Navigation - Collapsible on Desktop / Drawer on Mobile */}
      {!isAuthPage && <Sidebar />}

      {/* 2. Main Analytics Viewport */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header telemetry line */}
        {!isAuthPage && (
          <header className="hidden md:flex items-center justify-between border-b border-gray-900 px-6 lg:px-8 py-3 bg-gray-950">
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                AI CONSOLE ENGINE STATUS: ACTIVE
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-[10px] font-mono text-gray-500">
                AUDIT CREDITS: <span className="text-emerald-400 font-bold">{user?.credits}</span>
              </span>
              <div className="h-3 w-[1px] bg-gray-900" />
              <span className="text-[10px] font-mono text-gray-500 uppercase">
                COGNITIVE ROLE: <span className="text-emerald-400 font-bold">{user?.role}</span>
              </span>
            </div>
          </header>
        )}

        {/* Dynamic viewport page switch */}
        <div className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </div>

        {/* Luxury minimalist footer */}
        <footer className="border-t border-gray-900/60 py-5 text-center text-gray-600 text-[9px] font-mono uppercase tracking-widest bg-gray-950/20">
          <span>&copy; {new Date().getFullYear()} SEO AI Pro Inc. | All rights reserved.</span>
        </footer>
      </main>

      {/* Dynamic Slide notifications */}
      <ToastNotification />
    </div>
  );
}

export default function App() {
  return (
    <SEOProvider>
      <AppContent />
    </SEOProvider>
  );
}
