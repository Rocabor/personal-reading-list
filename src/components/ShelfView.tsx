import React, { useState } from 'react';
import {
  BookOpen,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  Tag
} from 'lucide-react';
import { Book, SortField, SortOrder } from '../types';
import { BookCard } from './BookCard';
import { BookCover } from './BookCover';
import { useApp } from '../context/AppContext';

export const ShelfView: React.FC = () => {
  const {
    books,
    shelves,
    activeShelfId,
    setActiveShelfId,
    setIsSearchModalOpen,
    renameShelf,
    deleteShelf,
    bulkSelectedIds,
    setBulkSelectedIds,
    bulkMoveShelves,
    bulkDeleteBooks,
    bulkAddGenre,
    setSelectedBook
  } = useApp();

  const [sortField, setSortField] = useState<SortField>('recent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [targetMoveShelf, setTargetMoveShelf] = useState(shelves[0]?.id || 'to-read');
  const [bulkGenreInput, setBulkGenreInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'spines'>('grid');

  const currentShelf = activeShelfId === 'all' ? null : shelves.find((s) => s.id === activeShelfId);

  // Filter books
  const shelfBooks = books.filter((b) => {
    if (activeShelfId !== 'all' && b.shelfId !== activeShelfId) {
      return false;
    }
    if (genreFilter !== 'all' && !(b.genres || []).includes(genreFilter)) {
      return false;
    }
    if (ratingFilter !== 'all' && b.rating !== ratingFilter) {
      return false;
    }
    return true;
  });

  // Sort books
  const sortedBooks = [...shelfBooks].sort((a, b) => {
    let result = 0;
    if (sortField === 'recent') {
      const aTime = a.lastProgressUpdate || a.dateAdded || '';
      const bTime = b.lastProgressUpdate || b.dateAdded || '';
      result = bTime.localeCompare(aTime);
    } else if (sortField === 'title') {
      result = a.title.localeCompare(b.title);
    } else if (sortField === 'author') {
      result = a.author.localeCompare(b.author);
    } else if (sortField === 'rating') {
      result = (b.rating || 0) - (a.rating || 0);
    } else if (sortField === 'dateRead') {
      result = (b.dateRead || '').localeCompare(a.dateRead || '');
    } else if (sortField === 'dateAdded') {
      result = (b.dateAdded || '').localeCompare(a.dateAdded || '');
    } else if (sortField === 'progress') {
      result = (b.percentage || 0) - (a.percentage || 0);
    }
    return sortOrder === 'asc' ? -result : result;
  });

  // Extract all available genres for filtering
  const allGenres = Array.from(new Set(books.flatMap((b) => b.genres || []))).filter(Boolean);

  const handleToggleSelect = (id: string) => {
    setBulkSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (bulkSelectedIds.length === sortedBooks.length) {
      setBulkSelectedIds([]);
    } else {
      setBulkSelectedIds(sortedBooks.map((b) => b.id));
    }
  };

  const handleSaveRename = () => {
    if (currentShelf && renameValue.trim()) {
      renameShelf(currentShelf.id, renameValue.trim());
      setIsRenaming(false);
    }
  };

  return (
    <div id="shelf-view" className="space-y-6">
      {/* Shelf Header */}
      <div className="pb-4 border-b border-[var(--color-border)] space-y-3.5">
        {/* Title & Shelf Meta */}
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="px-3 py-1 font-heading text-lg sm:text-xl font-bold rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1.5 bg-[var(--color-accent)] text-[var(--color-accent-text)] rounded-lg hover:bg-[var(--color-accent-hover)]"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
                {currentShelf ? currentShelf.name : 'All Library Books'}
              </h1>
            )}

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] whitespace-nowrap">
              {sortedBooks.length} {sortedBooks.length === 1 ? 'book' : 'books'}
            </span>

            {/* Rename / Delete for custom shelves */}
            {currentShelf && !currentShelf.isDefault && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setRenameValue(currentShelf.name);
                    setIsRenaming(true);
                  }}
                  className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded"
                  title="Rename shelf"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${currentShelf.name}"? Books will be moved to "Want to Read".`)) {
                      deleteShelf(currentShelf.id);
                    }
                  }}
                  className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] rounded"
                  title="Delete shelf"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 line-clamp-1 sm:line-clamp-none">
            {currentShelf?.id === 'currently-reading' && 'Books currently in progress. Turn the page.'}
            {currentShelf?.id === 'to-read' && 'Stories waiting to be explored next.'}
            {currentShelf?.id === 'read' && 'Your completed journeys and reading accomplishments.'}
            {currentShelf?.id === 'favorites' && 'The most cherished books in your collection.'}
            {!currentShelf && 'Your entire catalog across all custom shelves.'}
          </p>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
          {/* Left: Primary actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Add Book CTA */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent-hover)] font-semibold shadow-2xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Add Book
            </button>

            {/* Bulk mode toggle */}
            <button
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                setBulkSelectedIds([]);
              }}
              className={`px-3 py-2 rounded-xl border transition-colors font-medium whitespace-nowrap ${
                isBulkMode
                  ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
              }`}
            >
              {isBulkMode ? 'Done Selecting' : 'Select'}
            </button>

            {isBulkMode && (
              <button
                onClick={handleSelectAll}
                className="px-2.5 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] font-medium whitespace-nowrap"
              >
                {bulkSelectedIds.length === sortedBooks.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Right: Filters & Sort controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Selector */}
            <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 bg-[var(--color-surface)]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] flex-shrink-0" />
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none text-xs cursor-pointer"
                aria-label="Sort books"
              >
                <option value="recent">Recent</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="rating">Rating</option>
                <option value="dateRead">Date Read</option>
                <option value="dateAdded">Date Added</option>
                <option value="progress">Progress</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] font-mono text-[11px]"
                title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 bg-[var(--color-surface)]">
              <Filter className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] flex-shrink-0" />
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none text-xs cursor-pointer max-w-[110px] sm:max-w-none"
                aria-label="Filter by genre"
              >
                <option value="all">All Genres</option>
                {allGenres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 bg-[var(--color-surface)]">
              <select
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(e.target.value === 'all' ? 'all' : (parseInt(e.target.value, 10) as any))
                }
                className="bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none text-xs cursor-pointer"
                aria-label="Filter by rating"
              >
                <option value="all">All Ratings</option>
                <option value="5">★ 5 Stars</option>
                <option value="4">★ 4 Stars</option>
                <option value="3">★ 3 Stars</option>
              </select>
            </div>

            {/* Clear filters if active */}
            {(genreFilter !== 'all' || ratingFilter !== 'all') && (
              <button
                onClick={() => {
                  setGenreFilter('all');
                  setRatingFilter('all');
                }}
                className="text-[var(--color-accent)] hover:underline text-xs px-1 whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar when selecting */}
      {isBulkMode && (
        <div className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-accent)]/40 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 font-medium text-[var(--color-text-primary)]"
            >
              {bulkSelectedIds.length === sortedBooks.length ? (
                <CheckSquare className="w-4 h-4 text-[var(--color-accent)]" />
              ) : (
                <Square className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              )}
              <span>
                {bulkSelectedIds.length} of {sortedBooks.length} Selected
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Move to shelf */}
            <div className="flex items-center gap-1">
              <span>Move to:</span>
              <select
                value={targetMoveShelf}
                onChange={(e) => setTargetMoveShelf(e.target.value)}
                className="px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
              >
                {shelves.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => bulkMoveShelves(targetMoveShelf)}
                disabled={bulkSelectedIds.length === 0}
                className="px-2.5 py-1 bg-[var(--color-accent)] text-[var(--color-accent-text)] rounded font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-40"
              >
                Move
              </button>
            </div>

            {/* Add Genre Tag */}
            <div className="hidden sm:flex items-center gap-1">
              <input
                type="text"
                placeholder="New tag..."
                value={bulkGenreInput}
                onChange={(e) => setBulkGenreInput(e.target.value)}
                className="w-20 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
              />
              <button
                onClick={() => {
                  bulkAddGenre(bulkGenreInput);
                  setBulkGenreInput('');
                }}
                disabled={bulkSelectedIds.length === 0 || !bulkGenreInput}
                className="px-2.5 py-1 border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded font-medium disabled:opacity-40"
              >
                Tag
              </button>
            </div>

            {/* Delete button */}
            <button
              onClick={() => {
                if (window.confirm(`Delete ${bulkSelectedIds.length} selected books from your library?`)) {
                  bulkDeleteBooks();
                }
              }}
              disabled={bulkSelectedIds.length === 0}
              className="px-3 py-1 bg-red-600/10 text-red-600 hover:bg-red-600/20 rounded font-medium disabled:opacity-40 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Book Grid or Empty State */}
      {sortedBooks.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] p-8 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 mx-auto text-[var(--color-accent)] mb-3 opacity-40" />
          <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">
            This shelf is waiting for its first book
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Search our integrated Open Library catalog to add your favorite titles or import reading history from Goodreads.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent-hover)] transition-colors shadow-xs"
            >
              Search Books
            </button>
          </div>
        </div>
      ) : (
        activeShelfId === 'currently-reading' ? (
          <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5">
            {sortedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                layout="horizontal"
                isSelectionMode={isBulkMode}
                isSelected={bulkSelectedIds.includes(book.id)}
                onToggleSelect={() => handleToggleSelect(book.id)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4.5">
            {sortedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                layout="vertical"
                isSelectionMode={isBulkMode}
                isSelected={bulkSelectedIds.includes(book.id)}
                onToggleSelect={() => handleToggleSelect(book.id)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};
