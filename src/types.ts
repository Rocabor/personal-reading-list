export type ShelfId = 'read' | 'currently-reading' | 'to-read' | string;

export interface Shelf {
  id: ShelfId;
  name: string;
  isDefault: boolean;
  position: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  additionalAuthors?: string;
  isbn13?: string | null;
  isbn10?: string | null;
  coverUrl?: string | null;
  pageCount?: number | null;
  publishedDate?: string;
  genres: string[];
  description?: string | null;
  publisher?: string;
  shelfId: ShelfId;
  currentPage?: number;
  percentage?: number;
  rating?: number | null; // 1-5 or null
  notes?: string;
  dateAdded: string; // ISO date YYYY-MM-DD
  dateRead?: string | null; // ISO date YYYY-MM-DD
  lastProgressUpdate?: string;
  readCount?: number;
  sourceApiId?: string;
}

export interface ReadingGoal {
  year: number;
  targetCount: number;
  completedCount: number;
}

export interface ActivityEvent {
  id: string;
  type: 'added' | 'started' | 'progress' | 'finished' | 'rated' | 'goal_updated';
  bookId?: string;
  bookTitle?: string;
  bookCover?: string | null;
  timestamp: string; // ISO string
  details?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
}

export type SortField = 'recent' | 'title' | 'author' | 'dateAdded' | 'dateRead' | 'rating' | 'progress';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  genre: string;
  rating: number | 'all';
  shelfId: string | 'all';
}

export interface GoodreadsRow {
  bookId?: string;
  title: string;
  author: string;
  authorLf?: string;
  additionalAuthors?: string;
  isbn?: string;
  isbn13?: string;
  myRating?: number;
  averageRating?: number;
  publisher?: string;
  binding?: string;
  numberOfPages?: number;
  yearPublished?: string;
  originalPublicationYear?: string;
  dateRead?: string;
  dateAdded?: string;
  bookshelves?: string;
  exclusiveShelf?: string;
  myReview?: string;
  privateNotes?: string;
  readCount?: number;
}

export interface GoodreadsImportResult {
  totalParsed: number;
  addedCount: number;
  duplicateCount: number;
  skippedCount: number;
  books: Book[];
  /**
   * Custom Goodreads bookshelves found in the file, grouped with the ids of the
   * books that carry them, so the UI can offer a shelf mapping before importing.
   */
  shelves: { goodreadsShelf: string; count: number; bookIds: string[] }[];
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'larger';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  reducedMotion: boolean;
  highContrast: boolean;
  dyslexicFont: boolean;
}
