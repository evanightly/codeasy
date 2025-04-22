'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

import { ny } from '@/Lib/Utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    indicatorClassName?: string;
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
    ({ className, indicatorClassName, ...props }, ref) => (
        <ProgressPrimitive.Root
            ref={ref}
            className={ny(
                'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
                className,
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                style={{ transform: `translateX(-${100 - (props.value || 0)}%)` }}
                className={ny('size-full flex-1 bg-primary transition-all', indicatorClassName)}
            />
        </ProgressPrimitive.Root>
    ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
