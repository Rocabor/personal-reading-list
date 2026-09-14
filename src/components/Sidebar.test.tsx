// @vitest-environment jsdom
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar } from './Sidebar';
import { seedStorage, renderInApp } from '../test/utils';
import { DEFAULT_SHELVES } from '../data/sampleBooksData';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

beforeEach(() => {
  seedStorage({ books: [] });
});

describe('Sidebar custom shelf management', () => {
  it('creates a custom shelf and persists it to storage', async () => {
    const user = userEvent.setup();
    renderInApp(<Sidebar />);

    await user.click(screen.getByRole('button', { name: 'Add custom shelf' }));
    await user.type(screen.getByRole('textbox', { name: 'New shelf name' }), 'Sci-Fi Classics');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Sci-Fi Classics')).toBeInTheDocument();

    const storedShelves = JSON.parse(localStorage.getItem('bookshelf_guest_user_shelves') || '[]');
    expect(storedShelves.map((s: { name: string }) => s.name)).toContain('Sci-Fi Classics');
    expect(storedShelves.length).toBe(DEFAULT_SHELVES.length + 1);
  });
});