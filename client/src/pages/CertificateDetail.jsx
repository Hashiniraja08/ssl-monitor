import React, { useState } from 'react';
import { useScan } from '../context/ScanContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export function CertificateDetail({ onNavigate }) {
  const { currentScan } = useScan();
  const [selectedChainNode, setSelectedChainNode] = useState(null);

  if (!currentScan) {
    return (
      <div className="p-xl text-center py-20">
        <p className="text-on-surface-variant mb-md">No certificate selected.</p>
        <button
          onClick={() => onNavigate('scan-home')}
          className="px-lg py-md bg-secondary text-on-secondary rounded-lg font-label-caps"
        >
          Scan a Website
        </button>
      </div>
    );
  }

  const daysRemaining = currentScan.days_remaining !== undefined ? currentScan.days_remaining : 0;
  const chain = currentScan.certificate_chain || [];

  return (
    <div className="flex flex-col w-full relative p-lg lg:p-xl max-w-container-max mx-auto">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-lg">
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            workspace_premium
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            {currentScan.domain || currentScan.common_name}
          </h1>
        </div>

        <div className="flex items-center gap-sm">
          <button
            onClick={() => onNavigate('results')}
            className="px-md py-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-label-caps text-label-caps rounded-lg transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            Results Overview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Main Details Panel */}
        <div className="col-span-12 lg:col-span-8 space-y-md">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-md">
            <div className="bg-surface-container-low rounded-xl p-md shadow-sm relative overflow-hidden group hover:bg-surface-container transition-colors border border-outline-variant/20">
              <div className="absolute inset-0 bg-gradient-to-br from-tertiary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Status</p>
              <div className="flex items-center gap-sm">
                <StatusBadge status={currentScan.status} size="sm" />
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-md shadow-sm border border-outline-variant/20">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Expires In</p>
              <p className="font-headline-md text-headline-md text-on-surface font-semibold">
                {daysRemaining > 0 ? `${daysRemaining} Days` : daysRemaining === 0 ? 'Today' : 'Expired'}
              </p>
            </div>

            <div className="bg-surface-container-low rounded-xl p-md shadow-sm border border-outline-variant/20">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-xs">Key Type</p>
              <p className="font-headline-md text-headline-md text-on-surface font-code-sm">
                {currentScan.key_type || 'RSA 2048'}
              </p>
            </div>
          </div>

          {/* Technical Metadata Table */}
          <div className="bg-surface-container rounded-xl shadow-md overflow-hidden border border-outline-variant/20">
            <div className="px-md py-sm bg-surface-container-high border-b border-outline-variant/20">
              <h2 className="font-headline-md text-headline-md text-on-surface">Technical Metadata</h2>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody className="font-body-md text-body-md text-on-surface-variant divide-y divide-outline-variant/10">
                  <tr className="hover:bg-primary/5 transition-colors">
                    <th className="py-md px-md font-label-caps text-label-caps text-on-surface-variant w-1/3 align-top">
                      Common Name (CN)
                    </th>
                    <td className="py-md px-md text-on-surface font-code-sm text-code-sm">
                      {currentScan.common_name || currentScan.domain}
                    </td>
                  </tr>

                  <tr className="hover:bg-primary/5 transition-colors bg-surface-container-low/30">
                    <th className="py-md px-md font-label-caps text-label-caps text-on-surface-variant align-top">
                      Subject Alt Names (SAN)
                    </th>
                    <td className="py-md px-md text-on-surface font-code-sm text-code-sm break-all">
                      {Array.isArray(currentScan.sans) && currentScan.sans.length > 0 ? (
                        currentScan.sans.map((san, i) => (
                          <div key={i} className="py-0.5">
                            DNS: <span className="text-secondary">{san}</span>
                          </div>
                        ))
                      ) : (
                        <span>DNS: {currentScan.domain}</span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-primary/5 transition-colors">
                    <th className="py-md px-md font-label-caps text-label-caps text-on-surface-variant align-top">
                      Issuer
                    </th>
                    <td className="py-md px-md text-on-surface font-code-sm text-code-sm break-all">
                      {currentScan.issuer || 'Unknown Issuer'}
                    </td>
                  </tr>

                  <tr className="hover:bg-primary/5 transition-colors bg-surface-container-low/30">
                    <th className="py-md px-md font-label-caps text-label-caps text-on-surface-variant align-top">
                      Serial Number
                    </th>
                    <td className="py-md px-md text-on-surface font-code-sm text-code-sm break-all text-secondary">
                      {currentScan.serial_number || 'N/A'}
                    </td>
                  </tr>

                  <tr className="hover:bg-primary/5 transition-colors">
                    <th className="py-md px-md font-label-caps text-label-caps text-on-surface-variant align-top">
                      Signature Algorithm
                    </th>
                    <td className="py-md px-md text-on-surface font-code-sm text-code-sm">
                      {currentScan.signature_algorithm || 'sha256WithRSAEncryption'}
                    </td>
                  </tr>

                  <tr className="hover:bg-primary/5 transition-colors bg-surface-container-low/30">
                    <th className="py-md px-md font-label-caps text-label-caps text-on-surface-variant align-top">
                      Valid From (NotBefore)
                    </th>
                    <td className="py-md px-md text-on-surface font-code-sm text-code-sm">
                      {currentScan.valid_from ? new Date(currentScan.valid_from).toUTCString() : 'N/A'}
                    </td>
                  </tr>

                  <tr className="hover:bg-primary/5 transition-colors">
                    <th className="py-md px-md font-label-caps text-label-caps text-on-surface-variant align-top">
                      Valid To (NotAfter)
                    </th>
                    <td className="py-md px-md text-on-surface font-code-sm text-code-sm">
                      {currentScan.valid_to ? new Date(currentScan.valid_to).toUTCString() : 'N/A'}
                    </td>
                  </tr>

                  <tr className="hover:bg-primary/5 transition-colors bg-surface-container-low/30">
                    <th className="py-md px-md font-label-caps text-label-caps text-on-surface-variant align-top">
                      Thumbprint (SHA-1)
                    </th>
                    <td className="py-md px-md text-on-surface font-code-sm text-code-sm break-all">
                      {currentScan.thumbprint_sha1 || 'N/A'}
                    </td>
                  </tr>

                  <tr className="hover:bg-primary/5 transition-colors">
                    <th className="py-md px-md font-label-caps text-label-caps text-on-surface-variant align-top">
                      Thumbprint (SHA-256)
                    </th>
                    <td className="py-md px-md text-on-surface font-code-sm text-code-sm break-all">
                      {currentScan.thumbprint_sha256 || 'N/A'}
                    </td>
                  </tr>

                  <tr className="hover:bg-primary/5 transition-colors bg-surface-container-low/30">
                    <th className="py-md px-md font-label-caps text-label-caps text-on-surface-variant align-top">
                      TLS Cipher Suite
                    </th>
                    <td className="py-md px-md text-on-surface font-code-sm text-code-sm">
                      {currentScan.cipher_suite || 'TLS_AES_256_GCM_SHA384'} ({currentScan.tls_version || 'TLSv1.3'})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Certificate Chain Panel */}
        <div className="col-span-12 lg:col-span-4 relative">
          <div className="sticky top-20 space-y-md">
            <h2 className="font-headline-md text-headline-md text-on-surface px-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-secondary">account_tree</span>
              Certificate Chain
            </h2>

            <div className="relative pl-6">
              {/* Vertical connecting line */}
              <div className="absolute left-[11px] top-6 bottom-8 w-0.5 bg-outline-variant/30" />

              {chain.map((node, index) => {
                const isRoot = node.type === 'Root CA' || index === chain.length - 1;
                const isLeaf = index === 0;

                return (
                  <div key={index} className="relative mb-lg">
                    {/* Horizontal connecting line & dot */}
                    <div className="absolute -left-6 top-6 w-6 h-0.5 bg-outline-variant/30" />
                    <div className={`absolute -left-[19px] top-5 w-3 h-3 rounded-full bg-surface border-2 z-10 ${node.status === 'expired' ? 'border-error shadow-[0_0_4px_#ffb4ab]' : 'border-tertiary shadow-[0_0_4px_#4edea3]'}`} />

                    {/* Node Card */}
                    <div
                      onClick={() => setSelectedChainNode(node)}
                      className="bg-surface-container-low rounded-xl p-md shadow-sm hover:shadow-md transition-all hover:bg-surface-container cursor-pointer border border-outline-variant/20 group"
                    >
                      <div className="flex items-center justify-between mb-xs">
                        <span className="font-label-caps text-label-caps text-secondary font-semibold uppercase">
                          {node.type}
                        </span>
                        <span className={`material-symbols-outlined text-[16px] ${node.status === 'expired' ? 'text-error' : 'text-tertiary'}`}>
                          {node.status === 'expired' ? 'warning' : 'verified'}
                        </span>
                      </div>

                      <p className="font-body-md text-body-md text-on-surface font-bold mb-xs truncate" title={node.name}>
                        {node.name}
                      </p>
                      <p className="font-code-sm text-code-sm text-on-surface-variant truncate">
                        {node.organization || node.issuer}
                      </p>

                      <div className="mt-sm pt-sm border-t border-outline-variant/10 flex justify-between items-center text-xs">
                        <span className="font-code-sm text-[10px] text-on-surface-variant">
                          {node.valid_to ? `Expires: ${new Date(node.valid_to).toLocaleDateString()}` : 'Trusted Root'}
                        </span>
                        <button className="text-secondary hover:text-secondary-fixed text-xs font-bold uppercase tracking-wider">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Node Details Modal */}
      <Modal
        isOpen={Boolean(selectedChainNode)}
        onClose={() => setSelectedChainNode(null)}
        title={selectedChainNode ? `${selectedChainNode.type}: ${selectedChainNode.name}` : ''}
      >
        {selectedChainNode && (
          <div className="space-y-md text-sm">
            <div className="grid grid-cols-2 gap-sm">
              <div>
                <p className="text-xs text-on-surface-variant font-label-caps">Organization</p>
                <p className="font-code-sm text-on-surface">{selectedChainNode.organization || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-label-caps">Country</p>
                <p className="font-code-sm text-on-surface">{selectedChainNode.country || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-on-surface-variant font-label-caps">Issuer</p>
              <p className="font-code-sm text-on-surface break-all">{selectedChainNode.issuer || 'N/A'}</p>
            </div>

            {selectedChainNode.serial_number && (
              <div>
                <p className="text-xs text-on-surface-variant font-label-caps">Serial Number</p>
                <p className="font-code-sm text-secondary break-all">{selectedChainNode.serial_number}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-sm">
              <div>
                <p className="text-xs text-on-surface-variant font-label-caps">Valid From</p>
                <p className="font-code-sm text-on-surface">
                  {selectedChainNode.valid_from ? new Date(selectedChainNode.valid_from).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-label-caps">Valid To</p>
                <p className="font-code-sm text-on-surface">
                  {selectedChainNode.valid_to ? new Date(selectedChainNode.valid_to).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {selectedChainNode.thumbprint_sha256 && (
              <div>
                <p className="text-xs text-on-surface-variant font-label-caps">SHA-256 Fingerprint</p>
                <p className="font-code-sm text-xs text-on-surface break-all bg-surface-container p-2 rounded">
                  {selectedChainNode.thumbprint_sha256}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CertificateDetail;
