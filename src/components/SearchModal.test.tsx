// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchModal } from './SearchModal';
import { useApp } from '../context/AppContext';
import { seedStorage, renderInApp } from '../test/utils';
import { SearchResultItem, searchOpenLibrary } from '../services/openLibrary';

vi.mock('../services/openLibrary', () => ({
  searchOpenLibrary: vi.fn(),
  convertSearchResultToBook: (item: SearchResultItem, shelfId: string) => ({
    id: `book-${item.id}`,
    title: item.title,
    author: item.author,
    isbn13: item.isbn13,
    isbn10: item.isbn10,
    coverUrl: item.coverUrl,
    pageCount: item.pageCount,
    publishedDate: item.publishedDate,
    genres: item.genres,
    publisher: item.publisher,
    description: item.description,
    shelfId,
    rating: null,
    notes: '',
    dateAdded: '2026-01-01',
    currentPage: shelfId === 'currently-reading' ? 1 : undefined,
    percentage: shelfId === 'read' || shelfId === 'favorites' ? 100 : 0,
    sourceApiId: item.openLibraryKey
  })
}));

const mockedSearch = vi.mocked(searchOpenLibrary);

const DUNE_RESULT: SearchResultItem = {
  id: 'ol-dune',
  title: 'Dune',
  author: 'Frank Herbert',
  coverUrl: null,
  isbn10: '0441172717',
  isbn13: '9780441172719',
  pageCount: 412,
  publishedDate: '1965',
  genres: ['Science fiction'],
  publisher: 'Ace',
  description: '',
  openLibraryKey: 'OL1234M'
};

function Harness() {
  const { setIsSearchModalOpen } = useApp();
  return (
    <>
      <button type="button" onClick={() => setIsSearchModalOpen(true)}>
        Open search
      </button>
      <SearchModal />
    </>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  seedStorage({ books: [] });
});

describe('SearchModal', () => {
  it('searches the catalog and adds a book to the library', async () => {
    mockedSearch.mockResolvedValue([DUNE_RESULT]);
    const user = userEvent.setup();
    renderInApp(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));
    const input = await screen.findByRole('textbox', { name: 'Search books to add' });
    await user.type(input, 'Dune');

    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument();
    expect(screen.getAllByText(/Frank Herbert/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(await screen.findByText('In Library')).toBeInTheDocument();
  });

  it('debounces the request and passes the trimmed query to the provider', async () => {
    mockedSearch.mockResolvedValue([DUNE_RESULT]);
    const user = userEvent.setup();
    renderInApp(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));
    const input = await screen.findByRole('textbox', { name: 'Search books to add' });
    await user.type(input, 'Dune');

    await waitFor(() => expect(mockedSearch).toHaveBeenCalledTimes(1));
    expect(mockedSearch).toHaveBeenCalledWith('Dune');
  });

  it('shows the provider state when nothing matches', async () => {
    mockedSearch.mockResolvedValue([]);
    const user = userEvent.setup();
    renderInApp(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));
    const input = await screen.findByRole('textbox', { name: 'Search books to add' });
    await user.type(input, 'zzzz');

    expect(
      await screen.findByText(/No books found for that title or author/)
    ).toBeInTheDocument();
  });
});