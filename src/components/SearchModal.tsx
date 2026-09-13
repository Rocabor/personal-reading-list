import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Plus, Check, BookOpen, AlertCircle } from 'lucide-react';
import { searchOpenLibrary, convertSearchResultToBook, SearchResultItem } from '../services/openLibrary';
import { useApp } from '../context/AppContext';
import { BookCover } from './BookCover';

export const SearchModal: React.FC = () => {
  const { isSearchModalOpen, setIsSearchModalOpen, books, addBook, shelves } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedShelfId, setSelectedShelfId] = useState<string>('to-read');
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setErrorMessage(null);
    }
  }, [isSearchModalOpen]);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const requestId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      try {
        const items = await searchOpenLibrary(trimmed);
        if (requestIdRef.current !== requestId) return;
        setResults(items);
        if (items.length === 0) {
          setErrorMessage('No books found for that title or author. Try checking the spelling or searching by ISBN.');
        }
      } catch (err: any) {
        if (requestIdRef.current !== requestId) return;
        setErrorMessage(err.message || 'Unable to connect to book database. Please check your internet connection.');
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      requestIdRef.current++;
    };
  }, [query]);

  if (!isSearchModalOpen) return null;

  const isBookInLibrary = (item: SearchResultItem) => {
    return books.some(b => {
      if (item.isbn13 && b.isbn13 && item.isbn13 === b.isbn13) return true;
      if (item.isbn10 && b.isbn10 && item.isbn10 === b.isbn10) return true;
      return b.title.toLowerCase() === item.title.toLowerCase();
    });
  };

  const handleAddBook = (item: SearchResultItem) => {
    const newBook = convertSearchResultToBook(item, selectedShelfId);
    addBook(newBook);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
      onClick={() => setIsSearchModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        id="book-search-modal-panel"
      >
        {/* Header & Search Input */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
          <div className="flex items-center justify-between mb-3">
            <h2 id="search-modal-title" className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">
              Search & Add Books
            </h2>
            <button
              onClick={() => setIsSearchModalOpen(false)}
              className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-bg-tertiary)] transition-colors"
              aria-label="Close search dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN (e.g. Dune, Tolkien, 9780141439518)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            {isLoading && (
              <Loader2 className="absolute right-3.5 w-4 h-4 text-[var(--color-accent)] animate-spin" />
            )}
            {!isLoading && query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Target Shelf Selector */}
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5">
              Add new books to:
              <select
                value={selectedShelfId}
                onChange={(e) => setSelectedShelfId(e.target.value)}
                className="px-2.5 py-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-medium"
              >
                {shelves.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </span>
            <span className="text-[11px] text-[var(--color-text-tertiary)] hidden sm:inline">
              Powered by Open Library
            </span>
          </div>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!query && (
            <div className="py-12 text-center text-[var(--color-text-tertiary)]">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30 text-[var(--color-accent)]" />
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                Type a title, author, or ISBN to search
              </p>
              <p className="text-xs mt-1">
                Explore millions of editions directly from the Open Library catalog.
              </p>
            </div>
          )}

          {results.map((item) => {
            const inLibrary = isBookInLibrary(item);

            return (
              <div
                key={item.id}
                className="flex items-center gap-3.5 p-3 rounded-xl border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                {/* Thumbnail */}
                <BookCover
                  title={item.title}
                  author={item.author}
                  coverUrl={item.coverUrl}
                  size="sm"
                  className="rounded"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm text-[var(--color-text-primary)] leading-tight line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1 mt-0.5">
                    {item.author}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--color-text-tertiary)]">
                    {item.publishedDate && <span>{item.publishedDate}</span>}
                    {item.pageCount && <span>• {item.pageCount} pages</span>}
                    {item.publisher && <span className="line-clamp-1">• {item.publisher}</span>}
                  </div>
                </div>

                {/* Add button / In Library Status */}
                <div className="flex-shrink-0">
                  {inLibrary ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      <Check className="w-3.5 h-3.5" /> In Library
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddBook(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent-hover)] transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
