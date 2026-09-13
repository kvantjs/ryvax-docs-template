import React, { useState, useEffect, useRef } from 'react';
import { DocCategory, SearchResult } from '../types/docs';
import { Search, Hash, Code, FileText, ArrowRight, CornerDownLeft, Sparkles, X } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: DocCategory[];
  onSelectResult: (pageId: string, sectionId?: string) => void;
}

export function SearchModal({ isOpen, onClose, categories, onSelectResult }: SearchModalProps) {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Build index and search
  const results: SearchResult[] = [];

  if (query.trim().length > 0) {
    const q = query.toLowerCase();

    categories.forEach(cat => {
      cat.pages.forEach(page => {
        // Match page title or description
        if (page.title.toLowerCase().includes(q) || page.description.toLowerCase().includes(q)) {
          results.push({
            pageId: page.id,
            pageTitle: page.title,
            categoryTitle: cat.title,
            snippet: page.description,
            matchType: 'title'
          });
        }

        // Match sections
        page.sections.forEach(sec => {
          if (sec.title.toLowerCase().includes(q)) {
            results.push({
              pageId: page.id,
              pageTitle: page.title,
              categoryTitle: cat.title,
              sectionId: sec.id,
              sectionTitle: sec.title,
              snippet: sec.content ? sec.content.slice(0, 110) + '...' : `Section on ${sec.title}`,
              matchType: 'content'
            });
          } else if (sec.content && sec.content.toLowerCase().includes(q)) {
            const idx = sec.content.toLowerCase().indexOf(q);
            const start = Math.max(0, idx - 30);
            const snippet = (start > 0 ? '...' : '') + sec.content.slice(start, start + 120) + '...';
            results.push({
              pageId: page.id,
              pageTitle: page.title,
              categoryTitle: cat.title,
              sectionId: sec.id,
              sectionTitle: sec.title,
              snippet,
              matchType: 'content'
            });
          }

          // Match API endpoint paths
          if (sec.apiEndpoint && (sec.apiEndpoint.path.toLowerCase().includes(q) || sec.apiEndpoint.summary.toLowerCase().includes(q))) {
            results.push({
              pageId: page.id,
              pageTitle: page.title,
              categoryTitle: cat.title,
              sectionId: sec.id,
              sectionTitle: `${sec.apiEndpoint.method} ${sec.apiEndpoint.path}`,
              snippet: sec.apiEndpoint.summary,
              matchType: 'code'
            });
          }
        });
      });
    });
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          onSelectResult(selected.pageId, selected.sectionId);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, onSelectResult]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-[6px] border border-[#141414] bg-[#0a0a0a] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#141414] bg-[#0d0d0d]">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documentation, API endpoints, SDK methods..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-[6px] border border-[#141414] bg-[#141414] text-[10px] font-mono text-neutral-300">
            ESC
          </kbd>
          <button onClick={onClose} className="sm:hidden text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-2 bg-[#0a0a0a]">
          {query.trim().length === 0 ? (
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
                Suggested Quick Access
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {[
                  { pageId: 'quickstart', title: 'Quickstart Guide', cat: 'Getting Started' },
                  { pageId: 'chat-completions', title: 'POST /v1/chat/completions', cat: 'API Reference' },
                  { pageId: 'streaming', title: 'Streaming & SSE Mechanics', cat: 'Core Concepts' },
                  { pageId: 'token-streamer-sandbox', title: 'Token Streamer Sandbox', cat: 'Interactive Playgrounds' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectResult(item.pageId);
                      onClose();
                    }}
                    className="p-2.5 rounded-[6px] border border-[#141414] bg-[#0d0d0d] hover:bg-[#141414] text-left transition-colors group"
                  >
                    <div className="text-xs font-semibold text-neutral-200 group-hover:text-white">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{item.cat}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              No documentation pages found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {results.slice(0, 10).map((res, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectResult(res.pageId, res.sectionId);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-3 rounded-[6px] transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#181818] text-white border border-[#141414] shadow-xs'
                        : 'text-neutral-300 hover:bg-[#111111] border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-1 rounded-[6px] bg-[#141414] border border-[#141414] text-neutral-300 shrink-0">
                        {res.matchType === 'code' ? (
                          <Code className="w-3.5 h-3.5" />
                        ) : res.sectionId ? (
                          <Hash className="w-3.5 h-3.5" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">
                            {res.sectionTitle || res.pageTitle}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-[6px] bg-[#141414] border border-[#141414] text-neutral-400">
                            {res.categoryTitle}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                          {res.snippet}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 mt-1">
                      {isSelected ? (
                        <CornerDownLeft className="w-4 h-4 text-neutral-200" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-neutral-500 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d0d0d] border-t border-[#141414] text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="font-mono bg-[#141414] border border-[#141414] px-1.5 py-0.5 rounded-[6px] text-[10px] text-neutral-300">↑</kbd> <kbd className="font-mono bg-[#141414] border border-[#141414] px-1.5 py-0.5 rounded-[6px] text-[10px] text-neutral-300">↓</kbd> to navigate</span>
            <span><kbd className="font-mono bg-[#141414] border border-[#141414] px-1.5 py-0.5 rounded-[6px] text-[10px] text-neutral-300">↵</kbd> to select</span>
          </div>
          <span>Ryvax Docs Engine</span>
        </div>
      </div>
    </div>
  );
}
