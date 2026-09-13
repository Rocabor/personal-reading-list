import { describe, expect, it } from 'vitest';
import { cleanGoodreadsIsbn, parseCsvRows, parseGoodreadsCsv, sanitizeHtml } from './goodreadsParser';

describe('parseCsvRows', () => {
  it('parses rows after the header', () => {
    const rows = parseCsvRows('Title,Author,ISBN\nA,B,C\nD,E,F');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual(['Title', 'Author', 'ISBN']);
    expect(rows[1]).toEqual(['A', 'B', 'C']);
    expect(rows[2]).toEqual(['D', 'E', 'F']);
  });

  it('respects quoted fields with internal commas', () => {
    const rows = parseCsvRows('Title,Author\n"Thing, The","Doe, John"');
    expect(rows[1]).toEqual(['Thing, The', 'Doe, John']);
  });

  it('handles escaped quotes and CRLF line endings', () => {
    const rows = parseCsvRows('Title,Review\r\n"Said ""hey""",Great\r\n');
    expect(rows[1]).toEqual(['Said "hey"', 'Great']);
  });

  it('skips blank lines', () => {
    const rows = parseCsvRows('A,B\n\n\nC,D\n');
    expect(rows).toEqual([['A', 'B'], ['C', 'D']]);
  });
});

describe('cleanGoodreadsIsbn', () => {
  it('strips the Goodreads ="..." wrapper', () => {
    expect(cleanGoodreadsIsbn('="9780743273565"')).toBe('9780743273565');
  });

  it('removes non-alphanumeric characters', () => {
    expect(cleanGoodreadsIsbn(' 978-0-7432-7356-5 ')).toBe('9780743273565');
  });

  it('keeps X for ISBN-10 checksums', () => {
    expect(cleanGoodreadsIsbn('="080442957X"')).toBe('080442957X');
  });

  it('returns null for empty or too-short values', () => {
    expect(cleanGoodreadsIsbn(undefined)).toBeNull();
    expect(cleanGoodreadsIsbn('123')).toBeNull();
    expect(cleanGoodreadsIsbn('')).toBeNull();
  });
});

describe('sanitizeHtml', () => {
  it('strips tags', () => {
    expect(sanitizeHtml('<p>A perfect novel.</p>')).toBe('A perfect novel.');
  });

  it('returns undefined when nothing meaningful remains', () => {
    expect(sanitizeHtml('<br/>')).toBeUndefined();
    expect(sanitizeHtml(undefined)).toBeUndefined();
  });
});

const HEADER = [
  'Book Id', 'Title', 'Author', 'Author l-f', 'Additional Authors', 'ISBN', 'ISBN13',
  'My Rating', 'Average Rating', 'Publisher', 'Binding', 'Number of Pages',
  'Year Published', 'Original Publication Year', 'Date Read', 'Date Added',
  'Bookshelves', 'Bookshelves with positions', 'Exclusive Shelf', 'My Review',
  'Spoiler', 'Private Notes', 'Read Count', 'Owned Copies'
].join(',');

