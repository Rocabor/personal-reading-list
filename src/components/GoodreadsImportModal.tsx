import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseGoodreadsCsv } from '../services/goodreadsParser';
import { SAMPLE_GOODREADS_CSV } from '../data/sampleGoodreadsCsv';
import { GoodreadsImportResult, Book } from '../types';

const IMPORT_CHUNK_SIZE = 10;

export const GoodreadsImportModal: React.FC = () => {
  const {
    isGoodreadsModalOpen,
    setIsGoodreadsModalOpen,
    books,
    shelves,
    bulkImportBooks,
    showToast,
    triggerConfetti
  } = useApp();
  const [fileName, setFileName] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<GoodreadsImportResult | null>(null);
  const [shelfOverrides, setShelfOverrides] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!isGoodreadsModalOpen) {
      setParsedResult(null);
      setFileName('');
      setShelfOverrides({});
      setIsImporting(false);
      setImportProgress(0);
    }
  }, [isGoodreadsModalOpen]);

  if (!isGoodreadsModalOpen) return null;

  const rememberMapping = (resul: GoodreadsImportResult) => {
    const overrides: Record<string, string> = {};
    resul.shelves.forEach((s) => {
      overrides[s.goodreadsShelf] = 'to-read';
    });
    setShelfOverrides(overrides);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = parseGoodreadsCsv(text, books);
      setParsedResult(res);
      rememberMapping(res);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCsv = () => {
    setFileName('sample-books.csv (Goodreads format)');
    const res = parseGoodreadsCsv(SAMPLE_GOODREADS_CSV, books);
    setParsedResult(res);
    rememberMapping(res);
  };

  const effectiveShelfId = (book: Book): string => {
    if (!parsedResult) return book.shelfId;
    for (const src of parsedResult.shelves) {
      if (src.bookIds.includes(book.id)) {
        const mapped = shelfOverrides[src.goodreadsShelf];
        if (mapped) return mapped;
      }
    }
    return book.shelfId;
  };

  const resetToUpload = () => {
    if (isImporting) return;
    setParsedResult(null);
    setFileName('');
    setShelfOverrides({});
  };

  const handleConfirmImport = () => {
    if (!parsedResult || parsedResult.books.length === 0 || isImporting) return;

    // Apply the chosen custom-shelf mapping
    const overrideById: Record<string, string> = {};
    parsedResult.shelves.forEach((src) => {
      const target = shelfOverrides[src.goodreadsShelf];
      if (!target) return;
      src.bookIds.forEach((bid) => {
        overrideById[bid] = target;
      });
    });
    const finalBooks: Book[] = parsedResult.books.map((b) =>
      overrideById[b.id] ? { ...b, shelfId: overrideById[b.id] } : b
    );

    setImportProgress(0);
    setIsImporting(true);
    cancelledRef.current = false;

    let index = 0;
    const nextChunk = () => {
      if (cancelledRef.current) {
        setIsImporting(false);
        showToast(`Import cancelled — ${index} of ${finalBooks.length} books were added.`);
        return;
      }
      const batch = finalBooks.slice(index, index + IMPORT_CHUNK_SIZE);
      if (batch.length > 0) {
        bulkImportBooks(batch);
      }
      index += batch.length;
      setImportProgress(
        finalBooks.length === 0 ? 100 : Math.min(100, Math.round((index / finalBooks.length) * 100))
      );

      if (index < finalBooks.length) {
        requestAnimationFrame(nextChunk);
      } else {
        setIsImporting(false);
        setParsedResult(null);
        setFileName('');
        setShelfOverrides({});
        triggerConfetti();
        showToast(`Successfully imported ${finalBooks.length} books from Goodreads!`);
        setIsGoodreadsModalOpen(false);
      }
    };
    requestAnimationFrame(nextChunk);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="goodreads-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={() => setIsGoodreadsModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        id="goodreads-modal-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold text-base">
              g
            </div>
            <div>
              <h2 id="goodreads-modal-title" className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">
                Import from Goodreads
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Bring your reading shelves, ratings, and reviews seamlessly into Bookshelf
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGoodreadsModalOpen(false)}
            className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-bg-secondary)]"
            aria-label="Close import dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Box & Sample Action */}
        {!parsedResult ? (
          <div className="mt-6 space-y-4">
            <label
              htmlFor="csv-file-input"
              className="border-2 border-dashed border-[var(--color-border)] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-secondary)]/60 transition-all text-center"
            >
              <Upload className="w-10 h-10 text-[var(--color-accent)] mb-3 opacity-80" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Choose your Goodreads CSV file or drag it here
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1 max-w-md">
                Exported from Goodreads (My Books → Import/Export → Export Library). Supports wrapped ISBNs, custom shelves, reviews, and reading history.
              </p>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <Sparkles className="w-4 h-4 text-[var(--color-rating)]" />
                <span>Want to test the parser immediately without downloading your export?</span>
              </div>
              <button
                onClick={handleLoadSampleCsv}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-bg-tertiary)] transition-colors shadow-2xs whitespace-nowrap"
              >
                Load Sample 45-Book CSV
              </button>
            </div>
          </div>
        ) : (
          /* Parsed Summary & Preview */
          <div className="mt-6 space-y-5">
            {/* Stats Pills */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="block font-heading font-bold text-xl text-emerald-700 dark:text-emerald-300">
                  {parsedResult.addedCount}
                </span>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium">
                  Ready to Import
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="block font-heading font-bold text-xl text-amber-700 dark:text-amber-300">
                  {parsedResult.duplicateCount}
                </span>
                <span className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                  Duplicates Skipped
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center">
                <span className="block font-heading font-bold text-xl text-[var(--color-text-primary)]">
                  {parsedResult.totalParsed}
                </span>
                <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">
                  Total in File
                </span>
              </div>
            </div>

            {/* Custom shelf mapping */}
            {parsedResult.shelves.length > 0 && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Custom shelf mapping
                  </h3>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">
                    My Goodreads shelves → Bookshelf shelves
                  </span>
                </div>
                <div className="space-y-2">
                  {parsedResult.shelves.map((s) => (
                    <div key={s.goodreadsShelf} className="flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--color-text-primary)] truncate">
                          “{s.goodreadsShelf}”
                        </p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)]">{s.count} books</p>
                      </div>
                      <select
                        value={shelfOverrides[s.goodreadsShelf] ?? 'to-read'}
                        onChange={(e) =>
                          setShelfOverrides((prev) => ({
                            ...prev,
                            [s.goodreadsShelf]: e.target.value
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      >
                        {shelves.map((sh) => (
                          <option key={sh.id} value={sh.id}>
                            {sh.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book Preview Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-semibold text-sm text-[var(--color-text-primary)]">
                  Books to be added ({parsedResult.books.length})
                </h3>
                <button
                  onClick={resetToUpload}
                  className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] underline"
                >
                  Choose different file
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
                {parsedResult.books.slice(0, 15).map((book, idx) => {
                  const mappedId = effectiveShelfId(book);
                  const shelfName = shelves.find((s) => s.id === mappedId)?.name || mappedId;
                  return (
                    <div key={idx} className="p-2.5 px-3.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-3">
                        <p className="font-medium text-[var(--color-text-primary)] truncate">
                          {book.title}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                          {book.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {book.rating && (
                          <span className="text-[11px] text-[var(--color-rating)] font-medium">
                            ★ {book.rating}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-medium">
                          {shelfName}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {parsedResult.books.length > 15 && (
                  <div className="p-2 text-center text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)]">
                    + {parsedResult.books.length - 15} more books will be imported
                  </div>
                )}
              </div>
            </div>

            {/* Import progress */}
            {isImporting && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-[var(--color-text-secondary)]">Importing books…</span>
                  <span className="font-mono font-semibold text-[var(--color-accent)]">{importProgress}%</span>
                </div>
                <div className="w-full bg-[var(--color-border)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--color-accent)] h-full transition-all duration-150 rounded-full"
                    style={{ width: `${importProgress}%` }}
                    role="progressbar"
                    aria-valuenow={importProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-tertiary)]">
                File: <span className="font-medium">{fileName}</span>
              </span>

              <div className="flex items-center gap-2">
                {isImporting ? (
                  <button
                    onClick={() => {
                      cancelledRef.current = true;
                    }}
                    className="px-3.5 py-2 text-xs font-medium rounded-xl border border-[var(--color-error)]/40 text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                  >
                    Cancel Import
                  </button>
                ) : (
                  <>
                    <button
                      onClick={resetToUpload}
                      className="px-3.5 py-2 text-xs font-medium rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      disabled={parsedResult.books.length === 0}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent-hover)] transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                    >
                      Import {parsedResult.books.length} Books <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                {isImporting && (
                  <Loader2 className="w-4 h-4 text-[var(--color-accent)] animate-spin" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};