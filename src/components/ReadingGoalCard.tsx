import React, { useState } from 'react';
import { Target, Trophy, TrendingUp, Edit2, Check, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReadingGoalCard: React.FC = () => {
  const { readingGoal, updateReadingGoal, clearReadingGoal, triggerConfetti } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(readingGoal?.targetCount ?? 24);

  // No goal set — show a CTA to create one
  if (!readingGoal) {
    return (
      <div
        id="reading-goal-card"
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-base text-[var(--color-text-primary)]">
              Set Your Reading Goal
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Pick how many books to read this year
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={500}
            value={newTarget}
            onChange={(e) => setNewTarget(parseInt(e.target.value, 10) || 1)}
            aria-label="Reading goal target"
            className="w-16 px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <button
            onClick={() => updateReadingGoal(newTarget)}
            className="px-3 py-1.5 rounded bg-[var(--color-accent)] text-[var(--color-accent-text)] text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Set Goal
          </button>
        </div>
        <p className="text-[11px] text-[var(--color-text-tertiary)] mt-3">
          Track your pace through the year and celebrate when you finish.
        </p>
      </div>
    );
  }

  const { targetCount, completedCount, year } = readingGoal;

  // Day of year calculation for accurate pace analysis
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysInYear = 365;
  const yearFraction = dayOfYear / daysInYear;
  const expectedPaceBooks = Math.round(targetCount * yearFraction);

  const diff = completedCount - expectedPaceBooks;
  let paceStatus: 'ahead' | 'on_track' | 'behind';
  let paceMessage: string;

  if (completedCount >= targetCount) {
    paceStatus = 'ahead';
    paceMessage = 'Goal completed! Fantastic reading year!';
  } else if (diff >= 2) {
    paceStatus = 'ahead';
    paceMessage = `${diff} books ahead of schedule`;
  } else if (diff <= -2) {
    paceStatus = 'behind';
    paceMessage = `${Math.abs(diff)} books behind schedule`;
  } else {
    paceStatus = 'on_track';
    paceMessage = 'Exactly on track for your goal';
  }

  const percentage = Math.min(100, Math.round((completedCount / targetCount) * 100));

  const handleSave = () => {
    if (newTarget > 0) {
      updateReadingGoal(newTarget);
      setIsEditing(false);
    }
  };

  return (
    <div
      id="reading-goal-card"
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-xs transition-all hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)] flex items-center justify-center">
            {completedCount >= targetCount ? (
              <Trophy className="w-5 h-5 text-[var(--color-rating)] animate-bounce" />
            ) : (
              <Target className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="font-heading font-semibold text-base text-[var(--color-text-primary)]">
              {year} Reading Goal
            </h2>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {completedCount} of {targetCount} books completed
            </p>
          </div>
        </div>

        {/* Edit Button */}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors"
            title="Edit reading goal"
            aria-label="Edit reading goal target"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={500}
              value={newTarget}
              onChange={(e) => setNewTarget(parseInt(e.target.value, 10) || 1)}
              className="w-16 px-2 py-0.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
            />
            <button
              onClick={handleSave}
              className="p-1 bg-[var(--color-accent)] text-[var(--color-accent-text)] rounded hover:bg-[var(--color-accent-hover)] transition-colors"
              title="Save target"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar & Percentage */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="font-medium text-[var(--color-text-secondary)]">Progress</span>
          <span className="font-mono font-semibold text-[var(--color-accent)]">{percentage}%</span>
        </div>
        <div className="w-full bg-[var(--color-bg-tertiary)] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-rating)] h-full transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${year} reading goal: ${percentage}% completed`}
          />
        </div>
      </div>

      {/* Pace Status Badge */}
      <div className="mt-3.5 pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <TrendingUp
            className={`w-3.5 h-3.5 ${
              paceStatus === 'ahead'
                ? 'text-[var(--color-success)]'
                : paceStatus === 'behind'
                ? 'text-[var(--color-warning)]'
                : 'text-[var(--color-accent)]'
            }`}
          />
          <span
            className={`font-medium ${
              paceStatus === 'ahead'
                ? 'text-[var(--color-success)]'
                : paceStatus === 'behind'
                ? 'text-[var(--color-warning)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {paceMessage}
          </span>
        </div>

        {completedCount >= targetCount && (
          <button
            onClick={triggerConfetti}
            className="flex items-center gap-1 text-[11px] text-[var(--color-rating)] font-semibold hover:underline"
          >
            <Sparkles className="w-3 h-3" /> Celebrate
          </button>
        )}
      </div>

      {/* Clear goal control */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-[var(--color-text-tertiary)]">
          {targetCount - completedCount > 0 ? `${targetCount - completedCount} books to go` : 'Goal reached'}
        </span>
        <button
          onClick={() => {
            if (window.confirm('Clear your reading goal? You can set a new one anytime.')) {
              clearReadingGoal();
            }
          }}
          className="text-[11px] text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors"
          title="Remove this reading goal"
        >
          Clear goal
        </button>
      </div>
    </div>
  );
};