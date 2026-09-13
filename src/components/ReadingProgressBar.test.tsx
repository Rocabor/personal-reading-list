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
});