import { describe, it, expect } from 'vitest';
import { convertSearchResultToBook, SearchResultItem } from './openLibrary';

const RESULT: SearchResultItem = {
  id: 'ol-dune',
  title: 'Dune',
  author: 'Frank Herbert',
  coverUrl: 'https://covers.openlibrary.org/b/id/123-L.jpg',
  isbn10: '0441172717',
  isbn13: '9780441172719',
  pageCount: 412,
  publishedDate: '1965',
  genres: ['Science fiction'],
  publisher: 'Ace',
  description: 'Published in 1965. Available on Open Library archives.',
  openLibraryKey: '/works/OL1234W'
};

describe('convertSearchResultToBook', () => {
  it('maps every field from the search result into a library book', () => {
    const book = convertSearchResultToBook(RESULT, 'to-read');

    expect(book.title).toBe('Dune');
    expect(book.author).toBe('Frank Herbert');
    expect(book.isbn10).toBe('0441172717');
    expect(book.isbn13).toBe('9780441172719');
    expect(book.coverUrl).toBe('https://covers.openlibrary.org/b/id/123-L.jpg');
    expect(book.pageCount).toBe(412);
    expect(book.publishedDate).toBe('1965');
    expect(book.genres).toEqual(['Science fiction']);
    expect(book.publisher).toBe('Ace');
    expect(book.description).toBe('Published in 1965. Available on Open Library archives.');
    expect(book.sourceApiId).toBe('/works/OL1234W');
    expect(book.shelfId).toBe('to-read');
    expect(book.rating).toBeNull();
    expect(book.notes).toBe('');
    expect(book.dateAdded).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('defaults to the to-read shelf when none is provided', () => {
    expect(convertSearchResultToBook(RESULT).shelfId).toBe('to-read');
  });

  it('sets reading state for the currently-reading shelf', () => {
    const book = convertSearchResultToBook(RESULT, 'currently-reading');

    expect(book.shelfId).toBe('currently-reading');
    expect(book.currentPage).toBe(1);
    expect(book.readCount).toBe(0);
    expect(book.percentage).toBe(0);
  });

  it('marks read and favorites shelves as fully read', () => {
    const read = convertSearchResultToBook(RESULT, 'read');
    expect(read.readCount).toBe(1);
    expect(read.percentage).toBe(100);
    expect(read.currentPage).toBeUndefined();

    const favorites = convertSearchResultToBook(RESULT, 'favorites');
    expect(favorites.readCount).toBe(1);
    expect(favorites.percentage).toBe(100);
  });

  it('generates a unique id for each conversion', () => {
    const a = convertSearchResultToBook(RESULT, 'to-read');
    const b = convertSearchResultToBook(RESULT, 'to-read');

    expect(a.id).not.toBe(b.id);
  });
});