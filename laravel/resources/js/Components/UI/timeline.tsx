import { CheckIcon, Cross1Icon } from '@radix-ui/react-icons';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import React from 'react';

import { ny } from '@/Lib/Utils';

const timelineVariants = cva('grid', {
    variants: {
        positions: {
            left: '[&>li]:grid-cols-[0_min-content_1fr]',
            right: '[&>li]:grid-cols-[1fr_min-content]',
            center: '[&>li]:grid-cols-[1fr_min-content_1fr]',
        },
    },
    defaultVariants: {
        positions: 'left',
    },
});

interface TimelineProps
    extends React.HTMLAttributes<HTMLUListElement>,
        VariantProps<typeof timelineVariants> {}

const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
    ({ children, className, positions, ...props }, ref) => {
        return (
            <ul ref={ref} className={ny(timelineVariants({ positions }), className)} {...props}>
                {children}
            </ul>
        );
    },
);
Timeline.displayName = 'Timeline';

const timelineItemVariants = cva('grid items-center gap-x-2', {
    variants: {
        status: {
            done: 'text-primary',
            default: 'text-muted-foreground',
        },
    },
    defaultVariants: {
        status: 'default',
    },
});

interface TimelineItemProps
    extends React.HTMLAttributes<HTMLLIElement>,
        VariantProps<typeof timelineItemVariants> {}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
    ({ className, status, ...props }, ref) => (
        <li ref={ref} className={ny(timelineItemVariants({ status }), className)} {...props} />
    ),
);
TimelineItem.displayName = 'TimelineItem';

const timelineDotVariants = cva(
    'col-start-2 col-end-3 row-start-1 row-end-1 flex size-4 items-center justify-center rounded-full border border-current',
    {
        variants: {
            status: {
                default: '[&>*]:hidden',
                current:
                    '[&>*:not(.radix-circle)]:hidden [&>.radix-circle]:bg-current [&>.radix-circle]:fill-current',
                done: 'bg-primary [&>*:not(.radix-check)]:hidden [&>.radix-check]:text-background',
                error: 'border-destructive bg-destructive [&>*:not(.radix-cross)]:hidden [&>.radix-cross]:text-background',
                custom: '[&>*:not(:nth-child(4))]:hidden [&>*:nth-child(4)]:block',
            },
        },
        defaultVariants: {
            status: 'default',
        },
    },
);

interface TimelineDotProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof timelineDotVariants> {
    customIcon?: React.ReactNode;
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
    ({ className, status, customIcon, ...props }, ref) => (
        <div
            role='status'
            ref={ref}
            className={ny('timeline-dot', timelineDotVariants({ status }), className)}
            {...props}
        >
            <div className='radix-circle size-2.5 rounded-full' />
            <CheckIcon className='radix-check size-3' />
            <Cross1Icon className='radix-cross size-2.5' />
            {customIcon}
        </div>
    ),
);
TimelineDot.displayName = 'TimelineDot';

const timelineContentVariants = cva('row-start-2 row-end-2 pb-8 text-muted-foreground', {
    variants: {
        side: {
            right: 'col-start-3 col-end-4 mr-auto text-left',
            left: 'col-start-1 col-end-2 ml-auto text-right',
        },
    },
    defaultVariants: {
        side: 'right',
    },
});

interface TimelineConentProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof timelineContentVariants> {}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineConentProps>(
    ({ className, side, ...props }, ref) => (
        <div ref={ref} className={ny(timelineContentVariants({ side }), className)} {...props} />
    ),
);
TimelineContent.displayName = 'TimelineContent';

const timelineHeadingVariants = cva('row-start-1 row-end-1 line-clamp-1 max-w-full truncate', {
    variants: {
        side: {
            right: 'col-start-3 col-end-4 mr-auto text-left',
            left: 'col-start-1 col-end-2 ml-auto text-right',
        },
        variant: {
            primary: 'text-base font-medium text-primary',
            secondary: 'text-sm font-light text-muted-foreground',
        },
    },
    defaultVariants: {
        side: 'right',
        variant: 'primary',
    },
});

interface TimelineHeadingProps
    extends React.HTMLAttributes<HTMLParagraphElement>,
        VariantProps<typeof timelineHeadingVariants> {}

const TimelineHeading = React.forwardRef<HTMLParagraphElement, TimelineHeadingProps>(
    ({ className, side, variant, ...props }, ref) => (
        <p
            role='heading'
            ref={ref}
            className={ny(timelineHeadingVariants({ side, variant }), className)}
            aria-level={variant === 'primary' ? 2 : 3}
            {...props}
        />
    ),
);
TimelineHeading.displayName = 'TimelineHeading';

interface TimelineLineProps extends React.HTMLAttributes<HTMLHRElement> {
    done?: boolean;
}

const TimelineLine = React.forwardRef<HTMLHRElement, TimelineLineProps>(
    ({ className, done = false, ...props }, ref) => {
        return (
            <hr
                role='separator'
                ref={ref}
                className={ny(
                    'col-start-2 col-end-3 row-start-2 row-end-2 mx-auto flex h-full min-h-16 w-0.5 justify-center rounded-full',
                    done ? 'bg-primary' : 'bg-muted',
                    className,
                )}
                aria-orientation='vertical'
                {...props}
            />
        );
    },
);
TimelineLine.displayName = 'TimelineLine';

export { Timeline, TimelineContent, TimelineDot, TimelineHeading, TimelineItem, TimelineLine };
