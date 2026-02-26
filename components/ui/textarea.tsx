import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'input min-h-24 w-full rounded-[10px] border-[1.5px] border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-text',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
