import React, { useState } from 'react';
import { CodeSnippet } from '../types/docs';
import { tokenizeLine, formatTokenColor } from '../utils/codeHighlighter';
import { Copy, Check, Play, Terminal, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface CodeBlockProps {
  snippets: CodeSnippet[];
  title?: string;
}

export function CodeBlock({ snippets, title }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [outputLogs, setOutputLogs] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!snippets || snippets.length === 0) return null;

  const currentSnippet = snippets[activeTab] || snippets[0];
  const lines = currentSnippet.code.split('\n');
  const isLongCode = lines.length > 24;
  const displayedLines = isLongCode && !isExpanded ? lines.slice(0, 20) : lines;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutputLogs(null);

    const delay = currentSnippet.executionTimeMs || 250;
    setTimeout(() => {
      setIsRunning(false);
      setOutputLogs(currentSnippet.expectedOutput || 'Execution completed with return code 0 (success).');
    }, Math.min(delay, 1200));
  };

  return (
    <div className="my-5 rounded-[6px] border border-[#141414] bg-[#0a0a0a] text-neutral-200 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#141414] bg-[#0d0d0d] px-3.5 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {snippets.length > 1 ? (
            snippets.map((snip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab(idx);
                  setShowOutput(false);
                }}
                className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === idx
                    ? 'bg-[#181818] text-white font-semibold border border-[#141414] shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {snip.label}
              </button>
            ))
          ) : (
            <span className="text-xs font-medium text-neutral-400 font-mono px-2 py-0.5">
              {title || currentSnippet.label || currentSnippet.language}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {currentSnippet.runnable && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-neutral-200 hover:bg-white text-neutral-950 text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-neutral-950" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs text-neutral-400 hover:text-white hover:bg-[#141414] border border-[#141414] bg-[#0d0d0d] transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-neutral-200" />
                <span className="text-neutral-200">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="relative overflow-x-auto p-4 font-mono text-[13px] leading-relaxed select-text bg-[#0a0a0a]">
        <table className="w-full border-collapse">
          <tbody>
            {displayedLines.map((line, idx) => {
              const lineNum = idx + 1;
              const isHighlighted = currentSnippet.highlightLines?.includes(lineNum);
              const tokens = tokenizeLine(line, currentSnippet.language);

              return (
                <tr
                  key={idx}
                  className={`${
                    isHighlighted ? 'bg-[#141414] border-l-2 border-white -ml-4 pl-4' : ''
                  } hover:bg-[#111111] transition-colors`}
                >
                  <td className="w-8 select-none pr-4 text-right text-neutral-600 text-xs font-mono align-top">
                    {lineNum}
                  </td>
                  <td className="whitespace-pre align-top">
                    {tokens.map((token, tIdx) => (
                      <span key={tIdx} className={formatTokenColor(token.type, true)}>
                        {token.text}
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {isLongCode && (
          <div className="pt-2 text-center border-t border-[#141414] mt-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white font-medium py-1 px-3 rounded-[6px] hover:bg-[#141414] transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Show all {lines.length} lines
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Interactive Execution Output Terminal */}
      {showOutput && (
        <div className="border-t border-[#141414] bg-[#080808] p-4 text-xs font-mono">
          <div className="flex items-center justify-between text-neutral-400 mb-2 border-b border-[#141414] pb-2">
            <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              <span>Console Output</span>
            </div>
            <span className="text-[11px] text-neutral-500">
              {isRunning ? 'Executing request...' : 'Status: 200 OK • 0 error(s)'}
            </span>
          </div>

          {isRunning ? (
            <div className="flex items-center gap-2 py-4 text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-300" />
              <span>Sending payload to test runtime cluster...</span>
            </div>
          ) : (
            <pre className="text-neutral-200 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-56">
              {outputLogs}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
