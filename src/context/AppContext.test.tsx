// @vitest-environment jsdom
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useApp } from './AppContext';
import { seedStorage, renderInApp, makeBook } from '../test/utils';
import { DEFAULT_SHELVES } from '../data/sampleBooksData';
import { GUEST_USER } from '../services/storage';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const STORED_BOOKS_KEY = 'bookshelf_guest_user_books';
const STORED_SHELVES_KEY = 'bookshelf_guest_user_shelves';

function Harness() {
  const {
    user,
    books,
    shelves,
    loginAsGuest,
    logout,
    addBook,
    createShelf,
    renameShelf,
    deleteShelf,
    moveShelf
  } = useApp();

  return (
    <div>
      <button type="button" onClick={loginAsGuest}>Login as guest</button>
      <button type="button" onClick={logout}>Logout</button>
      <button type="button" onClick={() => addBook(makeBook({ id: 'added-1', title: 'Added Book' }))}>
        Add book
      </button>
      <button type="button" onClick={() => createShelf('Custom Shelf 1')}>Create shelf</button>
      <button type="button" onClick={() => renameShelf('custom-1', 'Renamed Shelf')}>Rename shelf</button>
      <button type="button" onClick={() => deleteShelf('custom-1')}>Delete shelf</button>
      <button type="button" onClick={() => deleteShelf('to-read')}>Delete default shelf</button>
      <button type="button" onClick={() => moveShelf('custom-1', 'up')}>Move shelf up</button>

      <span data-testid="user">{user ? user.id : 'none'}</span>
      <span data-testid="book-count">{books.length}</span>
      <span data-testid="shelf-names">{shelves.map((s) => s.name).join(',')}</span>
    </div>
  );
}

function renderHarness() {
  return renderInApp(<Harness />);
}

function storedBooks(): any[] {
  return JSON.parse(localStorage.getItem(STORED_BOOKS_KEY) || '[]');
}

function storedShelves(): any[] {
  return JSON.parse(localStorage.getItem(STORED_SHELVES_KEY) || '[]');
}

beforeEach(() => {
  localStorage.clear();
});

describe('AppContext guest data', () => {
  it('logs in as a guest with the curated library and persists the current user', async () => {
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole('button', { name: 'Login as guest' }));

    expect(screen.getByTestId('user')).toHaveTextContent('guest_user');
    expect(screen.getByTestId('book-count')).toHaveTextContent('45');

    const currentUser = JSON.parse(localStorage.getItem('bookshelf_current_user') || 'null');
    expect(currentUser?.id).toBe(GUEST_USER.id);
    expect(storedBooks()).toHaveLength(45);
    expect(localStorage.getItem(STORED_BOOKS_KEY)).toBeTruthy();
  });

  it('persists guest actions under the guest storage key', async () => {
    seedStorage({ books: [] });
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole('button', { name: 'Add book' }));

    expect(screen.getByTestId('book-count')).toHaveTextContent('1');
    expect(storedBooks().map((b: any) => b.title)).toContain('Added Book');
  });

  it('clears the current user on logout but keeps the guest data stored', async () => {
    seedStorage({ books: [makeBook({ id: 'b1' })] });
    localStorage.setItem('bookshelf_current_user', JSON.stringify(GUEST_USER));
    const user = userEvent.setup();
    renderHarness();

    expect(screen.getByTestId('user')).toHaveTextContent('guest_user');

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(localStorage.getItem('bookshelf_current_user')).toBeNull();
    expect(storedBooks()).toHaveLength(1);
  });
});

describe('AppContext custom shelf management', () => {
  it('creates a custom shelf and persists it', async () => {
    seedStorage({ books: [] });
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole('button', { name: 'Create shelf' }));

    expect(screen.getByTestId('shelf-names')).toHaveTextContent('Custom Shelf 1');
    expect(storedShelves().map((s: any) => s.name)).toContain('Custom Shelf 1');
    expect(storedShelves().length).toBe(DEFAULT_SHELVES.length + 1);
  });

  it('renames a custom shelf and persists the new name', async () => {
    seedStorage({
      books: [],
      shelves: [...DEFAULT_SHELVES, { id: 'custom-1', name: 'Custom Shelf', isDefault: false, position: 5 }]
    });
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole('button', { name: 'Rename shelf' }));

    expect(screen.getByTestId('shelf-names')).toHaveTextContent('Renamed Shelf');

    const renamed = storedShelves().find((s: any) => s.id === 'custom-1');
    expect(renamed?.name).toBe('Renamed Shelf');
  });

  it('deleting a custom shelf moves its books back to Want to Read', async () => {
    seedStorage({
      books: [makeBook({ id: 'b1', title: 'Shelf Resident', shelfId: 'custom-1' })],
      shelves: [...DEFAULT_SHELVES, { id: 'custom-1', name: 'Custom Shelf', isDefault: false, position: 5 }]
    });
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole('button', { name: 'Delete shelf' }));

    expect(storedShelves().some((s: any) => s.id === 'custom-1')).toBe(false);
    expect(storedBooks()[0].shelfId).toBe('to-read');
  });

  it('refuses to delete a default shelf', async () => {
    seedStorage({ books: [makeBook({ id: 'b1', title: 'Stays Put', shelfId: 'to-read' })] });
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole('button', { name: 'Delete default shelf' }));

    expect(storedShelves().some((s: any) => s.id === 'to-read')).toBe(true);
    expect(storedBooks()[0].shelfId).toBe('to-read');
  });

  it('reorders a custom shelf and persists the new position', async () => {
    seedStorage({
      books: [],
      shelves: [...DEFAULT_SHELVES, { id: 'custom-1', name: 'Custom Shelf', isDefault: false, position: 5 }]
    });
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole('button', { name: 'Move shelf up' }));

    const positions = storedShelves().map((s: any) => ({ id: s.id, position: s.position }));
    const custom = positions.find((p: any) => p.id === 'custom-1');
    expect(custom?.position).toBe(DEFAULT_SHELVES.length - 1);
  });
});