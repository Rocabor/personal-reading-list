// @vitest-environment jsdom
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReadingGoalCard } from './ReadingGoalCard';
import { seedStorage, renderInApp } from '../test/utils';

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
});