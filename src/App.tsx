import React, { useState, useEffect } from 'react';
import { DOCS_CATEGORIES, ALL_DOC_PAGES } from './data/docsContent';
import { DocPage, ThemeMode } from './types/docs';
import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import { TableOfContents } from './components/TableOfContents';
import { DocContentRenderer } from './components/DocContentRenderer';
import { SearchModal } from './components/SearchModal';
import { X } from 'lucide-react';
import { Typescript, Python, Go, Rust, Github, Nodejs, Npm, Docker } from '@thesvg/react';
import { tokenizeLine, formatTokenColor } from './utils/codeHighlighter';

export default function App() {
  // Theme state
  const [theme] = useState<ThemeMode>('dark');

  // Current page state
  const [currentPageId, setCurrentPageId] = useState<string>('quickstart');
  const [activeSectionId, setActiveSectionId] = useState<string>('overview');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  // Initial loading effect (runs once on mount)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000); // 2s initial app loading duration
    return () => clearTimeout(timer);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ryvax_docs_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // Locked to dark mode by user request
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Find active page
  const currentPage: DocPage = ALL_DOC_PAGES.find(p => p.id === currentPageId) || ALL_DOC_PAGES[0];

  // Compute previous and next pages for pagination
  const currentIndex = ALL_DOC_PAGES.findIndex(p => p.id === currentPage.id);
  const prevPage = currentIndex > 0 ? ALL_DOC_PAGES[currentIndex - 1] : null;
  const nextPage = currentIndex < ALL_DOC_PAGES.length - 1 ? ALL_DOC_PAGES[currentIndex + 1] : null;

  // Find category for current page
  const currentCategory = DOCS_CATEGORIES.find(c => c.pages.some(p => p.id === currentPage.id))?.id || 'getting-started';

  // Resolve active main section
  const activeTab = (() => {
    if (currentPageId === 'sdks-and-tools') {
      return 'sdks';
    }
    if (['getting-started', 'core-concepts', 'guides-recipes'].includes(currentCategory)) {
      return 'docs';
    }
    if (currentCategory === 'api-reference') {
      return 'api-reference';
    }
    return 'docs';
  })();

  const sidebarCategories = (() => {
    switch (activeTab) {
      case 'docs':
      case 'sdks':
        return DOCS_CATEGORIES.filter(c => ['getting-started', 'core-concepts', 'guides-recipes'].includes(c.id));
      case 'api-reference':
        return DOCS_CATEGORIES.filter(c => c.id === 'api-reference');
      default:
        return DOCS_CATEGORIES;
    }
  })();

  // Section intersection observer for Scrollspy on right TOC
  useEffect(() => {
    const handleScroll = () => {
      const sections = currentPage.sections;
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSectionId(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const handleSelectPage = (pageId: string) => {
    setCurrentPageId(pageId);
    setIsMobileMenuOpen(false);
  };

  const handleSelectSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSearchResult = (pageId: string, sectionId?: string) => {
    setCurrentPageId(pageId);
    setIsMobileMenuOpen(false);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleSelectCategoryTab = (catId: string) => {
    if (catId === 'sdks-and-tools') {
      setCurrentPageId('sdks-and-tools');
      return;
    }
    const targetCat = DOCS_CATEGORIES.find(c => c.id === catId);
    if (targetCat && targetCat.pages.length > 0) {
      handleSelectPage(targetCat.pages[0].id);
    }
  };

  const renderSdksLayout = () => {
    const renderHighlightedCode = (code: string, language: string) => {
      const lines = code.trim().split('\n');
      return (
        <pre className="bg-[#0d0d0d] p-3.5 rounded-[6px] border border-[#141414]/50 font-mono text-[11px] overflow-x-auto leading-relaxed select-text w-full">
          <code className="block">
            {lines.map((line, idx) => {
              const tokens = tokenizeLine(line, language);
              return (
                <div key={idx} className="min-h-[1.5em] whitespace-pre">
                  {tokens.map((token, tIdx) => (
                    <span key={tIdx} className={formatTokenColor(token.type, true)}>
                      {token.text}
                    </span>
                  ))}
                </div>
              );
            })}
          </code>
        </pre>
      );
    };

    return (
      <div className="space-y-8 py-4 animate-fade-in select-none">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Simulated SDK Integration Templates
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl leading-relaxed">
            These installation cards and code boxes serve as layout examples. None of these packages exist or are intended for real production deployments.
          </p>
        </div>

        {/* SDK Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TypeScript/Node.js SDK Card */}
          <div className="border border-[#141414] bg-[#0d0d0d] rounded-[6px] p-6 hover:border-neutral-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-8 w-8 rounded-[6px] bg-[#111] border border-[#141414]">
                    <Typescript className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">TypeScript & Node.js</h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 bg-[#141414] px-2 py-0.5 rounded-[4px] border border-[#141414]/50">v2.4.0 • npm</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Native ESM & CommonJS module exports with built-in async generator support for server-sent event (SSE) token streams.
              </p>
              
              <div className="bg-[#0d0d0d] border border-[#141414] p-2.5 rounded-[6px] flex items-center justify-between font-mono text-xs text-neutral-300 mb-5">
                <span>npm install @kvantjs/ryvax.js</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("npm install @kvantjs/ryvax.js");
                  }}
                  className="text-neutral-500 hover:text-white text-[11px] font-semibold transition-colors uppercase tracking-wider"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="border-t border-[#141414]/55 pt-4 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Usage Sample</span>
              {renderHighlightedCode(
                `import { createRouter } from '@kvantjs/ryvax.js/client';

const router = createRouter({
  onNavigate: (url) => console.log('Routing to:', url)
});`,
                'typescript'
              )}
            </div>
          </div>

          {/* Python SDK Card */}
          <div className="border border-[#141414] bg-[#0d0d0d] rounded-[6px] p-6 hover:border-neutral-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-8 w-8 rounded-[6px] bg-[#111] border border-[#141414]">
                    <Python className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Python Adapter</h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 bg-[#141414] px-2 py-0.5 rounded-[4px] border border-[#141414]/50">v2.1.0 • PyPI</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Asynchronous Python client offering fast bidirectional gRPC streams to sync Ryvax server states natively.
              </p>
              
              <div className="bg-[#0d0d0d] border border-[#141414] p-2.5 rounded-[6px] flex items-center justify-between font-mono text-xs text-neutral-300 mb-5">
                <span>pip install ryvax-client</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("pip install ryvax-client");
                  }}
                  className="text-neutral-500 hover:text-white text-[11px] font-semibold transition-colors uppercase tracking-wider"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="border-t border-[#141414]/55 pt-4 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Usage Sample</span>
              {renderHighlightedCode(
                `from ryvax_client import RyvaxClient

client = RyvaxClient(
    host="https://dryvax.kvant.sbs"
)`,
                'python'
              )}
            </div>
          </div>

          {/* Go SDK Card */}
          <div className="border border-[#141414] bg-[#0d0d0d] rounded-[6px] p-6 hover:border-neutral-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-8 w-8 rounded-[6px] bg-[#111] border border-[#141414]">
                    <Go className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Go Service Bridge</h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 bg-[#141414] px-2 py-0.5 rounded-[4px] border border-[#141414]/50">v1.2.0 • Go Mod</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                High-concurrency bridge implementing the Ryvax job scheduler protocol with built-in channel backpressure.
              </p>
              
              <div className="bg-[#0d0d0d] border border-[#141414] p-2.5 rounded-[6px] flex items-center justify-between font-mono text-xs text-neutral-300 mb-5">
                <span>go get github.com/kvantjs/ryvax-go</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("go get github.com/kvantjs/ryvax-go");
                  }}
                  className="text-neutral-500 hover:text-white text-[11px] font-semibold transition-colors uppercase tracking-wider"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="border-t border-[#141414]/55 pt-4 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Usage Sample</span>
              {renderHighlightedCode(
                `import "github.com/kvantjs/ryvax-go"

client := ryvax.NewClient("https://dryvax.kvant.sbs")`,
                'go'
              )}
            </div>
          </div>

          {/* Rust SDK Card */}
          <div className="border border-[#141414] bg-[#0d0d0d] rounded-[6px] p-6 hover:border-neutral-700 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center h-8 w-8 rounded-[6px] bg-[#111] border border-[#141414]">
                    <Rust className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">Rust Crates</h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 bg-[#141414] px-2 py-0.5 rounded-[4px] border border-[#141414]/50">v0.9.0 • Crates</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Zero-cost abstraction bindings mapping native Ryvax RPC channels directly into hyper-performance Rust systems.
              </p>
              
              <div className="bg-[#0d0d0d] border border-[#141414] p-2.5 rounded-[6px] flex items-center justify-between font-mono text-xs text-neutral-300 mb-5">
                <span>cargo add ryvax-sdk</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("cargo add ryvax-sdk");
                  }}
                  className="text-neutral-500 hover:text-white text-[11px] font-semibold transition-colors uppercase tracking-wider"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="border-t border-[#141414]/55 pt-4 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Usage Sample</span>
              {renderHighlightedCode(
                `let client = RyvaxClient::new(
    "https://dryvax.kvant.sbs".to_string()
);`,
                'rust'
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-app text-custom-body flex flex-col select-none">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-40 w-full border-b border-custom bg-app h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo, Version Picker & Tabs */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 animate-pulse min-w-0 flex-1 lg:flex-initial">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-card-hover rounded-[4px]"></div>
              <span className="text-custom-muted text-sm font-light">/</span>
              <div className="h-5.5 w-16 bg-card-hover rounded-[4px]"></div>
            </div>
            <div className="hidden sm:block h-7 w-32 bg-card-hover rounded-[6px] shrink-0"></div>

            {/* Desktop Categories / Tabs skeleton inside the left section */}
            <div className="hidden lg:flex items-center gap-1.5 shrink-0 bg-card-custom/30 p-1 rounded-[6px] border border-custom-subtle">
              <div className="h-5 w-14 bg-card-hover rounded-[4px]"></div>
              <div className="h-5 w-20 bg-card-hover rounded-[4px]"></div>
              <div className="h-5 w-20 bg-card-hover rounded-[4px]"></div>
              <div className="h-5 w-12 bg-card-hover rounded-[4px]"></div>
            </div>
          </div>

          {/* Search, Theme & Icons */}
          <div className="flex items-center gap-2 animate-pulse">
            <div className="h-8 w-32 bg-card-hover rounded-[6px] hidden sm:block"></div>
            <div className="h-8 w-8 bg-card-hover rounded-[6px]"></div>
            <div className="h-8 w-8 bg-card-hover rounded-[6px]"></div>
          </div>
        </header>

        {/* Layout Wrapper Grid */}
        <div className="w-full flex min-h-[calc(100vh-4rem)] justify-between">
          {/* Left Sidebar Skeleton */}
          <div className="hidden md:block w-64 shrink-0 border-r border-custom bg-app p-5 space-y-6 animate-pulse">
            {/* Search filter input block */}
            <div className="h-9 bg-card-hover rounded-[6px] w-full"></div>
            
            {/* List items representation */}
            <div className="space-y-4">
              <div className="h-4 bg-card-hover rounded-[4px] w-2/3"></div>
              <div className="pl-3 space-y-3">
                <div className="h-3 bg-card-hover rounded-[4px] w-5/6"></div>
                <div className="h-3 bg-card-hover rounded-[4px] w-4/5"></div>
                <div className="h-3 bg-card-hover rounded-[4px] w-3/4"></div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="h-4 bg-card-hover rounded-[4px] w-1/2"></div>
              <div className="pl-3 space-y-3">
                <div className="h-3 bg-card-hover rounded-[4px] w-4/5"></div>
                <div className="h-3 bg-card-hover rounded-[4px] w-11/12"></div>
                <div className="h-3 bg-card-hover rounded-[4px] w-2/3"></div>
              </div>
            </div>
          </div>

          {/* Center Main Content Skeleton */}
          <div className="flex-1 flex justify-center min-w-0">
            <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
              {/* Breadcrumbs skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-4 bg-card-hover rounded-[4px] w-16"></div>
                <div className="h-4 bg-card-hover rounded-[4px] w-3"></div>
                <div className="h-4 bg-card-hover rounded-[4px] w-24"></div>
                <div className="h-4 bg-card-hover rounded-[4px] w-3"></div>
                <div className="h-4 bg-card-hover rounded-[4px] w-28"></div>
              </div>

              {/* Title & Description skeleton */}
              <div className="border-b border-custom pb-6 mb-8 space-y-4">
                <div className="h-9 bg-card-hover rounded-[6px] w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-card-hover rounded-[4px] w-5/6"></div>
                  <div className="h-4 bg-card-hover rounded-[4px] w-2/3"></div>
                </div>
                <div className="flex gap-4 pt-2">
                  <div className="h-3 bg-card-hover rounded-[4px] w-24"></div>
                  <div className="h-3 bg-card-hover rounded-[4px] w-20"></div>
                </div>
              </div>

              {/* Tab Selector skeleton */}
              <div className="flex gap-2 border-b border-custom pb-3 mb-8">
                <div className="h-7 bg-card-hover rounded-[6px] w-32"></div>
                <div className="h-7 bg-card-hover rounded-[6px] w-36"></div>
              </div>

              {/* Body prose skeleton */}
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="h-6 bg-card-hover rounded-[6px] w-1/3"></div>
                  <div className="space-y-2.5">
                    <div className="h-4 bg-card-hover rounded-[4px] w-full"></div>
                    <div className="h-4 bg-card-hover rounded-[4px] w-full"></div>
                    <div className="h-4 bg-card-hover rounded-[4px] w-11/12"></div>
                  </div>
                  {/* Visual card placeholder */}
                  <div className="h-32 bg-card-custom border border-custom rounded-[6px] w-full mt-6 flex flex-col justify-between p-4">
                    <div className="h-3.5 bg-card-hover rounded-[4px] w-1/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-card-hover rounded-[4px] w-full"></div>
                      <div className="h-3 bg-card-hover rounded-[4px] w-11/12"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="hidden xl:block w-64 shrink-0 border-l border-custom bg-app p-6 space-y-6 animate-pulse">
            <div className="h-3 bg-card-hover rounded-[4px] w-1/3"></div>
            <div className="space-y-3.5">
              <div className="h-2.5 bg-card-hover rounded-[4px] w-3/4"></div>
              <div className="h-2.5 bg-card-hover rounded-[4px] w-2/3"></div>
              <div className="h-2.5 bg-card-hover rounded-[4px] w-5/6"></div>
              <div className="h-2.5 bg-card-hover rounded-[4px] w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-custom-body transition-colors selection:bg-neutral-200 dark:selection:bg-neutral-800 selection:text-neutral-900 dark:selection:text-white">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        selectedCategory={currentPageId === 'sdks-and-tools' ? 'sdks-and-tools' : currentCategory}
        onSelectCategoryTab={handleSelectCategoryTab}
      />

      {/* Main Documentation Grid Container */}
      <div className="w-full flex min-h-[calc(100vh-4rem)] justify-between">
        {/* Left Sidebar (Desktop) - flush on the absolute left */}
        <div className="hidden md:block w-64 shrink-0 border-r border-custom bg-app sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
          <SidebarNav
            categories={sidebarCategories}
            currentPageId={currentPage.id}
            onSelectPage={handleSelectPage}
          />
        </div>

        {/* Center Main Content Area wrapper */}
        <div className="flex-1 flex justify-center min-w-0">
          <div className={`w-full ${activeTab === 'sdks' ? 'max-w-5xl' : 'max-w-3xl'} px-4 sm:px-6 lg:px-8 py-8`}>
            {/* Center Main Content Area */}
            <main className="w-full min-w-0">
              {activeTab === 'sdks' ? (
                renderSdksLayout()
              ) : (
                <DocContentRenderer
                  page={currentPage}
                  prevPage={prevPage}
                  nextPage={nextPage}
                  onNavigatePage={handleSelectPage}
                />
              )}
            </main>
          </div>
        </div>

        {/* Right Sidebar (Table of Contents) - flush on the absolute right */}
        {activeTab !== 'sdks' && (
          <TableOfContents
            page={currentPage}
            activeSectionId={activeSectionId}
            onSelectSection={handleSelectSection}
          />
        )}
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-xs sm:backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-app border-r border-custom h-full overflow-y-auto shadow-2xl z-10">
            <div className="p-4 border-b border-custom flex items-center justify-between">
              <span className="font-bold text-sm text-custom-title">Navigation Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-[6px] text-custom-muted hover:text-custom-title hover:bg-card-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarNav
              categories={sidebarCategories}
              currentPageId={currentPage.id}
              onSelectPage={handleSelectPage}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Spotlight Command Palette (Cmd + K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        categories={DOCS_CATEGORIES}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Floating Kvant Badge */}
      <div className="fixed bottom-5 right-5 z-40">
        <a 
          href="https://kvant.sbs" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-[4px] border border-custom bg-card-custom hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-card-hover transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.6)] group select-none cursor-pointer"
        >
          {/* Minimalist Quantum Kvant Logo */}
          <img 
            src="https://imgdb.io/i/76AhRAQ.png" 
            alt="Kvant Logo" 
            className="w-5 h-5 object-contain" 
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col text-left">
            <span className="text-[9px] text-custom-muted font-mono uppercase tracking-wider leading-none">Created with</span>
            <span className="text-[10.5px] text-custom-body font-semibold leading-none mt-0.5 group-hover:text-[#407BFF] transition-colors">Kvant</span>
          </div>
        </a>
      </div>
    </div>
  );
}
