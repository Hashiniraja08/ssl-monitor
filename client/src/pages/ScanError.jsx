import React, { useState } from 'react';
import { useScan } from '../context/ScanContext';
import { Modal } from '../components/Modal';

export function ScanError({ onNavigate }) {
  const { scanError, scanningUrl, executeScan } = useScan();
  const [retrying, setRetrying] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const targetHost = scanError?.domain || scanningUrl || 'api.securescan.internal';
  const errorCode = scanError?.error_code || 'ERR_CERT_AUTHORITY_INVALID';
  const errorMessage = scanError?.error_message || 'The server returned an invalid or incomplete certificate chain. This could be due to a temporary network issue or a configuration error.';
  const timestamp = scanError?.scanned_at ? new Date(scanError.scanned_at).toISOString().replace('T', ' ').substring(0, 19) + ' UTC' : new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await executeScan(targetHost);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] items-center justify-center p-xl relative">
      <div className="relative w-full max-w-lg bg-surface-container-high rounded-2xl p-xl flex flex-col items-center text-center shadow-2xl overflow-hidden border border-error/20 group">
        {/* Decorative background glow elements */}
        <div className="absolute top-0 right-0 -mt-xl -mr-xl w-48 h-48 bg-error/10 rounded-full blur-2xl transition-transform duration-1000 group-hover:scale-110 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-xl -ml-xl w-48 h-48 bg-error/10 rounded-full blur-2xl transition-transform duration-1000 group-hover:scale-110 pointer-events-none" />

        {/* Warning Icon with red pulse */}
        <div className="relative mb-lg">
          <div className="absolute inset-0 bg-error/20 blur-md rounded-full" />
          <div className="relative w-16 h-16 rounded-full bg-error/10 flex items-center justify-center border border-error/30 animate-pulse">
            <span className="material-symbols-outlined text-error text-[32px] drop-shadow-[0_0_8px_rgba(255,180,171,0.5)]">
              warning
            </span>
          </div>
        </div>

        <div className="mb-md">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
            Unable to Verify Certificate
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
            {errorMessage}
          </p>
        </div>

        {/* Diagnostic Details (Collapsible) */}
        <div className="w-full bg-surface-container rounded-xl p-md mb-xl border border-outline-variant/20 text-left">
          <div
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="flex items-center justify-between cursor-pointer group/details"
          >
            <span className="font-label-caps text-label-caps text-on-surface-variant group-hover/details:text-on-surface transition-colors">
              Diagnostic Details
            </span>
            <span className={`material-symbols-outlined text-on-surface-variant text-[16px] transition-transform ${detailsOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </div>

          {detailsOpen && (
            <div className="space-y-sm mt-md pt-sm border-t border-outline-variant/10">
              <div className="flex justify-between items-center">
                <span className="font-body-md text-body-md text-on-surface-variant">Error Code</span>
                <span className="font-code-sm text-code-sm text-error bg-error/10 px-sm py-xs rounded font-semibold">
                  {errorCode}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-body-md text-on-surface-variant">Target Host</span>
                <span className="font-code-sm text-code-sm text-on-surface">{targetHost}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body-md text-body-md text-on-surface-variant">Timestamp</span>
                <span className="font-code-sm text-code-sm text-on-surface">{timestamp}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-md w-full sm:w-auto">
          <button
            onClick={() => setShowLogsModal(true)}
            className="flex-1 sm:flex-none font-label-caps text-label-caps bg-transparent border border-outline-variant text-on-surface px-lg py-md rounded-lg hover:bg-surface-container-highest transition-colors"
          >
            View Logs
          </button>

          <button
            onClick={handleRetry}
            disabled={retrying}
            className="flex-1 sm:flex-none font-label-caps text-label-caps bg-secondary text-on-secondary px-lg py-md rounded-lg hover:bg-secondary-fixed transition-colors shadow-[0_0_12px_rgba(93,230,255,0.2)] hover:shadow-[0_0_16px_rgba(93,230,255,0.4)] flex items-center justify-center gap-sm disabled:opacity-70"
          >
            <span className={`material-symbols-outlined text-[18px] ${retrying ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>

      {/* Raw Diagnostic Logs Modal */}
      <Modal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        title="Diagnostic Log Trace"
      >
        <div className="font-code-sm text-xs bg-surface-container-lowest p-md rounded-xl text-on-surface-variant space-y-1 overflow-x-auto max-h-96">
          <p className="text-secondary">[0.000s] TLS handshake initiated to {targetHost}:443</p>
          <p>[0.012s] Resolved DNS target vectors</p>
          <p className="text-error">[0.045s] Socket error event: {errorCode}</p>
          <p className="text-error">[0.046s] Message: {errorMessage}</p>
          <p>[0.048s] Fallback diagnostics recorded in audit store</p>
          <p className="text-on-surface mt-2 text-xs">Recommended fix: Verify DNS A/AAAA records, verify server port 443 listening status, and ensure valid intermediate CA certificates are attached.</p>
        </div>
      </Modal>
    </div>
  );
}

export default ScanError;
