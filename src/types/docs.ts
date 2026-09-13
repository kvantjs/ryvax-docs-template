export type ThemeMode = 'light' | 'dark' | 'system';

export type LanguageTab = 'typescript' | 'python' | 'go' | 'rust' | 'curl' | 'json';

export interface CodeSnippet {
  language: LanguageTab;
  label: string;
  code: string;
  highlightLines?: number[];
  runnable?: boolean;
  expectedOutput?: string;
  executionTimeMs?: number;
}

export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
  enumOptions?: string[];
  example?: string;
}

export interface ApiResponseExample {
  status: number;
  statusText: string;
  description: string;
  body: Record<string, any> | string;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  authRequired: boolean;
  parameters?: {
    path?: ApiParameter[];
    query?: ApiParameter[];
    headers?: ApiParameter[];
    body?: ApiParameter[];
  };
  requestBodyExample?: Record<string, any>;
  responses: ApiResponseExample[];
  codeSnippets: CodeSnippet[];
}

export interface Callout {
  type: 'info' | 'tip' | 'warning' | 'danger';
  title?: string;
  content: string;
}

export interface TocItem {
  id: string;
  title: string;
  level: 2 | 3;
}

export interface DocSection {
  id: string;
  title: string;
  level?: 2 | 3;
  content?: string;
  callout?: Callout;
  codeSnippets?: CodeSnippet[];
  apiEndpoint?: ApiEndpoint;
  interactiveType?: 'token-streamer' | 'rate-calculator' | 'webhook-tester' | 'similarity-calculator' | 'schema-validator' | 'latency-monitor' | 'prompt-tokenizer' | 'curl-converter';
  steps?: {
    number: number;
    title: string;
    description: string;
    code?: string;
    language?: LanguageTab;
  }[];
  paramTable?: {
    title?: string;
    params: ApiParameter[];
  };
}

export interface DocPage {
  id: string;
  title: string;
  description: string;
  category: string;
  badge?: string;
  methodTag?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'SSE' | 'WS';
  lastUpdated: string;
  readTime: string;
  sections: DocSection[];
}

export interface DocCategory {
  id: string;
  title: string;
  iconName: string;
  pages: DocPage[];
}

export interface SearchResult {
  pageId: string;
  pageTitle: string;
  categoryTitle: string;
  sectionId?: string;
  sectionTitle?: string;
  snippet: string;
  matchType: 'title' | 'content' | 'code' | 'parameter';
}
