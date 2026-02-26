import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card card-soft rounded-[14px] border border-border bg-card p-[22px] transition-all hover:-translate-y-[1px] hover:shadow-[0_18px_38px_rgba(57,52,128,0.14)]',
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
