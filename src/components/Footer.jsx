import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <span className="footer-text">
          Hermanos Vega © {currentYear}
        </span>
      </div>
    </footer>
  );
}