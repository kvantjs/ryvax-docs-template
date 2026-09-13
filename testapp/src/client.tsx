import { hydrate, installHmr } from '@kvantjs/ryvax.js/client';
import { App } from './App.js';

hydrate(<App title="High-performance SaaS" />);
installHmr();
