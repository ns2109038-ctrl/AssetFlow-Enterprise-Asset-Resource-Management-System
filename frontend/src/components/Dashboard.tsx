import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, type Asset } from '../services/api';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Custom mock role override to let user test Admin & Employee features
  const [currentUserRole, setCurrentUserRole] = useState<string>(user?.role || 'ADMIN');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'calendar' | 'analytics' | 'team' | 'settings' | 'help'>('dashboard');

  // Interactive drop-down states
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showInbox, setShowInbox] = useState<boolean>(false);

  // Modal dialog states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);

  // Scanner simulation states
  const [scannerStatus, setScannerStatus] = useState<string>('Ready to scan...');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // FAQ Accordion states
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Core assets state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Search input query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form input states (Modal add asset)
  const [name, setName] = useState<string>('');
  const [assetTag, setAssetTag] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [status, setStatus] = useState<string>('AVAILABLE');
  const [categoryName, setCategoryName] = useState<string>('Laptops');
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');
  const [formLoading, setFormLoading] = useState<boolean>(false);

  // Active time tracker state
  const [timerSeconds, setTimerSeconds] = useState<number>(5048); // 01:24:08 matching the mockup image
  const [timerActive, setTimerActive] = useState<boolean>(true);

  // Load assets
  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.assets.getAll();
      if (response.success && response.assets) {
        setAssets(response.assets);
      } else {
        setError('Failed to fetch assets');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Update timer tick
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Handle manual asset create
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      const response = await api.assets.create({
        name,
        assetTag,
        serialNumber,
        location,
        status,
        categoryName,
      });

      if (response.success && response.asset) {
        setFormSuccess('Asset registered successfully!');
        setName('');
        setAssetTag('');
        setSerialNumber('');
        setLocation('');
        setStatus('AVAILABLE');
        setCategoryName('Laptops');
        fetchAssets();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess('');
        }, 1200);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create asset');
    } finally {
      setFormLoading(false);
    }
  };

  // Simulates scanning a barcode and adding a physical device dynamically to DB
  const startBarcodeScannerSimulation = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScannerStatus('Searching barcode tag...');

    setTimeout(() => {
      setScannerStatus('Decoding barcode AST-2026-X...');
      
      setTimeout(async () => {
        const randId = Math.floor(100 + Math.random() * 900);
        const deviceNames = [
          { name: 'iPhone 15 Pro Max', cat: 'Mobile Devices', tag: 'AST-IPH-' + randId, loc: 'New York HQ - Box 3' },
          { name: 'Samsung Odyssey G9 49"', cat: 'Monitors', tag: 'AST-MON-' + randId, loc: 'Tech Suite - Desk A2' },
          { name: 'Logitech MX Master 3S', cat: 'Furniture', tag: 'AST-ACC-' + randId, loc: 'San Francisco HQ - Cab C' },
          { name: 'Raspberry Pi 5 8GB', cat: 'Network Hardware', tag: 'AST-PI-' + randId, loc: 'Server Room 2B - Shelf 1' }
        ];
        const selectedDevice = deviceNames[Math.floor(Math.random() * deviceNames.length)];
        
        try {
          const res = await api.assets.create({
            name: selectedDevice.name,
            assetTag: selectedDevice.tag,
            serialNumber: 'SN-SCAN-' + Math.floor(100000 + Math.random() * 900000),
            location: selectedDevice.loc,
            status: 'AVAILABLE',
            categoryName: selectedDevice.cat,
          });

          if (res.success) {
            setScannerStatus(`Success: Scanned and registered ${selectedDevice.name}!`);
            fetchAssets();
          } else {
            setScannerStatus('Error: Barcode tag already registered.');
          }
        } catch (err) {
          setScannerStatus('Error: Failed to register scanned device.');
        } finally {
          setIsScanning(false);
        }
      }, 1500);
    }, 1500);
  };

  // Import mock data directly (Bulk import simulation)
  const importMockCSVData = async () => {
    setLoading(true);
    const randId = () => Math.floor(100 + Math.random() * 900);
    const extraAssets = [
      { name: 'Logitech C920 Webcam', tag: 'AST-CAM-' + randId(), sn: 'SN-WEB-' + randId(), cat: 'Monitors', loc: 'HR Office - Shelf 2' },
      { name: 'Keychron K2 Keyboard', tag: 'AST-KBD-' + randId(), sn: 'SN-KEY-' + randId(), cat: 'Furniture', loc: 'Design Studio - Desk 12' },
      { name: 'Ubiquiti UnFi Switch', tag: 'AST-NET-' + randId(), sn: 'SN-SWI-' + randId(), cat: 'Network Hardware', loc: 'Main Server Closet' }
    ];

    try {
      for (const item of extraAssets) {
        await api.assets.create({
          name: item.name,
          assetTag: item.tag,
          serialNumber: item.sn,
          location: item.loc,
          status: 'AVAILABLE',
          categoryName: item.cat,
        });
      }
      alert('Success: Simulated CSV Bulk Import! Added 3 new items.');
      fetchAssets();
    } catch (err) {
      alert('CSV Import error or duplicate values generated.');
    } finally {
      setLoading(false);
    }
  };

  // Format active timer
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  // Compute stats
  const totalAssets = assets.length;
  const availableAssets = assets.filter((a) => a.status === 'AVAILABLE').length;
  const allocatedAssets = assets.filter((a) => a.status === 'ALLOCATED').length;
  const maintenanceAssets = assets.filter((a) => a.status === 'UNDER_MAINTENANCE').length;

  const allocationRate = totalAssets > 0 ? Math.round((allocatedAssets / totalAssets) * 100) : 0;
  const gaugeOffset = 220 - (220 * allocationRate) / 100;

  // Filter list by search query
  const filteredAssets = assets.filter((asset) => {
    const q = searchQuery.toLowerCase();
    return (
      asset.name.toLowerCase().includes(q) ||
      asset.assetTag.toLowerCase().includes(q) ||
      asset.location.toLowerCase().includes(q) ||
      asset.serialNumber.toLowerCase().includes(q) ||
      asset.category?.name.toLowerCase().includes(q) ||
      asset.status.toLowerCase().includes(q)
    );
  });

  // Category counts
  const categoriesList = ['Laptops', 'Furniture', 'Network Hardware', 'Monitors', 'Mobile Devices'];
  const getCategoryCount = (catName: string) => {
    return assets.filter((a) => a.category?.name === catName).length;
  };
  const maxCategoryCount = Math.max(...categoriesList.map(getCategoryCount), 1);

  // Check management permission (linked to interactive role selector)
  const canManageAssets = currentUserRole === 'ADMIN' || currentUserRole === 'ASSET_MANAGER';

  return (
    <div className="dashboard-container">
      {/* ==========================================
          LEFT SIDEBAR PANEL
          ========================================== */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">A</div>
          <span>AssetFlow</span>
        </div>

        <div className="sidebar-section-title">Menu</div>
        <nav className="sidebar-menu">
          <button 
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            Dashboard
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Assets
            <span className="menu-badge">{totalAssets}</span>
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Calendar
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
            Analytics
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Team
          </button>
        </nav>

        <div className="sidebar-section-title">General</div>
        <nav className="sidebar-menu">
          <button 
            className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Help
          </button>
          <button className="sidebar-link" onClick={logout} style={{ color: '#ef4444' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </nav>

        {/* Sidebar Banner App Download (Clickable to open Qr Modal) */}
        <div className="sidebar-banner">
          <div className="sidebar-banner-phone">
            <svg width="26" height="26" fill="none" stroke="#ffffff" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <h4 className="sidebar-banner-title">Download Mobile App</h4>
          <p className="sidebar-banner-desc">Manage resources and scan asset barcodes on the go with our mobile app.</p>
          <button className="sidebar-banner-btn" onClick={() => setIsQrOpen(true)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Get App
          </button>
        </div>
      </aside>

      {/* ==========================================
          RIGHT CONTENT PANEL
          ========================================== */}
      <main className="main-content">
        {/* Top bar search and profile info */}
        <div className="top-bar">
          <div className="search-container">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: '#9ca3af' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search assets, tag, status..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'assets') {
                  setActiveTab('assets'); // Auto navigate to assets tab on typing search
                }
              }}
            />
            <span className="search-shortcut">⌘ F</span>
          </div>

          <div className="top-bar-actions">
            {/* INBOX BUTTON */}
            <button 
              className="action-icon-btn" 
              onClick={() => {
                setShowInbox(!showInbox);
                setShowNotifications(false);
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span className="notification-dot"></span>
            </button>
            
            {/* NOTIFICATIONS BUTTON */}
            <button 
              className="action-icon-btn" 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowInbox(false);
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notification-dot"></span>
            </button>

            {/* Profile area */}
            <div className="profile-avatar-group">
              <div className="member-avatar">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="profile-meta">
                <div className="profile-name">{user?.name}</div>
                <div className="profile-email">{user?.email}</div>
              </div>
            </div>

            {/* FLOATING INBOX DROPDOWN */}
            {showInbox && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Messages</div>
                <div className="dropdown-item" onClick={() => setShowInbox(false)}>
                  <div className="dropdown-item-title">Alexandra Deff</div>
                  <div style={{ fontSize: 11, color: 'var(--text)' }}>Can I request laptop warranty update details?</div>
                  <div className="dropdown-item-time">5 mins ago</div>
                </div>
                <div className="dropdown-item" onClick={() => setShowInbox(false)}>
                  <div className="dropdown-item-title">Edwin Adenike</div>
                  <div style={{ fontSize: 11, color: 'var(--text)' }}>Dell XPS laptop returned to available status.</div>
                  <div className="dropdown-item-time">1 hour ago</div>
                </div>
              </div>
            )}

            {/* FLOATING NOTIFICATIONS DROPDOWN */}
            {showNotifications && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Notifications</div>
                <div className="dropdown-item" onClick={() => setShowNotifications(false)}>
                  <div className="dropdown-item-title">Low Stock Warning</div>
                  <div style={{ fontSize: 11, color: 'var(--text)' }}>Available category 'Laptops' count is under 2.</div>
                  <div className="dropdown-item-time">2 mins ago</div>
                </div>
                <div className="dropdown-item" onClick={() => setShowNotifications(false)}>
                  <div className="dropdown-item-title">Server Scheduled Service</div>
                  <div style={{ fontSize: 11, color: 'var(--text)' }}>Server maintenance starts at 02:00 PM today.</div>
                  <div className="dropdown-item-time">15 mins ago</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            TAB CONTENT 1: MAIN DASHBOARD VIEW
            ========================================== */}
        {activeTab === 'dashboard' && (
          <>
            {/* Dashboard Header */}
            <div className="page-header">
              <div>
                <h1 className="page-header-title">Dashboard</h1>
                <p className="page-header-desc">Plan, prioritize, and manage your enterprise assets with ease.</p>
              </div>
              <div className="header-buttons">
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Asset
                </button>
                <button className="btn-secondary" onClick={importMockCSVData}>Import Data</button>
              </div>
            </div>

            {/* Metrics Row */}
            <section className="metrics-grid-redesigned">
              <div className="metric-card-redesigned highlighted" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('assets')}>
                <div className="card-top">
                  <span className="card-label">Total Assets</span>
                  <div className="arrow-circle">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>
                <div className="card-value">{loading ? '...' : totalAssets}</div>
                <div className="card-subtext">5% Increased from last month</div>
              </div>

              <div className="metric-card-redesigned" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('assets')}>
                <div className="card-top">
                  <span className="card-label">Available</span>
                  <div className="arrow-circle">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>
                <div className="card-value" style={{ color: 'var(--accent)' }}>
                  {loading ? '...' : availableAssets}
                </div>
                <div className="card-subtext">2% Increased from last month</div>
              </div>

              <div className="metric-card-redesigned" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('assets')}>
                <div className="card-top">
                  <span className="card-label">Allocated</span>
                  <div className="arrow-circle">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>
                <div className="card-value" style={{ color: 'var(--accent)' }}>
                  {loading ? '...' : allocatedAssets}
                </div>
                <div className="card-subtext">12% Increased from last month</div>
              </div>

              <div className="metric-card-redesigned" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('assets')}>
                <div className="card-top">
                  <span className="card-label">On Maintenance</span>
                  <div className="arrow-circle">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>
                <div className="card-value" style={{ color: '#ef4444' }}>
                  {loading ? '...' : maintenanceAssets}
                </div>
                <div className="card-subtext neutral">No critical failures</div>
              </div>
            </section>

            {/* Widgets Row 1 */}
            <div className="widgets-grid-main">
              {/* Category Chart Card */}
              <div className="widget-card">
                <div className="widget-title-area">
                  <h3 className="widget-title">Asset Category Distribution</h3>
                </div>
                
                <div className="bar-chart-container">
                  {categoriesList.map((cat, idx) => {
                    const count = getCategoryCount(cat);
                    const heightPercent = Math.max(10, Math.round((count / maxCategoryCount) * 100));
                    
                    let fillClass = 'solid';
                    if (idx % 3 === 1) fillClass = 'light';
                    if (idx % 3 === 2) fillClass = 'striped';
                    
                    return (
                      <div className="bar-col" key={cat}>
                        <div className="bar-track">
                          <div 
                            className={`bar-fill ${fillClass}`}
                            style={{ height: `${heightPercent}%` }}
                          >
                            <span className="bar-tooltip">{count} devices</span>
                          </div>
                        </div>
                        <span className="bar-label">{cat.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reminders/Alerts Widget */}
              <div className="widget-card">
                <h3 className="widget-title" style={{ marginBottom: 16 }}>Reminders & Alerts</h3>
                <div className="reminders-list">
                  <div className="reminder-item" style={{ borderColor: '#ef4444' }}>
                    <div className="reminder-title">Lenovo Server Maintenance</div>
                    <div className="reminder-time">Scheduled Service: 02:00 PM - 04:00 PM</div>
                  </div>
                  <div className="reminder-item" style={{ borderColor: '#3b82f6' }}>
                    <div className="reminder-title">Asset Audit Checkup</div>
                    <div className="reminder-time">Due date: Tomorrow morning</div>
                  </div>
                  <button className="reminder-btn" onClick={() => setIsScannerOpen(true)}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 4 }}>
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    Launch Barcode Scanner
                  </button>
                </div>
              </div>
            </div>

            {/* Widgets Row 2 */}
            <div className="widgets-grid-main">
              {/* Collaborations Widget */}
              <div className="widget-card">
                <div className="widget-title-area">
                  <h3 className="widget-title">Collaborations & Allocations</h3>
                </div>
                
                <div className="team-list-widget">
                  <div className="team-member-item">
                    <div className="member-profile">
                      <div className="member-avatar">AD</div>
                      <div className="member-meta">
                        <div className="member-name">Alexandra Deff</div>
                        <div className="member-task">Assigned: MacBook Pro (AST-2026-001)</div>
                      </div>
                    </div>
                    <span className="member-badge badge-completed">Assigned</span>
                  </div>

                  <div className="team-member-item">
                    <div className="member-profile">
                      <div className="member-avatar" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}>EA</div>
                      <div className="member-meta">
                        <div className="member-name">Edwin Adenike</div>
                        <div className="member-task">Assigned: Dell XPS 15 (AST-2026-002)</div>
                      </div>
                    </div>
                    <span className="member-badge badge-progress">Allocating</span>
                  </div>

                  <div className="team-member-item">
                    <div className="member-profile">
                      <div className="member-avatar" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>IO</div>
                      <div className="member-meta">
                        <div className="member-name">Isaac Oluwatemilorun</div>
                        <div className="member-task">Assigned: Office Chair (AST-2026-003)</div>
                      </div>
                    </div>
                    <span className="member-badge badge-pending">Pending Audit</span>
                  </div>
                </div>
              </div>

              {/* Progress and Timer Stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Allocation Gauge */}
                <div className="widget-card">
                  <h3 className="widget-title" style={{ marginBottom: 12 }}>Allocation Progress</h3>
                  
                  <div className="gauge-container">
                    <svg className="gauge-svg" viewBox="0 0 180 90">
                      <path className="gauge-bg" d="M20,90 A70,70 0 0,1 160,90" />
                      <path 
                        className="gauge-fill" 
                        d="M20,90 A70,70 0 0,1 160,90" 
                        style={{ strokeDashoffset: gaugeOffset }}
                      />
                    </svg>
                    <div className="gauge-text">
                      <div className="gauge-value">{allocationRate}%</div>
                      <div className="gauge-label">Assets Allocated</div>
                    </div>
                  </div>

                  <div className="gauge-legend">
                    <div className="legend-item">
                      <div className="legend-dot" style={{ background: 'var(--accent)' }}></div>
                      <span>Allocated</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot" style={{ background: '#10b981' }}></div>
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot" style={{ background: '#ef4444' }}></div>
                      <span>Service</span>
                    </div>
                  </div>
                </div>

                {/* Session Active Timer */}
                <div className="widget-card tracker-card">
                  <h3 className="widget-title" style={{ color: '#ffffff' }}>Active Session Time</h3>
                  <div className="tracker-time">{formatTime(timerSeconds)}</div>
                  <div className="tracker-controls">
                    <button 
                      onClick={() => setTimerActive(!timerActive)} 
                      className="tracker-btn"
                      title={timerActive ? 'Pause' : 'Resume'}
                    >
                      {timerActive ? (
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                    <button 
                      onClick={() => setTimerSeconds(0)} 
                      className="tracker-btn"
                      title="Reset timer"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==========================================
            TAB CONTENT 2: ASSETS FULL LIST VIEW
            ========================================== */}
        {activeTab === 'assets' && (
          <div className="section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>Asset Database Inventory</h2>
                <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 4 }}>
                  List of company registered hardware, furniture, and tools.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                  + Add Asset
                </button>
                <button onClick={fetchAssets} className="btn-secondary">
                  Refresh Database
                </button>
              </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text)' }}>
                Loading asset inventory from database...
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="no-assets">
                No matching assets found in local inventory database.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="asset-table">
                  <thead>
                    <tr>
                      <th>Asset Tag</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td style={{ fontWeight: 600 }}>{asset.assetTag}</td>
                        <td>
                          <div>{asset.name}</div>
                          <span style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                            S/N: {asset.serialNumber}
                          </span>
                        </td>
                        <td>
                          <span className="category-tag">{asset.category?.name}</span>
                        </td>
                        <td>{asset.location}</td>
                        <td>
                          <span className={`status-badge status-${asset.status}`}>
                            {asset.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB CONTENT 3: CALENDAR VIEW
            ========================================== */}
        {activeTab === 'calendar' && (
          <div className="section-card">
            <h2 className="section-title">Maintenance & Audit Calendar</h2>
            <p style={{ fontSize: 13, color: 'var(--text)' }}>
              Plan resources and track scheduled updates or audits on the calendar.
            </p>

            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div className="calendar-header-day" key={d}>{d}</div>
              ))}
              
              {/* Render cells */}
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = i - 2; // offset to align days
                const isValidDay = dayNum > 0 && dayNum <= 31;
                
                return (
                  <div className={`calendar-cell ${!isValidDay ? 'inactive' : ''}`} key={i}>
                    <span className="calendar-cell-num">{isValidDay ? dayNum : ''}</span>
                    {dayNum === 12 && <div className="calendar-event" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Server Maint.</div>}
                    {dayNum === 15 && <div className="calendar-event" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>Asset Audit</div>}
                    {dayNum === 22 && <div className="calendar-event" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Dell XPS Warranty</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB CONTENT 4: ANALYTICS DETAIL
            ========================================== */}
        {activeTab === 'analytics' && (
          <div className="section-card">
            <h2 className="section-title">Deep Resource Analytics</h2>
            <p style={{ fontSize: 13, color: 'var(--text)' }}>
              Graphical overview of active capital investment and distribution rates.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-h)' }}>Financial Capital Valuation</h4>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>$48,750 USD</div>
                <p style={{ fontSize: 12, color: 'var(--text)', marginTop: 4 }}>Estimated value of currently registered resources.</p>
                
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span>Laptops (M3, Thinkpads)</span>
                    <span style={{ fontWeight: 600 }}>$34,500</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span>Network Routers / Hardware</span>
                    <span style={{ fontWeight: 600 }}>$8,200</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>Furniture & Desk chairs</span>
                    <span style={{ fontWeight: 600 }}>$6,050</span>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-h)' }}>Category Allocation Density</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {categoriesList.map(cat => {
                    const count = getCategoryCount(cat);
                    const pct = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span>{cat}</span>
                          <span>{count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--body-bg)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB CONTENT 5: TEAM COLLABORATORS
            ========================================== */}
        {activeTab === 'team' && (
          <div className="section-card">
            <h2 className="section-title">Enterprise Team Members</h2>
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 20 }}>
              List of staff and active resource allocation assignments.
            </p>

            <div className="table-wrapper">
              <table className="asset-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th>Assigned Device</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="member-avatar">AD</div> Alexandra Deff
                    </td>
                    <td>alexandra.deff@company.com</td>
                    <td><span className="member-badge badge-completed">Active Employee</span></td>
                    <td>MacBook Pro M3 Max (AST-2026-001)</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="member-avatar" style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}>EA</div> Edwin Adenike
                    </td>
                    <td>edwin.adenike@company.com</td>
                    <td><span className="member-badge badge-progress">Asset Audit</span></td>
                    <td>Dell XPS 15 (AST-2026-002)</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="member-avatar" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>IO</div> Isaac Oluwatemilorun
                    </td>
                    <td>isaac.olu@company.com</td>
                    <td><span className="member-badge badge-pending">On Leave</span></td>
                    <td>Ergonomic Office Chair (AST-2026-003)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB CONTENT 6: SETTINGS & PERMISSIONS
            ========================================== */}
        {activeTab === 'settings' && (
          <div className="section-card">
            <h2 className="section-title">System Settings & Controls</h2>
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 24 }}>
              Configure your interface options, api paths, and test permissions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 500 }}>
              {/* Test Permission Toggle */}
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Test Permission Role (Mock Toggle)</label>
                <p style={{ fontSize: 12, color: 'var(--text)', marginBottom: 8 }}>
                  Change user role to test security validation triggers on the dashboard/modals.
                </p>
                <select 
                  className="form-select" 
                  value={currentUserRole}
                  onChange={(e) => setCurrentUserRole(e.target.value)}
                >
                  <option value="ADMIN">ADMIN (Full Access - Can Add Assets)</option>
                  <option value="ASSET_MANAGER">ASSET_MANAGER (Full Access - Can Add Assets)</option>
                  <option value="EMPLOYEE">EMPLOYEE (Restricted - Read-only Inventory)</option>
                </select>
              </div>

              {/* Theme preference */}
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Preferred Theme Option</label>
                <div className="theme-option-box">
                  <div className="theme-card-option active">
                    ☀️ Light Mode
                  </div>
                  <div className="theme-card-option" onClick={() => alert('Dark Mode configuration saved to localStorage! (Will load if prefers-color-scheme matches)')}>
                    🌙 Dark Mode
                  </div>
                </div>
              </div>

              {/* API Path Config */}
              <div>
                <label className="form-label" htmlFor="apiPath" style={{ fontWeight: 600 }}>Backend Server Endpoint</label>
                <input 
                  id="apiPath"
                  type="text" 
                  className="form-input" 
                  value="http://localhost:5000/api" 
                  readOnly 
                />
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB CONTENT 7: HELP FAQ ACCORDION
            ========================================== */}
        {activeTab === 'help' && (
          <div className="section-card">
            <h2 className="section-title">FAQ & Help Desk</h2>
            <p style={{ fontSize: 13, color: 'var(--text)' }}>
              Got questions? Explore resource solutions or search the user guide.
            </p>

            <div className="faq-accordion">
              <div className="faq-item">
                <button 
                  className="faq-trigger" 
                  onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}
                >
                  <span>How do I assign an asset tag to a resource?</span>
                  <span>{activeFaq === 0 ? '−' : '+'}</span>
                </button>
                {activeFaq === 0 && (
                  <div className="faq-content">
                    Asset tags are alphanumeric strings matching AST-YYYY-XXXX. They must be unique identifiers.
                    You can add them using the "+ Add Asset" popup form.
                  </div>
                )}
              </div>

              <div className="faq-item">
                <button 
                  className="faq-trigger" 
                  onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
                >
                  <span>Who has permissions to modify resources?</span>
                  <span>{activeFaq === 1 ? '−' : '+'}</span>
                </button>
                {activeFaq === 1 && (
                  <div className="faq-content">
                    Only users with the role <strong>ADMIN</strong> or <strong>ASSET_MANAGER</strong> can perform database modifications.
                    You can toggle your mock role inside the **Settings** tab to preview employee-restricted errors.
                  </div>
                )}
              </div>

              <div className="faq-item">
                <button 
                  className="faq-trigger" 
                  onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
                >
                  <span>How can I run bulk imports from spreadsheets?</span>
                  <span>{activeFaq === 2 ? '−' : '+'}</span>
                </button>
                {activeFaq === 2 && (
                  <div className="faq-content">
                    Clicking the "Import Data" button in the dashboard simulates a parsed spreadsheet upload,
                    bulk-saving entries directly into the SQLite database.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==========================================
          POPUP MODAL: REGISTER ASSET
          ========================================== */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Register Enterprise Resource</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              {canManageAssets ? (
                <form onSubmit={handleCreateAsset}>
                  {formError && <div className="error-banner">{formError}</div>}
                  {formSuccess && (
                    <div className="error-banner" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
                      {formSuccess}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="assetName">Asset Name</label>
                    <input
                      id="assetName"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Lenovo ThinkPad T14"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="assetTag">Asset Tag</label>
                      <input
                        id="assetTag"
                        type="text"
                        className="form-input"
                        placeholder="AST-2026-X"
                        value={assetTag}
                        onChange={(e) => setAssetTag(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="sn">Serial Number</label>
                      <input
                        id="sn"
                        type="text"
                        className="form-input"
                        placeholder="SN-XXXX"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="loc">Location</label>
                    <input
                      id="loc"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Server Room 3B"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="assetCat">Category</label>
                      <select
                        id="assetCat"
                        className="form-select"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                      >
                        <option value="Laptops">Laptops</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Network Hardware">Network Hardware</option>
                        <option value="Monitors">Monitors</option>
                        <option value="Mobile Devices">Mobile Devices</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="assetStatus">Status</label>
                      <select
                        id="assetStatus"
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="ALLOCATED">Allocated</option>
                        <option value="RESERVED">Reserved</option>
                        <option value="UNDER_MAINTENANCE">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" disabled={formLoading} style={{ marginTop: 20 }}>
                    {formLoading && <span className="spinner"></span>}
                    Register Asset
                  </button>
                </form>
              ) : (
                <div className="role-restricted-message">
                  <p><strong>Access Restricted</strong></p>
                  <p style={{ marginTop: 8 }}>
                    Only <strong>ADMIN</strong> and <strong>ASSET MANAGER</strong> roles can register new assets to the system.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          POPUP MODAL: BARCODE SCANNER MOCKUP
          ========================================== */}
      {isScannerOpen && (
        <div className="modal-backdrop" onClick={() => setIsScannerOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Live Barcode Scan Simulation</h3>
              <button className="modal-close-btn" onClick={() => setIsScannerOpen(false)}>&times;</button>
            </div>
            
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 16 }}>
                Camera interface simulation. Direct a barcode tag inside the sensor box to register assets.
              </p>

              <div className="scanner-simulate-box">
                {isScanning && <div className="scanner-laser-line"></div>}
                <div className="scanner-focus-corners"></div>
                <div className="scanner-text-status">{scannerStatus}</div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button 
                  className="btn-primary" 
                  onClick={startBarcodeScannerSimulation} 
                  disabled={isScanning}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {isScanning ? 'Decoding...' : 'Trigger Laser Scan'}
                </button>
                <button className="btn-secondary" onClick={() => setIsScannerOpen(false)}>Close Camera</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          POPUP MODAL: QR DOWNLOAD APP
          ========================================== */}
      {isQrOpen && (
        <div className="modal-backdrop" onClick={() => setIsQrOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <h3 className="modal-title">Download Mobile App</h3>
              <button className="modal-close-btn" onClick={() => setIsQrOpen(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="app-qr-container">
                <div className="qr-code-mock"></div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-h)' }}>
                    Scan QR to install AssetFlow Mobile
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text)', marginTop: 4 }}>
                    Compatible with iOS & Android barcode scanning apps.
                  </p>
                </div>
                <button className="submit-btn" onClick={() => setIsQrOpen(false)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
