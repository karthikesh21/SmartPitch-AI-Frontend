import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from './BrandLogo';
import './Navbar.css';

const NavLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'nav-link--active' : ''}`}>
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, logout } = useAuth();
  const isGenerator = location.pathname === '/generator';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <BrandLogo size={28} fontSize="1rem" fontWeight={800} gap="8px" />
        </Link>

        <div className="navbar-links">
          <NavLink to="/"          icon={Wand2} label="Home" />
          <NavLink to="/generator" icon={Wand2} label="AI Pitch Generator" />
        </div>
        {!isGenerator && (
          <div className="navbar-actions">
            {isLoggedIn ? (
              <>
                <span className="navbar-user">✓ Logged in</span>
                <button className="navbar-btn navbar-btn--ghost" onClick={() => { logout(); navigate('/'); }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="navbar-btn navbar-btn--ghost"  onClick={() => navigate('/login')}>Login</button>
                <button className="navbar-btn navbar-btn--orange" onClick={() => navigate('/signup')}>Sign Up</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
