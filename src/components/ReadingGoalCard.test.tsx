// @vitest-environment jsdom
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReadingGoalCard } from './ReadingGoalCard';
import { seedStorage, renderInApp, makeBook } from '../test/utils';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

beforeEach(() => {
  seedStorage({ books: [] });
});

describe('ReadingGoalCard', () => {
  it('creates a reading goal when none exists', async () => {
    seedStorage({ books: [], goal: null });
    const user = userEvent.setup();
    renderInApp(<ReadingGoalCard />);

    expect(screen.getByText('Set Your Reading Goal')).toBeInTheDocument();

    const input = screen.getByRole('spinbutton', { name: 'Reading goal target' });
    fireEvent.change(input, { target: { value: '12' } });
    await user.click(screen.getByRole('button', { name: 'Set Goal' }));

    expect(await screen.findByText('0 of 12 books completed')).toBeInTheDocument();
  });

  it('edits an existing reading goal target', async () => {
    seedStorage({ books: [], goal: { year: 2026, targetCount: 24, completedCount: 0 } });
    const user = userEvent.setup();
    renderInApp(<ReadingGoalCard />);

    expect(screen.getByText('2026 Reading Goal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit reading goal target' }));
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '30' } });
    await user.click(screen.getByRole('button', { name: 'Save target' }));

    expect(await screen.findByText('0 of 30 books completed')).toBeInTheDocument();
  });

  it('clears an existing goal and returns to the setup prompt', async () => {
    seedStorage({ books: [], goal: { year: 2026, targetCount: 24, completedCount: 0 } });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderInApp(<ReadingGoalCard />);

    await user.click(screen.getByTitle('Remove this reading goal'));

    expect(await screen.findByText('Set Your Reading Goal')).toBeInTheDocument();
    expect(localStorage.getItem('bookshelf_guest_user_goal')).toBe('null');

    confirmSpy.mockRestore();
  });

  it('keeps the goal when the user cancels the clear confirmation', async () => {
    seedStorage({ books: [], goal: { year: 2026, targetCount: 24, completedCount: 0 } });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    renderInApp(<ReadingGoalCard />);

    await user.click(screen.getByTitle('Remove this reading goal'));

    expect(screen.getByText('2026 Reading Goal')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('bookshelf_guest_user_goal') || 'null')).not.toBeNull();

    confirmSpy.mockRestore();
  });

  it('counts books finished in the goal year toward completion on load', async () => {
    seedStorage({
      books: [
        makeBook({ shelfId: 'read', dateRead: '2026-05-01', percentage: 100 }),
        makeBook({ id: 'book-2', shelfId: 'read', dateRead: '2025-03-12', percentage: 100 }),
        makeBook({ id: 'book-3', shelfId: 'to-read', dateRead: null })
      ],
      goal: { year: 2026, targetCount: 24, completedCount: 0 }
    });
    renderInApp(<ReadingGoalCard />);

    expect(await screen.findByText('1 of 24 books completed')).toBeInTheDocument();

    const storedGoal = JSON.parse(localStorage.getItem('bookshelf_guest_user_goal') || 'null');
    expect(storedGoal.completedCount).toBe(1);
  });
});