import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LayoutDashboard, Grid, CheckCircle, Loader2 } from 'lucide-react';

const LandingPage = lazy(() => import('./components/LandingPage').then((m) => ({ default: m.LandingPage })));
const LibraryOverview = lazy(() => import('./components/LibraryOverview').then((m) => ({ default: m.LibraryOverview })));
const ShelfView = lazy(() => import('./components/ShelfView').then((m) => ({ default: m.ShelfView })));
const YearInReview = lazy(() => import('./components/YearInReview').then((m) => ({ default: m.YearInReview })));
const ActivityTimeline = lazy(() => import('./components/ActivityTimeline').then((m) => ({ default: m.ActivityTimeline })));
const BookDetailModal = lazy(() => import('./components/BookDetailModal').then((m) => ({ default: m.BookDetailModal })));
const SearchModal = lazy(() => import('./components/SearchModal').then((m) => ({ default: m.SearchModal })));
const LibrarySearchModal = lazy(() => import('./components/LibrarySearchModal').then((m) => ({ default: m.LibrarySearchModal })));
const GoodreadsImportModal = lazy(() => import('./components/GoodreadsImportModal').then((m) => ({ default: m.GoodreadsImportModal })));
const ReadingCardExportModal = lazy(() => import('./components/ReadingCardExportModal').then((m) => ({ default: m.ReadingCardExportModal })));
const AccessibilitySettingsModal = lazy(() => import('./components/AccessibilitySettingsModal').then((m) => ({ default: m.AccessibilitySettingsModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));

const ViewFallback: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="w-6 h-6 text-[var(--color-accent)] animate-spin" />
  </div>
);

const MainLayout: React.FC = () => {
  const {
    user,
    activeView,
    activeShelfId,
    selectedBook,
    toastMessage,
    isLibrarySearchOpen,
    setIsLibrarySearchOpen,
    setSelectedBook,
    isSearchModalOpen,
    setIsSearchModalOpen,
    isGoodreadsModalOpen,
    setIsGoodreadsModalOpen,
    isExportCardModalOpen,
    setIsExportCardModalOpen,
    isA11yModalOpen,
    setIsA11yModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [librarySubTab, setLibrarySubTab] = useState<'overview' | 'grid'>('overview');

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input / textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Cmd+K or Ctrl+K or / to search library
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsLibrarySearchOpen(true);
      } else if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsLibrarySearchOpen(true);
      } else if (e.key === 'Escape') {
        setSelectedBook(null);
        setIsSearchModalOpen(false);
        setIsLibrarySearchOpen(false);
        setIsGoodreadsModalOpen(false);
        setIsExportCardModalOpen(false);
        setIsA11yModalOpen(false);
        setIsAuthModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setIsLibrarySearchOpen,
    setSelectedBook,
    setIsSearchModalOpen,
    setIsGoodreadsModalOpen,
    setIsExportCardModalOpen,
    setIsA11yModalOpen,
    setIsAuthModalOpen
  ]);

  if (!user) {
    return (
      <>
        <Suspense fallback={<ViewFallback />}>
          <LandingPage />
        </Suspense>
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
      </>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-xs flex"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="w-64 h-full bg-[var(--color-bg-secondary)] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        <main id="main-content" className="flex-1 overflow-y-auto px-3.5 sm:px-6 md:px-8 py-4 sm:py-6">
          <Suspense fallback={<ViewFallback />}>
            <div className="max-w-7xl mx-auto">
            {activeView === 'year-in-review' && <YearInReview />}

            {activeView === 'activity' && <ActivityTimeline />}

            {activeView === 'library' && (
              <div className="space-y-6">
                {/* Segment tab toggle for "All Library Books" view */}
                {activeShelfId === 'all' && (
                  <div className="pb-1 border-b border-[var(--color-border-subtle)]">
                    <div className="inline-flex w-full sm:w-auto p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <button
                        onClick={() => setLibrarySubTab('overview')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                          librarySubTab === 'overview'
                            ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-2xs'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Overview & Shelves</span>
                      </button>
                      <button
                        onClick={() => setLibrarySubTab('grid')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                          librarySubTab === 'grid'
                            ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-2xs'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
                      >
                        <Grid className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>All Books Grid</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-view rendering */}
                {activeShelfId === 'all' ? (
                  librarySubTab === 'overview' ? (
                    <LibraryOverview />
                  ) : (
                    <ShelfView />
                  )
                ) : (
                  <ShelfView />
                )}
              </div>
            )}
            </div>
          </Suspense>
        </main>
      </div>

      {/* Global Modals — lazily loaded when first opened */}
      <Suspense fallback={null}>
        {selectedBook && <BookDetailModal />}
        {isSearchModalOpen && <SearchModal />}
        {isLibrarySearchOpen && <LibrarySearchModal />}
        {isGoodreadsModalOpen && <GoodreadsImportModal />}
        {isExportCardModalOpen && <ReadingCardExportModal />}
        {isA11yModalOpen && <AccessibilitySettingsModal />}
        {isAuthModalOpen && <AuthModal />}
      </Suspense>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 animate-slideUp"
        >
          <div className="px-4 py-3 rounded-2xl bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-xl flex items-center gap-2.5 text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
