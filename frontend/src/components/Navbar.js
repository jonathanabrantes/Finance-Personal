import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">
          🚀 Finance Personal
        </Link>
        
        <div className="navbar-nav ms-auto">
          <Link 
            className={`nav-link ${isActive('/') ? 'active' : ''}`} 
            to="/"
          >
            📊 Dashboard
          </Link>
          
          <Link 
            className={`nav-link ${isActive('/transactions') ? 'active' : ''}`} 
            to="/transactions"
          >
            🏦 Transações
          </Link>
          
          <Link 
            className={`nav-link ${isActive('/investments') ? 'active' : ''}`} 
            to="/investments"
          >
            📈 Investimentos
          </Link>
          
          <Link 
            className={`nav-link ${isActive('/settings') ? 'active' : ''}`} 
            to="/settings"
          >
            ⚙️ Configurações
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
