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
                className={ny(
                    'h-full w-full transition-transform duration-300 ease-in-out',
                    indicatorClassName,
                )}
            />
        </ProgressPrimitive.Root>
    ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
