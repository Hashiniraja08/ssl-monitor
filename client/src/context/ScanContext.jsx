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
    if (!url) return;
    setScanningUrl(url);
    setIsScanning(true);
    setScanError(null);

    if (onNavigate) {
      onNavigate('scanning');
    }

    try {
      const result = await api.scan(url);
      setCurrentScan(result);
      loadRecentScans();

      // Allow the scanning terminal animation to finish smoothly
      setTimeout(() => {
        setIsScanning(false);
        if (result.status === 'error') {
          setScanError(result);
          if (onNavigate) onNavigate('error');
        } else {
          if (onNavigate) onNavigate('results');
        }
      }, 2000);

      return result;
    } catch (err) {
      const errorObj = {
        url,
        domain: url.replace(/^[a-zA-Z]+:\/\//, '').split('/')[0],
        status: 'error',
        error_code: 'ERR_NETWORK_OR_SERVER',
        error_message: err.message || 'Failed to communicate with scanner service.',
        scanned_at: new Date().toISOString()
      };
      setScanError(errorObj);
      setTimeout(() => {
        setIsScanning(false);
        if (onNavigate) onNavigate('error');
      }, 1500);
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
