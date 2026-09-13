import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BookCoverProps {
  title: string;
  author: string;
  coverUrl?: string | null;
  percentage?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  coverUrl,
  percentage,
  showProgress = false,
  size = 'md',
  className = '',
  onClick
}) => {
  const [imageError, setImageError] = useState(false);
  const { a11ySettings } = useApp();

  const sizeClasses = {
    sm: 'w-16 h-24 text-[10px]',
    md: 'w-28 h-42 sm:w-32 sm:h-48 text-xs',
    lg: 'w-40 h-60 sm:w-48 sm:h-72 text-sm',
    xl: 'w-52 h-78 sm:w-60 sm:h-90 text-base'
  };

  const hasValidImage = coverUrl && !imageError;

  return (
    <motion.div
      whileHover={
        !a11ySettings.reducedMotion
          ? {
              scale: 1.03,
              rotateY: -6,
              rotateX: 4,
              boxShadow: '0 16px 28px -6px rgba(44, 36, 32, 0.28), 0 6px 12px -3px rgba(44, 36, 32, 0.15)'
            }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      style={{ perspective: 1000 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-sm overflow-hidden flex-shrink-0 transition-shadow select-none ${sizeClasses[size]} ${className}`}
      id={`cover-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      {/* Book spine depth shadow effect */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/25 via-white/10 to-transparent pointer-events-none z-10" />

      {hasValidImage ? (
        <img
          src={coverUrl}
          alt={`Cover of ${title} by ${author}`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-sm shadow-[var(--shadow-book)]"
        />
      ) : (
        /* Literary typography fallback cover */
        <div
          role="img"
          aria-label={`Cover placeholder for ${title} by ${author}`}
          className="w-full h-full bg-gradient-to-br from-[#F5EFE6] via-[#ECE3D4] to-[#DDD2C0] dark:from-[#2B231D] dark:via-[#241C17] dark:to-[#1B1512] border border-[var(--color-border)] p-2.5 flex flex-col justify-between text-[var(--color-text-primary)] shadow-[var(--shadow-book)] rounded-sm"
        >
          <div className="border border-[var(--color-border-subtle)]/70 h-full p-2 flex flex-col justify-between">
            <div>
              <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)] mb-1 opacity-75" />
              <p className="font-heading font-semibold leading-tight line-clamp-3 text-[var(--color-text-primary)]">
                {title}
              </p>
            </div>
            <div className="mt-1 border-t border-[var(--color-border-subtle)] pt-1">
              <p className="text-[var(--color-text-secondary)] font-medium text-[11px] line-clamp-2">
                {author}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress badge overlay */}
      {showProgress && percentage !== undefined && percentage > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/65 backdrop-blur-xs p-1 px-1.5 flex items-center justify-between text-[10px] text-white z-20">
          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mr-1.5">
            <div
              className="bg-[var(--color-accent)] h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="font-mono text-[10px] font-semibold">{percentage}%</span>
        </div>
      )}
    </motion.div>
  );
};
