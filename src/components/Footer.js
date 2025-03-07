import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const isAllPrizesRoute = location.pathname === '/allprizes';

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <p>&copy; {new Date().getFullYear()} Raffle Ball. All rights reserved.</p>
          </div>
          {!isAllPrizesRoute && (
            <div className="footer-section">
              <Link to="/allprizes" className="employee-link">
                Employee Access
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer; 