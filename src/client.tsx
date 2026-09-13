import { hydrate, installHmr } from '@kvantjs/ryvax.js/client';
import { StrictMode } from 'react';
import App from './App.tsx';

// Note: Ryvax hydrate automatically attaches to the element (or we can just wrap it)
hydrate(
  <StrictMode>
    <App />
  </StrictMode>
);
installHmr();
