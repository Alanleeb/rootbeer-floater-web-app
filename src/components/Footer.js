import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <p>&copy; {new Date().getFullYear()} Raffle Ball. All rights reserved.</p>
          </div>
          {!isAdminRoute && (
            <div className="footer-section">
              <Link to="/admin" className="employee-link">
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