import React, { useState } from 'react';
import { Clock, Plus, CheckCircle2, Star, Target, Bookmark, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityEvent } from '../types';

export const ActivityTimeline: React.FC = () => {
  const { activities, books, setSelectedBook } = useApp();
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = activities.filter((act) => {
    if (filterType === 'all') return true;
    return act.type === filterType;
  });

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'added':
        return <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'started':
        return <Bookmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'progress':
        return <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />;
      case 'finished':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'rated':
        return <Star className="w-3.5 h-3.5 text-[var(--color-rating)] fill-[var(--color-rating)]" />;
      case 'goal_updated':
        return <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Bookmark className="w-3.5 h-3.5 text-[var(--color-accent)]" />;
    }
  };

  const formatTimestamp = (iso: string) => {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diffSeconds = Math.round((now - then) / 1000);

    if (diffSeconds < 60) return 'just now';
    const minutes = Math.floor(diffSeconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  };

  return (
    <div id="activity-timeline-view" className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
            Reading Activity Timeline
          </h1>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            A chronological memory of your reading progress, additions, and ratings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
          >
            <option value="all">All Events</option>
            <option value="started">Started Reading</option>
            <option value="progress">Progress Updates</option>
            <option value="finished">Finished Books</option>
            <option value="rated">Ratings</option>
            <option value="goal_updated">Goal Updates</option>
            <option value="added">New Additions</option>
          </select>
        </div>
      </div>

      {/* Timeline entries */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border)]">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--color-text-tertiary)]">
            No activity recorded for this filter yet.
          </div>
        ) : (
          filtered.map((act) => {
            const matchingBook = act.bookTitle ? books.find((b) => b.title === act.bookTitle) : null;

            return (
              <div key={act.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-[27px] top-1 w-6 h-6 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] flex items-center justify-center shadow-2xs group-hover:border-[var(--color-accent)] transition-colors">
                  {getEventIcon(act.type)}
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-xs hover:border-[var(--color-accent)]/50 transition-colors">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)] mb-1">
                    <span className="capitalize font-medium text-[var(--color-text-secondary)]">
                      {act.type.replace('_', ' ')}
                    </span>
                    <span
                          title={new Date(act.timestamp).toLocaleString()}
                        >
                          {formatTimestamp(act.timestamp)}
                        </span>
                  </div>

                  {act.bookTitle && (
                    <h2
                      onClick={() => matchingBook && setSelectedBook(matchingBook)}
                      className={`font-heading font-semibold text-sm text-[var(--color-text-primary)] ${
                        matchingBook ? 'cursor-pointer hover:text-[var(--color-accent)] underline-offset-2' : ''
                      }`}
                    >
                      {act.bookTitle}
                    </h2>
                  )}

                  {act.details && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      {act.details}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
