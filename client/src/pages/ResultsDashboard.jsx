import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { GradeBadge } from '../components/GradeBadge';
import { useScan } from '../context/ScanContext';
import { api } from '../utils/api';

export function ResultsDashboard({ onNavigate }) {
  const { currentScan, executeScan } = useScan();
  const [copied, setCopied] = useState(false);
  const [addedToMonitor, setAddedToMonitor] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!currentScan) {
    return (
      <div className="p-xl text-center py-20">
        <p className="text-on-surface-variant mb-md">No active scan result found.</p>
        <button
          onClick={() => onNavigate('scan-home')}
          className="px-lg py-md bg-secondary text-on-secondary rounded-lg font-label-caps"
        >
          Start a New Scan
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentScan.domain || currentScan.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToMonitor = async () => {
    try {
      setIsAdding(true);
      await api.addSite({ domain: currentScan.domain, name: currentScan.domain });
      setAddedToMonitor(true);
      setTimeout(() => setAddedToMonitor(false), 3000);
    } catch (err) {
      alert(err.message || 'Domain is already in monitoring list');
    } finally {
      setIsAdding(false);
    }
  };

  const daysRemaining = currentScan.days_remaining !== undefined ? currentScan.days_remaining : 0;
  const progressPercent = Math.max(0, Math.min(100, (daysRemaining / 90) * 100));

  const validToFormatted = currentScan.valid_to
    ? new Date(currentScan.valid_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown';

  return (
    <div className="flex flex-col w-full h-full relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
        <div className="w-[80vw] h-[80vw] rounded-full bg-surface-container-high opacity-20 blur-[120px] mix-blend-screen animate-pulse" />
        <div className="w-[40vw] h-[40vw] absolute right-0 top-0 rounded-full bg-secondary-fixed/5 blur-[80px] mix-blend-screen" />
      </div>

      <div className="relative z-10 p-lg lg:p-xl flex flex-col gap-xl w-full max-w-container-max mx-auto">
        {/* Header Section: URL & Primary Status */}
        <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-lg bg-surface-container-lowest p-xl rounded-3xl shadow-xl relative overflow-hidden border border-outline-variant/20 group hover:border-outline-variant/40 transition-all duration-500">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-tertiary/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex flex-col gap-sm relative z-10">
            <p className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">link</span>
              Scanned Target
            </p>

            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight flex items-center gap-sm flex-wrap">
              {currentScan.domain}
              <button
                onClick={handleCopy}
                className="p-1 text-outline-variant hover:text-secondary transition-colors"
                title="Copy Domain"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            </h1>

            {/* IP Badges */}
            <div className="flex items-center gap-sm flex-wrap mt-sm">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-container text-secondary">
                <span className="material-symbols-outlined text-[16px]">public</span>
              </span>
              {Array.isArray(currentScan.ip_addresses) && currentScan.ip_addresses.length > 0 ? (
                currentScan.ip_addresses.slice(0, 3).map((ip, i) => (
                  <span key={i} className="font-code-sm text-code-sm text-on-surface-variant bg-surface-container px-sm py-xs rounded-md border border-outline-variant/10">
                    {ip}
                  </span>
                ))
              ) : (
                <span className="font-code-sm text-code-sm text-on-surface-variant bg-surface-container px-sm py-xs rounded-md">
                  Port {currentScan.port || 443} (HTTPS)
                </span>
              )}
            </div>
          </div>

          {/* Prominent Status Badge & Grade */}
          <div className="relative z-10 flex flex-col md:items-end gap-sm shrink-0">
            <div className="flex items-center gap-md">
              <GradeBadge grade={currentScan.grade || 'A'} />
              <StatusBadge status={currentScan.status} size="lg" />
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant text-right opacity-60">
              Scanned {new Date(currentScan.scanned_at || Date.now()).toLocaleTimeString()}
            </p>
          </div>
        </section>

        {/* Key Metrics Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {/* Card 1: Certificate Status */}
          <div className="bg-surface-container p-lg rounded-2xl flex flex-col justify-between min-h-[160px] relative overflow-hidden border border-outline-variant/20 hover:bg-surface-container-high transition-colors duration-300 group">
            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none text-tertiary">
              <span className="material-symbols-outlined text-[120px] -mr-8 -mb-8 leading-none">policy</span>
            </div>
            <div>
              <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Certificate Status</h2>
              <div className="flex items-center gap-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${currentScan.status === 'valid' ? 'bg-tertiary shadow-[0_0_8px_#4edea3]' : currentScan.status === 'warning' ? 'bg-[#FBBF24] shadow-[0_0_8px_#fbbf24]' : 'bg-error shadow-[0_0_8px_#ffb4ab]'}`} />
                <p className="font-headline-lg text-headline-lg text-on-surface capitalize">
                  {currentScan.status === 'valid' ? 'Active & Secure' : currentScan.status}
                </p>
              </div>
            </div>
            <div className="mt-auto pt-md flex items-center justify-between">
              <span className="font-body-md text-body-md text-on-surface-variant font-code-sm">
                {currentScan.tls_version || 'TLS 1.3'}
              </span>
              <span className={`font-code-sm text-code-sm px-xs py-base rounded ${currentScan.status === 'valid' ? 'text-tertiary bg-tertiary/10' : currentScan.status === 'warning' ? 'text-[#FBBF24] bg-[#FBBF24]/10' : 'text-error bg-error/10'}`}>
                {currentScan.status === 'valid' ? 'Healthy' : currentScan.status === 'warning' ? 'Expiring Soon' : 'Action Required'}
              </span>
            </div>
          </div>

          {/* Card 2: Expiry Date */}
          <div className="bg-surface-container p-lg rounded-2xl flex flex-col justify-between min-h-[160px] relative overflow-hidden border border-outline-variant/20 hover:bg-surface-container-high transition-colors duration-300 group">
            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[120px] -mr-8 -mb-8 leading-none">event_available</span>
            </div>
            <div>
              <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Expiry Date</h2>
              <p className="font-headline-lg text-headline-lg text-on-surface font-semibold">
                {validToFormatted}
              </p>
            </div>
            <div className="mt-auto pt-md flex items-center justify-between">
              <span className="font-body-md text-body-md text-on-surface-variant">Time Remaining</span>
              <span className="font-code-sm text-code-sm text-on-surface bg-surface-container-highest px-sm py-0.5 rounded">
                {daysRemaining > 0 ? `${daysRemaining} Days` : daysRemaining === 0 ? 'Expires Today' : `${Math.abs(daysRemaining)} Days Ago`}
              </span>
            </div>
            {/* Subtle progress bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-surface-container-highest w-full">
              <div
                className={`h-full rounded-r-full transition-all duration-1000 ${currentScan.status === 'valid' ? 'bg-tertiary shadow-[0_0_8px_#4edea3]' : currentScan.status === 'warning' ? 'bg-[#FBBF24] shadow-[0_0_8px_#fbbf24]' : 'bg-error shadow-[0_0_8px_#ffb4ab]'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Card 3: Issuer */}
          <div className="bg-surface-container p-lg rounded-2xl flex flex-col justify-between min-h-[160px] relative overflow-hidden border border-outline-variant/20 hover:bg-surface-container-high transition-colors duration-300 group">
            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none text-primary">
              <span className="material-symbols-outlined text-[120px] -mr-8 -mb-8 leading-none">corporate_fare</span>
            </div>
            <div>
              <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Issuer Organization</h2>
              <p className="font-headline-lg text-headline-lg text-on-surface truncate" title={currentScan.issuer_org || currentScan.issuer}>
                {currentScan.issuer_org || 'Certificate Authority'}
              </p>
            </div>
            <div className="mt-auto pt-md flex items-center gap-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-tertiary">verified_user</span>
              <span className="font-body-md text-body-md truncate">{currentScan.issuer || 'Valid Root CA'}</span>
            </div>
          </div>
        </section>

        {/* Action Buttons Toolbar */}
        <section className="flex flex-wrap items-center justify-between gap-md bg-surface-container-low p-md rounded-2xl border border-outline-variant/20">
          <div className="flex items-center gap-sm">
            <button
              onClick={() => onNavigate('details')}
              className="px-lg py-sm bg-secondary text-on-secondary font-label-caps text-label-caps rounded-xl hover:bg-secondary-fixed transition-all flex items-center gap-xs shadow-[0_0_12px_rgba(93,230,255,0.2)]"
            >
              <span className="material-symbols-outlined text-[18px]">list_alt</span>
              View Technical Metadata & Chain
            </button>

            <button
              onClick={handleAddToMonitor}
              disabled={isAdding}
              className="px-lg py-sm bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-caps text-label-caps rounded-xl transition-colors border border-outline-variant/30 flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">
                {addedToMonitor ? 'check' : 'add_circle'}
              </span>
              {addedToMonitor ? 'Added to Monitoring!' : 'Add to Monitoring'}
            </button>
          </div>

          <div className="flex items-center gap-sm">
            <button
              onClick={() => executeScan(currentScan.url || currentScan.domain)}
              className="px-md py-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps rounded-xl transition-colors flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Scan Again
            </button>

            <button
              onClick={() => onNavigate('scan-home')}
              className="px-md py-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps rounded-xl transition-colors flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              New Target
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResultsDashboard;
