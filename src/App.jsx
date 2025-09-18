import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { fetchUserData, logout } from './utils/auth';

// --- Page & Component Imports ---
import Home from './Pages/Home';
import Testing from './Pages/Testing';
import Login from './Authentication/Login';
import Register from './Authentication/Register';
import Query from './Components/HOD/Dashboard';
import FacultyDetails from './Components/HOD/FacultyDetails';
import CoAnalysis from './Pages/Faculty/COPO/CoAnalysis';
import SideBar from './Components/Faculty/Performance/SideBar';
import Navbar from './Components/Faculty/Performance/Navbar';
import Profile from './Components/Faculty/Performance/Profile';
import PDFTestPage from './Components/Faculty/ApaarReport/PDFTestPage';

// ============================================================================
// 1. UTILITY HOOK FOR MEDIA QUERIES (Essential for responsive inline styles)
// ============================================================================
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useLayoutEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
};

// ============================================================================
// 2. APP-WIDE LOADER COMPONENT (with Inline Styles)
// ============================================================================
const appLoaderStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f1f5f9'
  },
  wrapper: {
    textAlign: 'center'
  },
  spinner: {
    margin: 'auto',
    width: '50px',
    height: '50px',
    animation: 'spinAnimation 1s linear infinite'
  },
  text: {
    marginTop: '1rem',
    fontSize: '1.125rem',
    fontWeight: '500',
    color: '#334155'
  }
};

const AppLoader = () => (
  <div style={appLoaderStyles.container}>
    <div style={appLoaderStyles.wrapper}>
      <svg style={appLoaderStyles.spinner} viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#2563eb" strokeWidth="5" strokeDasharray="31.4 31.4"></circle>
      </svg>
      <p style={appLoaderStyles.text}>Initializing Application...</p>
    </div>
    {/* Dynamically inject keyframes for the animation */}
    <style>{`
      @keyframes spinAnimation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// ============================================================================
// 3. PROTECTED ROUTE COMPONENT (No changes needed, no styling)
// ============================================================================
const ProtectedRoute = ({ user, allowedRoles }) => {
  if (!user) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

// ============================================================================
// 4. RESPONSIVE LAYOUT COMPONENTS (with Inline Styles)
// ============================================================================

const facultyLayoutStyles = {
  container: { display: 'flex', position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: '#f1f5f9' },
  sidebarBase: { transition: 'transform 0.3s ease-in-out', zIndex: 40, backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  sidebarDesktop: { width: '20vw' },
  sidebarMobile: { position: 'fixed', width: '280px', height: '100%' },
  sidebarMobileOpen: { transform: 'translateX(0)' },
  sidebarMobileClosed: { transform: 'translateX(-100%)' },
  contentBase: { height: '100vh', display: 'flex', flexDirection: 'column' },
  contentDesktop: { width: '80vw' },
  contentMobile: { width: '100vw' },
  mainContent: { flex: '1', overflowY: 'auto', overflowX: 'hidden' },
  overlay: { position: 'fixed', inset: '0', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 30 },
};

const FacultyLayout = ({ user, handleLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const sidebarStyle = {
    ...facultyLayoutStyles.sidebarBase,
    ...(isMobile ? facultyLayoutStyles.sidebarMobile : facultyLayoutStyles.sidebarDesktop),
    ...(isMobile && (isSidebarOpen ? facultyLayoutStyles.sidebarMobileOpen : facultyLayoutStyles.sidebarMobileClosed)),
  };

  const contentStyle = {
    ...facultyLayoutStyles.contentBase,
    ...(isMobile ? facultyLayoutStyles.contentMobile : facultyLayoutStyles.contentDesktop),
  };

  return (
    <div style={facultyLayoutStyles.container}>
      {isMobile && isSidebarOpen && <div onClick={() => setSidebarOpen(false)} style={facultyLayoutStyles.overlay} />}
      <div style={sidebarStyle}>
        <SideBar closeSidebar={() => setSidebarOpen(false)} />
      </div>
      <div style={contentStyle}>
        <Navbar user={user} handleLogout={handleLogout} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} isMobile={isMobile} />
        <main style={facultyLayoutStyles.mainContent}>
          <Outlet context={{}} />
        </main>
      </div>
    </div>
  );
};

const hodLayoutStyles = {
  container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f5f9' },
  querySection: { padding: '2rem', flexGrow: 1 },
};

const HodLayout = ({ user, handleLogout }) => (
  <div style={hodLayoutStyles.container}>
    <Navbar user={user} handleLogout={handleLogout} />
    <div style={hodLayoutStyles.querySection}>
      <Outlet />
    </div>
  </div>
);

// ============================================================================
// 5. MAIN APP COMPONENT
// ============================================================================
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userData = await fetchUserData();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeUser();
    console.log("App initialized");
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return <AppLoader />;
  }

  const renderRoutesForRole = () => {
    switch (user?.role) {
      case 'vc':
      case 'faculty':
        return (
          <Route element={
            <FacultyLayout user={user} handleLogout={handleLogout} />
          }>
            <Route path="/" element={<Home />} />
            <Route path="/:PageID" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/copo" element={<CoAnalysis />} />
            <Route path="/report-generator" element={<Testing />} />
            <Route path="/pdf-test" element={<PDFTestPage />} />
          </Route>
        );
      case 'hod':
        return (
          <Route element={<HodLayout user={user} handleLogout={handleLogout} />}>
            <Route path="/" element={<Query />} />
            <Route path="/faculty/:userId" element={<FacultyDetails />} />
          </Route>
        );
      default:
        handleLogout();
        return <Route path="*" element={<Navigate to="/" replace />} />;
    }
  };

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/" element={<Login handleLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <Route element={<ProtectedRoute user={user} allowedRoles={['faculty', 'hod', 'vc']} />}>
          {renderRoutesForRole()}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      )}
    </Routes>
  );
};

// --- Prop Types ---
ProtectedRoute.propTypes = { user: PropTypes.object, allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired };
FacultyLayout.propTypes = { user: PropTypes.object.isRequired, handleLogout: PropTypes.func.isRequired };
HodLayout.propTypes = { user: PropTypes.object.isRequired, handleLogout: PropTypes.func.isRequired };

export default App;