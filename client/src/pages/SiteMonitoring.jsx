import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { useScan } from '../context/ScanContext';

export function SiteMonitoring({ onNavigate }) {
  const [sites, setSites] = useState([]);
  const [stats, setStats] = useState({ totalSites: 0, expiringSoon: 0, expired: 0, healthy: 0 });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setCurrentScan, executeScan } = useScan();

  // Add Site Form State
  const [newDomain, setNewDomain] = useState('');
  const [newPort, setNewPort] = useState(443);
  const [newFrequency, setNewFrequency] = useState(60);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableInApp, setEnableInApp] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await api.getSites();
      setSites(res.sites || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Error fetching monitored sites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setIsSubmitting(true);
    setFormError('');
    try {
      await api.addSite({
        domain: newDomain.trim(),
        port: parseInt(newPort, 10) || 443,
        check_frequency_minutes: parseInt(newFrequency, 10) || 60,
        enable_email_alerts: enableEmail,
        enable_inapp_alerts: enableInApp
      });
      setIsAddModalOpen(false);
      setNewDomain('');
      fetchSites();
    } catch (err) {
      setFormError(err.message || 'Failed to add site');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSite = async (e, siteId) => {
    e.stopPropagation();
    if (confirm('Remove this domain from active monitoring?')) {
      await api.deleteSite(siteId);
      fetchSites();
    }
  };

  const handleRescanSite = async (e, site) => {
    e.stopPropagation();
    try {
      await api.rescanSite(site.id);
      fetchSites();
    } catch (err) {
      alert(err.message || 'Rescan failed');
    }
  };

  const handleRunSweep = async () => {
    setIsSweeping(true);
    try {
      await api.checkAllSites();
      await fetchSites();
    } catch (err) {
      console.error('Sweep error:', err);
    } finally {
      setIsSweeping(false);
    }
  };

  const handleInspectSite = (site) => {
    executeScan(site.domain);
  };

  return (
    <div className="flex flex-col w-full relative p-lg lg:p-xl space-y-xl max-w-container-max mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-background tracking-tight font-bold">
            Multi-Site Overview
          </h1>
          <p className="font-body-md text-on-surface-variant text-sm mt-0.5">
            Automated recurring SSL reconnaissance and certificate expiration tracking.
          </p>
        </div>

        <div className="flex items-center gap-sm flex-wrap">
          <button
            onClick={handleRunSweep}
            disabled={isSweeping}
            className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors px-md py-sm rounded-lg flex items-center gap-sm border border-outline-variant/30 text-xs font-semibold uppercase tracking-wider"
          >
            <span className={`material-symbols-outlined text-[18px] text-secondary ${isSweeping ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isSweeping ? 'Scanning All...' : 'Run Sweep'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-secondary text-on-secondary hover:bg-secondary-fixed transition-colors px-md py-sm rounded-lg flex items-center gap-sm shadow-[0_0_12px_rgba(93,230,255,0.2)] text-xs font-semibold uppercase tracking-wider font-label-caps"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Site</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Total Sites */}
        <div className="bg-surface-container-low rounded-xl p-lg relative overflow-hidden group shadow-sm transition-transform hover:-translate-y-1 border border-outline-variant/20">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-lg relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Total Sites
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">language</span>
            </div>
          </div>
          <div className="flex items-baseline gap-sm relative z-10">
            <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
              {stats.totalSites}
            </span>
            <span className="font-body-sm text-xs text-tertiary flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              Active queue
            </span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-surface-container-low rounded-xl p-lg relative overflow-hidden group shadow-sm transition-transform hover:-translate-y-1 border border-outline-variant/20">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-lg relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Expiring Soon
            </span>
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[18px]">timer</span>
            </div>
          </div>
          <div className="flex items-baseline gap-sm relative z-10">
            <span className="font-headline-xl text-headline-xl text-secondary drop-shadow-[0_0_8px_rgba(93,230,255,0.4)] font-bold">
              {stats.expiringSoon}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">&lt; 30 Days</span>
          </div>
        </div>

        {/* Expired */}
        <div className="bg-surface-container-low rounded-xl p-lg relative overflow-hidden group shadow-sm transition-transform hover:-translate-y-1 border border-outline-variant/20">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-error/5 rounded-full blur-2xl group-hover:bg-error/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-lg relative z-10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Expired / Critical
            </span>
            <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[18px]">warning</span>
            </div>
          </div>
          <div className="flex items-baseline gap-sm relative z-10">
            <span className={`font-headline-xl text-headline-xl font-bold ${stats.expired > 0 ? 'text-error drop-shadow-[0_0_8px_rgba(255,180,171,0.4)]' : 'text-on-surface'}`}>
              {stats.expired}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">
              {stats.expired === 0 ? 'All sites healthy' : 'Immediate attention needed'}
            </span>
          </div>
        </div>
      </div>

      {/* Monitored Domains Section */}
      <div className="bg-surface-container rounded-xl shadow-md overflow-hidden border border-outline-variant/20">
        {/* Panel Header */}
        <div className="p-lg flex justify-between items-center bg-surface-container-low border-b border-outline-variant/20">
          <h2 className="font-headline-md text-headline-md text-on-surface">Monitored Domains</h2>
          <div className="flex bg-surface-container rounded-lg p-xs border border-outline-variant/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-md py-xs rounded-md text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-surface-container-high text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-md py-xs rounded-md text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-surface-container-high text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="p-xl text-center text-on-surface-variant font-code-sm">
            Scanning assets...
          </div>
        ) : sites.length === 0 ? (
          <div className="p-xl text-center text-on-surface-variant py-16">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">public_off</span>
            <p className="text-body-md mb-md">No domains in monitoring queue yet.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-lg py-md bg-secondary text-on-secondary font-label-caps rounded-lg shadow-sm"
            >
              Add Your First Site
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="p-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-md">
            {sites.map((site) => {
              const isExpired = site.status === 'expired' || site.days_remaining <= 0;
              const isWarning = site.status === 'warning' || (site.days_remaining > 0 && site.days_remaining <= 30);

              const badgeColor = isExpired
                ? 'bg-error/10 text-error border-error/20'
                : isWarning
                ? 'bg-secondary/10 text-secondary border-secondary/20'
                : 'bg-tertiary/10 text-tertiary border-tertiary/20';

              const indicatorColor = isExpired
                ? 'bg-error shadow-[0_0_4px_#ffb4ab]'
                : isWarning
                ? 'bg-secondary shadow-[0_0_4px_#5de6ff]'
                : 'bg-tertiary shadow-[0_0_4px_#4edea3]';

              const barColor = isExpired ? 'bg-error' : isWarning ? 'bg-secondary' : 'bg-tertiary';

              return (
                <div
                  key={site.id}
                  onClick={() => handleInspectSite(site)}
                  className="bg-surface-container-low p-md rounded-xl shadow-sm hover:bg-surface-container-high transition-colors cursor-pointer group relative border border-outline-variant/20"
                >
                  {/* Left accent bar on hover */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor} rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <div className="flex justify-between items-start mb-md">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-secondary group-hover:bg-secondary/10 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">language</span>
                    </div>

                    <div className={`flex items-center gap-xs px-sm py-xs rounded-full border ${badgeColor}`}>
                      <div className={`w-2 h-2 rounded-full ${indicatorColor}`} />
                      <span className="font-code-sm text-[11px] font-medium">
                        {isExpired
                          ? 'Expired'
                          : `${site.days_remaining} Days`}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-headline-sm text-[16px] font-semibold text-on-surface truncate mb-xs">
                    {site.domain}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant truncate">
                    Issuer: {site.issuer || 'Unknown'}
                  </p>

                  <div className="mt-md pt-sm border-t border-outline-variant/10 flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="font-code-sm text-[10px]">
                      {site.tls_version || 'TLS 1.3'}
                    </span>
                    <div className="flex items-center gap-xs">
                      <button
                        onClick={(e) => handleRescanSite(e, site)}
                        className="p-1 hover:text-secondary transition-colors"
                        title="Re-check SSL"
                      >
                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteSite(e, site.id)}
                        className="p-1 hover:text-error transition-colors"
                        title="Remove from monitoring"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="divide-y divide-outline-variant/10">
            {sites.map((site) => (
              <div
                key={site.id}
                onClick={() => handleInspectSite(site)}
                className="flex items-center justify-between p-md hover:bg-surface-container-high transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-md">
                  <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">public</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-sm font-semibold text-on-surface">
                      {site.domain}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Issuer: {site.issuer || 'N/A'} &bull; Frequency: {site.check_frequency_minutes || 60}m
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-md">
                  <StatusBadge status={site.status} size="sm" />
                  <span className="font-code-sm text-xs text-on-surface w-20 text-right">
                    {site.days_remaining > 0 ? `${site.days_remaining}d left` : 'Expired'}
                  </span>
                  <div className="flex items-center gap-xs pl-md border-l border-outline-variant/20">
                    <button
                      onClick={(e) => handleRescanSite(e, site)}
                      className="p-1 text-on-surface-variant hover:text-secondary transition-colors"
                      title="Re-scan"
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteSite(e, site.id)}
                      className="p-1 text-on-surface-variant hover:text-error transition-colors"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Site Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Domain to Active Monitoring"
      >
        <form onSubmit={handleAddSite} className="space-y-md">
          {formError && (
            <div className="p-sm bg-error/10 border border-error/30 text-error rounded-lg text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
              Target Domain or Hostname
            </label>
            <input
              type="text"
              placeholder="e.g. api.production.corp"
              required
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-md py-sm font-code-sm text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                Port
              </label>
              <input
                type="number"
                value={newPort}
                onChange={(e) => setNewPort(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-md py-sm font-code-sm text-xs text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="block text-xs font-label-caps uppercase text-on-surface-variant mb-1">
                Check Interval
              </label>
              <select
                value={newFrequency}
                onChange={(e) => setNewFrequency(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-md py-sm font-body-md text-xs text-on-surface focus:outline-none focus:border-secondary"
              >
                <option value={15}>Every 15 Minutes</option>
                <option value={30}>Every 30 Minutes</option>
                <option value={60}>Every 1 Hour</option>
                <option value={360}>Every 6 Hours</option>
                <option value={1440}>Every 24 Hours</option>
              </select>
            </div>
          </div>

          <div className="space-y-sm pt-sm border-t border-outline-variant/20">
            <label className="flex items-center gap-sm cursor-pointer">
              <input
                type="checkbox"
                checked={enableEmail}
                onChange={(e) => setEnableEmail(e.target.checked)}
                className="accent-secondary"
              />
              <span className="text-xs text-on-surface font-body-md">Trigger Email Alerts upon expiry warning</span>
            </label>
            <label className="flex items-center gap-sm cursor-pointer">
              <input
                type="checkbox"
                checked={enableInApp}
                onChange={(e) => setEnableInApp(e.target.checked)}
                className="accent-secondary"
              />
              <span className="text-xs text-on-surface font-body-md">Post In-App Notification warnings</span>
            </label>
          </div>

          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-md py-sm text-on-surface-variant hover:text-on-surface text-xs font-label-caps"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-lg py-sm bg-secondary text-on-secondary font-label-caps text-xs rounded-lg hover:bg-secondary-fixed transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Scanning & Adding...' : 'Start Monitoring'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SiteMonitoring;
