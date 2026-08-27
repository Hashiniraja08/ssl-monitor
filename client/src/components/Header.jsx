import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Header({ onSelectTab, unreadNotifCount = 0, onSearchSubmit }) {
  const { user, availableUsers, switchUser, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchKey = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (onSearchSubmit) onSearchSubmit(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-between px-xl shadow-[0_1px_8px_rgba(0,0,0,0.1)] border-b border-outline-variant/10">
      {/* Quick Search bar */}
      <div className="flex items-center gap-sm bg-surface-container-high/60 border border-outline-variant/20 rounded-lg px-md py-1.5 w-72 focus-within:border-secondary transition-all">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
        <input
          type="text"
          placeholder="Quick scan (e.g. google.com)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKey}
          className="bg-transparent border-none text-on-surface font-body-md text-xs focus:outline-none placeholder:text-on-surface-variant/50 w-full"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-lg">
        {/* Demo Role Switcher Quick Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-xs px-sm py-1 bg-surface-container-high border border-outline-variant/30 rounded-lg hover:border-secondary transition-colors text-xs font-label-caps text-on-surface"
            title="Switch demo persona for testing permissions"
          >
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-semibold">{user?.role || 'Analyst'}</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl p-sm z-50 animate-in fade-in zoom-in-95">
              <div className="px-sm py-1 text-[10px] font-label-caps uppercase text-on-surface-variant border-b border-outline-variant/10 mb-1">
                Switch Role / Persona
              </div>
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-sm py-1.5 rounded-lg text-left text-xs transition-colors ${
                    user?.id === u.id
                      ? 'bg-secondary-container text-on-secondary-container font-bold'
                      : 'hover:bg-surface-container text-on-surface'
                  }`}
                >
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{u.role} &bull; {u.title}</p>
                  </div>
                  {user?.id === u.id && <span className="material-symbols-outlined text-[16px]">check</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <button
          onClick={() => onSelectTab('notifications')}
          className="relative p-1 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadNotifCount > 0 && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface animate-pulse" />
          )}
        </button>

        {/* User Profile Pill */}
        <div
          className="flex items-center gap-md border-l border-outline-variant/20 pl-lg cursor-pointer group"
          onClick={() => onSelectTab('settings')}
        >
          <div className="text-right hidden sm:block">
            <p className="font-label-caps text-label-caps text-on-surface group-hover:text-secondary transition-colors">
              {user?.name || 'Analyst 01'}
            </p>
            <p className="text-[10px] text-on-surface-variant">{user?.title || 'Tier 3 Admin'}</p>
          </div>
          <img
            alt={user?.name || 'Profile'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-outline-variant/30 group-hover:ring-secondary transition-all"
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
