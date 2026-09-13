import type { ApiHandler } from '@kvantjs/ryvax.js';

export const GET: ApiHandler = async ({ env }) => ({
  json: { ok: true, service: 'saas', node: process.version, environment: env.NODE_ENV ?? 'development' }
});
