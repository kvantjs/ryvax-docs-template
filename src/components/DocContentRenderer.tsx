import React, { useState, useEffect } from 'react';
import { DocPage, DocSection, Callout, ApiParameter } from '../types/docs';
import { DOCS_MDX_SOURCES } from '../data/docsMdxSources';
import { CodeBlock } from './CodeBlock';
import { ApiExplorer } from './ApiExplorer';
import { 
  TokenStreamerPlayground, 
  RateLimitCostCalculator, 
  WebhookTester, 
  VectorSimilarityCalculator,
  LatencyPingMonitor,
  PromptTokenizerPlayground,
  CurlToCodeConverter,
  SchemaValidatorPlayground
} from './InteractivePlaygrounds';
import { 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Calendar, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight,
  Hash,
  Copy,
  Check,
  Download,
  FileCode,
  Share2
} from 'lucide-react';

interface DocContentRendererProps {
  page: DocPage;
  prevPage?: DocPage | null;
  nextPage?: DocPage | null;
  onNavigatePage: (pageId: string) => void;
}

export function DocContentRenderer({ page, prevPage, nextPage, onNavigatePage }: DocContentRendererProps) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large'>('normal');
  const [viewMode, setViewMode] = useState<'preview' | 'mdx'>('preview');

  const handleCopyMarkdown = () => {
    let md = `# ${page.title}\n\n${page.description}\n\n`;
    page.sections.forEach(s => {
      md += `## ${s.title}\n\n`;
      if (s.content) md += `${s.content}\n\n`;
      if (s.codeSnippets) {
        s.codeSnippets.forEach(cs => {
          md += `\`\`\`${cs.language}\n${cs.code}\n\`\`\`\n\n`;
        });
      }
    });
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const renderCallout = (callout: Callout) => {
    const iconMap = {
      info: Info,
      tip: Lightbulb,
      warning: AlertTriangle,
      danger: AlertOctagon,
    };

    const Icon = iconMap[callout.type] || Info;

    const isWarningOrDanger = callout.type === 'warning' || callout.type === 'danger';
    const bgClass = isWarningOrDanger ? 'bg-[#331b00]' : 'bg-card-custom';
    const textClass = isWarningOrDanger ? 'text-[#c18f3a]' : 'text-custom-title';
    const iconClass = isWarningOrDanger ? 'text-[#c18f3a]' : 'text-custom-muted';
    const bodyTextClass = isWarningOrDanger ? 'text-[#c18f3a]' : 'text-custom-body';
    const borderClass = isWarningOrDanger ? 'border-[#c18f3a]/30' : 'border-custom';

    return (
      <div className={`my-5 p-4 rounded-[6px] border ${borderClass} ${bgClass} text-xs sm:text-sm`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconClass}`} />
          <div className="space-y-1">
            {callout.title && (
              <h5 className={`font-semibold ${textClass}`}>
                {callout.title}
              </h5>
            )}
            <p className={`${bodyTextClass} leading-relaxed`}>
              {callout.content}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderParamTable = (params: ApiParameter[], title?: string) => (
    <div className="my-5 overflow-hidden rounded-[6px] border border-custom bg-card-custom">
      {title && (
        <div className="px-4 py-2.5 bg-card-hover border-b border-custom font-semibold text-xs text-custom-title">
          {title}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-custom bg-card-custom text-custom-muted">
              <th className="py-2.5 px-4 font-semibold">Parameter</th>
              <th className="py-2.5 px-4 font-semibold">Type</th>
              <th className="py-2.5 px-4 font-semibold">Required</th>
              <th className="py-2.5 px-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-custom font-sans">
            {params.map((param, idx) => (
              <tr key={idx} className="hover:bg-card-hover/40 transition-colors">
                <td className="py-3 px-4 font-mono font-semibold text-custom-title whitespace-nowrap">
                  {param.name}
                </td>
                <td className="py-3 px-4 font-mono text-custom-muted text-[11px]">
                  {param.type}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {param.required ? (
                    <span className="px-2 py-0.5 rounded-[6px] bg-card-hover text-custom-title border border-custom font-semibold text-[10px]">
                      Required
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-[6px] bg-card-custom text-custom-muted border border-custom text-[10px]">
                      Optional
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-custom-body leading-relaxed">
                  {param.description}
                  {param.defaultValue && (
                    <div className="mt-1 text-[11px] font-mono text-custom-muted">
                      Default: <code className="text-custom-title bg-card-hover px-1 py-0.5 rounded-[6px] border border-custom">{param.defaultValue}</code>
                    </div>
                  )}
                  {param.enumOptions && (
                    <div className="mt-1 text-[11px] flex items-center gap-1.5 flex-wrap">
                      <span className="text-custom-muted">Options:</span>
                      {param.enumOptions.map((opt, oIdx) => (
                        <code key={oIdx} className="px-1.5 py-0.2 rounded-[6px] bg-card-hover text-custom-title border border-custom">
                          {opt}
                        </code>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <article className={`min-w-0 flex-1 max-w-4xl py-6 px-4 sm:px-8 ${fontSizeScale === 'large' ? 'text-base' : ''}`}>
      {/* Breadcrumbs & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <nav className="flex items-center gap-1.5 text-xs text-custom-muted">
          <span>Documentation</span>
          <ChevronRight className="w-3.5 h-3.5 text-custom-muted" />
          <span className="text-custom-body">{page.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-custom-muted" />
          <span className="text-custom-title font-medium truncate">{page.title}</span>
        </nav>

        {/* Page Top Actions */}
        <div className="flex items-center gap-2">
          {/* Font Scale Toggle */}
          <div className="flex items-center bg-card-custom border border-custom rounded-[6px] p-0.5 text-xs">
            <button
              onClick={() => setFontSizeScale('normal')}
              className={`px-2 py-0.5 rounded-[6px] text-[11px] font-mono transition-colors ${
                fontSizeScale === 'normal' ? 'bg-card-hover text-custom-title font-bold' : 'text-custom-muted hover:text-custom-title'
              }`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSizeScale('large')}
              className={`px-2 py-0.5 rounded-[6px] text-xs font-mono transition-colors ${
                fontSizeScale === 'large' ? 'bg-card-hover text-custom-title font-bold' : 'text-custom-muted hover:text-custom-title'
              }`}
              title="Large Font Size"
            >
              A+
            </button>
          </div>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-custom bg-card-custom hover:bg-card-hover text-xs text-custom-body hover:text-custom-title transition-colors"
            title="Copy entire page as clean Markdown"
          >
            {copiedMd ? (
              <>
                <Check className="w-3.5 h-3.5 text-custom-title" />
                <span className="text-custom-title">Copied MD</span>
              </>
            ) : (
              <>
                <FileCode className="w-3.5 h-3.5 text-custom-muted" />
                <span className="hidden sm:inline">Copy Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Page Header */}
      <header className="border-b border-custom pb-6 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-custom-title">
            {page.title}
          </h1>
          {page.badge && (
            <span className="px-2.5 py-0.5 rounded-[6px] text-xs font-semibold bg-card-hover text-custom-title border border-custom">
              {page.badge}
            </span>
          )}
        </div>

        <p className="text-sm sm:text-base text-custom-body leading-relaxed mb-4">
          {page.description}
        </p>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-custom-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-custom-muted" />
            <span>Updated {page.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>{page.readTime}</span>
          </div>
        </div>
      </header>

      {/* Mintlify Structure Mode Selector */}
      <div className="flex items-center gap-1.5 border-b border-custom mb-8 pb-3">
        <button
          onClick={() => setViewMode('preview')}
          className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all ${
            viewMode === 'preview'
              ? 'bg-card-hover text-custom-title border border-custom shadow-xs'
              : 'text-custom-muted hover:text-custom-title'
          }`}
          id="toggle-interactive-preview"
        >
          Interactive Preview
        </button>
        <button
          onClick={() => setViewMode('mdx')}
          className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-all flex items-center gap-1.5 ${
            viewMode === 'mdx'
              ? 'bg-card-hover text-custom-title border border-custom shadow-xs'
              : 'text-custom-muted hover:text-custom-title'
          }`}
          id="toggle-mintlify-source"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Mintlify MDX Source
        </button>
      </div>

      {viewMode === 'mdx' ? (
        <div className="space-y-6">
          <div className="p-4 rounded-[6px] bg-card-custom/50 border border-custom">
            <div className="flex items-center justify-between mb-3 border-b border-custom pb-2">
              <span className="font-mono text-xs text-custom-muted">docs/{page.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}/{page.id}.mdx</span>
              <span className="px-2 py-0.5 rounded-[6px] text-[10px] uppercase font-bold tracking-wider bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                Mintlify Standard
              </span>
            </div>
            <CodeBlock 
              snippets={[{
                language: 'typescript',
                label: `${page.id}.mdx`,
                code: DOCS_MDX_SOURCES[page.id] || `---\ntitle: "${page.title}"\ndescription: "${page.description}"\n---\n\n# ${page.title}\n\n${page.description}`
              }]} 
            />
          </div>
          
          <div className="p-4 rounded-[6px] border border-blue-300/40 dark:border-blue-900/20 bg-blue-100/10 dark:bg-blue-950/10 text-xs sm:text-sm">
            <h4 className="font-semibold text-blue-600 dark:text-blue-200 mb-1">Mintlify MDX Compilation Info</h4>
            <p className="text-custom-muted leading-relaxed">
              This page complies with Mintlify’s standards: uses unified MDX styling, clean parameter representations via {"<ParamField>"} and {"<ResponseField>"} tags, unified relative image asset referencing (`/images/logo.svg`), and links seamlessly into the primary `docs.json` navigation outline.
            </p>
          </div>
        </div>
      ) : (
        /* Main Sections Content */
        <div className="space-y-10">
          {page.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              {/* Section Title */}
              <div className="group flex items-center gap-2 mb-3">
                <h2 className="text-lg sm:text-xl font-bold text-custom-title">
                  {section.title}
                </h2>
                <a 
                  href={`#${section.id}`} 
                  className="opacity-0 group-hover:opacity-100 text-custom-muted hover:text-custom-title transition-opacity"
                  aria-label={`Link to ${section.title}`}
                >
                  <Hash className="w-4 h-4" />
                </a>
              </div>

              {/* Section Prose Content */}
              {section.content && (
                <p className="text-sm text-custom-body leading-relaxed mb-4">
                  {section.content}
                </p>
              )}

              {/* Callout */}
              {section.callout && renderCallout(section.callout)}

              {/* Parameter Table */}
              {section.paramTable && renderParamTable(section.paramTable.params, section.paramTable.title)}

              {/* Code Snippets */}
              {section.codeSnippets && section.codeSnippets.length > 0 && (
                <CodeBlock snippets={section.codeSnippets} />
              )}

              {/* API Endpoint Workbench */}
              {section.apiEndpoint && (
                <ApiExplorer endpoint={section.apiEndpoint} />
              )}

              {/* Interactive Playgrounds */}
              {section.interactiveType === 'token-streamer' && <TokenStreamerPlayground />}
              {section.interactiveType === 'rate-calculator' && <RateLimitCostCalculator />}
              {section.interactiveType === 'webhook-tester' && <WebhookTester />}
              {section.interactiveType === 'similarity-calculator' && <VectorSimilarityCalculator />}
              {section.interactiveType === 'latency-monitor' && <LatencyPingMonitor />}
              {section.interactiveType === 'prompt-tokenizer' && <PromptTokenizerPlayground />}
              {section.interactiveType === 'curl-converter' && <CurlToCodeConverter />}
              {section.interactiveType === 'schema-validator' && <SchemaValidatorPlayground />}

              {/* Step-by-Step Flow */}
              {section.steps && (
                <div className="my-6 space-y-4">
                  {section.steps.map((step) => (
                    <div key={step.number} className="flex items-start gap-3.5 p-4 rounded-[6px] border border-custom bg-card-custom">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-card-hover border border-custom text-custom-title font-mono text-xs font-bold shadow-xs">
                        {step.number}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-custom-title">
                          {step.title}
                        </h4>
                        <p className="text-xs text-custom-muted leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <footer className="mt-14 pt-8 border-t border-custom grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevPage ? (
          <button
            onClick={() => onNavigatePage(prevPage.id)}
            className="flex items-center gap-3 p-4 rounded-[6px] border border-custom hover:border-neutral-400 dark:hover:border-neutral-700 bg-card-custom hover:bg-card-hover text-left transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-custom-muted group-hover:-translate-x-0.5 group-hover:text-custom-title transition-all shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-custom-muted uppercase tracking-wider block">Previous</span>
              <span className="text-xs font-semibold text-custom-body group-hover:text-custom-title truncate block">
                {prevPage.title}
              </span>
            </div>
          </button>
        ) : <div />}

        {nextPage ? (
          <button
            onClick={() => onNavigatePage(nextPage.id)}
            className="flex items-center justify-end gap-3 p-4 rounded-[6px] border border-custom hover:border-neutral-400 dark:hover:border-neutral-700 bg-card-custom hover:bg-card-hover text-right transition-all group"
          >
            <div className="min-w-0">
              <span className="text-[11px] text-custom-muted uppercase tracking-wider block">Next</span>
              <span className="text-xs font-semibold text-custom-body group-hover:text-custom-title truncate block">
                {nextPage.title}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-custom-muted group-hover:translate-x-0.5 group-hover:text-custom-title transition-all shrink-0" />
          </button>
        ) : <div />}
      </footer>
    </article>
  );
}
