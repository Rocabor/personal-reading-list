// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchModal } from './SearchModal';
import { useApp } from '../context/AppContext';
import { seedStorage, renderInApp } from '../test/utils';
import { SearchResultItem, searchOpenLibrary } from '../services/openLibrary';

vi.mock('../services/openLibrary', async (importOriginal) => {
  const original = await importOriginal<typeof import('../services/openLibrary')>();
  return {
    ...original,
    searchOpenLibrary: vi.fn()
  };
});

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

afterEach(() => {
  vi.useRealTimers();
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
    vi.useFakeTimers();
    mockedSearch.mockResolvedValue([DUNE_RESULT]);
    renderInApp(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: 'Open search' }));
    const input = screen.getByRole('textbox', { name: 'Search books to add' });
    fireEvent.change(input, { target: { value: '  Dune  ' } });

    expect(mockedSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(449);
    expect(mockedSearch).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(mockedSearch).toHaveBeenCalledTimes(1);
    expect(mockedSearch).toHaveBeenCalledWith('Dune');
  });

  it('shows an alert with the provider error when the request fails', async () => {
    mockedSearch.mockRejectedValue(new Error('unexpected network failure'));
    const user = userEvent.setup();
    renderInApp(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open search' }));
    const input = await screen.findByRole('textbox', { name: 'Search books to add' });
    await user.type(input, 'Dune');

    expect(await screen.findByRole('alert')).toHaveTextContent('unexpected network failure');
    expect(screen.queryByRole('heading', { name: 'Dune' })).not.toBeInTheDocument();
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