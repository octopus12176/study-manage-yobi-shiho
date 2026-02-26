import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card rounded-[14px] border border-border bg-card p-[22px] transition-all hover:shadow-[0_2px_16px_rgba(0,0,0,0.03)]',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn('text-sm font-bold', className)} {...props} />
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => <p ref={ref} className={cn('text-xs text-sub', className)} {...props} />);
CardDescription.displayName = 'CardDescription';

export { Card, CardTitle, CardDescription };
