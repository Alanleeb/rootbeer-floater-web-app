import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <header className={`header ${darkMode ? 'dark' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            Raffle Ball
          </Link>
        </div>
        <nav className="nav-menu">
          <Link 
            to="/story" 
            className={`nav-link ${location.pathname === '/story' ? 'active' : ''}`}
          >
            Story
          </Link>
          <Link 
            to="/suggestions" 
            className={`nav-link ${location.pathname === '/suggestions' ? 'active' : ''}`}
          >
            Suggestions
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            About
          </Link>
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header; 