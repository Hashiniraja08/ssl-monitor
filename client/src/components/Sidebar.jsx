import React from 'react';

export function Sidebar({ currentTab, onSelectTab, unreadNotifCount = 0 }) {
  const navItems = [
    { id: 'scan-home', label: 'Scan (Home)', icon: 'radar' },
    { id: 'monitoring', label: 'Monitoring', icon: 'analytics' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', badge: unreadNotifCount },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'get-started', label: 'Get Started', icon: 'explore' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col border-r border-outline-variant/10">
      {/* Brand Header */}
      <div
        className="h-16 flex items-center px-lg mb-xl cursor-pointer"
        onClick={() => onSelectTab('scan-home')}
      >
        <div className="w-8 h-8 rounded-lg bg-secondary-container/20 border border-secondary/40 flex items-center justify-center mr-sm shadow-[0_0_8px_rgba(0,203,230,0.3)]">
          <span className="material-symbols-outlined text-secondary text-[22px]">shield</span>
        </div>
        <span className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
          SecureScan <span className="text-secondary">AI</span>
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-md space-y-xs">
        {navItems.map((item) => {
          const isActive = currentTab === item.id || (item.id === 'scan-home' && (currentTab === 'results' || currentTab === 'details' || currentTab === 'error' || currentTab === 'scanning'));

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center px-lg py-md rounded-xl transition-all group text-left ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-bold shadow-[0_0_8px_rgba(0,203,230,0.3)]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined mr-md text-[20px] ${isActive ? 'text-on-secondary-container' : 'text-secondary group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </span>
              <span className="font-body-md flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-error text-on-error">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="mt-auto p-lg border-t border-outline-variant/10">
        <div className="flex items-center gap-md">
          <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_4px_#4edea3]" />
          <span className="font-label-caps text-label-caps text-on-tertiary-container tracking-wider font-semibold">
            System Operational
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
