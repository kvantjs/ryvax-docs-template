import { DocCategory } from '../types/docs';

export const DOCS_CATEGORIES: DocCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    iconName: 'Rocket',
    pages: [
      {
        id: 'quickstart',
        title: 'Ryvax.js Quickstart',
        category: 'Getting Started',
        description: 'Learn how to initialize a Ryvax.js project, build robust API routes, and deploy to any container platform.',
        badge: 'Framework',
        lastUpdated: '2026-09-13',
        readTime: '4 min read',
        sections: [
          {
            id: 'what-is-ryvax',
            title: 'What is Ryvax.js?',
            level: 2,
            content: 'Ryvax.js is a React-first, full-stack TypeScript framework developed by Kvant. Designed for high-reliability APIs, Server-Side Rendering (SSR), Static Site Generation (SSG), and resilient job processing. It features portable production adapters and provider-neutral resource interfaces.',
            callout: {
              type: 'info',
              title: 'Documentation Template Notice',
              content: 'This site is an interactive presentation template showcasing the Ryvax.js design. None of the connected live terminals here are connected to actual production networks.'
            }
          },
          {
            id: 'installation',
            title: 'Resilient Scaffolding',
            level: 2,
            content: 'To initialize a new Ryvax.js application, install the core packages or use the interactive CLI scaffolding tool:',
            codeSnippets: [
              {
                language: 'typescript',
                label: 'NPM Scaffolding',
                code: 'npm install @kvantjs/ryvax.js\n# or scaffold a complete boilerplate\nnpx create-ryvax-app my-new-saas',
                runnable: true,
                expectedOutput: `[ryvax-cli] Creating new Ryvax.js app under my-new-saas...
[ryvax-cli] Installing @kvantjs/ryvax.js...
[ryvax-cli] Ready to deploy! Run 'npm run dev' to start local server.`,
                executionTimeMs: 450
              }
            ]
          }
        ]
      },
      {
        id: 'request-handling',
        title: 'Cancellable API Routes',
        category: 'Getting Started',
        description: 'Understand how Ryvax.js manages RequestContext.signal to automatically cancel outstanding execution on disconnects.',
        lastUpdated: '2026-09-13',
        readTime: '3 min read',
        sections: [
          {
            id: 'request-cancel',
            title: 'Context Signal & Abort Handling',
            level: 2,
            content: 'Ryvax.js explicitly propagates client cancellations down to your controllers, database queries, and downstream AI prompts using RequestContext.signal. When a client disconnects, the abort signal is instantly tripped, preventing server wastage.',
            callout: {
              type: 'warning',
              title: 'Automatic Resource Protection',
              content: 'Always pass the RequestContext.signal to your fetch operations and database transaction methods to prevent dangling processes.'
            },
            codeSnippets: [
              {
                language: 'typescript',
                label: 'Cancellable API handler',
                code: `import { type ApiHandler } from '@kvantjs/ryvax.js';

export const handlePostRequest: ApiHandler = async (req, res) => {
  const { signal } = req.context;

  // Pass abort signal directly to long-running downstream processes
  const response = await fetch('https://api.external.com/v1/inference', {
    method: 'POST',
    signal // Instantly aborted on client disconnect!
  });

  res.json(await response.json());
};`
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'core-concepts',
    title: 'Core Architecture',
    iconName: 'Cpu',
    pages: [
      {
        id: 'portable-production',
        title: 'Portable Production Architecture',
        category: 'Core Architecture',
        description: 'Deploy to Cloud Run, Docker, Cloudflare Workers, or Vercel Edge with zero alterations to your domain code.',
        badge: 'Portable',
        lastUpdated: '2026-09-13',
        readTime: '5 min read',
        sections: [
          {
            id: 'adapters-overview',
            title: 'Infrastructure-Neutral Adapters',
            level: 2,
            content: 'Ryvax.js structures deployment targets via decoupled adapters. Your business logic talks to provider-neutral interfaces for caching, durable jobs, and SQL connections. Changing from a regional VPS to a global serverless edge takes three lines of configuration.',
            callout: {
              type: 'tip',
              title: 'Adapter Pattern',
              content: 'All runtime abstractions (like ResponseCache, DataCache, and JobQueue) operate on standard interfaces, allowing teams to swap backends without refactoring core code.'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Specification',
    iconName: 'Terminal',
    pages: [
      {
        id: 'job-queue-endpoint',
        title: 'POST /api/v1/jobs',
        category: 'API Specification',
        description: 'Trigger a resilient, decoupled job execution with backoff parameters and idempotency constraints.',
        badge: 'API Endpoint',
        methodTag: 'POST',
        lastUpdated: '2026-09-13',
        readTime: '3 min read',
        sections: [
          {
            id: 'job-trigger-explorer',
            title: 'Decoupled Job Scheduler',
            level: 2,
            content: 'Simulate queueing a delayed task payload. Fill in parameters and test the JSON response.',
            apiEndpoint: {
              method: 'POST',
              path: '/api/v1/jobs',
              summary: 'Queue delayed task with idempotency check',
              description: 'This is a mock interactive endpoint demonstrating how Ryvax.js schedules robust, background workers.',
              authRequired: true,
              parameters: {
                body: [
                  {
                    name: 'task_type',
                    type: 'string',
                    required: true,
                    description: 'Identifies the background handler schema.',
                    defaultValue: 'metrics-compaction',
                    enumOptions: ['metrics-compaction', 'image-transcoding']
                  },
                  {
                    name: 'idempotency_key',
                    type: 'string',
                    required: true,
                    description: 'Prevents duplicates inside the job queue boundary.'
                  },
                  {
                    name: 'retry_limit',
                    type: 'number',
                    required: false,
                    description: 'Maximum failures before marking job dead.',
                    defaultValue: '3'
                  }
                ]
              },
              responses: [
                {
                  status: 202,
                  statusText: 'Accepted',
                  description: 'Durable background job successfully scheduled.',
                  body: {
                    status: 'queued',
                    job_id: 'job_ryvax_9948123',
                    idempotency_key: 'user-defined-unique-uuid',
                    enqueued_at: 1789432921,
                    is_production_ready: true,
                    meta: {
                      framework: 'Ryvax.js',
                      owner: 'Kvant'
                    }
                  }
                }
              ],
              codeSnippets: [
                {
                  language: 'curl',
                  label: 'cURL curl',
                  code: `curl -X POST "https://dryvax.kvant.sbs/api/v1/jobs" \\
  -H "Authorization: Bearer my_ryvax_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "task_type": "metrics-compaction",
    "idempotency_key": "unique_compaction_001",
    "retry_limit": 3
  }'`
                }
              ]
            }
          }
        ]
      }
    ]
  }
];

export const ALL_DOC_PAGES = DOCS_CATEGORIES.flatMap(cat => cat.pages);
