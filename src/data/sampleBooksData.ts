import { Book, Shelf } from '../types';
import sampleCatalog from '../../data/sample-books.json';

export type RawSampleBook = {
  title: string;
  author: string;
  additionalAuthors?: string;
  isbn13?: string;
  isbn10?: string;
  coverUrl?: string;
  pageCount?: number;
  publishedDate?: string;
  genres?: string[];
  description?: string;
  publisher?: string;
};

export const RAW_SAMPLE_BOOKS = sampleCatalog as RawSampleBook[];

export const DEFAULT_SHELVES: Shelf[] = [
  { id: 'currently-reading', name: 'Currently Reading', isDefault: true, position: 0 },
  { id: 'to-read', name: 'Want to Read', isDefault: true, position: 1 },
  { id: 'read', name: 'Read', isDefault: true, position: 2 },
  { id: 'favorites', name: 'Favorites', isDefault: false, position: 3 },
  { id: 'book-club', name: 'Book Club', isDefault: false, position: 4 }
];

export function getCuratedInitialBooks(): Book[] {
  // Distribute the 45 curated books across shelves according to the guest experience specs:
  // ~15 on "Read" (with ratings and dates read in 2025/2026)
  // ~5 on "Currently Reading" (with reading progress)
  // ~15 on "Want to Read"
  // ~10 on "Favorites" (which also count as read/treasured)

  return RAW_SAMPLE_BOOKS.map((raw, index) => {
    const id = `book-${index + 1}`;
    let shelfId: string = 'to-read';
    let rating: number | null = null;
    let notes: string | undefined = undefined;
    let dateRead: string | null = null;
    let currentPage: number | undefined = undefined;
    let percentage: number | undefined = undefined;
    let readCount = 0;

    // Spec distribution:
    if (index === 24) { // Project Hail Mary
      shelfId = 'currently-reading';
      percentage = 65;
      currentPage = Math.round((raw.pageCount || 496) * 0.65);
      notes = "Best sci-fi I've read in years. Funny, smart, emotional.";
    } else if (index === 11) { // Educated
      shelfId = 'currently-reading';
      percentage = 30;
      currentPage = Math.round((raw.pageCount || 352) * 0.30);
      notes = "Intense, moving memoir about family, isolation, and resilience.";
    } else if (index === 23) { // The Name of the Wind
      shelfId = 'currently-reading';
      percentage = 82;
      currentPage = Math.round((raw.pageCount || 662) * 0.82);
      notes = "Still waiting for book 3! Kvothe's story is endlessly captivating.";
    } else if (index === 30) { // Deep Work
      shelfId = 'currently-reading';
      percentage = 15;
      currentPage = Math.round((raw.pageCount || 304) * 0.15);
      notes = "Applied the time-blocking method immediately.";
    } else if (index === 9) { // Circe
      shelfId = 'currently-reading';
      percentage = 47;
      currentPage = Math.round((raw.pageCount || 393) * 0.47);
      notes = "Loving the mythological perspective and Circe's transformation.";
    } else if ([0, 1, 3, 5, 20].includes(index)) {
      // Favorites custom shelf (5 books)
      shelfId = 'favorites';
      rating = 5;
      readCount = index === 0 || index === 20 ? 2 : 1;
      dateRead = index % 2 === 0 ? '2026-02-14' : '2025-10-12';
      notes = index === 0 ? "A perfect novel. Every sentence earns its place." :
              index === 1 ? "Timeless and devastating. One of the greats." :
              index === 20 ? "Epic worldbuilding, deeply philosophical." :
              "A truly memorable and inspiring read.";
    } else if ([2, 4, 6, 8, 10, 12, 13, 14, 15, 16, 17, 18, 21, 22, 25, 26, 31, 32, 34, 37].includes(index)) {
      // Read shelf (20 books)
      shelfId = 'read';
      readCount = 1;
      const ratings = [4, 3, 4, 4, 4, 3, 4, 4, 4, 4, 4, 3, 4, 4, 4, 4, 3, 3, 3, 4];
      const rIdx = [2, 4, 6, 8, 10, 12, 13, 14, 15, 16, 17, 18, 21, 22, 25, 26, 31, 32, 34, 37].indexOf(index);
      rating = ratings[rIdx] || 4;
      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      const month = months[index % 12];
      const day = (10 + (index % 18)).toString().padStart(2, '0');
      dateRead = `2026-${month}-${day}`;
      if (index === 2) notes = "More relevant than ever.";
      if (index === 6) notes = "Bleak but beautiful. Read in two sittings.";
      if (index === 10) notes = "Changed how I think about history.";
      if (index === 15) notes = "Practical and actionable.";
    } else {
      // Want to read shelf (15 books)
      shelfId = 'to-read';
      if (index === 28) notes = "Recommended by Sarah from the reading group.";
    }

    return {
      id,
      title: raw.title,
      author: raw.author,
      additionalAuthors: raw.additionalAuthors,
      isbn13: raw.isbn13,
      isbn10: raw.isbn10,
      coverUrl: raw.coverUrl,
      pageCount: raw.pageCount,
      publishedDate: raw.publishedDate,
      genres: raw.genres,
      description: raw.description,
      publisher: raw.publisher,
      shelfId,
      currentPage,
      percentage: percentage || (currentPage && raw.pageCount ? Math.round((currentPage / raw.pageCount) * 100) : (shelfId === 'read' || shelfId === 'favorites' ? 100 : 0)),
      rating,
      notes,
      dateAdded: '2025-01-10',
      dateRead,
      readCount,
      lastProgressUpdate: currentPage ? '2026-09-10T14:20:00Z' : undefined
    };
  });
}