import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseGoodreadsCsv } from '../services/goodreadsParser';
import { SAMPLE_GOODREADS_CSV } from '../data/sampleGoodreadsCsv';
import { GoodreadsImportResult } from '../types';

export const GoodreadsImportModal: React.FC = () => {
  const { isGoodreadsModalOpen, setIsGoodreadsModalOpen, books, addBook, showToast, triggerConfetti } = useApp();
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<GoodreadsImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isGoodreadsModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      const res = parseGoodreadsCsv(text, books);
      setParsedResult(res);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCsv = () => {
    setFileName('sample-books.csv (Goodreads format)');
    setCsvContent(SAMPLE_GOODREADS_CSV);
    const res = parseGoodreadsCsv(SAMPLE_GOODREADS_CSV, books);
    setParsedResult(res);
  };

  const handleConfirmImport = () => {
    if (!parsedResult || parsedResult.books.length === 0) return;
    setIsProcessing(true);

    // Batch add all new parsed books
    parsedResult.books.forEach((book) => {
      addBook(book);
    });

    setIsProcessing(false);
    triggerConfetti();
    showToast(`Successfully imported ${parsedResult.books.length} books from Goodreads!`);
    setIsGoodreadsModalOpen(false);
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

            {/* Book Preview Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-semibold text-sm text-[var(--color-text-primary)]">
                  Books to be added ({parsedResult.books.length})
                </h3>
                <button
                  onClick={() => {
                    setParsedResult(null);
                    setFileName('');
                  }}
                  className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] underline"
                >
                  Choose different file
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
                {parsedResult.books.slice(0, 15).map((book, idx) => (
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
                        {book.shelfId}
                      </span>
                    </div>
                  </div>
                ))}
                {parsedResult.books.length > 15 && (
                  <div className="p-2 text-center text-xs text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)]">
                    + {parsedResult.books.length - 15} more books will be imported
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-tertiary)]">
                File: <span className="font-medium">{fileName}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setParsedResult(null);
                    setFileName('');
                  }}
                  className="px-3.5 py-2 text-xs font-medium rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={parsedResult.books.length === 0 || isProcessing}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessing ? (
                    'Importing...'
                  ) : (
                    <>
                      Import {parsedResult.books.length} Books <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
