import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <span style={styles.text}>
        Hermanos Vega © {currentYear}
      </span>
    </footer>
  );
}

document.head.appendChild(styleSheet);