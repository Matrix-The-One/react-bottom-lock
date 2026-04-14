import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      data-slot='card'
      className={cn(
        'rounded-[32px] border border-border/80 bg-card/88 text-card-foreground backdrop-blur-2xl',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot='card-header'
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  style,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot='card-title'
      className={cn(
        'text-[1.65rem] font-semibold tracking-[-0.04em] text-card-foreground',
        className,
      )}
      style={{ fontFamily: 'var(--font-display)', ...style }}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot='card-description'
      className={cn('text-sm leading-6 text-muted-foreground/92', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot='card-content'
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
}
