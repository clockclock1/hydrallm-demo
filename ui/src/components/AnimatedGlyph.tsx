import { cn } from '../utils/cn';

export type AnimatedGlyphVariant =
  | 'activity'
  | 'refresh'
  | 'threads'
  | 'chains'
  | 'release'
  | 'lab'
  | 'stats'
  | 'memory'
  | 'overview'
  | 'load'
  | 'save'
  | 'logout';

export default function AnimatedGlyph({
  variant,
  className,
}: {
  variant: AnimatedGlyphVariant;
  className?: string;
}) {
  if (variant === 'refresh' || variant === 'load') {
    return (
      <span className={cn('live-animated-icon relative inline-flex h-4 w-4 shrink-0 items-center justify-center', className)} aria-hidden="true">
        <span className="live-glyph-spin absolute h-4 w-4 rounded-full border-2 border-current border-l-transparent opacity-90" />
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      </span>
    );
  }

  if (variant === 'chains' || variant === 'stats') {
    return (
      <span className={cn('live-animated-icon relative inline-flex h-4 w-4 shrink-0', className)} aria-hidden="true">
        <span className="live-glyph-pulse absolute left-[3px] top-[3px] h-1.5 w-1.5 rounded-full bg-current" />
        <span className="live-glyph-pulse live-glyph-delay absolute bottom-[3px] right-[3px] h-1.5 w-1.5 rounded-full bg-current" />
        <span className="absolute left-[6px] top-[7px] h-0.5 w-3 rotate-45 rounded-full bg-current opacity-70" />
      </span>
    );
  }

  if (variant === 'memory') {
    return (
      <span className={cn('live-animated-icon relative inline-flex h-4 w-4 shrink-0 items-center justify-center', className)} aria-hidden="true">
        <span className="absolute bottom-[2px] left-[2px] h-2.5 w-1.5 rounded-sm bg-current opacity-60" />
        <span className="live-glyph-pulse absolute bottom-[2px] left-[7px] h-3.5 w-1.5 rounded-sm bg-current" />
        <span className="live-glyph-pulse live-glyph-delay absolute bottom-[2px] right-[2px] h-2 w-1.5 rounded-sm bg-current opacity-80" />
      </span>
    );
  }

  if (variant === 'release' || variant === 'logout') {
    return (
      <span className={cn('live-animated-icon relative inline-flex h-4 w-4 shrink-0 items-center justify-center', className)} aria-hidden="true">
        <span className="live-glyph-spin absolute h-4 w-4 rounded-full border-2 border-current border-b-transparent border-r-transparent opacity-80" />
        <span className="h-2 w-2 rounded-full border-2 border-current opacity-80" />
      </span>
    );
  }

  if (variant === 'save') {
    return (
      <span className={cn('live-animated-icon relative inline-flex h-4 w-4 shrink-0 items-center justify-center', className)} aria-hidden="true">
        <span className="absolute h-4 w-4 rounded-md border-2 border-current opacity-70" />
        <span className="live-glyph-pulse h-2 w-1.5 rounded-sm bg-current" />
      </span>
    );
  }

  if (variant === 'lab') {
    return (
      <span className={cn('live-animated-icon relative inline-flex h-4 w-4 shrink-0 items-center justify-center', className)} aria-hidden="true">
        <span className="live-glyph-ping absolute h-3.5 w-3.5 rounded-full border border-current opacity-40" />
        <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
        <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      </span>
    );
  }

  return (
    <span className={cn('live-animated-icon relative inline-flex h-4 w-4 shrink-0 items-center justify-center', className)} aria-hidden="true">
      <span className="live-glyph-ping absolute h-4 w-4 rounded-full border border-current opacity-50" />
      <span className="h-2.5 w-2.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
    </span>
  );
}
