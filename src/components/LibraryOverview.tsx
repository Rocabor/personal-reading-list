import React from 'react';
import { BookOpen, Plus, ArrowRight, Bookmark, Sparkles, Star, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookCover } from './BookCover';
import { ReadingGoalCard } from './ReadingGoalCard';
import { ReadingProgressBar } from './ReadingProgressBar';

export const LibraryOverview: React.FC = () => {
  const {
    books,
    shelves,
    setActiveShelfId,
    setIsSearchModalOpen,
    setSelectedBook,
    setActiveView
  } = useApp();

  const currentlyReading = books.filter((b) => b.shelfId === 'currently-reading');
  const readBooks = books.filter((b) => b.shelfId === 'read' || b.shelfId === 'favorites');
  const toReadBooks = books.filter((b) => b.shelfId === 'to-read');

  return (
    <div id="library-overview" className="space-y-10 animate-fadeIn">
      {/* Top Banner & Goal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to your library
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] leading-tight">
              A curated space for your reading life.
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-2 max-w-xl leading-relaxed">
              Track your active books, manage your custom shelves, and reflect on your progress without distraction.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5 text-xs text-[var(--color-text-secondary)]">
              <div>
                <span className="font-heading font-bold text-lg text-[var(--color-text-primary)] block">
                  {books.length}
                </span>
                <span>Total Books</span>
              </div>
              <div className="w-px h-8 bg-[var(--color-border)]" />
              <div>
                <span className="font-heading font-bold text-lg text-emerald-700 dark:text-emerald-400 block">
                  {readBooks.length}
                </span>
                <span>Completed</span>
              </div>
              <div className="w-px h-8 bg-[var(--color-border)]" />
              <div>
                <span className="font-heading font-bold text-lg text-amber-900 dark:text-amber-400 block">
                  {currentlyReading.length}
                </span>
                <span className="text-[var(--color-text-secondary)] font-medium">In Progress</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Book
              </button>
            </div>
          </div>
        </div>

        {/* Reading Goal Widget */}
        <div className="lg:col-span-1">
          <ReadingGoalCard />
        </div>
      </div>

      {/* Priority Section: Currently Reading */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 className="font-heading font-bold text-xl text-[var(--color-text-primary)]">
              Currently Reading
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300/80 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/35 font-semibold">
              {currentlyReading.length}
            </span>
          </div>

          <button
            onClick={() => setActiveShelfId('currently-reading')}
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1"
          >
            View shelf <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {currentlyReading.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-center text-xs text-[var(--color-text-tertiary)]">
            No books currently being read. Pick a book from "Want to Read" or search for your next adventure.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentlyReading.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs hover:border-[var(--color-accent)]/50 transition-colors flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  <BookCover
                    title={book.title}
                    author={book.author}
                    coverUrl={book.coverUrl}
                    size="sm"
                    onClick={() => setSelectedBook(book)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => setSelectedBook(book)}
                      className="font-heading font-semibold text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent)] cursor-pointer truncate"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">
                      {book.author}
                    </p>
                    {book.notes && (
                      <p className="text-[11px] text-[var(--color-text-tertiary)] italic line-clamp-2 mt-1">
                        "{book.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
                  <ReadingProgressBar book={book} compact={true} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shelf Previews (First 5-7 covers per shelf with See All) */}
      <div className="space-y-10">
        {shelves.map((shelf) => {
          if (shelf.id === 'currently-reading') return null; // Already rendered above as priority
          const shelfBooks = books.filter((b) => b.shelfId === shelf.id);
          const previewItems = shelfBooks.slice(0, 7);

          return (
            <section key={shelf.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-heading font-bold text-lg sm:text-xl text-[var(--color-text-primary)]">
                    {shelf.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] font-semibold">
                    {shelfBooks.length}
                  </span>
                </div>

                <button
                  onClick={() => setActiveShelfId(shelf.id)}
                  className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1"
                >
                  See all ({shelfBooks.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {shelfBooks.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] text-center text-xs text-[var(--color-text-tertiary)]">
                  No books on this shelf yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4">
                  {previewItems.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBook(book)}
                      className="group cursor-pointer flex flex-col items-center text-center p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                      <BookCover
                        title={book.title}
                        author={book.author}
                        coverUrl={book.coverUrl}
                        size="sm"
                        className="mb-2"
                      />
                      <h3 className="font-heading font-semibold text-xs text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] line-clamp-1 w-full">
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1 w-full">
                        {book.author}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
