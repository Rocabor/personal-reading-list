// @vitest-environment jsdom
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { YearInReview } from './YearInReview';
import { seedStorage, renderInApp, makeBook } from '../test/utils';

const books2026 = [
  makeBook({
    id: 'a',
    title: 'Dune',
    author: 'Frank Herbert',
    shelfId: 'read',
    dateRead: '2026-03-10',
    dateAdded: '2026-01-01',
    rating: 5,
    pageCount: 412,
    genres: ['Sci-Fi']
  }),
  makeBook({
    id: 'b',
    title: 'Circe',
    author: 'Madeline Miller',
    shelfId: 'read',
    dateRead: '2026-07-04',
    rating: 4,
    pageCount: 393,
    genres: ['Fantasy']
  }),
  makeBook({
    id: 'c',
    title: 'Atomic Habits',
    author: 'James Clear',
    shelfId: 'favorites',
    dateRead: '2026-05-20',
    rating: 5,
    pageCount: 320,
    genres: ['Self-Help']
  })
];

const olderBook = makeBook({
  id: 'd',
  title: 'Brave New World',
  author: 'Aldous Huxley',
  shelfId: 'read',
  dateRead: '2025-01-10',
  rating: 4,
  pageCount: 268,
  genres: ['Dystopian']
});

beforeEach(() => {
  seedStorage({ books: [...books2026, olderBook] });
});

describe('YearInReview', () => {
  it('renders insights for the current year with finished books only', async () => {
    renderInApp(<YearInReview />);

    expect(
      await screen.findByRole('heading', { name: '2026 Year in Review' })
    ).toBeInTheDocument();
    expect(screen.getByText('Books Finished')).toBeInTheDocument();
    expect(screen.getByText('Across 3 distinct genres')).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument();
    expect(screen.getByText('2 books awarded 5 stars')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Longest Book Read\s*Dune/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Shortest Book Read\s*Atomic Habits/ })).toBeInTheDocument();
  });

  it('switches between review years and filters strictly by dateRead', async () => {
    const user = userEvent.setup();
    renderInApp(<YearInReview />);

    const yearSelect = screen.getByRole('combobox', { name: 'Select review year' });
    await user.selectOptions(yearSelect, '2025');

    expect(
      await screen.findByRole('heading', { name: '2025 Year in Review' })
    ).toBeInTheDocument();
    expect(screen.getByText('Across 1 distinct genres')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
    expect(screen.queryByText(/Dune/)).not.toBeInTheDocument();
  });
});