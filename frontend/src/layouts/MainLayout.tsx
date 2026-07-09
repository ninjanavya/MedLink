import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserSquare2, 
  PenTool, 
  History, 
  Sparkles, 
  CalendarClock, 
  Settings, 
  Search, 
  Bell, 
  User, 
  Menu, 
  X, 
  LogOut
} from 'lucide-react';
import { AIIndicator } from '../components/AIIndicator';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';
import { MedLinkLogo } from '../components/MedLinkLogo';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const toasts = useAppSelector(state => state.toast.toasts);
  const { user } = useAppSelector(state => state.auth);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
  ];

  if (user?.role === 'Administrator') {
    menuItems.push(
      { name: 'HCP Management', path: '/admin/hcps', icon: <UserSquare2 size={18} /> },
      { name: 'Interaction History', path: '/history', icon: <History size={18} /> },
      { name: 'AI Insights', path: '/ai-insights', icon: <Sparkles size={18} /> },
      { name: 'Follow Ups', path: '/follow-ups', icon: <CalendarClock size={18} /> },
      { name: 'Admin Panel', path: '/admin', icon: <Settings size={18} /> }
    );
  } else {
    menuItems.push(
      { name: 'HCP Directory', path: '/hcps', icon: <UserSquare2 size={18} /> },
      { name: 'Log Interaction', path: '/log', icon: <PenTool size={18} /> },
      { name: 'Interaction History', path: '/history', icon: <History size={18} /> },
      { name: 'AI Insights', path: '/ai-insights', icon: <Sparkles size={18} /> },
      { name: 'Follow Ups', path: '/follow-ups', icon: <CalendarClock size={18} /> }
    );
  }

  return (
    <div style={layoutWrapperStyle}>
      {/* 1. Mobile Top Bar */}
      <div style={mobileHeaderStyle} className="mobile-header">
        <button onClick={() => setSidebarOpen(true)} style={mobileMenuBtnStyle}>
          <Menu size={20} />
        </button>
        <span style={{ fontSize: '14px', fontWeight: '800', color: '#14B8A6', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MedLinkLogo size={18} color="#14B8A6" />
          <span>MEDLINK CRM</span>
        </span>
        <div style={{ width: '20px' }} /> {/* Spacer */}
      </div>

      {/* 2. Left Sidebar (With Responsive Class Overlay) */}
      <div 
        style={{
          ...sidebarStyle,
          left: sidebarOpen ? '0' : '-260px'
        }}
        className="sidebar-container"
      >
        <div style={logoContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MedLinkLogo size={20} color="#14B8A6" />
            <span style={{ fontWeight: '800', fontSize: '15px', color: '#FFFFFF', letterSpacing: '0.8px' }}>
              MEDLINK CRM
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={mobileCloseBtnStyle} className="sidebar-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Rep Profile Card in Sidebar */}
        <div style={repProfileBoxStyle}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0F766E, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: '700', fontSize: '13px' }}>
            {user?.role === 'Administrator' ? 'AD' : 'AM'}
          </div>
          <div>
            <h5 style={{ fontSize: '12.5px', fontWeight: '700', color: '#F1F5F9' }}>
              {user?.role === 'Administrator' ? 'CRM Admin' : 'Alex Mercer'}
            </h5>
            <p style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '600' }}>
              {user?.role === 'Administrator' ? 'Administrator' : 'Senior Medical Rep'}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={navStyle}>
          {menuItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-btn)',
                fontSize: '13.5px',
                fontWeight: '600',
                color: '#94A3B8',
                textDecoration: 'none',
                marginBottom: '4px',
                transition: 'all var(--transition-fast)'
              }}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
          
          {/* Logout Trigger */}
          <button
            onClick={() => {
              dispatch(logoutUser());
              navigate('/login');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              background: 'none',
              border: 'none',
              gap: '12px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-btn)',
              fontSize: '13.5px',
              fontWeight: '600',
              color: '#F87171',
              cursor: 'pointer',
              marginBottom: '4px',
              transition: 'all var(--transition-fast)',
              textAlign: 'left'
            }}
            className="nav-link-logout"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </nav>

      </div>

      {/* Sidebar background overlay for mobile */}
      {sidebarOpen && <div style={overlayStyle} onClick={() => setSidebarOpen(false)} />}

      {/* 3. Main Content Container */}
      <div style={contentContainerStyle} className="main-content-container">
        {/* Top Navbar */}
        <header style={navbarStyle} className="desktop-header">
          {/* Search box */}
          <div style={searchContainerStyle}>
            <Search size={16} color="var(--text-light)" />
            <input 
              type="text" 
              placeholder="Search HCPs, hospitals, or specialties..." 
              style={searchInputStyle}
            />
          </div>

          {/* Right header actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>


            {/* Notifications Alert Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                style={iconButtonStyle}
              >
                <Bell size={18} />
                {toasts.length > 0 && (
                  <span style={badgeCountStyle}>
                    {toasts.length}
                  </span>
                )}
              </button>

              {/* Simple dropdown menu */}
              {notifOpen && (
                <>
                  <div style={dropdownOverlayStyle} onClick={() => setNotifOpen(false)} />
                  <div style={notifDropdownStyle}>
                    <h5 style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '12.5px', fontWeight: '700', color: '#F1F5F9' }}>Recent Logs</h5>
                    <div style={{ padding: '8px 0', maxHeight: '200px', overflowY: 'auto' }}>
                      {toasts.length > 0 ? (
                        toasts.map(t => (
                          <div key={t.id} style={{ padding: '8px 14px', fontSize: '11.5px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: '500', color: '#CBD5E1' }}>
                            {t.message}
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '16px 14px', fontSize: '11.5px', color: 'var(--text-light)', textAlign: 'center' }}>
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #0F766E, #14B8A6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '12px', fontWeight: '700' }}>
                <User size={16} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#F1F5F9', display: 'none' }} className="desktop-profile-name">
                {user?.role === 'Administrator' ? 'CRM Admin' : 'Alex Mercer'}
              </span>
            </div>
          </div>
        </header>

        {/* Router child view outlet */}
        <main style={mainContentAreaStyle} className="main-content-body">
          {children}
        </main>
      </div>

      <style>{`
        /* Default mobile styling rules */
        .mobile-header {
          display: flex !important;
        }
        .desktop-header {
          display: none !important;
        }
        .sidebar-close-btn {
          display: block !important;
        }
        .main-content-container {
          margin-left: 0 !important;
          margin-top: 56px !important;
        }
        .main-content-body {
          padding: 16px !important;
        }

        /* Desktop styles overrides */
        @media(min-width: 992px) {
          .mobile-header {
            display: none !important;
          }
          .desktop-header {
            display: flex !important;
          }
          .sidebar-container {
            left: 0 !important;
          }
          .sidebar-close-btn {
            display: none !important;
          }
          .main-content-container {
            margin-left: 260px !important;
            margin-top: 0 !important;
          }
          .main-content-body {
            padding: 32px !important;
          }
          .desktop-profile-name {
            display: inline !important;
          }
        }
        
        /* Active links state styling */
        .nav-link.active {
          background-color: rgba(20, 184, 166, 0.12) !important;
          color: #14B8A6 !important;
        }
        .nav-link:hover:not(.active) {
          background-color: rgba(255,255,255,0.05) !important;
          color: #E2E8F0 !important;
        }
        .nav-link-logout:hover {
          background-color: rgba(248, 113, 113, 0.10) !important;
        }
      `}</style>
    </div>
  );
};

// Styling structures
const layoutWrapperStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  position: 'relative'
};

const mobileHeaderStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '56px',
  background: '#0D1F1E',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  zIndex: 1000,
  boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
};

const mobileMenuBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#94A3B8',
  padding: '4px'
};

const sidebarStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  width: '260px',
  background: 'linear-gradient(180deg, #0D1F1E 0%, #0F172A 100%)',
  borderRight: '1px solid rgba(255,255,255,0.07)',
  zIndex: 2000,
  display: 'flex',
  flexDirection: 'column',
  transition: 'left var(--transition-normal)'
};

const logoContainerStyle: React.CSSProperties = {
  padding: '24px 20px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const mobileCloseBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#64748B',
  padding: '4px',
  display: 'block' // Toggled by media queries
};

const repProfileBoxStyle: React.CSSProperties = {
  padding: '16px',
  margin: '16px 20px',
  borderRadius: '12px',
  background: 'rgba(20, 184, 166, 0.06)',
  border: '1px solid rgba(20, 184, 166, 0.15)',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const navStyle: React.CSSProperties = {
  padding: '0 20px',
  display: 'flex',
  flexDirection: 'column'
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(15,23,42,0.3)',
  zIndex: 1500
};

const contentContainerStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  marginLeft: '0' // Adjusted dynamically by CSS responsive queries
};

const navbarStyle: React.CSSProperties = {
  height: '64px',
  background: '#0F172A',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 32px',
  zIndex: 100,
  boxShadow: '0 1px 12px rgba(0,0,0,0.25)'
};

const searchContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '6px 12px',
  borderRadius: 'var(--radius-input)',
  width: '320px'
};

const searchInputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '12.5px',
  width: '100%',
  color: '#CBD5E1'
};

const iconButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#94A3B8',
  padding: '6px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background var(--transition-fast)'
};

const badgeCountStyle: React.CSSProperties = {
  position: 'absolute',
  top: '2px',
  right: '2px',
  background: 'var(--danger)',
  color: '#FFFFFF',
  fontSize: '8px',
  fontWeight: '800',
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const notifDropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '36px',
  right: '0',
  width: '240px',
  background: '#0D1F1E',
  borderRadius: '12px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.08)',
  zIndex: 1000
};

const dropdownOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 999
};

const mainContentAreaStyle: React.CSSProperties = {
  flex: 1,
  padding: '32px',
  overflowY: 'auto',
  background: 'var(--background)'
};

export default MainLayout;
