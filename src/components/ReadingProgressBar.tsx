import React, { useState } from 'react';
import { Bookmark, CheckCircle, ChevronRight, Plus } from 'lucide-react';
import { Book } from '../types';
import { useApp } from '../context/AppContext';

interface ReadingProgressBarProps {
  book: Book;
  compact?: boolean;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ book, compact = false }) => {
  const { updateReadingProgress } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [inputPage, setInputPage] = useState<number>(book.currentPage || 0);

  const totalPages = book.pageCount || null;
  const currentPage = book.currentPage || 0;
  const percentage = book.percentage !== undefined ? book.percentage : (totalPages ? Math.round((currentPage / totalPages) * 100) : 0);

  const handleSavePage = () => {
    const valid = Math.max(0, totalPages ? Math.min(totalPages, inputPage) : inputPage);
    updateReadingProgress(book.id, valid, totalPages || undefined);
    setIsEditing(false);
  };

  const handleQuickAdd = (pages: number) => {
    const next = Math.max(0, (book.currentPage || 0) + pages);
    const valid = totalPages ? Math.min(totalPages, next) : next;
    updateReadingProgress(book.id, valid, totalPages || undefined);
    setInputPage(valid);
  };

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center text-xs mb-1 text-[var(--color-text-secondary)]">
          <span>
            {totalPages ? `Page ${currentPage} of ${totalPages}` : `${percentage}% complete`}
          </span>
          <span className="font-mono font-semibold text-[var(--color-accent)]">{percentage}%</span>
        </div>
        <div className="w-full bg-[var(--color-border)] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[var(--color-progress)] h-full transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="font-medium text-sm text-[var(--color-text-primary)]">
            Reading Progress
          </span>
        </div>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
          {percentage}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative w-full bg-[var(--color-bg-tertiary)] h-3 rounded-full overflow-hidden my-2.5">
        <div
          className="bg-[var(--color-accent)] h-full transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Reading progress: ${percentage}% complete`}
        />
      </div>

      {/* Stats and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor={`input-page-${book.id}`} className="sr-only">Current Page</label>
            <input
              id={`input-page-${book.id}`}
              type="number"
              min={0}
              max={totalPages || 9999}
              value={inputPage}
              onChange={(e) => setInputPage(parseInt(e.target.value, 10) || 0)}
              className="w-20 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
            />
            <span className="text-[var(--color-text-tertiary)]">
              {totalPages ? `/ ${totalPages} pages` : '%'}
            </span>
            <button
              onClick={handleSavePage}
              className="px-2.5 py-1 bg-[var(--color-accent)] text-[var(--color-accent-text)] font-medium rounded hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInputPage(currentPage);
                setIsEditing(true);
              }}
              className="text-[var(--color-text-primary)] font-medium hover:text-[var(--color-accent)] underline underline-offset-4 decoration-dotted"
            >
              {totalPages ? `Page ${currentPage} of ${totalPages}` : `${percentage}% complete`}
            </button>
            {totalPages && (
              <span className="text-[var(--color-text-tertiary)]">
                ({totalPages - currentPage} pages left)
              </span>
            )}
          </div>
        )}

        {/* Quick Increment buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[var(--color-text-tertiary)] text-[11px]">Quick add:</span>
          <button
            onClick={() => handleQuickAdd(10)}
            className="px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-medium transition-colors"
            title="Add 10 pages"
          >
            +10
          </button>
          <button
            onClick={() => handleQuickAdd(25)}
            className="px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-medium transition-colors"
            title="Add 25 pages"
          >
            +25
          </button>
          {totalPages && currentPage < totalPages && (
            <button
              onClick={() => handleQuickAdd(totalPages - currentPage)}
              className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium transition-colors flex items-center gap-1"
              title="Mark as finished"
            >
              <CheckCircle className="w-3 h-3" />
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
