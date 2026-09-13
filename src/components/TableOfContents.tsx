import React, { useState, useEffect } from 'react';
import { DocPage } from '../types/docs';
import { ThumbsUp, ThumbsDown, Share2, Github, Check, MessageSquare } from 'lucide-react';

interface TableOfContentsProps {
  page: DocPage;
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
}

export function TableOfContents({ page, activeSectionId, onSelectSection }: TableOfContentsProps) {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Reset feedback when page changes
  useEffect(() => {
    setFeedback(null);
  }, [page.id]);

  const tocItems = page.sections.map(sec => ({
    id: sec.id,
    title: sec.title,
    level: sec.level || 2
  }));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <aside className="w-64 shrink-0 py-6 pl-6 pr-4 hidden xl:block sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto bg-app border-l border-custom no-scrollbar">
      <div className="space-y-6">
        {/* On this page links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-custom-muted mb-3">
            On this page
          </h4>
          <ul className="space-y-1 text-xs border-l border-custom ml-1 pl-3">
            {tocItems.map((item) => {
              const isActive = activeSectionId === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onSelectSection(item.id)}
                    className={`text-left w-full py-1 transition-colors block truncate rounded-[6px] ${
                      isActive
                        ? 'text-custom-title font-semibold border-l-2 border-current -ml-3 pl-2.5'
                        : 'text-custom-muted hover:text-custom-title'
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Page Feedback Widget */}
        <div className="pt-4 border-t border-custom">
          <span className="text-xs font-medium text-custom-body block mb-2">
            Was this page helpful?
          </span>
          {feedback === null ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFeedback('yes')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-custom bg-card-custom hover:bg-card-hover text-xs text-custom-body hover:text-custom-title transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-custom-muted" />
                <span>Yes</span>
              </button>
              <button
                onClick={() => setFeedback('no')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-custom bg-card-custom hover:bg-card-hover text-xs text-custom-body hover:text-custom-title transition-colors"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-custom-muted" />
                <span>No</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-custom-body font-medium py-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-[#407BFF]" />
              <span>Thank you for your feedback!</span>
            </div>
          )}
        </div>

        {/* Community & Utilities */}
        <div className="pt-4 border-t border-custom space-y-2 text-xs">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-custom-muted hover:text-custom-title transition-colors w-full text-left"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#407BFF]" /> : <Share2 className="w-3.5 h-3.5 text-custom-muted" />}
            <span>{copiedLink ? 'Link copied!' : 'Copy page URL'}</span>
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-custom-muted hover:text-custom-title transition-colors block"
          >
            <Github className="w-3.5 h-3.5 text-custom-muted" />
            <span>Edit this page on GitHub</span>
          </a>

          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-custom-muted hover:text-custom-title transition-colors block"
          >
            <MessageSquare className="w-3.5 h-3.5 text-custom-muted" />
            <span>Join Developer Discord</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
