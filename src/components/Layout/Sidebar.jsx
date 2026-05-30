import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wand2, Linkedin, History } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/generator', icon: Wand2, label: 'Generator' },
  { to: '/linkedin', icon: Linkedin, label: 'LinkedIn' },
  { to: '/history', icon: History, label: 'History' },
];

const Sidebar = ({ isOpen = true }) => {
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--collapsed'}`}>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${location.pathname === to ? 'sidebar-link--active' : ''}`}
          >
            <Icon size={20} />
            {isOpen && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
