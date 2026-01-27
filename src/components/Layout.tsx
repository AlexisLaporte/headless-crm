import { ReactNode, useState } from 'react';
import { Building2, Users, Megaphone, LogOut, Menu, X, LayoutDashboard, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'companies' | 'contacts' | 'campaigns' | 'settings';
  onTabChange: (tab: 'companies' | 'contacts' | 'campaigns' | 'settings') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { signOut, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mainTabs = [
    { id: 'companies' as const, label: 'Entreprises', icon: Building2 },
    { id: 'contacts' as const, label: 'Contacts', icon: Users },
    { id: 'campaigns' as const, label: 'Campagnes', icon: Megaphone },
  ];

  const settingsTab = { id: 'settings' as const, label: 'Parametres', icon: Settings };

  const allTabs = [...mainTabs, settingsTab];
  const activeLabel = allTabs.find(t => t.id === activeTab)?.label || '';

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-brand-950 text-white fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
          <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-brand-950" />
          </div>
          <span className="text-lg font-bold tracking-tight">YACRM</span>
          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">DEMO</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col">
          <div className="space-y-1">
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-300/60">
              Gestion
            </p>
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-brand-200 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
                </button>
              );
            })}
          </div>
          <div className="mt-auto pt-4 border-t border-white/10 space-y-1">
            <button
              onClick={() => onTabChange(settingsTab.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-brand-200 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">Parametres</span>
              {activeTab === 'settings' && <ChevronRight className="w-4 h-4 opacity-60" />}
            </button>
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-4">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-sm font-bold">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-brand-300">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-brand-300 hover:text-white hover:bg-white/8 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Changer de profil</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-surface-200 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-gray-600 hover:bg-surface-100 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-700 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900">YACRM</span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500">{activeLabel}</span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-brand-950 text-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-6 h-14 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-accent-500 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-3.5 h-3.5 text-brand-950" />
                </div>
                <span className="text-lg font-bold">YACRM</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 flex flex-col">
              <div className="space-y-1">
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-300/60">
                  Gestion
                </p>
                {mainTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'text-brand-200 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-auto pt-4 border-t border-white/10 space-y-1">
                <button
                  onClick={() => { onTabChange('settings'); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === 'settings'
                      ? 'bg-white/15 text-white'
                      : 'text-brand-200 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Parametres</span>
                </button>
              </div>
            </nav>

            <div className="border-t border-white/10 p-4">
              {user && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-sm font-bold">
                    {user.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-brand-300">{user.role}</p>
                  </div>
                </div>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-brand-300 hover:text-white hover:bg-white/8 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Changer de profil</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        <div className="pt-14 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
