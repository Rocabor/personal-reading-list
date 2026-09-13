import React, { useRef } from 'react';
import { X, Eye, Type, Sliders, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

export const AccessibilitySettingsModal: React.FC = () => {
  const { isA11yModalOpen, setIsA11yModalOpen, a11ySettings, updateA11ySettings } = useApp();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isA11yModalOpen);

  if (!isA11yModalOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs"
      onClick={() => setIsA11yModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="a11y-modal-panel"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[var(--color-accent)]" />
            <h2 id="a11y-modal-title" className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">
              Accessibility Settings
            </h2>
          </div>
          <button
            onClick={() => setIsA11yModalOpen(false)}
            className="p-1 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            aria-label="Close accessibility options"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5 text-sm">
          {/* Reduced motion */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">Reduce Motion</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Disable 3D tilt effects and animated transitions
              </p>
            </div>
            <input
              type="checkbox"
              id="reduced-motion-checkbox"
              checked={a11ySettings.reducedMotion}
              onChange={(e) => updateA11ySettings({ reducedMotion: e.target.checked })}
              className="w-5 h-5 accent-[var(--color-accent)] cursor-pointer"
            />
          </div>

          {/* High contrast */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">High Contrast</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Increase text and border contrast for maximum legibility
              </p>
            </div>
            <input
              type="checkbox"
              id="high-contrast-checkbox"
              checked={a11ySettings.highContrast}
              onChange={(e) => updateA11ySettings({ highContrast: e.target.checked })}
              className="w-5 h-5 accent-[var(--color-accent)] cursor-pointer"
            />
          </div>

          {/* Font scale */}
          <div>
            <p className="font-medium text-[var(--color-text-primary)] mb-1">Text Size</p>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'larger'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updateA11ySettings({ fontSize: size })}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-colors ${
                    a11ySettings.fontSize === size
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Line spacing */}
          <div>
            <p className="font-medium text-[var(--color-text-primary)] mb-1">Line Spacing</p>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'relaxed', 'loose'] as const).map((lh) => (
                <button
                  key={lh}
                  type="button"
                  onClick={() => updateA11ySettings({ lineHeight: lh })}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-colors ${
                    a11ySettings.lineHeight === lh
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {lh}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--color-border)] flex justify-end">
          <button
            onClick={() => setIsA11yModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent-hover)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
