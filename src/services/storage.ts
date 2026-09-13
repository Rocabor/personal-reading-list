import { Book, Shelf, ReadingGoal, ActivityEvent, UserProfile, AccessibilitySettings } from '../types';
import { DEFAULT_SHELVES, getCuratedInitialBooks } from '../data/sampleBooksData';

const CURRENT_USER_KEY = 'bookshelf_current_user';
const USERS_REGISTRY_KEY = 'bookshelf_registered_users';
const THEME_KEY = 'bookshelf_theme_preference';
const A11Y_KEY = 'bookshelf_a11y_settings';

export const GUEST_USER: UserProfile = {
  id: 'guest_user',
  name: 'Maria Santos',
  email: 'maria.santos@bookshelf.local',
  isGuest: true
};

export const DEFAULT_GOAL: ReadingGoal = {
  year: 2026,
  targetCount: 24,
  completedCount: 15
};

export const DEFAULT_A11Y: AccessibilitySettings = {
  fontSize: 'normal',
  lineHeight: 'normal',
  reducedMotion: false,
  highContrast: false,
  dyslexicFont: false
};

function getUserStorageKey(userId: string, itemKey: string): string {
  return `bookshelf_${userId}_${itemKey}`;
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to set current user', e);
  }
}

export function getThemePreference(): 'light' | 'dark' | 'system' {
  try {
    return (localStorage.getItem(THEME_KEY) as any) || 'system';
  } catch {
    return 'system';
  }
}

export function setThemePreference(theme: 'light' | 'dark' | 'system'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

export function getA11ySettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(A11Y_KEY);
    return raw ? { ...DEFAULT_A11Y, ...JSON.parse(raw) } : DEFAULT_A11Y;
  } catch {
    return DEFAULT_A11Y;
  }
}

export function saveA11ySettings(settings: AccessibilitySettings): void {
  try {
    localStorage.setItem(A11Y_KEY, JSON.stringify(settings));
  } catch {}
}

export function getStoredShelves(userId: string): Shelf[] {
  try {
    const key = getUserStorageKey(userId, 'shelves');
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    return DEFAULT_SHELVES;
  } catch {
    return DEFAULT_SHELVES;
  }
}

export function saveStoredShelves(userId: string, shelves: Shelf[]): void {
  try {
    const key = getUserStorageKey(userId, 'shelves');
    localStorage.setItem(key, JSON.stringify(shelves));
  } catch {}
}

export function getStoredBooks(userId: string, isGuest: boolean = false): Book[] {
  try {
    const key = getUserStorageKey(userId, 'books');
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    // If guest or newly initialized, populate with the 45 curated sample books
    const initial = getCuratedInitialBooks();
    saveStoredBooks(userId, initial);
    return initial;
  } catch {
    return getCuratedInitialBooks();
  }
}

export function saveStoredBooks(userId: string, books: Book[]): void {
  try {
    const key = getUserStorageKey(userId, 'books');
    localStorage.setItem(key, JSON.stringify(books));
  } catch {}
}

export function getStoredGoal(userId: string): ReadingGoal {
  try {
    const key = getUserStorageKey(userId, 'goal');
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    return DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
}

export function saveStoredGoal(userId: string, goal: ReadingGoal): void {
  try {
    const key = getUserStorageKey(userId, 'goal');
    localStorage.setItem(key, JSON.stringify(goal));
  } catch {}
}

export function getStoredActivities(userId: string): ActivityEvent[] {
  try {
    const key = getUserStorageKey(userId, 'activities');
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    // Initial activity logs for realistic guest history
    const initialActivities: ActivityEvent[] = [
      {
        id: 'act-1',
        type: 'finished',
        bookTitle: 'The Great Gatsby',
        timestamp: '2026-02-14T18:30:00Z',
        details: 'Finished reading and rated 5 stars'
      },
      {
        id: 'act-2',
        type: 'progress',
        bookTitle: 'Circe',
        timestamp: '2026-09-10T14:20:00Z',
        details: 'Updated progress to page 210 of 393 (53%)'
      },
      {
        id: 'act-3',
        type: 'started',
        bookTitle: 'The Name of the Wind',
        timestamp: '2026-09-01T09:15:00Z',
        details: 'Moved to Currently Reading'
      },
      {
        id: 'act-4',
        type: 'rated',
        bookTitle: 'Designing Data-Intensive Applications',
        timestamp: '2026-08-15T21:00:00Z',
        details: 'Rated 5 stars: "Dense, thorough, brilliant."'
      },
      {
        id: 'act-5',
        type: 'added',
        bookTitle: 'Say Nothing',
        timestamp: '2026-07-20T11:05:00Z',
        details: 'Added to Want to Read'
      }
    ];
    saveStoredActivities(userId, initialActivities);
    return initialActivities;
  } catch {
    return [];
  }
}

export function saveStoredActivities(userId: string, activities: ActivityEvent[]): void {
  try {
    const key = getUserStorageKey(userId, 'activities');
    localStorage.setItem(key, JSON.stringify(activities));
  } catch {}
}
