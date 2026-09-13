import { describe, expect, it } from 'vitest';
import { DEFAULT_SHELVES, RAW_SAMPLE_BOOKS, getCuratedInitialBooks } from './sampleBooksData';

describe('RAW_SAMPLE_BOOKS', () => {
  it('contains the 45 curated books', () => {
    expect(RAW_SAMPLE_BOOKS).toHaveLength(45);
  });

  it('every book has title and author; covers are valid URLs when present', () => {
    for (const book of RAW_SAMPLE_BOOKS) {
      expect(book.title.length).toBeGreaterThan(0);
      expect(book.author.length).toBeGreaterThan(0);
      if (book.coverUrl) {
        expect(book.coverUrl).toMatch(/^https:\/\//);
      }
    }
  });
});

describe('getCuratedInitialBooks', () => {
  const books = getCuratedInitialBooks();

  it('builds 45 books with stable ids', () => {
    expect(books).toHaveLength(45);
    expect(books[0].id).toBe('book-1');
    expect(books[44].id).toBe('book-45');
  });

  it('distributes books across shelves as specified', () => {
    const byShelf = new Map<string, number>();
    for (const b of books) {
      byShelf.set(b.shelfId, (byShelf.get(b.shelfId) || 0) + 1);
    }
    expect(byShelf.get('read')).toBe(20);
    expect(byShelf.get('currently-reading')).toBe(5);
    expect(byShelf.get('to-read')).toBe(15);
    expect(byShelf.get('favorites')).toBe(5);
  });

  it('read and favorites books are marked 100% complete', () => {
    const finished = books.filter((b) => b.shelfId === 'read' || b.shelfId === 'favorites');
    expect(finished).toHaveLength(25);
    for (const b of finished) {
      expect(b.percentage).toBe(100);
    }
  });

  it('completed in 2026 is exactly 22 (20 read + 2 favorites)', () => {
    const in2026 = books.filter((b) => b.dateRead && b.dateRead.startsWith('2026'));
    expect(in2026).toHaveLength(22);
  });

  it('completed in 2025 is exactly 3 (rest of favorites)', () => {
    const in2025 = books.filter((b) => b.dateRead && b.dateRead.startsWith('2025'));
    expect(in2025).toHaveLength(3);
  });

  it('currently-reading books have progress but no completion date', () => {
    const reading = books.filter((b) => b.shelfId === 'currently-reading');
    for (const b of reading) {
      expect(b.dateRead).toBeNull();
      expect(b.currentPage).toBeGreaterThan(0);
      expect(b.percentage).toBeGreaterThan(0);
    }
  });

  it('Ratings only appear on finished shelves', () => {
    for (const b of books) {
      if (b.rating) {
        expect(b.shelfId === 'read' || b.shelfId === 'favorites').toBe(true);
      }
    }
  });
});

describe('DEFAULT_SHELVES', () => {
  it('starts each fresh user with the five default shelves', () => {
    expect(DEFAULT_SHELVES).toHaveLength(5);
    expect(DEFAULT_SHELVES.filter((s) => s.isDefault)).toHaveLength(3);
  });
});