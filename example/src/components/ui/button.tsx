import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-300',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-foreground text-background shadow-[var(--shadow-tight)] hover:opacity-92',
        secondary:
          'border-border bg-foreground/[0.045] text-foreground hover:bg-foreground/[0.08]',
        outline:
          'border-border bg-background/78 text-foreground/84 hover:bg-foreground/[0.05]',
        ghost:
          'border-transparent bg-transparent text-foreground/68 hover:bg-foreground/[0.05] hover:text-foreground',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3.5 text-[0.72rem]',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot='button'
      className={cn(buttonVariants({ variant, size }), className)}
      type={type}
      {...props}
    />
  );
}

export { buttonVariants };
