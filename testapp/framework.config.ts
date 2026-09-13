import type { AppConfig } from '@kvantjs/ryvax.js';

export default {
  cache: { enabled: true, defaultTtl: 0, staleWhileRevalidate: 60 },
  poweredBy: false,
  observability: { requestLogging: false }
} satisfies AppConfig;
