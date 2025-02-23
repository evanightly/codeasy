import { type VariantProps, cva } from 'class-variance-authority';
import type * as React from 'react';

import { ny } from '@/Lib/Utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
                secondary:
                    'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                tertiary:
                    'border-transparent bg-tertiary text-tertiary-foreground hover:bg-tertiary/80',
                quaternary:
                    'border-transparent bg-quaternary text-quaternary-foreground hover:bg-quaternary/80',
                success:
                    'border-transparent bg-success text-success-foreground shadow hover:bg-success/80',
                warning:
                    'border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/80',
                destructive:
                    'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
                info: 'border-transparent bg-info text-info-foreground shadow hover:bg-info/80',
                outline: 'text-foreground',
                'outline-primary': 'text-primary border-primary',
                'outline-secondary': 'text-secondary border-secondary',
                'outline-tertiary': 'text-tertiary border-tertiary',
                'outline-quaternary': 'text-quaternary border-quaternary',
                'outline-success': 'text-success border-success',
                'outline-warning': 'text-warning border-warning',
                'outline-destructive': 'text-destructive border-destructive',
                'outline-info': 'text-info border-info',
                'outline-accent': 'text-accent border-accent',
                'outline-muted': 'text-muted-foreground border-muted',
                'outline-error': 'text-error border-error',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={ny(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
