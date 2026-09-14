// @vitest-environment jsdom
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReadingProgressBar } from './ReadingProgressBar';
import { useApp } from '../context/AppContext';
import { seedStorage, renderInApp, makeBook } from '../test/utils';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

function ProgressHarness() {
  const { books } = useApp();
  return <ReadingProgressBar book={books[0]} />;
}

beforeEach(() => {
  seedStorage({
    books: [makeBook({ shelfId: 'currently-reading', pageCount: 400, currentPage: 10, percentage: 3 })]
  });
});

describe('ReadingProgressBar', () => {
  it('adds pages quickly and shows the updated percentage', async () => {
    const user = userEvent.setup();
    renderInApp(<ProgressHarness />);

    await user.click(screen.getByRole('button', { name: '+25' }));

    const progressbar = await screen.findByRole('progressbar', { name: /Reading progress/ });
    expect(progressbar).toHaveAttribute('aria-valuenow', '9');
    expect(screen.getByRole('button', { name: 'Page 35 of 400' })).toBeInTheDocument();
  });

  it('saves a manually entered page number', async () => {
    const user = userEvent.setup();
    renderInApp(<ProgressHarness />);

    await user.click(screen.getByRole('button', { name: 'Page 10 of 400' }));
    const input = screen.getByLabelText('Current Page');
    await user.clear(input);
    await user.type(input, '200');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const progressbar = await screen.findByRole('progressbar', { name: /Reading progress/ });
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByRole('button', { name: 'Page 200 of 400' })).toBeInTheDocument();
  });

  it('finishes a book at 100% and moves it to Read', async () => {
    const user = userEvent.setup();
    renderInApp(<ProgressHarness />);

    await user.click(screen.getByRole('button', { name: 'Page 10 of 400' }));
    const input = screen.getByLabelText('Current Page');
    await user.clear(input);
    await user.type(input, '400');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const progressbar = await screen.findByRole('progressbar', { name: /Reading progress/ });
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps progress above the page count and still finishes the book', async () => {
    const user = userEvent.setup();
    renderInApp(<ProgressHarness />);

    await user.click(screen.getByRole('button', { name: 'Page 10 of 400' }));
    const input = screen.getByLabelText('Current Page');
    await user.clear(input);
    await user.type(input, '1000');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    const progressbar = await screen.findByRole('progressbar', { name: /Reading progress/ });
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });

  it('persists the finished book to storage and counts it toward the annual goal', async () => {
    seedStorage({
      books: [makeBook({ shelfId: 'currently-reading', pageCount: 400, currentPage: 10, percentage: 3 })],
      goal: { year: 2026, targetCount: 24, completedCount: 0 }
    });
    const user = userEvent.setup();
    renderInApp(<ProgressHarness />);

    await user.click(screen.getByRole('button', { name: 'Page 10 of 400' }));
    const input = screen.getByLabelText('Current Page');
    await user.clear(input);
    await user.type(input, '400');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await screen.findByRole('progressbar', { name: /Reading progress/ });

    const storedBooks = JSON.parse(localStorage.getItem('bookshelf_guest_user_books') || '[]');
    expect(storedBooks[0]).toMatchObject({ shelfId: 'read', percentage: 100, currentPage: 400 });
    expect(storedBooks[0].dateRead).toBeTruthy();

    const storedGoal = JSON.parse(localStorage.getItem('bookshelf_guest_user_goal') || 'null');
    expect(storedGoal).not.toBeNull();
    expect(storedGoal.completedCount).toBe(1);
  });
});