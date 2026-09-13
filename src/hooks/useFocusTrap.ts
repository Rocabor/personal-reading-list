import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

/**
 * Moves focus inside the dialog when it opens, traps Tab within it,
 * and returns focus to the previously focused element on close.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean) {
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    previouslyFocused.current = document.activeElement;

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const first = focusables()[0];
    if (first && !container.contains(document.activeElement)) {
      first.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      let nextIndex: number;
      if (event.shiftKey) {
        nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
      }
      event.preventDefault();
      items[nextIndex]?.focus();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      const previous = previouslyFocused.current;
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus();
      }
    };
  }, [containerRef, active]);
}