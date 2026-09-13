import { Book, GoodreadsImportResult } from '../types';

/**
 * Parses CSV lines respecting quoted fields with internal commas or quotes.
 */
export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      if (currentRow.some(field => field.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(field => field.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Strips Goodreads ISBN wrapper format: ="0123456789" -> 0123456789
 */
export function cleanGoodreadsIsbn(raw?: string): string | null {
  if (!raw) return null;
  let cleaned = raw.trim();
  // Strip ="..." pattern
  if (cleaned.startsWith('="') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(2, -1);
  }
  cleaned = cleaned.replace(/[^0-9X]/gi, '');
  return cleaned.length >= 9 ? cleaned : null;
}

/**
 * Strips HTML tags or entities from review text
 */
export function sanitizeHtml(html?: string): string | undefined {
  if (!html) return undefined;
  const stripped = html.replace(/<[^>]*>?/gm, '').trim();
  return stripped.length > 0 ? stripped : undefined;
}

/**
 * Parses Goodreads CSV and generates Bookshelf books
 */
export function parseGoodreadsCsv(
  csvText: string,
  existingBooks: Book[] = []
): GoodreadsImportResult {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    return {
      totalParsed: 0,
      addedCount: 0,
      duplicateCount: 0,
      skippedCount: 0,
      books: []
    };
  }

  const header = rows[0].map(h => h.trim().toLowerCase());
  const colIndex = {
    title: header.indexOf('title'),
    author: header.indexOf('author'),
    authorLf: header.indexOf('author l-f'),
    additionalAuthors: header.indexOf('additional authors'),
    isbn: header.indexOf('isbn'),
    isbn13: header.indexOf('isbn13'),
    myRating: header.indexOf('my rating'),
    numberOfPages: header.indexOf('number of pages'),
    yearPublished: header.indexOf('year published'),
    originalPublicationYear: header.indexOf('original publication year'),
    dateRead: header.indexOf('date read'),
    dateAdded: header.indexOf('date added'),
    bookshelves: header.indexOf('bookshelves'),
    exclusiveShelf: header.indexOf('exclusive shelf'),
    myReview: header.indexOf('my review'),
    privateNotes: header.indexOf('private notes'),
    readCount: header.indexOf('read count'),
    publisher: header.indexOf('publisher'),
  };

  const newBooks: Book[] = [];
  let duplicateCount = 0;
  let skippedCount = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const title = (row[colIndex.title] || '').trim();
    if (!title) {
      skippedCount++;
      continue;
    }

    let author = (row[colIndex.author] || '').trim();
    if (!author && colIndex.authorLf >= 0 && row[colIndex.authorLf]) {
      // Convert "Last, First" to "First Last"
      const parts = row[colIndex.authorLf].split(',').map(p => p.trim());
      if (parts.length === 2) {
        author = `${parts[1]} ${parts[0]}`;
      } else {
        author = row[colIndex.authorLf].trim();
      }
    }

    const additionalAuthors = colIndex.additionalAuthors >= 0 ? (row[colIndex.additionalAuthors] || '').trim() : '';
    const fullAuthor = additionalAuthors ? `${author}, ${additionalAuthors}` : author;

    const rawIsbn10 = colIndex.isbn >= 0 ? row[colIndex.isbn] : undefined;
    const rawIsbn13 = colIndex.isbn13 >= 0 ? row[colIndex.isbn13] : undefined;
    const isbn10 = cleanGoodreadsIsbn(rawIsbn10);
    const isbn13 = cleanGoodreadsIsbn(rawIsbn13);

    // Duplicate check by ISBN or Title + Author
    const isDuplicate = existingBooks.some(existing => {
      if (isbn13 && existing.isbn13 && isbn13 === existing.isbn13) return true;
      if (isbn10 && existing.isbn10 && isbn10 === existing.isbn10) return true;
      return (
        existing.title.toLowerCase() === title.toLowerCase() &&
        existing.author.toLowerCase() === author.toLowerCase()
      );
    });

    if (isDuplicate) {
      duplicateCount++;
      continue;
    }

    // Shelf mapping
    const rawExclusive = colIndex.exclusiveShelf >= 0 ? (row[colIndex.exclusiveShelf] || '').trim().toLowerCase() : '';
    const rawShelves = colIndex.bookshelves >= 0 ? (row[colIndex.bookshelves] || '').toLowerCase() : '';
    
    let shelfId = 'to-read';
    if (rawExclusive === 'read' || rawExclusive === 'currently-reading' || rawExclusive === 'to-read') {
      shelfId = rawExclusive;
    } else if (rawShelves.includes('favorites')) {
      shelfId = 'favorites';
    }

    // Rating: 0 means unrated
    const rawRating = colIndex.myRating >= 0 ? parseInt(row[colIndex.myRating] || '0', 10) : 0;
    const rating = rawRating > 0 && rawRating <= 5 ? rawRating : null;

    // Pages
    const rawPages = colIndex.numberOfPages >= 0 ? parseInt(row[colIndex.numberOfPages] || '0', 10) : 0;
    const pageCount = rawPages > 0 ? rawPages : null;

    // Dates
    const rawDateRead = colIndex.dateRead >= 0 ? (row[colIndex.dateRead] || '').trim() : '';
    const rawDateAdded = colIndex.dateAdded >= 0 ? (row[colIndex.dateAdded] || '').trim() : '';
    const dateRead = rawDateRead ? rawDateRead.replace(/\//g, '-') : null;
    const dateAdded = rawDateAdded ? rawDateAdded.replace(/\//g, '-') : new Date().toISOString().slice(0, 10);

    // Year published
    const yearPub = colIndex.originalPublicationYear >= 0 && row[colIndex.originalPublicationYear] 
      ? row[colIndex.originalPublicationYear].trim()
      : (colIndex.yearPublished >= 0 ? (row[colIndex.yearPublished] || '').trim() : '');

    // Notes
    const review = colIndex.myReview >= 0 ? sanitizeHtml(row[colIndex.myReview]) : undefined;
    const privateNotes = colIndex.privateNotes >= 0 ? (row[colIndex.privateNotes] || '').trim() : undefined;
    const combinedNotes = [review, privateNotes].filter(Boolean).join('\n\n') || undefined;

    // Read count
    const readCount = colIndex.readCount >= 0 ? parseInt(row[colIndex.readCount] || '1', 10) : 1;

    // Cover image using Open Library cover if ISBN available
    const coverUrl = isbn13 
      ? `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg` 
      : (isbn10 ? `https://covers.openlibrary.org/b/isbn/${isbn10}-L.jpg` : null);

    const book: Book = {
      id: `imported-${Date.now()}-${r}`,
      title,
      author: fullAuthor || 'Unknown Author',
      isbn10,
      isbn13,
      coverUrl,
      pageCount,
      publishedDate: yearPub || undefined,
      genres: ['Goodreads Import'],
      shelfId,
      rating,
      notes: combinedNotes,
      dateAdded,
      dateRead,
      readCount: readCount || 1,
      currentPage: shelfId === 'currently-reading' ? Math.round((pageCount || 200) * 0.3) : undefined,
      percentage: shelfId === 'read' || shelfId === 'favorites' ? 100 : (shelfId === 'currently-reading' ? 30 : 0)
    };

    newBooks.push(book);
  }

  return {
    totalParsed: rows.length - 1,
    addedCount: newBooks.length,
    duplicateCount,
    skippedCount,
    books: newBooks
  };
}
