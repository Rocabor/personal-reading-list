import React, { useState } from 'react';
import { Trophy, Calendar, BookOpen, Star, Sparkles, Share2, Award, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useViewHeadingFocus } from '../hooks/useViewHeadingFocus';
import { useYearInReviewData } from '../hooks/useYearInReviewData';
import { BookCover } from './BookCover';

export const YearInReview: React.FC = () => {
  const { books, readingGoal, setIsExportCardModalOpen, setSelectedBook } = useApp();
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const headingRef = useViewHeadingFocus<HTMLHeadingElement>([]);

  const {
    availableYears,
    months,
    totalBooks,
    totalPages,
    averageRating,
    longestBook,
    shortestBook,
    monthlyCounts,
    maxMonthCount,
    genreCount,
    sortedGenres,
    topRated,
  } = useYearInReviewData(books, selectedYear);

  return (
    <div id="year-in-review-view" className="max-w-5xl mx-auto py-4 px-4 sm:px-6 space-y-8 animate-fadeIn">
      {/* Top Banner & Story Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2C2420] via-[#3A2E28] to-[#1F1916] text-[#FAF8F5] p-6 sm:p-10 shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-300 border border-white/10 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Reading Journey Showcase
            </div>
            <h1 ref={headingRef} className="font-heading text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              {selectedYear} Year in Review
            </h1>
            <p className="text-sm sm:text-base text-stone-300 mt-2 leading-relaxed">
              Every page turned tells a story. Here is an intimate look into the ideas, narratives, and authors that shaped your reading journey this year.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center">
              <Calendar className="w-4 h-4 absolute left-3 text-amber-300/70 pointer-events-none" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                aria-label="Select review year"
                className="pl-9 pr-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-md text-xs sm:text-sm font-semibold text-amber-100 border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400/50 appearance-none cursor-pointer"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year} className="text-stone-900">
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsExportCardModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] text-xs sm:text-sm font-semibold hover:bg-[var(--color-accent-hover)] transition-all shadow-lg hover:shadow-xl hover:scale-102"
              aria-label="Generate shareable reading card"
            >
              <Share2 className="w-4 h-4" /> Share Reading Card
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-tertiary)] mb-2">
            <span className="text-xs font-medium">Books Finished</span>
            <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <p className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">
            {totalBooks}
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            Across {genreCount} distinct genres
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-tertiary)] mb-2">
            <span className="text-xs font-medium">Pages Devoured</span>
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">
            {totalPages.toLocaleString()}
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            ~{Math.round(totalPages / (totalBooks || 1))} pages per book
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-tertiary)] mb-2">
            <span className="text-xs font-medium">Average Rating</span>
            <Star className="w-4 h-4 text-[var(--color-rating)] fill-[var(--color-rating)]" />
          </div>
          <p className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">
            {averageRating ?? '—'}
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            {averageRating
              ? `${topRated.length} books awarded 5 stars`
              : 'No ratings yet'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--color-text-tertiary)] mb-2">
            <span className="text-xs font-medium">Reading Goal</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          {readingGoal ? (
            <>
              <p className="font-heading text-3xl font-bold text-[var(--color-text-primary)]">
                {readingGoal.completedCount}/{readingGoal.targetCount}
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
                {Math.round((readingGoal.completedCount / readingGoal.targetCount) * 100)}% target reached
              </p>
            </>
          ) : (
            <>
              <p className="font-heading text-3xl font-bold text-[var(--color-text-tertiary)]">—</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
                No goal set for this year
              </p>
            </>
          )}
        </div>
      </div>

      {/* Monthly Rhythm Chart & Genre Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Activity Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-base text-[var(--color-text-primary)]">
                Reading Pace Through the Months
              </h2>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                Number of books completed by month in {selectedYear}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2">
            {months.map((m, idx) => {
              const count = monthlyCounts[idx];
              const heightPercent = maxMonthCount > 0 ? (count / maxMonthCount) * 100 : 0;

              return (
                <div key={m} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[11px] font-mono text-[var(--color-accent)] font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {count > 0 ? count : ''}
                  </span>
                  <div className="w-full max-w-[28px] bg-[var(--color-bg-tertiary)] rounded-t-lg overflow-hidden flex items-end h-full">
                    <div
                      className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all rounded-t-lg"
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                      title={`${m}: ${count} books read`}
                    />
                  </div>
                  <span className="text-[11px] text-[var(--color-text-tertiary)] mt-2 font-medium">
                    {m}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Genres Breakdown */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-heading font-semibold text-base text-[var(--color-text-primary)] mb-1">
              Top Genres
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-4">
              Your dominant reading interests
            </p>

            <div className="space-y-3">
              {sortedGenres.map(([genre, count], idx) => {
                const pct = Math.round((count / (totalBooks || 1)) * 100);
                return (
                  <div key={genre}>
                    <div className="flex justify-between text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      <span>{genre}</span>
                      <span className="text-[var(--color-text-tertiary)] font-mono">{count} books ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[var(--color-bg-tertiary)] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? 'bg-[var(--color-accent)]'
                            : idx === 1
                            ? 'bg-amber-600'
                            : idx === 2
                            ? 'bg-emerald-600'
                            : 'bg-stone-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-tertiary)]">
            A balanced mix of imaginative fiction and thoughtful non-fiction.
          </div>
        </div>
      </div>

      {/* Book Records: Longest Book & Shortest Book */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {longestBook && (
          <button
            type="button"
            onClick={() => setSelectedBook(longestBook)}
            className="w-full text-left p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-4 hover:border-[var(--color-accent)] transition-colors group shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:border-[var(--color-accent)]"
          >
            <BookCover
              title={longestBook.title}
              author={longestBook.author}
              coverUrl={longestBook.coverUrl}
              size="sm"
            />
            <span className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                Longest Book Read
              </span>
              <span className="block font-heading font-semibold text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                {longestBook.title}
              </span>
              <span className="block text-xs text-[var(--color-text-secondary)] truncate">
                {longestBook.author}
              </span>
              <span className="block text-xs font-mono text-[var(--color-text-tertiary)] mt-1">
                {longestBook.pageCount} pages
              </span>
            </span>
            <ArrowUpRight className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] flex-shrink-0" />
          </button>
        )}

        {shortestBook && (
          <button
            type="button"
            onClick={() => setSelectedBook(shortestBook)}
            className="w-full text-left p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-4 hover:border-[var(--color-accent)] transition-colors group shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:border-[var(--color-accent)]"
          >
            <BookCover
              title={shortestBook.title}
              author={shortestBook.author}
              coverUrl={shortestBook.coverUrl}
              size="sm"
            />
            <span className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Shortest Book Read
              </span>
              <span className="block font-heading font-semibold text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                {shortestBook.title}
              </span>
              <span className="block text-xs text-[var(--color-text-secondary)] truncate">
                {shortestBook.author}
              </span>
              <span className="block text-xs font-mono text-[var(--color-text-tertiary)] mt-1">
                {shortestBook.pageCount} pages
              </span>
            </span>
            <ArrowUpRight className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] flex-shrink-0" />
          </button>
        )}
      </div>

      {/* 5-Star Hall of Fame */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
              <Star className="w-5 h-5 text-[var(--color-rating)] fill-[var(--color-rating)]" />
              The 5-Star Hall of Fame
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
              The books that earned your highest praise this year
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {topRated.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBook(b)}
              className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
            >
              <BookCover
                title={b.title}
                author={b.author}
                coverUrl={b.coverUrl}
                size="sm"
                className="mb-2"
              />
              <span className="block font-heading font-semibold text-xs text-[var(--color-text-primary)] line-clamp-2">
                {b.title}
              </span>
              <span className="block text-[11px] text-[var(--color-text-secondary)] line-clamp-1 mt-0.5">
                {b.author}
              </span>
              {b.notes && (
                <span className="block text-[10px] text-[var(--color-text-tertiary)] italic line-clamp-2 mt-1">
                  "{b.notes}"
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
