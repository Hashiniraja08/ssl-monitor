import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const ScanContext = createContext(null);

export function ScanProvider({ children, onNavigate }) {
  const [currentScan, setCurrentScan] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningUrl, setScanningUrl] = useState('');
  const [scanError, setScanError] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  const loadRecentScans = async () => {
    try {
      const list = await api.getRecentScans(10);
      setRecentScans(list || []);
    } catch (err) {
      console.warn('Could not load recent scans:', err);
    }
  };

  useEffect(() => {
    loadRecentScans();
  }, []);

  const executeScan = async (url) => {
    if (!url || typeof url !== 'string' || !url.trim()) return;
    const cleanUrl = url.trim();
    setScanningUrl(cleanUrl);
    setIsScanning(true);
    setScanError(null);

    if (onNavigate) {
      onNavigate('scanning');
    }

    try {
      const result = await api.scan(cleanUrl);
      setCurrentScan(result);
      loadRecentScans();

      setTimeout(() => {
        setIsScanning(false);
        if (result.status === 'error') {
          setScanError(result);
          if (onNavigate) onNavigate('error');
        } else {
          if (onNavigate) onNavigate('results');
        }
      }, 1600);

      return result;
    } catch (err) {
      const errorObj = {
        url: cleanUrl,
        domain: cleanUrl.replace(/^[a-zA-Z]+:\/\//, '').split('/')[0] || cleanUrl,
        status: 'error',
        error_code: err.data?.error_code || (err.status === 400 ? 'ERR_INVALID_URL' : 'ERR_NETWORK_OR_SERVER'),
        error_message: err.data?.error || err.message || 'Failed to communicate with the SSL/TLS scanner service.',
        scanned_at: new Date().toISOString()
      };
      setScanError(errorObj);
      setTimeout(() => {
        setIsScanning(false);
        if (onNavigate) onNavigate('error');
      }, 1200);
      return errorObj;
    }
  };

  const inspectScan = async (scanId) => {
    try {
      const scan = await api.getScan(scanId);
      setCurrentScan(scan);
      if (scan.status === 'error') {
        setScanError(scan);
        if (onNavigate) onNavigate('error');
      } else {
        if (onNavigate) onNavigate('results');
      }
    } catch (err) {
      console.error('Error inspecting scan:', err);
    }
  };

  return (
    <ScanContext.Provider
      value={{
        currentScan,
        setCurrentScan,
        isScanning,
        scanningUrl,
        scanError,
        recentScans,
        executeScan,
        inspectScan,
        loadRecentScans
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  return useContext(ScanContext);
}
