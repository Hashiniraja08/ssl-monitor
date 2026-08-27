import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScanProvider, useScan } from './context/ScanContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { api } from './utils/api';

// Pages
import { ScanHome } from './pages/ScanHome';
import { ScanningPage } from './pages/ScanningPage';
import { ResultsDashboard } from './pages/ResultsDashboard';
import { CertificateDetail } from './pages/CertificateDetail';
import { ScanError } from './pages/ScanError';
import { SiteMonitoring } from './pages/SiteMonitoring';
import { ScanHistory } from './pages/ScanHistory';
import { Notifications } from './pages/Notifications';
import { AlertSettings } from './pages/AlertSettings';
import { AccountSettings } from './pages/AccountSettings';
import { GetStarted } from './pages/GetStarted';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('scan-home');
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const { executeScan } = useScan();

  const fetchUnreadCount = async () => {
    try {
      const res = await api.getNotifications();
      if (res.unread_count !== undefined) {
        setUnreadNotifCount(res.unread_count);
      }
    } catch {
      // Ignore background poll errors
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [currentTab]);

  const handleSearchSubmit = (query) => {
    executeScan(query);
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'scan-home':
        return <ScanHome onNavigate={setCurrentTab} />;
      case 'scanning':
        return <ScanningPage onCancel={() => setCurrentTab('scan-home')} />;
      case 'results':
        return <ResultsDashboard onNavigate={setCurrentTab} />;
      case 'details':
        return <CertificateDetail onNavigate={setCurrentTab} />;
      case 'error':
        return <ScanError onNavigate={setCurrentTab} />;
      case 'monitoring':
        return <SiteMonitoring onNavigate={setCurrentTab} />;
      case 'history':
        return <ScanHistory onNavigate={setCurrentTab} />;
      case 'notifications':
        return <Notifications onNavigate={setCurrentTab} />;
      case 'alert-settings':
        return <AlertSettings onNavigate={setCurrentTab} />;
      case 'settings':
        return <AccountSettings onNavigate={setCurrentTab} />;
      case 'get-started':
        return <GetStarted onNavigate={setCurrentTab} />;
      default:
        return <ScanHome onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadNotifCount={unreadNotifCount}
      />

      {/* Main Content Area */}
      <div className="pl-72 flex-1 flex flex-col min-h-screen">
        <Header
          onSelectTab={setCurrentTab}
          unreadNotifCount={unreadNotifCount}
          onSearchSubmit={handleSearchSubmit}
        />

        <main className="relative pt-16 bg-surface min-h-[calc(100vh-64px)] flex-1">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export function App() {
  const [navTab, setNavTab] = useState('scan-home');

  return (
    <AuthProvider>
      <ScanProvider onNavigate={setNavTab}>
        <AppContent />
      </ScanProvider>
    </AuthProvider>
  );
}

export default App;