// CSV row builder that quotes fields needing it (commas, quotes, newlines)
function csvRow(fields: string[]): string {
  return fields.map(f => /[",\n]/.test(f) ? `"${f.replace(/"/g, '""')}"` : f).join(',');
}

function bookRow(fields: Record<string, string>): string {
  const cells: string[] = [];
  const idx = HEADER.split(',');
  for (const name of idx) {
    cells.push(fields[name] ?? '');
  }
  return csvRow(cells);
}

describe('parseGoodreadsCsv', () => {
  it('returns an empty result for a file with no data rows', () => {
    const result = parseGoodreadsCsv(HEADER);
    expect(result.totalParsed).toBe(0);
    expect(result.books).toHaveLength(0);
  });

  it('parses a single book row correctly', () => {
    const row = bookRow({
      'Book Id': '1',
      'Title': 'Title One',
      'Author': 'Author One',
      'Author l-f': 'One, Author',
      'ISBN': '0743273567',
      'ISBN13': '9780743273565',
      'My Rating': '5',
      'Publisher': 'Pub',
      'Number of Pages': '300',
      'Original Publication Year': '2019',
      'Date Read': '2025/09/14',
      'Date Added': '2025/01/10',
      'Exclusive Shelf': 'read',
      'My Review': 'Good <small>review</small>',
      'Read Count': '2'
    });
    const result = parseGoodreadsCsv([HEADER, row].join('\n'));
    expect(result.totalParsed).toBe(1);
    expect(result.addedCount).toBe(1);
    const book = result.books[0];
    expect(book.title).toBe('Title One');
    expect(book.author).toBe('Author One');
    expect(book.isbn13).toBe('9780743273565');
    expect(book.isbn10).toBe('0743273567');
    expect(book.pageCount).toBe(300);
    expect(book.rating).toBe(5);
    expect(book.shelfId).toBe('read');
    expect(book.percentage).toBe(100);
    expect(book.dateRead).toBe('2025-09-14');
    expect(book.notes).toBe('Good review');
  });

  it('falls back to Author l-f when Author is empty', () => {
    const row = bookRow({ 'Book Id': '2', 'Title': 'No Author Yet', 'Author l-f': 'One, Author' });
    const result = parseGoodreadsCsv([HEADER, row].join('\n'));
    expect(result.books[0].author).toBe('Author One');
  });

  it('moves books on a mapped custom shelf when shelfMap is provided', () => {
    const row = bookRow({
      'Book Id': '3',
      'Title': 'Club Pick',
      'Author': 'Some Author',
      'ISBN13': '9780141439518',
      'Bookshelves': 'goodreads',
      'Exclusive Shelf': 'to-read',
      'Private Notes': 'notes'
    });
    const result = parseGoodreadsCsv([HEADER, row].join('\n'), [], {
      shelfMap: { goodreads: 'book-club' }
    });
    expect(result.books[0].shelfId).toBe('book-club');
    expect(result.shelves).toContainEqual(
      expect.objectContaining({ goodreadsShelf: 'goodreads', count: 1 })
    );
  });

  it('flags duplicates against the existing library', () => {
    const row = bookRow({
      'Book Id': '1',
      'Title': 'Title One',
      'Author': 'Author One',
      'ISBN': '0743273567',
      'ISBN13': '9780743273565',
      'Exclusive Shelf': 'to-read'
    });
    const existing = [{
      id: 'existing-1',
      title: 'Title One',
      author: 'Author One',
      isbn10: '0743273567',
      isbn13: '9780743273565',
      shelfId: 'to-read'
    } as any];
    const result = parseGoodreadsCsv([HEADER, row].join('\n'), existing);
    expect(result.duplicateCount).toBe(1);
    expect(result.addedCount).toBe(0);
  });

  it('skips rows without a title', () => {
    const noTitle = bookRow({ 'Book Id': '2', 'Author': 'Some Author' });
    const realBook = bookRow({ 'Book Id': '3', 'Title': 'Real Book', 'Author': 'Good Author' });
    const result = parseGoodreadsCsv([HEADER, noTitle, realBook].join('\n'));
    expect(result.skippedCount).toBe(1);
    expect(result.books).toHaveLength(1);
  });

  it('replaces slashes with hyphens for both dates', () => {
    const row = bookRow({
      'Book Id': '4',
      'Title': 'Date Book',
      'Author': 'Author X',
      'ISBN13': '9780451524935',
      'Date Read': '2026/03/02',
      'Date Added': '2025/12/20',
      'Exclusive Shelf': 'read'
    });
    const result = parseGoodreadsCsv([HEADER, row].join('\n'));
    expect(result.books[0].dateRead).toBe('2026-03-02');
    expect(result.books[0].dateAdded).toBe('2025-12-20');
  });
});