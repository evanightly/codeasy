'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

import { ny } from '@/Lib/Utils';

const Progress = React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={ny('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
        {...props}
    >
        <ProgressPrimitive.Indicator
            style={{ transform: `translateX(-${100 - (props.value || 0)}%)` }}
            className='size-full flex-1 bg-primary transition-all'
        />
    </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
