import React, { useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Check,
  CheckCircle,
  Clock,
  Sparkles,
  History,
  Plus,
  Upload,
  Star,
  Search,
  Edit2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const {
    shelves,
    books,
    activeShelfId,
    setActiveShelfId,
    activeView,
    setActiveView,
    createShelf,
    setIsGoodreadsModalOpen,
    readingGoal,
    updateReadingGoal,
    triggerConfetti
  } = useApp();

  const [shelfSearchQuery, setShelfSearchQuery] = useState('');
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalTargetInput, setGoalTargetInput] = useState(readingGoal.targetCount);

  const handleCreateShelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShelfName.trim()) {
      createShelf(newShelfName.trim());
      setNewShelfName('');
      setIsCreatingShelf(false);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalTargetInput > 0) {
      updateReadingGoal(goalTargetInput);
      setIsEditingGoal(false);
      if (readingGoal.completedCount >= goalTargetInput) {
        triggerConfetti();
      }
    }
  };

  const getShelfIcon = (shelfId: string) => {
    switch (shelfId) {
      case 'currently-reading':
        return <BookOpen className="w-4 h-4 text-amber-800 dark:text-amber-400" />;
      case 'to-read':
        return <Bookmark className="w-4 h-4 text-sky-800 dark:text-sky-400" />;
      case 'read':
        return <Check className="w-4 h-4 text-emerald-800 dark:text-emerald-400 stroke-[2.5]" />;
      case 'favorites':
        return <Star className="w-4 h-4 text-amber-700 fill-amber-700 dark:text-amber-400 dark:fill-amber-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />;
    }
  };

  const handleNavClick = (view: 'library' | 'year-in-review' | 'activity', shelfId?: string | 'all') => {
    setActiveView(view);
    if (shelfId !== undefined) {
      setActiveShelfId(shelfId);
    }
    onCloseMobile?.();
  };

  // Filter shelves based on search
  const filteredShelves = shelves.filter((shelf) =>
    shelf.name.toLowerCase().includes(shelfSearchQuery.toLowerCase())
  );

  // Goal calculations
  const goalPercentage = Math.min(
    100,
    Math.round((readingGoal.completedCount / readingGoal.targetCount) * 100)
  );
  const booksRemaining = Math.max(0, readingGoal.targetCount - readingGoal.completedCount);

  return (
    <aside
      id="app-sidebar"
      aria-label="Sidebar navigation"
      className="w-64 h-full bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col justify-between select-none"
    >
      {/* Top Header & Search Shelves */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-3">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('library', 'all')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-lg text-[var(--color-text-primary)]">
              Bookshelf
            </span>
          </div>

          {/* Search Shelves Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Search shelves..."
              value={shelfSearchQuery}
              onChange={(e) => setShelfSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
            {shelfSearchQuery && (
              <button
                type="button"
                onClick={() => setShelfSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Library Section Header */}
        <div className="px-4 pt-1">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
            <span>Library</span>
            <button
              onClick={() => setIsCreatingShelf(!isCreatingShelf)}
              className="hover:text-[var(--color-accent)] p-0.5 rounded transition-colors"
              title="Add custom shelf"
              aria-label="Add custom shelf"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* New shelf creation input */}
          {isCreatingShelf && (
            <form onSubmit={handleCreateShelf} className="px-2 py-1.5 mb-1 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Shelf name..."
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                autoFocus
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none"
              />
              <button
                type="submit"
                className="px-2 py-1 rounded bg-[var(--color-accent)] text-white text-xs font-semibold"
              >
                Add
              </button>
            </form>
          )}

          {/* Shelves List */}
          <div className="space-y-0.5 mt-1">
            {/* All Books navigation item */}
            {(!shelfSearchQuery || 'all books'.includes(shelfSearchQuery.toLowerCase())) && (
              <button
                onClick={() => handleNavClick('library', 'all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeView === 'library' && activeShelfId === 'all'
                    ? 'bg-[var(--color-surface)] text-[var(--color-accent)] font-semibold shadow-2xs border border-[var(--color-border-subtle)]'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>All Books</span>
                </span>
                <span className="font-mono text-[11px] text-[var(--color-text-secondary)] font-semibold">
                  {books.length}
                </span>
              </button>
            )}

            {/* Individual Shelves */}
            {filteredShelves.map((shelf) => {
              const count = books.filter((b) => b.shelfId === shelf.id).length;
              const isActive = activeView === 'library' && activeShelfId === shelf.id;

              return (
                <button
                  key={shelf.id}
                  onClick={() => handleNavClick('library', shelf.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-surface)] text-[var(--color-accent)] font-semibold shadow-2xs border border-[var(--color-border-subtle)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    {getShelfIcon(shelf.id)}
                    <span className="truncate">{shelf.name}</span>
                  </span>
                  <span className="font-mono text-[11px] text-[var(--color-text-secondary)] ml-1 font-semibold">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Extended Tools: Year in Review & Activity */}
        <div className="mt-4 px-4 pt-2 border-t border-[var(--color-border-subtle)] space-y-0.5">
          <button
            onClick={() => handleNavClick('year-in-review')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeView === 'year-in-review'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-2xs border border-[var(--color-border-subtle)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Year in Review</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-semibold">
              2026
            </span>
          </button>

          <button
            onClick={() => handleNavClick('activity')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeView === 'activity'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-2xs border border-[var(--color-border-subtle)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-[var(--color-text-secondary)]" />
              <span>Reading Activity</span>
            </span>
          </button>

          <button
            onClick={() => {
              setIsGoodreadsModalOpen(true);
              onCloseMobile?.();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)] transition-colors mt-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Goodreads</span>
          </button>
        </div>
      </div>

      {/* Docked Reading Goal at Sidebar Footer */}
      <div
        id="sidebar-reading-goal"
        className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] select-none flex-shrink-0"
      >
        <div className="space-y-1.5">
          {/* Label and Year */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--color-text-tertiary)]">
              Reading Goal
            </span>
            <button
              onClick={() => {
                setGoalTargetInput(readingGoal.targetCount);
                setIsEditingGoal(!isEditingGoal);
              }}
              className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors font-mono"
              title="Click to edit reading goal"
              aria-label="Edit reading goal"
            >
              <span className="flex items-center gap-1">
                <span>{readingGoal.year}</span>
                <Edit2 className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
              </span>
            </button>
          </div>

          {/* Goal Counts & Inline Edit */}
          {isEditingGoal ? (
            <form onSubmit={handleSaveGoal} className="flex items-center gap-2 my-1">
              <input
                type="number"
                min={1}
                max={500}
                value={goalTargetInput}
                onChange={(e) => setGoalTargetInput(parseInt(e.target.value, 10) || 1)}
                autoFocus
                className="w-16 px-2 py-0.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-[var(--color-accent)] text-white text-xs font-semibold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-lg text-[var(--color-text-primary)] font-heading">
                  {readingGoal.completedCount}
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] font-medium">
                  / {readingGoal.targetCount} books
                </span>
              </div>
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
                {readingGoal.year}
              </span>
            </div>
          )}

          {/* Terracotta Progress Bar */}
          <div className="w-full bg-[var(--color-border)] h-1.5 rounded-full overflow-hidden my-1">
            <div
              className="bg-[var(--color-accent)] h-full transition-all duration-500 rounded-full"
              style={{ width: `${goalPercentage}%` }}
              role="progressbar"
              aria-valuenow={goalPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Summary Subtext */}
          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)]">
            <span>{goalPercentage}% complete</span>
            <span>·</span>
            <span>{booksRemaining} {booksRemaining === 1 ? 'book' : 'books'} to go</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
