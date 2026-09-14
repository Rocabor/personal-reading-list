import React, { useState } from 'react';
import { BookOpen, Sparkles, Compass, ShieldCheck, ArrowRight, Star, TrendingUp, Layers, CheckCircle, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookCover } from './BookCover';
import { RAW_SAMPLE_BOOKS } from '../data/sampleBooksData';

export const LandingPage: React.FC = () => {
  const { loginAsGuest, setIsAuthModalOpen } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const previewBooks = RAW_SAMPLE_BOOKS.slice(0, 7);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div id="landing-page" className="min-h-screen flex flex-col justify-between bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Top Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-[var(--color-text-primary)]">
            Bookshelf
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={loginAsGuest}
            className="px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Try as Guest
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent-hover)] transition-all shadow-xs"
          >
            Sign Up
          </button>
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {menuOpen && (
        <nav aria-label="Primary" className="md:hidden w-full max-w-7xl mx-auto px-6 pb-5 flex flex-col gap-2.5 border-b border-[var(--color-border)]">
          <button
            onClick={() => {
              closeMenu();
              loginAsGuest();
            }}
            className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Try as Guest
          </button>
          <button
            onClick={() => {
              closeMenu();
              setIsAuthModalOpen(true);
            }}
            className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent-hover)] transition-all shadow-xs"
          >
            Sign Up
          </button>
        </nav>
      )}

      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto px-6 pt-12 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-xs font-semibold mb-6 border border-[var(--color-border-subtle)]">
          <Sparkles className="w-3.5 h-3.5" /> A thoughtful space for true readers
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl font-bold leading-tight tracking-tight text-[var(--color-text-primary)] max-w-3xl">
          Your reading life, beautifully organized.
        </h1>

        <p className="mt-5 text-base sm:text-lg text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
          No social feeds, no unsolicited reviews, no algorithms. Just your curated shelves, intuitive progress tracking, and meaningful reading insights.
        </p>

        {/* Dual Primary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <button
            onClick={loginAsGuest}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-text)] font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:scale-102"
          >
            Try as Guest <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-semibold text-sm transition-all shadow-xs"
          >
            Create an Account
          </button>
        </div>

        <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
          Guest mode comes pre-loaded with 45 curated books and complete reading analytics.
        </p>

        {/* Visual Book Shelf Display Showcase */}
        <div className="mt-16 w-full max-w-4xl relative">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-serif italic text-[var(--color-text-tertiary)]">
                Featured on Bookshelf
              </span>
            </div>

            {/* Row of Covers */}
            <div className="flex items-end justify-center gap-3 sm:gap-5 overflow-x-auto py-4">
              {previewBooks.map((b, idx) => (
                <div
                  key={idx}
                  className="transform hover:-translate-y-2 transition-transform duration-300"
                >
                  <BookCover
                    title={b.title}
                    author={b.author}
                    coverUrl={b.coverUrl}
                    size="md"
                    instantFallback
                  />
                </div>
              ))}
            </div>

            {/* Wooden shelf footer visual bar */}
            <div className="w-full h-3.5 bg-gradient-to-r from-[#8B5A2B] via-[#A06D3B] to-[#7B4E26] rounded-md shadow-md mt-2 border-t border-amber-900/30" />
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">
              Custom Shelves
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              Curate default shelves like "Currently Reading" or build bespoke collections for book clubs, favorite authors, and lent-out books.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">
              Reading Goals & Pace
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              Set annual reading targets with realistic pace feedback that accounts for day of year without high-pressure guilt.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">
              Year in Review & Cards
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              Reflect on monthly reading rhythms, genre diversity, and download elegant summary cards tailored for sharing.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-16 w-full max-w-5xl flex flex-col items-center border-t-2 border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
        <p>
          <span className="font-heading font-bold text-[var(--color-text-primary)]">Bookshelf</span>{" "}
          — your reading life, beautifully organized.
        </p>

        <nav aria-label="Attribution credits" className="mt-2">
          <p className="flex flex-wrap items-center justify-center gap-1 text-xs font-medium">
            <span>Challenge by</span>
            <a
              href="https://frontendmentor.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline underline-offset-2 text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-accent)]"
            >
              Frontend Mentor
            </a>
            <span>• Coded by</span>
            <a
              href="https://frontendmentor.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline underline-offset-2 text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-accent)]"
            >
              @Rocabor
            </a>
            <span className="font-bold text-[var(--color-text-primary)]">
              &copy;{new Date().getFullYear()}
            </span>
          </p>
        </nav>
      </footer>
    </div>
  );
};
