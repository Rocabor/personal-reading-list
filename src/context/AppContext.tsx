import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Book, Shelf, ReadingGoal, ActivityEvent, UserProfile, AccessibilitySettings, ShelfId } from '../types';
import {
  getCurrentUser,
  setCurrentUser,
  GUEST_USER,
  getStoredShelves,
  saveStoredShelves,
  getStoredBooks,
  saveStoredBooks,
  getStoredGoal,
  saveStoredGoal,
  getStoredActivities,
  saveStoredActivities,
  getThemePreference,
  setThemePreference,
  getA11ySettings,
  saveA11ySettings
} from '../services/storage';

interface AppContextType {
  user: UserProfile | null;
  loginAsGuest: () => void;
  loginUser: (email: string, name?: string) => void;
  logout: () => void;
  books: Book[];
  shelves: Shelf[];
  activeShelfId: ShelfId | 'all';
  setActiveShelfId: (id: ShelfId | 'all') => void;
  activeView: 'library' | 'year-in-review' | 'activity' | 'landing';
  setActiveView: (view: 'library' | 'year-in-review' | 'activity' | 'landing') => void;
  readingGoal: ReadingGoal | null;
  updateReadingGoal: (target: number) => void;
  clearReadingGoal: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  a11ySettings: AccessibilitySettings;
  updateA11ySettings: (settings: Partial<AccessibilitySettings>) => void;
  activities: ActivityEvent[];
  addBook: (book: Book) => void;
  bulkImportBooks: (books: Book[]) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  removeBook: (id: string) => void;
  moveBookToShelf: (bookId: string, targetShelfId: string) => void;
  updateReadingProgress: (bookId: string, currentPage: number, totalPages?: number) => void;
  createShelf: (name: string) => void;
  renameShelf: (id: string, newName: string) => void;
  deleteShelf: (id: string) => void;
  moveShelf: (shelfId: string, direction: 'up' | 'down') => void;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  isLibrarySearchOpen: boolean;
  setIsLibrarySearchOpen: (open: boolean) => void;
  isGoodreadsModalOpen: boolean;
  setIsGoodreadsModalOpen: (open: boolean) => void;
  isA11yModalOpen: boolean;
  setIsA11yModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isExportCardModalOpen: boolean;
  setIsExportCardModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  triggerConfetti: () => void;
  bulkSelectedIds: string[];
  setBulkSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  bulkMoveShelves: (targetShelfId: string) => void;
  bulkDeleteBooks: () => void;
  bulkAddGenre: (genre: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(() => getCurrentUser() || GUEST_USER);
  const [activeView, setActiveView] = useState<'library' | 'year-in-review' | 'activity' | 'landing'>('library');
  const [activeShelfId, setActiveShelfId] = useState<ShelfId | 'all'>('currently-reading');

  const userId = user?.id || 'guest_user';

  const [shelves, setShelves] = useState<Shelf[]>(() => getStoredShelves(userId));
  const [books, setBooks] = useState<Book[]>(() => getStoredBooks(userId, user?.isGuest ?? true));
  const [readingGoal, setReadingGoal] = useState<ReadingGoal | null>(() => getStoredGoal(userId));
  const [activities, setActivities] = useState<ActivityEvent[]>(() => getStoredActivities(userId));
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => getThemePreference());
  const [a11ySettings, setA11ySettingsState] = useState<AccessibilitySettings>(() => getA11ySettings());

