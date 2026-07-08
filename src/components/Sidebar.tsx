import { useSEO, AppView } from '../context/SEOContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  FileText, 
  Settings, 
  User, 
  LogOut, 
  Compass, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { currentView, navigate, user, logout, reports } = useSEO();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as AppView, label: 'SEO Dashboard', icon: LayoutDashboard, count: reports.length },
    { id: 'new-audit' as AppView, label: 'Run New Audit', icon: PlusCircle },
    { id: 'history' as AppView, label: 'Audit History', icon: History },
    { id: 'reports' as AppView, label: 'Analysis Reports', icon: FileText },
    { id: 'settings' as AppView, label: 'Engine Settings', icon: Settings },
    { id: 'profile' as AppView, label: 'My Profile', icon: User },
  ];

  const handleNav = (id: AppView) => {
    navigate(id);
    setMobileOpen(false);
  };

  const getActiveStyles = (id: AppView) => {
    return currentView === id
      ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 font-bold'
      : 'text-gray-400 hover:bg-gray-900/50 hover:text-gray-200 border-l-4 border-transparent';
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-gray-950 border-b border-gray-900 px-4 py-3 sticky top-0 z-40 w-full">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-500 text-gray-950 p-1.5 rounded-lg">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <span className="font-display font-black text-sm tracking-tight text-white uppercase">SEO AI PRO</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
        />
      )}

      {/* Mobile Sidebar Panel */}
      <aside 
        className={`md:hidden fixed top-0 bottom-0 left-0 w-64 bg-gray-950 border-r border-gray-900 z-50 p-5 transform transition-transform duration-300 flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-500 text-gray-950 p-1.5 rounded-lg">
                <Compass className="h-5 w-5" />
              </div>
              <span className="font-display font-black text-md text-white uppercase">SEO AI PRO</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-gray-900 text-gray-400 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs transition-all cursor-pointer ${getActiveStyles(item.id)}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile mobile */}
        {user && (
          <div className="border-t border-gray-900 pt-4 mt-auto">
            <div className="flex items-center space-x-3 mb-3.5">
              <img 
                src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'} 
                alt="user avatar" 
                className="h-10 w-10 rounded-xl bg-gray-900 border border-gray-800"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-emerald-400 font-mono">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 p-2.5 bg-gray-900 hover:bg-rose-950/20 text-gray-400 hover:text-rose-400 border border-gray-800 hover:border-rose-950/30 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Desktop Sidebar Panel */}
      <aside 
        className={`hidden md:flex flex-col justify-between bg-gray-950 border-r border-gray-900 sticky top-0 h-screen transition-all duration-300 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-5 flex flex-col h-full justify-between">
          <div className="space-y-8">
            {/* Sidebar Branding / Header */}
            <div className="flex items-center justify-between">
              {!collapsed && (
                <div className="flex items-center space-x-2.5">
                  <div className="bg-emerald-500 text-gray-950 p-1.5 rounded-lg shadow-lg shadow-emerald-500/10">
                    <Compass className="h-5 w-5 animate-spin-slow" />
                  </div>
                  <div>
                    <span className="font-display font-black text-sm text-white tracking-wider uppercase block">SEO AI PRO</span>
                    <span className="text-[9px] font-mono text-emerald-400 tracking-widest uppercase">ANALYZER HUB</span>
                  </div>
                </div>
              )}
              {collapsed && (
                <div className="bg-emerald-500 text-gray-950 p-1.5 rounded-lg mx-auto shadow-lg shadow-emerald-500/10">
                  <Compass className="h-5 w-5" />
                </div>
              )}
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 text-xs transition-all cursor-pointer ${getActiveStyles(item.id)} ${
                      collapsed ? 'justify-center rounded-xl py-4 border-l-0 border-r-4' : 'rounded-lg'
                    }`}
                    title={collapsed ? item.label : ''}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && item.count !== undefined && item.count > 0 && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Collapsible Switch & Profile */}
          <div className="space-y-4">
            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-full items-center justify-center space-x-2 py-2 border border-gray-900 bg-gray-900/30 hover:bg-gray-900 text-[10px] text-gray-500 hover:text-gray-300 font-mono uppercase tracking-wider rounded-xl cursor-pointer"
            >
              <span>{collapsed ? '▶ Expand' : '◀ Collapse Sidebar'}</span>
            </button>

            {/* Profile badge details */}
            {user && (
              <div className={`border-t border-gray-900 pt-4 ${collapsed ? 'text-center' : ''}`}>
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} mb-3`}>
                  <img 
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'} 
                    alt="avatar" 
                    className="h-10 w-10 rounded-xl bg-gray-900 border border-gray-800"
                    title={user.name}
                  />
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase font-mono font-bold">
                        {user.credits} Credits
                      </span>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 p-2 bg-gray-950 hover:bg-rose-950/20 text-gray-500 hover:text-rose-400 border border-gray-900 hover:border-rose-950/30 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
