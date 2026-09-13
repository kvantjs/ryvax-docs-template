import React, { useState } from 'react';
import { Search, Sun, Moon, Github, Menu, X, ChevronDown, Sparkles, BookOpen, Terminal, Code, Cpu } from 'lucide-react';
import { ThemeMode } from '../types/docs';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  selectedCategory: string;
  onSelectCategoryTab: (catId: string) => void;
}

export function Header({
  theme,
  onToggleTheme,
  onOpenSearch,
  onToggleMobileMenu,
  isMobileMenuOpen,
  selectedCategory,
  onSelectCategoryTab
}: HeaderProps) {
  const [version, setVersion] = useState<string>('v2.4.0 (Latest)');
  const [showVersionMenu, setShowVersionMenu] = useState<boolean>(false);

  const navTabs = [
    { id: 'getting-started', label: 'Docs', icon: BookOpen },
    { id: 'api-reference', label: 'API Reference', icon: Terminal },
    { id: 'sdks-and-tools', label: 'SDKs', icon: Code },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-custom bg-header backdrop-blur-md transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Version Picker */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5 min-w-0 flex-1 lg:flex-initial">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-[6px] text-custom-muted hover:text-custom-title hover:bg-card-hover transition-colors"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => onSelectCategoryTab('getting-started')}>
            <img 
              src="https://imgdb.io/i/EyqPfKM.png" 
              alt="Abstract Logo" 
              className="h-6 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity" 
              referrerPolicy="no-referrer" 
            />
            <span className="text-neutral-500 font-light select-none text-sm">/</span>
            <img 
              src="https://imgdb.io/i/Ec5Zcqo.png" 
              alt="Complete Logo" 
              className="h-5.5 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity" 
              referrerPolicy="no-referrer" 
            />
          </div>

          {/* Version badge & picker */}
          <div className="relative hidden sm:block shrink-0">
            <button
              onClick={() => setShowVersionMenu(!showVersionMenu)}
              className="flex items-center justify-between w-32 shrink-0 px-2 py-1 rounded-[6px] border border-custom bg-card-custom text-[11px] font-mono text-custom-muted hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-custom-title transition-colors"
            >
              <span className="truncate pr-1">{version}</span>
              <ChevronDown className="w-3 h-3 text-custom-muted shrink-0" />
            </button>

            {showVersionMenu && (
              <div 
                className="absolute left-0 mt-1.5 w-36 rounded-[6px] border border-custom bg-card-custom shadow-2xl py-1 z-50 text-xs font-mono"
                onMouseLeave={() => setShowVersionMenu(false)}
              >
                {['v2.4.0 (Latest)', 'v2.3.2', 'v2.0.0 (LTS)', 'v1.8.0'].map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setVersion(v);
                      setShowVersionMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-card-hover transition-colors ${
                      version === v ? 'text-custom-title font-semibold bg-card-hover' : 'text-custom-muted hover:text-custom-title'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Global Navigation Tabs (Moved here to the right of version selector) */}
          <nav className="hidden lg:flex items-center gap-1 bg-card-custom p-1 rounded-[6px] border border-custom shrink-0">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === 'getting-started'
                ? ['getting-started', 'core-concepts', 'guides-recipes'].includes(selectedCategory)
                : selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectCategoryTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-card-hover text-custom-title border border-custom shadow-xs'
                      : 'text-custom-muted hover:text-custom-title hover:bg-card-hover'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-custom-muted" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search trigger, Theme switch, GitHub link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cmd + K search trigger button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] border border-custom bg-card-custom text-custom-muted hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-custom-title text-xs transition-colors group"
          >
            <Search className="w-3.5 h-3.5 text-custom-muted group-hover:text-custom-title" />
            <span className="hidden sm:inline">Search docs...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[6px] border border-custom bg-card-hover text-[10px] font-mono text-custom-muted font-medium">
              ⌘K
            </kbd>
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium text-custom-body hover:text-custom-title hover:bg-card-hover border border-custom bg-card-custom transition-colors"
          >
            <Github className="w-3.5 h-3.5 text-custom-muted" />
            <span>GitHub</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-[6px] bg-card-hover text-custom-muted font-mono border border-custom">
              14.2k
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
