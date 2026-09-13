import React, { useRef, useState } from 'react';
import { X, Download, Share2, Sparkles, Check, BookOpen, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReadingCardExportModal: React.FC = () => {
  const { isExportCardModalOpen, setIsExportCardModalOpen, books, readingGoal, user, showToast } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!isExportCardModalOpen) return null;

  const readBooks = books.filter(b => b.shelfId === 'read' || b.shelfId === 'favorites');
  const totalPages = readBooks.reduce((acc, b) => acc + (b.pageCount || 280), 0);
  const topFiveStars = readBooks.filter(b => b.rating === 5).slice(0, 3);

  const handleDownload = () => {
    if (!cardRef.current) return;
    // Create an image snapshot via HTML5 Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1080;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#2C2420');
    gradient.addColorStop(0.5, '#3A2E28');
    gradient.addColorStop(1, '#1A1512');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative borders
    ctx.strokeStyle = 'rgba(212, 150, 74, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1000, 1000);

    // Header typography
    ctx.fillStyle = '#D4964A';
    ctx.font = 'bold 36px serif';
    ctx.fillText('BOOKSHELF • 2026 READING REPORT', 80, 130);

    ctx.fillStyle = '#FAF8F5';
    ctx.font = 'bold 64px serif';
    ctx.fillText(user?.name ? `${user.name}'s Reading Year` : 'My Reading Year', 80, 220);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 260);
    ctx.lineTo(1000, 260);
    ctx.stroke();

    // Stats Grid
    ctx.fillStyle = '#EDE8E2';
    ctx.font = '28px sans-serif';
    ctx.fillText('BOOKS COMPLETED', 100, 340);
    ctx.fillStyle = '#D4964A';
    ctx.font = 'bold 84px serif';
    ctx.fillText(String(readBooks.length), 100, 430);

    ctx.fillStyle = '#EDE8E2';
    ctx.font = '28px sans-serif';
    ctx.fillText('PAGES DEVOURING', 560, 340);
    ctx.fillStyle = '#FAF8F5';
    ctx.font = 'bold 84px serif';
    ctx.fillText(totalPages.toLocaleString(), 560, 430);

    // Goal status
    ctx.fillStyle = '#EDE8E2';
    ctx.font = '28px sans-serif';
    ctx.fillText('ANNUAL GOAL PROGRESS', 100, 550);
    ctx.fillStyle = '#5AAF6E';
    ctx.font = 'bold 54px serif';
    ctx.fillText(`${readingGoal.completedCount} / ${readingGoal.targetCount} Books (${Math.round((readingGoal.completedCount / readingGoal.targetCount) * 100)}%)`, 100, 620);

    // Top Reads section
    ctx.fillStyle = '#D4A03E';
    ctx.font = 'bold 32px serif';
    ctx.fillText('★ Top 5-Star Highlights', 100, 730);

    let yOffset = 800;
    topFiveStars.forEach((b) => {
      ctx.fillStyle = '#FAF8F5';
      ctx.font = 'bold 30px serif';
      ctx.fillText(`• ${b.title}`, 120, yOffset);
      ctx.fillStyle = '#A89E94';
      ctx.font = '24px sans-serif';
      ctx.fillText(`  by ${b.author}`, 140, yOffset + 35);
      yOffset += 75;
    });

    // Watermark
    ctx.fillStyle = '#7A716A';
    ctx.font = '22px sans-serif';
    ctx.fillText('Crafted with Bookshelf — Your reading life, beautifully organized.', 80, 1000);

    // Trigger download
    const link = document.createElement('a');
    link.download = `bookshelf-2026-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Downloaded reading card image!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    showToast('Reading report link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reading-card-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={() => setIsExportCardModalOpen(false)}
    >
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="reading-card-export-panel"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-rating)]" />
            <h2 id="reading-card-title" className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">
              Shareable Reading Card
            </h2>
          </div>
          <button
            onClick={() => setIsExportCardModalOpen(false)}
            className="p-1.5 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
            aria-label="Close export card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Card Preview */}
        <div
          ref={cardRef}
          className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#2C2420] via-[#3A2E28] to-[#1A1512] text-[#FAF8F5] border border-white/15 shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">
            <span>Bookshelf • 2026</span>
            <span>Reading Wrap</span>
          </div>

          <h3 className="font-heading text-2xl font-bold text-white mb-4">
            {user?.name ? `${user.name}'s Reading Year` : 'My Reading Year'}
          </h3>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/10 my-4">
            <div>
              <span className="text-[11px] text-stone-400 block uppercase">Books Finished</span>
              <span className="font-heading text-3xl font-bold text-amber-400">
                {readBooks.length}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block uppercase">Pages Read</span>
              <span className="font-heading text-3xl font-bold text-white">
                {totalPages.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-xs space-y-1.5 my-3">
            <span className="text-[11px] font-semibold text-amber-300 block uppercase tracking-wider">
              ★ Top Highlights
            </span>
            {topFiveStars.map((b) => (
              <p key={b.id} className="truncate text-stone-200">
                • <strong className="font-heading text-white">{b.title}</strong> by {b.author}
              </p>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400">
            <span>Goal: {readingGoal.completedCount}/{readingGoal.targetCount} Completed</span>
            <span className="text-amber-400/80 font-mono">bookshelf.app</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1.5"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            {isCopied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" /> Download Image
          </button>
        </div>
      </div>
    </div>
  );
};
