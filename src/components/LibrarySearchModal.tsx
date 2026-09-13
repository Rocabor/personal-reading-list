import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Star, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Book } from '../types';

export const LibrarySearchModal: React.FC = () => {
  const { isLibrarySearchOpen, setIsLibrarySearchOpen, books, shelves, setSelectedBook } = useApp();
  const [query, setQuery] = useState('');
  const [selectedShelf, setSelectedShelf] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLibrarySearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedShelf('all');
      setSelectedRating('all');
    }
  }, [isLibrarySearchOpen]);

  if (!isLibrarySearchOpen) return null;

  const filtered = books.filter((b) => {
    // Shelf filter
    if (selectedShelf !== 'all' && b.shelfId !== selectedShelf) {
      return false;
    }
    // Rating filter
    if (selectedRating !== 'all' && b.rating !== selectedRating) {
      return false;
    }
    // Text search
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = b.title.toLowerCase().includes(q);
    const authorMatch = b.author.toLowerCase().includes(q);
    const notesMatch = b.notes ? b.notes.toLowerCase().includes(q) : false;
    const genreMatch = b.genres ? b.genres.some(g => g.toLowerCase().includes(q)) : false;
    return titleMatch || authorMatch || notesMatch || genreMatch;
  });

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setIsLibrarySearchOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-search-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
      onClick={() => setIsLibrarySearchOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        id="library-search-modal-panel"
      >
        {/* Search header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 id="library-search-title" className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">
                Search Your Library
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] font-mono text-[var(--color-text-tertiary)] hidden sm:inline">
                ESC to close
              </span>
              <button
                onClick={() => setIsLibrarySearchOpen(false)}
                className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors"
                aria-label="Close library search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, personal notes, or genres..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-1.5">
              <span>Shelf:</span>
              <select
                value={selectedShelf}
                onChange={(e) => setSelectedShelf(e.target.value)}
                className="px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
              >
                <option value="all">All Shelves</option>
                {shelves.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Rating:</span>
              <select
                value={selectedRating}
                onChange={(e) =>
                  setSelectedRating(e.target.value === 'all' ? 'all' : (parseInt(e.target.value, 10) as any))
                }
                className="px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
              >
                <option value="all">Any Rating</option>
                <option value="5">★★★★★ (5 stars)</option>
                <option value="4">★★★★☆ (4 stars)</option>
                <option value="3">★★★☆☆ (3 stars)</option>
              </select>
            </div>

            <span className="ml-auto text-[11px] text-[var(--color-text-tertiary)]">
              {filtered.length} {filtered.length === 1 ? 'book' : 'books'} found
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[var(--color-text-tertiary)]">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                No matching books in your library
              </p>
              <p className="text-xs mt-1">
                Try a different keyword, reset filters, or search the Open Library catalog.
              </p>
            </div>
          ) : (
            filtered.map((b) => {
              const shelfName = shelves.find((s) => s.id === b.shelfId)?.name || b.shelfId;
              return (
                <div
                  key={b.id}
                  onClick={() => handleSelectBook(b)}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-14 bg-[var(--color-bg-tertiary)] rounded flex-shrink-0 overflow-hidden border border-[var(--color-border)] shadow-2xs">
                      {b.coverUrl ? (
                        <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] font-heading text-center p-1 leading-none text-[var(--color-text-primary)]">
                          {b.title.slice(0, 10)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-sm text-[var(--color-text-primary)] truncate">
                        {b.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate">
                        {b.author}
                      </p>
                      {b.notes && (
                        <p className="text-[11px] text-[var(--color-text-tertiary)] italic truncate mt-0.5">
                          "{b.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    {b.rating && (
                      <div className="flex items-center gap-1 text-xs text-[var(--color-rating)] font-medium">
                        <Star className="w-3.5 h-3.5 fill-[var(--color-rating)]" />
                        <span>{b.rating}</span>
                      </div>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-medium">
                      {shelfName}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
