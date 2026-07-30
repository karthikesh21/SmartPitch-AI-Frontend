import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/utils.css';
import App from './App';

// Suppress harmless browser development overlay for ResizeObserver loop notifications
window.addEventListener('error', (e) => {
  if (
    e.message && (
      e.message.includes('ResizeObserver loop completed with undelivered notifications') ||
      e.message.includes('ResizeObserver loop limit exceeded')
    )
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
