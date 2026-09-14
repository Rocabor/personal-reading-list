import React from 'react';
import { Star, Check } from 'lucide-react';
import { Book } from '../types';
import { BookCover } from './BookCover';
import { useApp } from '../context/AppContext';

interface BookCardProps {
  book: Book;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  layout?: 'vertical' | 'horizontal';
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  layout
}) => {
  const { setSelectedBook, shelves } = useApp();

  const currentShelf = shelves.find(s => s.id === book.shelfId);
  const isHorizontal = layout === 'horizontal';

  if (isHorizontal) {
    return (
      <div
        id={`book-card-${book.id}`}
        className={`group relative flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs hover:shadow-md transition-all select-none ${
          isSelected
            ? 'bg-[var(--color-accent-subtle)] ring-2 ring-[var(--color-accent)]'
            : 'hover:border-[var(--color-accent)]/40'
        }`}
      >
        {/* Bulk selection checkbox */}
        {(isSelectionMode || isSelected) && (
          <button
            type="button"
            aria-label={isSelected ? `Deselect ${book.title}` : `Select ${book.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
            className={`absolute top-2 left-2 z-30 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-xs'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-transparent hover:text-gray-400'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        )}

        {/* Cover */}
        <div className="flex-shrink-0">
          <BookCover
            title={book.title}
            author={book.author}
            coverUrl={book.coverUrl}
            size="sm"
          />
        </div>

        {/* Info & Progress */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
          <div>
            <h2 className="font-heading font-bold text-sm sm:text-base leading-snug text-[var(--color-text-primary)]">
              <button
                type="button"
                onClick={() => setSelectedBook(book)}
                className="text-left group-hover:text-[var(--color-accent)] transition-colors after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-[var(--color-accent)]"
                title={book.title}
              >
                <span className="line-clamp-2">{book.title}</span>
              </button>
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
              {book.author}
            </p>

            {/* Genre Pill */}
            {book.genres && book.genres.length > 0 && (
              <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] mt-1.5 truncate max-w-[180px]">
                {book.genres[0]}
              </span>
            )}
          </div>

          {/* Progress Section */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between gap-2 text-xs mb-1">
              <span className="text-[var(--color-text-secondary)] font-medium">Progress</span>
              <span className="font-bold text-[var(--color-text-primary)] font-mono">
                {book.percentage ?? 0}%
              </span>
            </div>
            <div className="w-full bg-[var(--color-border-subtle)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-300"
                style={{ width: `${book.percentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`book-card-${book.id}`}
      className={`group relative flex flex-col p-2.5 rounded-lg transition-all duration-200 ${
        isSelected
          ? 'bg-[var(--color-accent-subtle)] ring-2 ring-[var(--color-accent)]'
          : 'hover:bg-[var(--color-bg-secondary)]'
      }`}
    >
      {/* Bulk selection checkbox or hover trigger */}
      {(isSelectionMode || isSelected) && (
        <button
          type="button"
          aria-label={isSelected ? `Deselect ${book.title}` : `Select ${book.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          className={`absolute top-3 left-3 z-30 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-md'
              : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-transparent hover:text-gray-400 shadow-xs'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>
      )}

      {/* Book Cover Container */}
      <div className="flex justify-center mb-2.5">
        <BookCover
          title={book.title}
          author={book.author}
          coverUrl={book.coverUrl}
          percentage={book.percentage}
          showProgress={book.shelfId === 'currently-reading'}
          size="md"
          className="z-10"
          onClick={() => setSelectedBook(book)}
        />
      </div>

      {/* Book Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="font-heading font-semibold text-sm leading-tight">
            <button
              type="button"
              onClick={() => setSelectedBook(book)}
              className="text-left group-hover:text-[var(--color-accent)] transition-colors after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-[var(--color-accent)]"
              title={book.title}
            >
              <span className="line-clamp-2">{book.title}</span>
            </button>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-xs mt-0.5 line-clamp-1">
            {book.author}
          </p>
        </div>

        {/* Rating & Shelf info */}
        <div className="mt-2 pt-1.5 flex items-center justify-between gap-1 border-t border-[var(--color-border-subtle)] text-[11px]">
          {/* Star Rating display */}
          <div className="flex items-center gap-0.5 min-w-0" aria-label={book.rating ? `${book.rating} out of 5 stars` : 'Unrated'}>
            {book.rating ? (
              <>
                <Star className="w-3.5 h-3.5 fill-[var(--color-rating)] text-[var(--color-rating)] flex-shrink-0" />
                <span className="font-medium text-[var(--color-text-primary)] ml-0.5">
                  {book.rating}
                </span>
              </>
            ) : (
              <span className="text-[var(--color-text-tertiary)] italic truncate">Unrated</span>
            )}
          </div>

          {/* Shelf badge or reading status */}
          <div className="flex items-center flex-shrink-0">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold whitespace-nowrap transition-colors ${
                book.shelfId === 'currently-reading'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300/80 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/35'
                  : book.shelfId === 'read' || book.shelfId === 'favorites'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300/80 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/35'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
              }`}
            >
              {book.shelfId === 'currently-reading'
                ? 'Reading'
                : book.shelfId === 'read'
                ? 'Read'
                : book.shelfId === 'favorites'
                ? 'Favorite'
                : book.shelfId === 'to-read'
                ? 'Want to Read'
                : currentShelf?.name || 'Saved'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
