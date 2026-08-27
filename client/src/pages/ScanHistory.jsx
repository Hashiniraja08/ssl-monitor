import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { StatusBadge } from '../components/StatusBadge';
import { useScan } from '../context/ScanContext';

export function ScanHistory({ onNavigate }) {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { setCurrentScan } = useScan();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.getHistory(params);
      setHistory(res.scans || []);
    } catch (err) {
      console.error('Error fetching scan history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [searchQuery, statusFilter]);

  const handleExportCSV = () => {
    window.open('/api/history/export.csv', '_blank');
  };

  const handleRowClick = (scan) => {
    setCurrentScan(scan);
    if (scan.status === 'error') {
      onNavigate('error');
    } else {
      onNavigate('results');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('Delete this scan entry from history?')) {
      await api.deleteHistoryItem(id);
      fetchHistory();
    }
  };

  return (
    <div className="flex flex-col w-full px-lg py-xl max-w-container-max mx-auto">
      {/* Header section */}
      <div className="flex items-end justify-between mb-lg relative">
        <div className="flex flex-col gap-xs z-10">
          <h1 className="font-headline-xl text-headline-xl text-on-background font-bold">
            Scan History
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Review previously executed SSL/TLS security audits.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
      </div>

      {/* Filter and Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-md bg-surface-container-low rounded-xl p-md mb-lg shadow-sm border border-outline-variant/20">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by URL or Issuer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-highest text-on-surface font-body-md text-body-md rounded-lg py-sm pl-xl pr-md outline-none focus:ring-1 focus:ring-secondary transition-shadow placeholder:text-on-surface-variant/60"
          />
        </div>

        <div className="flex items-center gap-sm">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-label-caps text-label-caps py-sm px-md rounded-lg transition-colors outline-none cursor-pointer appearance-none pr-8 border border-outline-variant/20"
            >
              <option value="all">All Statuses</option>
              <option value="valid">Valid</option>
              <option value="warning">Warning</option>
              <option value="expired">Expired</option>
              <option value="error">Error</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-xs bg-secondary hover:bg-secondary-fixed text-on-secondary font-label-caps text-label-caps py-sm px-md rounded-lg transition-colors shadow-[0_0_8px_rgba(93,230,255,0.2)] whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* History Data Table */}
      <div className="bg-surface-container rounded-xl shadow-md overflow-hidden flex flex-col w-full relative z-10 border border-outline-variant/20">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-md p-md bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps border-b border-outline-variant/20">
          <div className="col-span-4 sm:col-span-3">Website URL</div>
          <div className="col-span-3 sm:col-span-2">Scan Date</div>
          <div className="col-span-2">Status</div>
          <div className="hidden sm:block sm:col-span-3">Issuer</div>
          <div className="col-span-3 sm:col-span-2 text-right">Expiry Date</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col divide-y divide-outline-variant/10">
          {loading ? (
            <div className="p-xl text-center text-on-surface-variant font-code-sm">
              Loading historical audits...
            </div>
          ) : history.length === 0 ? (
            <div className="p-xl text-center text-on-surface-variant font-body-md py-16">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">history_toggle_off</span>
              <p>No scan history matching your filter criteria.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleRowClick(item)}
                className="grid grid-cols-12 gap-md p-md items-center bg-surface-container hover:bg-surface-container-highest hover:text-on-surface group transition-colors cursor-pointer"
              >
                {/* Domain / Target */}
                <div className="col-span-4 sm:col-span-3 flex items-center gap-sm">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-secondary group-hover:bg-secondary/10 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">public</span>
                  </div>
                  <span className="font-code-sm text-code-sm text-on-surface truncate font-semibold">
                    {item.domain || item.url}
                  </span>
                </div>

                {/* Scan Date */}
                <div className="col-span-3 sm:col-span-2 font-body-md text-xs text-on-surface-variant group-hover:text-on-surface">
                  {item.scanned_at ? new Date(item.scanned_at).toLocaleString() : 'N/A'}
                </div>

                {/* Status Badge */}
                <div className="col-span-2">
                  <StatusBadge status={item.status} size="sm" />
                </div>

                {/* Issuer */}
                <div className="hidden sm:block sm:col-span-3 font-body-md text-xs text-on-surface-variant truncate">
                  {item.issuer_org || item.issuer || 'N/A'}
                </div>

                {/* Expiry Date / Actions */}
                <div className="col-span-3 sm:col-span-2 font-code-sm text-xs text-right flex items-center justify-end gap-sm">
                  <span className={item.status === 'expired' ? 'text-error font-bold' : item.status === 'warning' ? 'text-[#FBBF24] font-bold' : 'text-on-surface-variant'}>
                    {item.valid_to ? new Date(item.valid_to).toISOString().split('T')[0] : 'N/A'}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all"
                    title="Delete entry"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ScanHistory;
