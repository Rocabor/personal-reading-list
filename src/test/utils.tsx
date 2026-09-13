import React from 'react';
import { render } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { Book, Shelf, ReadingGoal, ActivityEvent } from '../types';
import { DEFAULT_SHELVES } from '../data/sampleBooksData';

export function renderInApp(ui: React.ReactElement) {
  return render(<AppProvider>{ui}</AppProvider>);
}

export function seedStorage(overrides: {
  books?: Book[];
  shelves?: Shelf[];
  goal?: ReadingGoal | null;
  activities?: ActivityEvent[];
}) {
  if (typeof localStorage === 'undefined') return;
  localStorage.clear();
  if (overrides.books) {
    localStorage.setItem('bookshelf_guest_user_books', JSON.stringify(overrides.books));
  }
  localStorage.setItem('bookshelf_guest_user_shelves', JSON.stringify(overrides.shelves ?? DEFAULT_SHELVES));
  if (overrides.goal !== undefined) {
    localStorage.setItem('bookshelf_guest_user_goal', JSON.stringify(overrides.goal));
  }
  if (overrides.activities !== undefined) {
    localStorage.setItem('bookshelf_guest_user_activities', JSON.stringify(overrides.activities));
  }
}

export function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-1',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genres: [],
    shelfId: 'to-read',
    dateAdded: '2026-01-15',
    ...overrides
  };
}