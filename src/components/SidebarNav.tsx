import React, { useState } from 'react';
import { DocCategory, DocPage } from '../types/docs';
import { 
  Rocket, 
  Cpu, 
  Code, 
  PlayCircle, 
  Layers, 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';

interface SidebarNavProps {
  categories: DocCategory[];
  currentPageId: string;
  onSelectPage: (pageId: string) => void;
  isMobile?: boolean;
}

export function SidebarNav({ categories, currentPageId, onSelectPage, isMobile }: SidebarNavProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [sidebarFilter, setSidebarFilter] = useState<string>('');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Rocket': return <Rocket className="w-4 h-4 text-custom-muted" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-custom-muted" />;
      case 'Code': return <Code className="w-4 h-4 text-custom-muted" />;
      case 'PlayCircle': return <PlayCircle className="w-4 h-4 text-custom-muted" />;
      case 'Layers': return <Layers className="w-4 h-4 text-custom-muted" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-custom-muted" />;
      default: return <BookOpen className="w-4 h-4 text-custom-muted" />;
    }
  };

  const getMethodBadge = (method?: string) => {
    if (!method) return null;
    const styles: Record<string, string> = {
      POST: 'inline-flex items-center justify-center text-center bg-green-500/10 dark:bg-[#101010] text-green-600 dark:text-[#4ade80] border-green-500/20 dark:border-[#22c55e]/20 text-[9px] font-mono font-bold px-1.5 h-4 leading-none rounded-[4px] border uppercase shrink-0 min-w-[32px]',
      GET: 'inline-flex items-center justify-center text-center bg-blue-500/10 dark:bg-[#101010] text-blue-600 dark:text-[#60a5fa] border-blue-500/20 dark:border-[#3b82f6]/20 text-[9px] font-mono font-bold px-1.5 h-4 leading-none rounded-[4px] border uppercase shrink-0 min-w-[32px]',
      PUT: 'inline-flex items-center justify-center text-center bg-amber-500/10 dark:bg-[#101010] text-amber-600 dark:text-[#f59e0b] border-amber-500/20 dark:border-[#d97706]/20 text-[9px] font-mono font-bold px-1.5 h-4 leading-none rounded-[4px] border uppercase shrink-0 min-w-[32px]',
      DELETE: 'inline-flex items-center justify-center text-center bg-red-500/10 dark:bg-[#101010] text-red-600 dark:text-[#ef4444] border-red-500/20 dark:border-[#dc2626]/20 text-[9px] font-mono font-bold px-1.5 h-4 leading-none rounded-[4px] border uppercase shrink-0 min-w-[32px]',
      SSE: 'inline-flex items-center justify-center text-center bg-purple-500/10 dark:bg-[#101010] text-purple-600 dark:text-[#c084fc] border-purple-500/20 dark:border-[#a855f7]/20 text-[9px] font-mono font-bold px-1.5 h-4 leading-none rounded-[4px] border uppercase shrink-0 min-w-[32px]',
      WS: 'inline-flex items-center justify-center text-center bg-sky-500/10 dark:bg-[#101010] text-sky-600 dark:text-[#38bdf8] border-sky-500/20 dark:border-[#0ea5e9]/20 text-[9px] font-mono font-bold px-1.5 h-4 leading-none rounded-[4px] border uppercase shrink-0 min-w-[32px]'
    };
    return <span className={styles[method] || 'inline-flex items-center justify-center text-center bg-card-custom dark:bg-[#141414] text-custom-muted text-[9px] font-mono font-bold px-1.5 h-4 leading-none rounded-[4px] border uppercase shrink-0 min-w-[32px]'}>{method}</span>;
  };

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const getBadgeStyle = () => {
    // Vibrant Blue styling ONLY for actual sidebar tags
    return 'inline-flex items-center justify-center text-center bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/40 text-[9px] font-semibold font-mono px-1.5 h-4 leading-none shadow-[0_0_8px_rgba(59,130,246,0.15)] dark:shadow-[0_0_8px_rgba(59,130,246,0.2)]';
  };

  return (
    <aside className={`w-full h-full flex flex-col justify-between ${isMobile ? 'p-4' : 'py-5 px-3'}`}>
      {/* Scrollable navigation and search */}
      <div className="flex-1 overflow-y-auto pr-1.5 no-scrollbar space-y-5">
        {/* Search filter input */}
        <div className="relative mb-5">
          <Filter className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-custom-muted" />
          <input
            type="text"
            placeholder="Filter navigation..."
            value={sidebarFilter}
            onChange={(e) => setSidebarFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-[6px] border border-custom bg-white dark:bg-[#0d0d0d] text-xs text-custom-title placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-colors"
          />
          {sidebarFilter && (
            <button 
              onClick={() => setSidebarFilter('')}
              className="absolute right-2.5 top-2 text-[10px] text-custom-muted hover:text-custom-title"
            >
              Clear
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-6">
          {categories.map((cat) => {
            const isCollapsed = false; // Always expanded, cannot be collapsed
            const filteredPages = sidebarFilter.trim()
              ? cat.pages.filter(p => p.title.toLowerCase().includes(sidebarFilter.toLowerCase()) || p.description.toLowerCase().includes(sidebarFilter.toLowerCase()))
              : cat.pages;

            if (sidebarFilter.trim() && filteredPages.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-1.5">
                {/* Category Header (Always expanded, non-clickable) */}
                <div className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wider text-custom-muted">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(cat.iconName)}
                    <span>{cat.title}</span>
                  </div>
                </div>

                {/* Category Pages */}
                <ul className="space-y-0.5 border-l border-custom ml-3 pl-2.5">
                  {filteredPages.map((page) => {
                    const isActive = page.id === currentPageId;
                    return (
                      <li key={page.id}>
                        <button
                          onClick={() => onSelectPage(page.id)}
                          className={`w-full text-left flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium transition-all group ${
                            isActive
                              ? 'bg-card-hover text-custom-title font-semibold border-l-2 border-current -ml-2.5 pl-4'
                              : 'text-custom-muted hover:text-custom-title hover:bg-card-hover'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate min-w-0">
                            {getMethodBadge(page.methodTag)}
                            <span className="truncate">{page.title}</span>
                          </div>
                          {page.badge && (
                            <span className={`shrink-0 rounded-[4px] ${getBadgeStyle()}`}>
                              {page.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: Real-time API Edge Status - Always at the very bottom */}
      <div className="pt-4 border-t border-custom mt-4 shrink-0">
        <button
          onClick={() => onSelectPage('latency-monitor-sandbox')}
          className="w-full p-2.5 rounded-[6px] bg-card-custom hover:bg-card-hover border border-custom text-left transition-colors group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-custom-title">Global Edge API</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-custom-muted">
              <span className="w-1.5 h-1.5 rounded-[6px] bg-[#407BFF]" />
              99.99% SLA
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-custom-muted">
            <span>Anycast PoPs</span>
            <span className="font-mono text-custom-body">14ms latency</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