  // Modals & UI state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLibrarySearchOpen, setIsLibrarySearchOpen] = useState(false);
  const [isGoodreadsModalOpen, setIsGoodreadsModalOpen] = useState(false);
  const [isA11yModalOpen, setIsA11yModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isExportCardModalOpen, setIsExportCardModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const isDarkSystem = mediaQuery.matches;
      const shouldBeDark = theme === 'dark' || (theme === 'system' && isDarkSystem);

      if (shouldBeDark) {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    };

    updateTheme();

    if (theme === 'system') {
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  // Apply Accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    if (a11ySettings.reducedMotion) {
      root.classList.add('motion-reduce');
    } else {
      root.classList.remove('motion-reduce');
    }

    if (a11ySettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (a11ySettings.dyslexicFont) {
      root.classList.add('font-dyslexic');
    } else {
      root.classList.remove('font-dyslexic');
    }

    root.classList.remove('a11y-font-large', 'a11y-font-larger');
    if (a11ySettings.fontSize === 'large') root.classList.add('a11y-font-large');
    else if (a11ySettings.fontSize === 'larger') root.classList.add('a11y-font-larger');

    root.classList.remove('a11y-line-relaxed', 'a11y-line-loose');
    if (a11ySettings.lineHeight === 'relaxed') root.classList.add('a11y-line-relaxed');
    else if (a11ySettings.lineHeight === 'loose') root.classList.add('a11y-line-loose');
  }, [a11ySettings]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3800);
  }, []);

  const triggerConfetti = useCallback(() => {
    // Dynamically load the confetti lib so it stays out of the main bundle
    import('canvas-confetti')
      .then(({ default: confetti }) => {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#A8612B', '#D4A03E', '#3D7C4F', '#2C2420']
        });
      })
      .catch(() => {});
  }, []);

  const logActivity = useCallback((type: ActivityEvent['type'], bookTitle?: string, details?: string) => {
    const newAct: ActivityEvent = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      bookTitle,
      timestamp: new Date().toISOString(),
      details
    };
    setActivities((prev) => {
      const updated = [newAct, ...prev];
      saveStoredActivities(userId, updated);
      return updated;
    });
  }, [userId]);

  const loginAsGuest = useCallback(() => {
    setCurrentUser(GUEST_USER);
    setUserState(GUEST_USER);
    const gBooks = getStoredBooks('guest_user', true);
    setBooks(gBooks);
    setShelves(getStoredShelves('guest_user'));
    setReadingGoal(getStoredGoal('guest_user'));
    setActivities(getStoredActivities('guest_user'));
    setActiveView('library');
    showToast('Entered guest mode with 45 curated books pre-loaded!');
  }, [showToast]);

  const loginUser = useCallback((email: string, name?: string) => {
    const newUser: UserProfile = {
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      name: name || email.split('@')[0],
      isGuest: false
    };
    setCurrentUser(newUser);
    setUserState(newUser);
    const uBooks = getStoredBooks(newUser.id, false);
    setBooks(uBooks);
    setShelves(getStoredShelves(newUser.id));
    setReadingGoal(getStoredGoal(newUser.id));
    setActivities(getStoredActivities(newUser.id));
    setActiveView('library');
    showToast(`Welcome back, ${newUser.name}!`);
  }, [showToast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setUserState(null);
    setActiveView('landing');
    showToast('Signed out successfully.');
  }, [showToast]);

  const updateGoalCalculations = useCallback((currentBooks: Book[], currentGoal: ReadingGoal | null) => {
    if (!currentGoal) return;
    const currentYearStr = currentGoal.year.toString();
    // Only count books actually read (finished) during the goal year
    const completedThisYear = currentBooks.filter(b =>
      b.dateRead && b.dateRead.startsWith(currentYearStr)
    ).length;

    if (completedThisYear !== currentGoal.completedCount) {
      const updated = { ...currentGoal, completedCount: completedThisYear };
      setReadingGoal(updated);
      saveStoredGoal(userId, updated);
    }
  }, [userId]);

  // Sync the goal's completed count against the library on load and after every data change
  useEffect(() => {
    updateGoalCalculations(books, readingGoal);
  }, [books, readingGoal, updateGoalCalculations]);

  const addBook = useCallback((book: Book) => {
    setBooks(prev => {
      const updated = [book, ...prev];
      saveStoredBooks(userId, updated);
      updateGoalCalculations(updated, readingGoal);
      return updated;
    });
    logActivity('added', book.title, `Added to "${book.shelfId}" shelf`);
    showToast(`"${book.title}" added to your library!`);
  }, [userId, logActivity, showToast, readingGoal, updateGoalCalculations]);

  const bulkImportBooks = useCallback((incoming: Book[]) => {
    if (incoming.length === 0) return;
    setBooks(prev => {
      const updated = [...incoming, ...prev];
      saveStoredBooks(userId, updated);
      updateGoalCalculations(updated, readingGoal);
      return updated;
    });
  }, [userId, readingGoal, updateGoalCalculations]);

  const updateBook = useCallback((id: string, updates: Partial<Book>) => {
    setBooks(prev => {
      const book = prev.find(b => b.id === id);
      const updated = prev.map(b => (b.id === id ? { ...b, ...updates } : b));
      saveStoredBooks(userId, updated);
      updateGoalCalculations(updated, readingGoal);

      // Log a 'rated' activity whenever the user changes a book's rating
      if (book && 'rating' in updates && updates.rating !== undefined && ((book as Book)?.rating ?? null) !== updates.rating) {
        logActivity(
          'rated',
          book.title,
          updates.rating ? `Rated ${updates.rating} out of 5 stars` : 'Removed rating'
        );
      }
      return updated;
    });
    if (selectedBook && selectedBook.id === id) {
      setSelectedBook(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [userId, selectedBook, readingGoal, updateGoalCalculations, logActivity]);

  const removeBook = useCallback((id: string) => {
    setBooks(prev => {
      const target = prev.find(b => b.id === id);
      const updated = prev.filter(b => b.id !== id);
      saveStoredBooks(userId, updated);
      updateGoalCalculations(updated, readingGoal);
      if (target) {
        showToast(`Removed "${target.title}" from library.`);
      }
      return updated;
    });
    if (selectedBook && selectedBook.id === id) {
      setSelectedBook(null);
    }
  }, [userId, selectedBook, readingGoal, updateGoalCalculations, showToast]);

  const moveBookToShelf = useCallback((bookId: string, targetShelfId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const wasRead = book.shelfId === 'read' || book.shelfId === 'favorites';
    const isNowRead = targetShelfId === 'read' || targetShelfId === 'favorites';

    const updates: Partial<Book> = {
      shelfId: targetShelfId
    };

    if (isNowRead && !wasRead) {
      updates.dateRead = new Date().toISOString().slice(0, 10);
      updates.percentage = 100;
      if (book.pageCount) updates.currentPage = book.pageCount;
      updates.readCount = (book.readCount || 0) + 1;
      triggerConfetti();
      logActivity('finished', book.title, 'Marked as completed!');
      showToast(`Congratulations on finishing "${book.title}"!`);
    } else if (targetShelfId === 'currently-reading' && book.shelfId !== 'currently-reading') {
      if (!book.currentPage) updates.currentPage = 1;
      updates.percentage = book.pageCount ? Math.round((1 / book.pageCount) * 100) : 5;
      logActivity('started', book.title, 'Started reading');
      showToast(`Started reading "${book.title}"`);
    }

    const updated = books.map(b => (b.id === bookId ? { ...b, ...updates } : b));
    setBooks(updated);
    saveStoredBooks(userId, updated);
    updateGoalCalculations(updated, readingGoal);

    // Keep the open detail modal in sync with the new shelf state
    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook(prev => (prev ? { ...prev, ...updates } : null));
    }
  }, [books, userId, selectedBook, triggerConfetti, logActivity, showToast, readingGoal, updateGoalCalculations]);

  const updateReadingProgress = useCallback((bookId: string, currentPage: number, totalPages?: number) => {
    // Compute percentage once so both the books state and the open modal stay in sync
    const bookSnapshot = books.find(b => b.id === bookId);
    const pagesTotal = totalPages ?? bookSnapshot?.pageCount ?? null;
    let percentage = 0;
    if (pagesTotal && pagesTotal > 0) {
      percentage = Math.min(100, Math.max(0, Math.round((currentPage / pagesTotal) * 100)));
    } else {
      percentage = Math.min(100, Math.max(0, currentPage)); // fallback percentage
    }

    setBooks(prev => {
      const book = prev.find(b => b.id === bookId);
      if (!book) return prev;

      const updates: Partial<Book> = {
        currentPage,
        percentage,
        lastProgressUpdate: new Date().toISOString()
      };

      if (percentage >= 100) {
        updates.shelfId = 'read';
        updates.dateRead = new Date().toISOString().slice(0, 10);
        updates.readCount = (book.readCount || 0) + 1;
        triggerConfetti();
        logActivity('finished', book.title, `Finished reading! 100% of ${pagesTotal || 'book'} pages completed.`);
        showToast(`Hooray! You finished "${book.title}"!`);
      } else {
        logActivity('progress', book.title, `Progress updated: page ${currentPage} (${percentage}%)`);
        showToast(`Updated progress for "${book.title}": ${percentage}%`);
      }

      const updated = prev.map(b => (b.id === bookId ? { ...b, ...updates } : b));
      saveStoredBooks(userId, updated);
      updateGoalCalculations(updated, readingGoal);
      return updated;
    });

    // Keep the open detail modal in sync with the latest progress
    if (selectedBook && selectedBook.id === bookId) {
      setSelectedBook(prev => {
        if (!prev) return null;
        const updated: Book = { ...prev };
        if (percentage >= 100) {
          updated.shelfId = 'read';
          updated.dateRead = new Date().toISOString().slice(0, 10);
          updated.readCount = (prev.readCount || 0) + 1;
        }
        updated.currentPage = currentPage;
        updated.percentage = percentage;
        updated.lastProgressUpdate = new Date().toISOString();
        return updated;
      });
    }
  }, [userId, books, triggerConfetti, logActivity, showToast, readingGoal, updateGoalCalculations, selectedBook]);

  const createShelf = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newShelf: Shelf = {
      id: `shelf_${Date.now()}`,
      name: trimmed,
      isDefault: false,
      position: shelves.length
    };
    const updated = [...shelves, newShelf];
    setShelves(updated);
    saveStoredShelves(userId, updated);
    showToast(`Created custom shelf "${trimmed}"`);
  }, [shelves, userId, showToast]);

  const renameShelf = useCallback((id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const updated = shelves.map(s => (s.id === id && !s.isDefault ? { ...s, name: trimmed } : s));
    setShelves(updated);
    saveStoredShelves(userId, updated);
    showToast(`Shelf renamed to "${trimmed}"`);
  }, [shelves, userId, showToast]);

  const deleteShelf = useCallback((id: string) => {
    const shelfToDelete = shelves.find(s => s.id === id);
    if (!shelfToDelete || shelfToDelete.isDefault) {
      showToast('Default shelves cannot be deleted.');
      return;
    }
    // Reassign books on this shelf to 'to-read'
    setBooks(prev => {
      const updatedBooks = prev.map(b => (b.shelfId === id ? { ...b, shelfId: 'to-read' } : b));
      saveStoredBooks(userId, updatedBooks);
      return updatedBooks;
    });
    const updatedShelves = shelves.filter(s => s.id !== id);
    setShelves(updatedShelves);
    saveStoredShelves(userId, updatedShelves);
    if (activeShelfId === id) {
      setActiveShelfId('all');
    }
    showToast(`Deleted shelf "${shelfToDelete.name}". Its books were moved to "Want to Read".`);
  }, [shelves, userId, activeShelfId, showToast]);

  const updateReadingGoal = useCallback((target: number) => {
    const currentYearStr = (readingGoal?.year ?? new Date().getFullYear()).toString();
    // Only count books actually read (finished) during the goal year
    const completedThisYear = books.filter(b =>
      b.dateRead && b.dateRead.startsWith(currentYearStr)
    ).length;
    const updated: ReadingGoal = {
      year: readingGoal?.year ?? new Date().getFullYear(),
      targetCount: target,
      completedCount: completedThisYear
    };
    setReadingGoal(updated);
    saveStoredGoal(userId, updated);
    logActivity('goal_updated', undefined, `Updated ${updated.year} goal to ${target} books`);
    showToast(`Updated annual reading goal to ${target} books!`);
    if (updated.completedCount >= updated.targetCount) {
      triggerConfetti();
    }
  }, [readingGoal, books, userId, logActivity, showToast, triggerConfetti]);

  const clearReadingGoal = useCallback(() => {
    setReadingGoal(null);
    saveStoredGoal(userId, null);
    logActivity('goal_updated', undefined, 'Reading goal cleared');
    showToast('Reading goal cleared. Set a new one anytime.');
  }, [userId, logActivity, showToast]);

  const moveShelf = useCallback((shelfId: string, direction: 'up' | 'down') => {
    setShelves(prev => {
      const idx = prev.findIndex(s => s.id === shelfId);
      if (idx < 0) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      const withPositions = next.map((s, i) => ({ ...s, position: i }));
      saveStoredShelves(userId, withPositions);
      return withPositions;
    });
  }, [userId]);

  const setTheme = useCallback((t: 'light' | 'dark' | 'system') => {
    setThemeState(t);
    setThemePreference(t);
  }, []);

  const updateA11ySettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setA11ySettingsState(prev => {
      const next = { ...prev, ...updates };
      saveA11ySettings(next);
      return next;
    });
  }, []);

  // Bulk actions
  const bulkMoveShelves = useCallback((targetShelfId: string) => {
    if (bulkSelectedIds.length === 0) return;
    setBooks(prev => {
      const updated = prev.map(b => (bulkSelectedIds.includes(b.id) ? { ...b, shelfId: targetShelfId } : b));
      saveStoredBooks(userId, updated);
      updateGoalCalculations(updated, readingGoal);
      return updated;
    });
    showToast(`Moved ${bulkSelectedIds.length} books to chosen shelf.`);
    setBulkSelectedIds([]);
  }, [bulkSelectedIds, userId, readingGoal, updateGoalCalculations, showToast]);

  const bulkDeleteBooks = useCallback((() => {
    if (bulkSelectedIds.length === 0) return;
    setBooks(prev => {
      const updated = prev.filter(b => !bulkSelectedIds.includes(b.id));
      saveStoredBooks(userId, updated);
      updateGoalCalculations(updated, readingGoal);
      return updated;
    });
    showToast(`Deleted ${bulkSelectedIds.length} books from your library.`);
    setBulkSelectedIds([]);
  }), [bulkSelectedIds, userId, readingGoal, updateGoalCalculations, showToast]);

  const bulkAddGenre = useCallback((genre: string) => {
    const trimmed = genre.trim();
    if (!trimmed || bulkSelectedIds.length === 0) return;
    setBooks(prev => {
      const updated = prev.map(b => {
        if (bulkSelectedIds.includes(b.id)) {
          const currentGenres = b.genres || [];
          if (!currentGenres.includes(trimmed)) {
            return { ...b, genres: [...currentGenres, trimmed] };
          }
        }
        return b;
      });
      saveStoredBooks(userId, updated);
      return updated;
    });
    showToast(`Added genre "${trimmed}" to ${bulkSelectedIds.length} books.`);
    setBulkSelectedIds([]);
  }, [bulkSelectedIds, userId, showToast]);

  // Global keyboard shortcut: Cmd/Ctrl + K opens internal library search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsLibrarySearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setIsLibrarySearchOpen(false);
        setIsGoodreadsModalOpen(false);
        setIsA11yModalOpen(false);
        setIsAuthModalOpen(false);
        setIsExportCardModalOpen(false);
        setSelectedBook(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        loginAsGuest,
        loginUser,
        logout,
        books,
        shelves,
        activeShelfId,
        setActiveShelfId,
        activeView,
        setActiveView,
        readingGoal,
        updateReadingGoal,
        clearReadingGoal,
        theme,
        setTheme,
        a11ySettings,
        updateA11ySettings,
        activities,
        addBook,
        bulkImportBooks,
        updateBook,
        removeBook,
        moveBookToShelf,
        updateReadingProgress,
        createShelf,
        renameShelf,
        deleteShelf,
        moveShelf,
        selectedBook,
        setSelectedBook,
        isSearchModalOpen,
        setIsSearchModalOpen,
        isLibrarySearchOpen,
        setIsLibrarySearchOpen,
        isGoodreadsModalOpen,
        setIsGoodreadsModalOpen,
        isA11yModalOpen,
        setIsA11yModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isExportCardModalOpen,
        setIsExportCardModalOpen,
        toastMessage,
        showToast,
        triggerConfetti,
        bulkSelectedIds,
        setBulkSelectedIds,
        bulkMoveShelves,
        bulkDeleteBooks,
        bulkAddGenre
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
