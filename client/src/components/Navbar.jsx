import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar({ adminUser, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="nav-brand">
          EvoMem
        </NavLink>

        <ul className="nav-links">
          <li>
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/team" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Team
            </NavLink>
          </li>

          {adminUser ? (
            <>
              <li>
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <button onClick={onLogout} className="btn-login-nav">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <button onClick={() => navigate('/admin')} className="btn-login-nav">
                Login
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
