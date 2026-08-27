import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useScan } from '../context/ScanContext';

export function Notifications({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { executeScan } = useScan();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    await api.markNotificationRead(id);
    fetchNotifications();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await api.deleteNotification(id);
    fetchNotifications();
  };

  const handleCardClick = (notif) => {
    if (!notif.is_read) {
      handleMarkRead(notif.id);
    }
    if (notif.domain && notif.domain !== 'System') {
      executeScan(notif.domain);
    } else if (notif.link) {
      onNavigate('monitoring');
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.is_read;
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'critical': return { icon: 'error', color: 'text-error bg-error/10 border-error/30' };
      case 'warning': return { icon: 'warning', color: 'text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/30' };
      case 'success': return { icon: 'verified', color: 'text-tertiary bg-tertiary/10 border-tertiary/30' };
      default: return { icon: 'info', color: 'text-secondary bg-secondary/10 border-secondary/30' };
    }
  };

  return (
    <div className="flex flex-col w-full relative p-lg lg:p-xl space-y-lg max-w-container-max mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-background font-bold">
            Notifications Center
          </h1>
          <p className="font-body-md text-on-surface-variant text-sm mt-0.5">
            Real-time security alerts, certificate expiration warnings, and system status logs.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors px-md py-sm rounded-lg flex items-center gap-xs border border-outline-variant/30 text-xs font-semibold uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[16px]">done_all</span>
          Mark All As Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-xs border-b border-outline-variant/20 pb-sm overflow-x-auto">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread' },
          { id: 'critical', label: 'Critical' },
          { id: 'warning', label: 'Warnings' },
          { id: 'success', label: 'Success' },
          { id: 'system', label: 'System' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-md py-1.5 rounded-lg text-xs font-label-caps uppercase font-semibold transition-colors whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-sm">
        {loading ? (
          <div className="p-xl text-center text-on-surface-variant font-code-sm">
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-xl text-center text-on-surface-variant py-16 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">notifications_paused</span>
            <p className="text-body-md">No notifications matching this filter.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const { icon, color } = getIconForType(item.type);

            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className={`p-md rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-md group ${
                  item.is_read
                    ? 'bg-surface-container-low/60 border-outline-variant/10 text-on-surface-variant hover:bg-surface-container'
                    : 'bg-surface-container-high border-secondary/30 text-on-surface shadow-md hover:border-secondary'
                }`}
              >
                <div className="flex items-start gap-md">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${color}`}>
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-sm mb-0.5">
                      <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
                        {item.title}
                      </h3>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-md mt-2 text-[11px] font-code-sm text-on-surface-variant/80">
                      {item.domain && (
                        <span className="bg-surface-container px-1.5 py-0.5 rounded text-secondary">
                          {item.domain}
                        </span>
                      )}
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-xs shrink-0">
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all"
                    title="Delete notification"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Notifications;
