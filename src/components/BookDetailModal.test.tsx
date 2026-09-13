// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookDetailModal } from './BookDetailModal';
import { useApp } from '../context/AppContext';
import { seedStorage, renderInApp, makeBook } from '../test/utils';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

function Harness() {
  const { books, setSelectedBook } = useApp();
  return (
    <>
      <button type="button" onClick={() => setSelectedBook(books[0])}>
        Open details
      </button>
      <BookDetailModal />
    </>
  );
}

beforeEach(() => {
  seedStorage({
    books: [makeBook({ pageCount: 300 })]
  });
});

describe('BookDetailModal shelf moves', () => {
  it('moves a book to Currently Reading and logs started', async () => {
    const user = userEvent.setup();
    renderInApp(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open details' }));
    const select = await screen.findByLabelText('Shelf:');
    expect(select).toHaveValue('to-read');

    await user.selectOptions(select, 'currently-reading');
    expect(await screen.findByText('Reading Progress')).toBeInTheDocument();
    expect(screen.queryByText(/Finished:/)).not.toBeInTheDocument();
  });

  it('marks a book as finished when moved to Read', async () => {
    const user = userEvent.setup();
    renderInApp(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open details' }));
    const select = await screen.findByLabelText('Shelf:');

    await user.selectOptions(select, 'read');
    expect(await screen.findByText(/Finished:/)).toBeInTheDocument();
    expect(screen.queryByText('Reading Progress')).not.toBeInTheDocument();
  });

  it('exposes the currently selected rating via aria-pressed', async () => {
    const user = userEvent.setup();
    renderInApp(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Open details' }));
    for (const star of [1, 2, 3, 4, 5]) {
      expect(screen.getByRole('button', { name: `Rate ${star} stars out of 5` })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    }

    await user.click(screen.getByRole('button', { name: 'Rate 4 stars out of 5' }));
    expect(screen.getByRole('button', { name: 'Rate 4 stars out of 5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Rate 3 stars out of 5' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('button', { name: 'Rate 4 stars out of 5' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});