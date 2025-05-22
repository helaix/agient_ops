import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './styles/accessibility.css';
import App from './App';

// Add a skip navigation link for keyboard users
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.className = 'skip-link';
skipLink.textContent = 'Skip to main content';
document.body.prepend(skipLink);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
