import { useState } from 'react';
import { ShieldCheck, BarChart3, Database, FileCode, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'history' | 'docs';
  setView: (view: 'home' | 'history' | 'docs') => void;
  historyCount: number;
}

export default function Navbar({ currentView, setView, historyCount }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  interface NavItem {
    id: 'home' | 'history' | 'docs';
    label: string;
    icon: any;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'SEO Auditor', icon: BarChart3 },
    { id: 'history', label: 'Audit History', icon: Database, badge: historyCount > 0 ? historyCount : undefined },
    { id: 'docs', label: 'Pro Architecture', icon: FileCode },
  ];

  const handleNavClick = (view: 'home' | 'history' | 'docs') => {
    setView(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-900 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
          id="nav-logo-container"
        >
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/25 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
            <ShieldCheck className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-emerald-300 transition-colors duration-300">
            SEO Audit <span className="bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text text-transparent">AI Pro</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1.5" id="desktop-nav-items">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 border ${
                  isActive
                    ? 'bg-gray-900 border-gray-800 text-emerald-400 font-semibold'
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/50'
                }`}
                id={`nav-btn-${item.id}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-1.5 py-0.5 rounded-full font-mono min-w-[18px]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status / Call-to-action */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-violet-950/30 border border-violet-500/25 px-3 py-1.5 rounded-full shadow-sm text-xs font-mono font-medium text-violet-300">
            <Sparkles className="h-3 w-3 text-violet-400 animate-pulse" />
            <span>GEMINI 3.5 ACTIVE</span>
          </div>
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="md:hidden flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-violet-950/30 border border-violet-500/25 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium text-violet-300">
            <Sparkles className="h-2.5 w-2.5 text-violet-400 animate-pulse" />
            <span>AI CORE</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white rounded-xl border border-gray-800 transition-colors"
            aria-label="Toggle menu"
            id="mobile-hamburger-btn"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-gray-900 animate-fade-in" id="mobile-nav-drawer">
          <div className="flex flex-col space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gray-900 border border-gray-800 text-emerald-400'
                      : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-900/30'
                  }`}
                  id={`mobile-nav-btn-${item.id}`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
