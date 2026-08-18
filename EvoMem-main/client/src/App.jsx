import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Team from './pages/Team';
import Admin from './pages/Admin';
import V2 from './pages/V2';
import PPTViewPage from './pages/PPTViewPage';
import ErrorPage from './pages/ErrorPage';
import { checkAuth } from './services/api';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('evomem_admin_user');
      const token = localStorage.getItem('evomem_admin_token');
      return (token && savedUser) ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [authChecking, setAuthChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function verifySession() {
      const token = localStorage.getItem('evomem_admin_token');
      if (token) {
        try {
          const res = await checkAuth();
          if (res && res.success && res.user) {
            setAdminUser(res.user);
            localStorage.setItem('evomem_admin_user', JSON.stringify(res.user));
          } else if (res && res.message && res.message.includes('Token invalid')) {
            localStorage.removeItem('evomem_admin_token');
            localStorage.removeItem('evomem_admin_user');
            setAdminUser(null);
          }
        } catch (e) {
          // On network hiccup or page reload, preserve existing token & user session
        }
      } else {
        localStorage.removeItem('evomem_admin_user');
        setAdminUser(null);
      }
      setAuthChecking(false);
    }
    verifySession();
  }, []);

  const handleLoginSuccess = (user, token) => {
    if (token) {
      localStorage.setItem('evomem_admin_token', token);
    }
    localStorage.setItem('evomem_admin_user', JSON.stringify(user));
    setAdminUser(user);
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('evomem_admin_token');
    localStorage.removeItem('evomem_admin_user');
    setAdminUser(null);
    navigate('/');
  };

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <Navbar adminUser={adminUser} onLogout={handleLogout} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home adminUser={adminUser} />} />
          <Route path="/team" element={<Team />} />
          <Route
            path="/admin"
            element={
              <Admin
                adminUser={adminUser}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
              />
            }
          />
          <Route path="/v2" element={<V2 />} />
          <Route path="/ppt" element={<PPTViewPage />} />
          <Route path="/ppt-viewer" element={<PPTViewPage />} />
          {/* Catch-all invalid route renders custom Error Page */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>

      <footer style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', padding: '1rem 0', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        </div>
      </footer>
    </div>
  );
}
