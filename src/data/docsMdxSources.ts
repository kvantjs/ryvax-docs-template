export const DOCS_MDX_SOURCES: Record<string, string> = {
  'introduction': `---
title: "Introduction"
description: "Ryvax 2.0.0 is a full-stack TypeScript framework designed for Server-Side Rendering (SSR), Static Site Generation (SSG), and API routes."
---

# Introduction to Ryvax.js

Ryvax 2.0.0 is a full-stack TypeScript framework. It provides a compiler, local development server, production edge runtime, and structured abstractions for caching, durable jobs, and background workers.

It does **not** patch global objects, rely on unhandled magic imports, or force a single vendor platform. 

Ryvax separates domain logic from infrastructure using explicit Dependency Injection (DI), explicit setup/teardown hooks, and explicit peer-dependency boundaries. The core never bundles vendor SDKs, so providers can publish adapters independently and teams can operate them without coupling the framework to one platform.

## React Server Components

React Server Components are an explicit experimental track. Ryvax 1.1 supports SSR, SSG, hydration, and streaming; a future RSC adapter will own the Flight protocol and client reference manifest while Ryvax owns routing, abort propagation, HTTP limits, caching, and deployment lifecycle.
`,
  'request-contracts': `---
title: "Request and Response Contracts"
description: "Handle incoming requests, AbortSignals, and explicit response definitions."
---

# Request and response contracts

Every Node request receives an \`AbortSignal\` through \`RequestContext.signal\`. The signal aborts when the client disconnects, the request deadline expires, or the response closes. Pass it to database drivers, model clients, storage, and custom streaming code.

Malformed JSON with an \`application/json\` content type returns HTTP \`400\` with a stable JSON error. Bodies remain bounded by \`limits.bodyBytes\` and return \`413\` when the limit is exceeded. \`OPTIONS\` automatically returns \`Allow\` when a route exports methods. \`HEAD\` uses an explicit \`HEAD\` handler or the \`GET\` handler and never sends a body.

\`\`\`typescript
import type { ApiHandler } from '@kvantjs/ryvax.js';

export const POST: ApiHandler = async ({ body, signal }) => {
  await validateAndPersist(body, { signal });
  return { status: 201, json: { created: true } };
};
\`\`\`

Applications can supply a health registry to expose JSON \`/health\` and \`/ready\` endpoints. A non-\`ok\` report returns \`503\`, and the report includes check status, latency, tags when provided, and an ISO timestamp.
`,
  'streaming-workflows': `---
title: "Streaming & Workflows"
description: "Ryvax supports streaming as an explicit transport primitive."
---

# Streaming, agents, and training workflows

Ryvax supports streaming as an explicit transport primitive. An API can return an \`AsyncIterable<Uint8Array>\` for NDJSON, SSE, token output, progress, or another byte protocol. React pages and API responses can also use React's server streaming renderer. 

This makes Ryvax useful as a deterministic boundary around AI agents, inference, evaluation, and training orchestration: jobs can submit or resume durable work, and streams can expose progress or partial output to connected clients.

\`\`\`typescript
export async function POST({ signal }: RequestContext) {
  async function* progress() {
    yield new TextEncoder().encode('{"event":"started"}\\n');
    await runEvaluation({ signal });
    yield new TextEncoder().encode('{"event":"completed"}\\n');
  }
  return { stream: progress(), headers: { 'Content-Type': 'application/x-ndjson' } };
}
\`\`\`
`,
  'cache-adapters': `---
title: "Cache and Platform Adapters"
description: "Use decoupled platform adapters for caching, jobs, and metrics."
---

# Cache and platform adapters

The local \`ResponseCache\` supports TTL, \`getFresh\`, stale-while-revalidate, concurrent-miss deduplication, tags, tag invalidation, path invalidation through \`invalidatePath\`/\`revalidatePath\`, a configurable entry limit, and basic counters. It is process-scoped and disposable. Multi-instance deployments should use a distributed adapter.

For data caching across instances, \`createDataCache\` accepts a \`CacheAdapter\` and makes scope explicit: \`request\`, \`public\`, or \`private\`. Private entries require a \`varyKey\`, preventing accidental sharing between users. 

## Adapter Philosophy

The public \`CacheAdapter\`, \`JobQueue\`, \`StorageAdapter\`, and \`MetricsAdapter\` interfaces are intentionally small. Optional methods add fresh reads, tag invalidation, abort signals, idempotency metadata, gauges, flush, and bounded close behavior.

| Area | Development | Production |
| --- | --- | --- |
| Database | SQLite or a test adapter | PostgreSQL, managed SQL, Prisma, Drizzle, etc. |
| Cache | Process-local memory | Redis or another distributed cache |
| Jobs | Local fake | Durable queue with retries and dead-letter handling |
| Files | Temporary local storage | S3-compatible or managed object storage |
| Observability | Structured console logs | Metrics/tracing exporter and centralized logs |
`,
  'configuration': `---
title: "Configuration"
description: "Configure Ryvax applications using framework.config.ts"
---

# Configuration

Ryvax loads \`framework.config.ts\`, \`framework.config.mts\`, \`framework.config.js\`, or \`framework.config.mjs\`. TypeScript configuration is compiled with esbuild. \`.env\` and \`.env.local\` values are available without replacing variables already defined by the process.

\`\`\`typescript
import type { AppConfig } from '@kvantjs/ryvax.js';

export default {
  poweredBy: false,
  cache: { enabled: true, defaultTtl: 30, staleWhileRevalidate: 60, maxEntries: 10_000 },
  observability: { requestId: true, requestLogging: false },
  limits: { bodyBytes: 2 * 1024 * 1024, requestTimeoutMs: 60_000, shutdownTimeoutMs: 10_000 }
} satisfies AppConfig;
\`\`\`
`,
  'cli-commands': `---
title: "CLI Commands"
description: "Built-in tooling for developing, building, and running Ryvax applications."
---

# CLI commands

| Command | Result |
| --- | --- |
| \`ryvax create <name>\` | Creates a React TypeScript application |
| \`ryvax create <name> --template saas\` | Creates the SaaS starter |
| \`ryvax dev --port 3000 --out-dir .meu-dev\` | Builds, starts, and watches with HMR |
| \`ryvax build --out-dir .meu\` | Builds production bundles and SSG pages |
| \`ryvax start --out-dir .meu --port 3000\` | Starts a selected production manifest |
| \`ryvax export --out-dir dist\` | Generates a static site for a CDN |
| \`ryvax deploy --out-dir dist\` | Generates a portable Node deployment package |
| \`ryvax routes --json\` | Emits a scriptable route manifest projection |
| \`ryvax doctor --out-dir .meu\` | Checks Node, dependencies, routes, scripts, and manifest health |

Use different \`--out-dir\` values for concurrent processes. Unknown options and invalid ports fail early rather than being silently ignored. 
`,
  'ai-patterns': `---
title: "Canonical AI Code Patterns"
description: "Standard implementations for Pages, APIs, and Actions in Ryvax.js"
---

# Canonical AI Code Patterns

These patterns are deliberately small. Copy the structure, then adapt domain names and validation to the application. Do not add abstractions until the existing pattern is insufficient.

## Page

**Use case:** server-rendered page.
**File:** \`pages/index.tsx\`

\`\`\`tsx
import type { PageModule } from '@kvantjs/ryvax.js';

type Props = { title: string };

const page: PageModule<Props> = {
  default: ({ title }) => <main><h1>{title}</h1></main>,
  getStaticProps: async () => ({ title: 'Ryvax application' })
};

export default page.default;
\`\`\`

## Dynamic page

**File:** \`pages/projects/[id].tsx\`

\`\`\`tsx
import type { PageModule } from '@kvantjs/ryvax.js';

type Props = { id: string };

const page: PageModule<Props> = {
  default: ({ id }) => <main><h1>Project {id}</h1></main>,
  getServerSideProps: async ({ params }) => ({ id: String(params.id) })
};

export default page.default;
\`\`\`

## Server Action

**File:** \`actions/projects.ts\`

\`\`\`typescript
'use server';

export async function createProject(input: { name: string }) {
  if (!input.name.trim()) throw new Error('Project name is required');
  return { name: input.name.trim() };
}
\`\`\`
`
};
