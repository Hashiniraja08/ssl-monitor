import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function AlertSettings() {
  const [preferences, setPreferences] = useState({
    email_alerts_enabled: true,
    inapp_alerts_enabled: true,
    threshold_warning_1: 30,
    threshold_warning_2: 15,
    threshold_critical: 7,
    site_preferences: {}
  });
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getAlertPreferences();
        if (res.preferences) setPreferences(res.preferences);
        if (res.sites) setSites(res.sites);
      } catch (err) {
        console.error('Error loading alert preferences:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.updateAlertPreferences(preferences);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save alert preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSitePref = (siteId, channel) => {
    const current = preferences.site_preferences || {};
    const sitePref = current[siteId] || { email: true, inapp: true };
    const updated = {
      ...current,
      [siteId]: {
        ...sitePref,
        [channel]: !sitePref[channel]
      }
    };
    setPreferences(prev => ({ ...prev, site_preferences: updated }));
  };

  return (
    <div className="flex flex-col w-full px-lg py-xl space-y-xl max-w-container-max mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div className="flex flex-col space-y-xs">
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Alert Preferences
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Configure how and when you receive notifications for critical security events and upcoming certificate expirations.
          </p>
        </div>

        <div className="flex items-center gap-sm">
          {saveSuccess && (
            <span className="text-xs text-tertiary font-semibold flex items-center gap-xs animate-in fade-in">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-secondary-container hover:bg-secondary-fixed transition-colors text-on-secondary-container font-label-caps text-label-caps px-md py-sm rounded-lg flex items-center gap-xs font-semibold uppercase tracking-wider disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Global Settings */}
        <div className="col-span-12 lg:col-span-5 space-y-lg">
          {/* Delivery Channels */}
          <div className="bg-surface-container rounded-xl p-lg space-y-md border border-outline-variant/20 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-sm pb-sm border-b border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary">campaign</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Delivery Channels</h2>
            </div>

            {/* Email Toggle */}
            <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg transition-colors hover:bg-surface-container-highest border border-outline-variant/10">
              <div className="flex flex-col">
                <span className="font-body-lg text-sm font-semibold text-on-surface">Email Alerts</span>
                <span className="font-body-md text-xs text-on-surface-variant">Daily summaries and critical alerts</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_alerts_enabled}
                  onChange={(e) => setPreferences({ ...preferences, email_alerts_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
              </label>
            </div>

            {/* In-App Toggle */}
            <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg transition-colors hover:bg-surface-container-highest border border-outline-variant/10">
              <div className="flex flex-col">
                <span className="font-body-lg text-sm font-semibold text-on-surface">In-App Notifications</span>
                <span className="font-body-md text-xs text-on-surface-variant">Real-time dashboard popups</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.inapp_alerts_enabled}
                  onChange={(e) => setPreferences({ ...preferences, inapp_alerts_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
              </label>
            </div>
          </div>

          {/* Expiry Thresholds */}
          <div className="bg-surface-container rounded-xl p-lg space-y-md border border-outline-variant/20 relative overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-tr from-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-sm pb-sm border-b border-outline-variant/10">
              <span className="material-symbols-outlined text-tertiary">timer</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Expiry Thresholds</h2>
            </div>
            <p className="font-body-md text-xs text-on-surface-variant">
              Trigger alert events and notifications before certificates expire.
            </p>

            <div className="space-y-sm">
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low border border-outline-variant/10">
                <label className="font-body-md text-xs text-on-surface">Warning 1 (Early Notice)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={preferences.threshold_warning_1}
                    onChange={(e) => setPreferences({ ...preferences, threshold_warning_1: parseInt(e.target.value, 10) || 30 })}
                    className="w-16 bg-surface-container-lowest text-on-surface font-code-sm text-xs p-1.5 rounded border border-outline-variant/30 focus:border-secondary outline-none text-right"
                  />
                  <span className="text-xs text-on-surface-variant font-code-sm">days</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low border border-outline-variant/10">
                <label className="font-body-md text-xs text-on-surface">Warning 2 (Imminent Expiry)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={preferences.threshold_warning_2}
                    onChange={(e) => setPreferences({ ...preferences, threshold_warning_2: parseInt(e.target.value, 10) || 15 })}
                    className="w-16 bg-surface-container-lowest text-on-surface font-code-sm text-xs p-1.5 rounded border border-outline-variant/30 focus:border-secondary outline-none text-right"
                  />
                  <span className="text-xs text-on-surface-variant font-code-sm">days</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low border border-error/20">
                <label className="font-body-md text-xs text-error font-semibold">Critical Expiry Warning</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={preferences.threshold_critical}
                    onChange={(e) => setPreferences({ ...preferences, threshold_critical: parseInt(e.target.value, 10) || 7 })}
                    className="w-16 bg-surface-container-lowest text-error font-code-sm text-xs p-1.5 rounded border border-error focus:ring-1 focus:ring-error outline-none text-right font-bold"
                  />
                  <span className="text-xs text-on-surface-variant font-code-sm">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Monitored Assets List */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container rounded-xl p-lg flex flex-col border border-outline-variant/20">
          <div className="flex items-center justify-between mb-md pb-md border-b border-outline-variant/10">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">language</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Monitored Assets</h2>
            </div>
            <span className="text-xs font-code-sm text-on-surface-variant">
              {sites.length} Active Targets
            </span>
          </div>

          <div className="flex-1 space-y-xs max-h-[500px] overflow-y-auto pr-1">
            {sites.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-8">
                No monitored assets. Add sites on the Monitoring page.
              </p>
            ) : (
              sites.map((site) => {
                const sitePref = preferences.site_preferences?.[site.id] || { email: true, inapp: true };

                return (
                  <div
                    key={site.id}
                    className="flex items-center justify-between p-md bg-surface-container-low rounded-lg group hover:bg-surface-container-highest transition-colors border border-outline-variant/10"
                  >
                    <div className="flex items-center gap-md">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-secondary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">public</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-code-sm text-xs font-semibold text-on-surface">
                          {site.domain}
                        </span>
                        <span className="font-body-md text-[11px] text-on-surface-variant flex items-center gap-xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${site.status === 'valid' ? 'bg-tertiary' : site.status === 'warning' ? 'bg-[#FBBF24]' : 'bg-error'}`} />
                          {site.days_remaining > 0 ? `${site.days_remaining}d remaining` : 'Expired'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-md">
                      {/* Email toggle */}
                      <div className="flex items-center gap-xs" title="Email Alerts">
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">mail</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sitePref.email !== false}
                            onChange={() => handleToggleSitePref(site.id, 'email')}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-secondary" />
                        </label>
                      </div>

                      {/* In-App toggle */}
                      <div className="flex items-center gap-xs" title="In-App Notifications">
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">notifications</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sitePref.inapp !== false}
                            onChange={() => handleToggleSitePref(site.id, 'inapp')}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-secondary" />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertSettings;
