import { useEffect, useRef } from 'react';

/**
 * Gives the view's primary heading a real focus target (tabindex="-1") and
 * moves focus to it whenever the view changes, so keyboard and screen reader
 * users are taken to the new content and know navigation completed.
 */
export function useViewHeadingFocus<T extends HTMLElement>(deps: ReadonlyArray<unknown>) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const heading = ref.current;
    if (heading && !heading.hasAttribute('tabindex')) {
      heading.tabIndex = -1;
    }
    if (heading) {
      const active = document.activeElement as HTMLElement | null;
      const activeDialog = active?.closest?.('[role="dialog"]') ?? null;
      if (!activeDialog) {
        heading.focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}