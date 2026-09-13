import React, { useState, useEffect, useRef } from 'react';
import { X, Star, ExternalLink, Calendar, BookOpen, Layers, Trash2, Tag, Plus, Check } from 'lucide-react';
import { BookCover } from './BookCover';
import { ReadingProgressBar } from './ReadingProgressBar';
import { useApp } from '../context/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

export const BookDetailModal: React.FC = () => {
  const { selectedBook, setSelectedBook, shelves, moveBookToShelf, updateBook, removeBook } = useApp();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, !!selectedBook);

  const [notes, setNotes] = useState(selectedBook?.notes || '');
  const [newGenre, setNewGenre] = useState('');
  const [isAddingGenre, setIsAddingGenre] = useState(false);

  useEffect(() => {
    if (selectedBook) {
      setNotes(selectedBook.notes || '');
    }
  }, [selectedBook]);

  if (!selectedBook) return null;

  const handleRatingChange = (newRating: number) => {
    const finalRating = selectedBook.rating === newRating ? null : newRating;
    updateBook(selectedBook.id, { rating: finalRating });
  };

  const handleNotesBlur = () => {
    if (notes !== (selectedBook.notes || '')) {
      updateBook(selectedBook.id, { notes });
    }
  };

  const handleClose = () => {
    if (notes !== (selectedBook.notes || '')) {
      updateBook(selectedBook.id, { notes });
    }
    setSelectedBook(null);
  };

  const handleAddGenre = () => {
    const trimmed = newGenre.trim();
    if (!trimmed) return;
    const current = selectedBook.genres || [];
    if (!current.includes(trimmed)) {
      updateBook(selectedBook.id, { genres: [...current, trimmed] });
    }
    setNewGenre('');
    setIsAddingGenre(false);
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    const current = selectedBook.genres || [];
    updateBook(selectedBook.id, {
      genres: current.filter(g => g !== genreToRemove)
    });
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        id="book-detail-modal-panel"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          aria-label="Close book details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
          {/* Large Cover */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <BookCover
              title={selectedBook.title}
              author={selectedBook.author}
              coverUrl={selectedBook.coverUrl}
              size="lg"
            />
          </div>

          {/* Core Info & Metadata */}
          <div className="flex-1 w-full">
            <h2
              id="book-detail-title"
              className="font-heading font-bold text-2xl text-[var(--color-text-primary)] leading-snug"
            >
              {selectedBook.title}
            </h2>
            <p className="text-base text-[var(--color-text-secondary)] font-medium mt-1">
              {selectedBook.author}
            </p>
            {selectedBook.additionalAuthors && (
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                With: {selectedBook.additionalAuthors}
              </p>
            )}

            {/* Star Rating interactive control */}
            <div className="flex items-center gap-1 mt-4">
              <span className="text-xs text-[var(--color-text-tertiary)] mr-2">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="p-1 hover:scale-115 transition-transform"
                  aria-label={`Rate ${star} stars out of 5`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      selectedBook.rating && star <= selectedBook.rating
                        ? 'fill-[var(--color-rating)] text-[var(--color-rating)]'
                        : 'text-[var(--color-border)] hover:text-[var(--color-rating)]'
                    }`}
                  />
                </button>
              ))}
              {selectedBook.rating && (
                <button
                  onClick={() => handleRatingChange(selectedBook.rating!)}
                  className="text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] ml-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Shelf Selection */}
            <div className="mt-5 flex items-center gap-2">
              <label htmlFor="shelf-select" className="text-xs font-medium text-[var(--color-text-secondary)]">
                Shelf:
              </label>
              <select
                id="shelf-select"
                value={selectedBook.shelfId}
                onChange={(e) => moveBookToShelf(selectedBook.id, e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                {shelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.id}>
                    {shelf.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Metadata Pill Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)] p-3 rounded-lg">
              {selectedBook.pageCount && (
                <div>
                  <span className="font-semibold text-[var(--color-text-secondary)]">Pages:</span>{' '}
                  {selectedBook.pageCount}
                </div>
              )}
              {selectedBook.publishedDate && (
                <div>
                  <span className="font-semibold text-[var(--color-text-secondary)]">Published:</span>{' '}
                  {selectedBook.publishedDate}
                </div>
              )}
              {selectedBook.publisher && (
                <div className="col-span-2">
                  <span className="font-semibold text-[var(--color-text-secondary)]">Publisher:</span>{' '}
                  {selectedBook.publisher}
                </div>
              )}
              {selectedBook.isbn13 && (
                <div>
                  <span className="font-semibold text-[var(--color-text-secondary)]">ISBN-13:</span>{' '}
                  {selectedBook.isbn13}
                </div>
              )}
              {selectedBook.dateRead && selectedBook.shelfId !== 'currently-reading' && (
                <div>
                  <span className="font-semibold text-[var(--color-text-secondary)]">Finished:</span>{' '}
                  {selectedBook.dateRead}
                </div>
              )}
              {selectedBook.dateAdded && (
                <div>
                  <span className="font-semibold text-[var(--color-text-secondary)]">Added:</span>{' '}
                  {selectedBook.dateAdded}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reading Progress section if Currently Reading */}
        {selectedBook.shelfId === 'currently-reading' && (
          <div className="mt-6">
            <ReadingProgressBar book={selectedBook} />
          </div>
        )}

        {/* Description */}
        {selectedBook.description && (
          <div className="mt-6 border-t border-[var(--color-border-subtle)] pt-5">
            <h3 className="font-heading font-semibold text-sm text-[var(--color-text-primary)] mb-2">
              About this book
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {selectedBook.description}
            </p>
          </div>
        )}

        {/* Genre Tags */}
        <div className="mt-6 border-t border-[var(--color-border-subtle)] pt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-heading font-semibold text-sm text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[var(--color-accent)]" /> Genre Tags
            </h3>
            {!isAddingGenre && (
              <button
                onClick={() => setIsAddingGenre(true)}
                className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> Add Tag
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            {(selectedBook.genres || []).map((genre) => (
              <span
                key={genre}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
              >
                {genre}
                <button
                  type="button"
                  onClick={() => handleRemoveGenre(genre)}
                  className="hover:text-[var(--color-error)]"
                  title={`Remove ${genre} tag`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {isAddingGenre && (
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  placeholder="New genre..."
                  aria-label="New genre"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGenre()}
                  autoFocus
                  className="px-2 py-0.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                />
                <button
                  onClick={handleAddGenre}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsAddingGenre(false)}
                  className="p-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal Notes Editor */}
        <div className="mt-6 border-t border-[var(--color-border-subtle)] pt-5">
          <label
            htmlFor="book-notes-textarea"
            className="block font-heading font-semibold text-sm text-[var(--color-text-primary)] mb-2"
          >
            Personal Reading Notes & Thoughts
          </label>
          <textarea
            id="book-notes-textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Record quotes, thoughts, or what resonated with you..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-text-tertiary)]"
          />
        </div>

        {/* Footer Actions: External Link & Delete */}
        <div className="mt-8 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
          <div>
            {(selectedBook.isbn13 || selectedBook.isbn10 || selectedBook.sourceApiId) && (
              <a
                href={`https://openlibrary.org/${
                  selectedBook.sourceApiId
                    ? selectedBook.sourceApiId.startsWith('works/')
                      ? selectedBook.sourceApiId
                      : `works/${selectedBook.sourceApiId}`
                    : `isbn/${selectedBook.isbn13 || selectedBook.isbn10}`
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on Open Library
              </a>
            )}
          </div>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to remove "${selectedBook.title}" from your library?`)) {
                removeBook(selectedBook.id);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-lg transition-colors font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove from Library
          </button>
        </div>
      </div>
    </div>
  );
};
