import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Moon, Sun, Eye, Menu, BookOpen, LogOut, Sparkles, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    theme,
    setTheme,
    setIsSearchModalOpen,
    setIsLibrarySearchOpen,
    setIsA11yModalOpen,
    setIsAuthModalOpen,
    user,
    logout
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Clean 2-way toggle between Light and Dark mode
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Derive user initials (e.g. Maria Santos -> MS)
  const getUserInitials = () => {
    if (!user?.name) return 'MS';
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[var(--color-bg-primary)]/85 backdrop-blur-md border-b border-[var(--color-border)] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
      {/* Skip to Content Link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 z-50 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-text)] text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* Left side: Mobile hamburger & Brand / Add Book */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 sm:p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] flex-shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand indicator for mobile */}
        <div className="md:hidden flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-text)] flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-base text-[var(--color-text-primary)]">
            Bookshelf
          </span>
        </div>

        {/* Add Book CTA (visible on desktop where space is ample) */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-text)] text-xs font-semibold transition-colors shadow-2xs flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Book</span>
        </button>
      </div>

      {/* Right Controls: Search + Theme + Tools + User Avatar (MS) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Mobile Search Button (compact icon) */}
        <button
          type="button"
          onClick={() => setIsLibrarySearchOpen(true)}
          className="sm:hidden p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors"
          aria-label="Search books in library"
          title="Search library"
        >
          <Search className="w-4 h-4 text-[var(--color-text-secondary)]" />
        </button>

        {/* Desktop Search books input trigger */}
        <button
          type="button"
          onClick={() => setIsLibrarySearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-all shadow-2xs sm:w-48 md:w-60 justify-between"
          aria-label="Search books in library"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] flex-shrink-0" />
            <span className="truncate">Search books...</span>
          </span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] font-mono text-[10px] text-[var(--color-text-tertiary)]">
            ⌘K
          </kbd>
        </button>

        {/* Accessibility Modal Trigger */}
        <button
          onClick={() => setIsA11yModalOpen(true)}
          className="hidden xs:inline-flex p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors"
          title="Accessibility preferences"
          aria-label="Accessibility preferences"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Theme Toggle (Light / Dark 2-state toggle) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors flex-shrink-0"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--color-text-secondary)]" />
          )}
        </button>

        {/* User Avatar Circle with initials (MS) and dropdown */}
        <div className="relative flex-shrink-0" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-text)] font-semibold text-xs flex items-center justify-center hover:opacity-90 transition-opacity shadow-xs focus:ring-2 focus:ring-[var(--color-accent)]/40 select-none cursor-pointer"
            title={user?.name ? `${user.name} (${user.email || 'Local session'})` : 'Account menu'}
            aria-label={`${getUserInitials()} — User account menu`}
            aria-expanded={isUserMenuOpen}
          >
            {getUserInitials()}
          </button>

          {/* User Profile Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg py-2 z-50">
              <div className="px-3.5 py-2 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-text)] flex items-center justify-center font-bold text-xs">
                    {getUserInitials()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                      {user?.name || 'Maria Santos'}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">
                      {user?.email || 'Local Reading Session'}
                    </p>
                  </div>
                </div>
                {user?.isGuest && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                    <Sparkles className="w-3 h-3" /> Guest reader session
                  </span>
                )}
              </div>

              <div className="p-1 space-y-0.5">
                {user?.isGuest && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] transition-colors"
                  >
                    Sync / Create Account
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
