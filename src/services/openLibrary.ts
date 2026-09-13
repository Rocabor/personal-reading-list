import { Book } from '../types';

export interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  subject?: string[];
  publisher?: string[];
}

export interface SearchResultItem {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  isbn10: string | null;
  isbn13: string | null;
  pageCount: number | null;
  publishedDate: string;
  genres: string[];
  publisher: string;
  description: string;
  openLibraryKey: string;
}

// In-memory search cache to respect rate-limiting
const searchCache = new Map<string, { timestamp: number; results: SearchResultItem[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function searchOpenLibrary(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const cacheKey = trimmed.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }

  // Detect if query is an ISBN
  const isIsbn = /^[0-9X-]{10,17}$/i.test(trimmed.replace(/\s+/g, ''));
  const cleanedIsbn = trimmed.replace(/[^0-9X]/gi, '');
  
  const searchUrl = isIsbn
    ? `https://openlibrary.org/search.json?isbn=${encodeURIComponent(cleanedIsbn)}&limit=25`
    : `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=25`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new Error('Open Library search is temporarily busy (rate limit). Please wait a moment and try again.');
    }

    if (!response.ok) {
      throw new Error(`Book database responded with status ${response.status}`);
    }

    const data = await response.json();
    const docs: OpenLibraryDoc[] = data.docs || [];

    const results: SearchResultItem[] = docs.map((doc, idx) => {
      const author = doc.author_name && doc.author_name.length > 0 
        ? doc.author_name.slice(0, 2).join(', ') 
        : 'Unknown Author';

      // Pick ISBN-10 and ISBN-13
      let isbn10: string | null = null;
      let isbn13: string | null = null;
      if (doc.isbn && doc.isbn.length > 0) {
        for (const code of doc.isbn) {
          const raw = code.replace(/[^0-9X]/gi, '');
          if (raw.length === 10 && !isbn10) isbn10 = raw;
          if (raw.length === 13 && !isbn13) isbn13 = raw;
        }
      }

      // Determine cover URL: prefer cover_i, else fallback to isbn
      let coverUrl: string | null = null;
      if (doc.cover_i) {
        coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      } else if (isbn13) {
        coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`;
      } else if (isbn10) {
        coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn10}-L.jpg`;
      }

      // Filter genres/subjects to top readable categories
      const rawSubjects = doc.subject || [];
      const genres = rawSubjects
        .filter(s => s.length > 2 && s.length < 25 && !s.includes('protected') && !s.includes('accessible'))
        .slice(0, 3);
      if (genres.length === 0) {
        genres.push('General');
      }

      return {
        id: `ol-${doc.key.replace(/\//g, '-') || idx}-${Date.now()}`,
        title: doc.title,
        author,
        coverUrl,
        isbn10,
        isbn13,
        pageCount: doc.number_of_pages_median || null,
        publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
        genres,
        publisher: doc.publisher && doc.publisher.length > 0 ? doc.publisher[0] : 'Various Publishers',
        description: `Published in ${doc.first_publish_year || 'earlier years'}. Available on Open Library archives.`,
        openLibraryKey: doc.key
      };
    });

    searchCache.set(cacheKey, { timestamp: Date.now(), results });
    return results;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Search request timed out. The Open Library server is taking longer than usual to respond.');
    }
    throw err;
  }
}

/**
 * Converts a SearchResultItem into a standard Library Book on a chosen shelf
 */
export function convertSearchResultToBook(item: SearchResultItem, shelfId: string = 'to-read'): Book {
  return {
    id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: item.title,
    author: item.author,
    isbn10: item.isbn10,
    isbn13: item.isbn13,
    coverUrl: item.coverUrl,
    pageCount: item.pageCount,
    publishedDate: item.publishedDate,
    genres: item.genres,
    description: item.description,
    publisher: item.publisher,
    shelfId,
    rating: null,
    notes: '',
    dateAdded: new Date().toISOString().slice(0, 10),
    readCount: shelfId === 'read' || shelfId === 'favorites' ? 1 : 0,
    currentPage: shelfId === 'currently-reading' ? 1 : undefined,
    percentage: shelfId === 'read' || shelfId === 'favorites' ? 100 : 0,
    sourceApiId: item.openLibraryKey
  };
}
