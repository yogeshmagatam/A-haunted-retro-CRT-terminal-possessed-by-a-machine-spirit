/**
 * NecroShell Main Application Bootstrapper
 */

import { NecroTerminal } from './terminal/core.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    window.necroTerminal = new NecroTerminal(appContainer);
    console.log('%c💀 NECROSHELL AWAKENED // 100% On-Device Open-Weights', 'color: #00ff66; font-size: 16px; font-weight: bold; background: #000; padding: 4px 8px;');
  }
});
