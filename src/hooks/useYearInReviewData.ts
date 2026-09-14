import { useMemo } from 'react';
import { Book } from '../types';

export interface YearInReviewData {
  availableYears: number[];
  months: string[];
  readBooks: Book[];
  totalBooks: number;
  totalPages: number;
  averageRating: string | null;
  longestBook: Book | null;
  shortestBook: Book | null;
  monthlyCounts: number[];
  maxMonthCount: number;
  genreCount: number;
  sortedGenres: [string, number][];
  topRated: Book[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Memoized year-review analytics for the given books and selected year.
 * Only books actually finished in the selected year are included.
 */
export function useYearInReviewData(books: Book[], selectedYear: number): YearInReviewData {
  const availableYears = useMemo(() => {
    const years = new Set<number>([new Date().getFullYear()]);
    books.forEach((b) => {
      if (b.dateRead) {
        const year = parseInt(b.dateRead.slice(0, 4), 10);
        if (!isNaN(year)) years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [books]);

  const analytics = useMemo(() => {
    const readBooks = books.filter((b) => {
      const isFinished = b.shelfId === 'read' || b.shelfId === 'favorites';
      if (!isFinished) return false;
      return !!b.dateRead && b.dateRead.startsWith(selectedYear.toString());
    });

    const totalBooks = readBooks.length;
    const totalPages = readBooks.reduce((acc, b) => acc + (b.pageCount || 280), 0);
    const ratedBooks = readBooks.filter((b) => b.rating && b.rating > 0);
    const averageRating = ratedBooks.length > 0
      ? (ratedBooks.reduce((acc, b) => acc + (b.rating || 0), 0) / ratedBooks.length).toFixed(1)
      : null;

    const sortedByPages = [...readBooks].filter(b => b.pageCount).sort((a, b) => (b.pageCount || 0) - (a.pageCount || 0));
    const longestBook = sortedByPages[0] || null;
    const shortestBook = sortedByPages[sortedByPages.length - 1] || null;

    // Monthly breakdown
    const monthlyCounts = Array(12).fill(0);
    readBooks.forEach((b) => {
      if (b.dateRead) {
        const parts = b.dateRead.split('-');
        if (parts.length >= 2) {
          const m = parseInt(parts[1], 10) - 1;
          if (m >= 0 && m < 12) {
            monthlyCounts[m]++;
          }
        }
      }
    });
    const maxMonthCount = Math.max(...monthlyCounts, 1);

    // Genre breakdown
    const genreMap = new Map<string, number>();
    readBooks.forEach((b) => {
      (b.genres || ['Uncategorized']).forEach((g) => {
        genreMap.set(g, (genreMap.get(g) || 0) + 1);
      });
    });
    const sortedGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topRated = readBooks.filter((b) => b.rating === 5).slice(0, 4);

    return {
      readBooks,
      totalBooks,
      totalPages,
      averageRating,
      longestBook,
      shortestBook,
      monthlyCounts,
      maxMonthCount,
      genreCount: genreMap.size,
      sortedGenres,
      topRated,
    };
  }, [books, selectedYear]);

  return {
    availableYears,
    months: MONTHS,
    ...analytics,
  };
}