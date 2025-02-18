import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { ny } from '@/Lib/Utils';
import { LoaderCircle } from 'lucide-react';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
                destructive:
                    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
                outline:
                    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
                tertiary: 'bg-tertiary text-tertiary-foreground shadow-sm hover:bg-tertiary/80',
                quaternary:
                    'bg-quaternary text-quaternary-foreground shadow-sm hover:bg-quaternary/80',
                success: 'bg-success text-success-foreground shadow-sm hover:bg-success/90',
                warning: 'bg-warning text-warning-foreground shadow-sm hover:bg-warning/90',
                info: 'bg-info text-info-foreground shadow-sm hover:bg-info/90',
                create: 'bg-create text-create-foreground shadow-sm hover:bg-create/90',
                update: 'bg-update text-update-foreground shadow-sm hover:bg-update/90',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-10 rounded-md px-8',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    disableRipple?: boolean;
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            disableRipple = false,
            loading = false,
            ...props
        },
        ref,
    ) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                ref={ref}
                className={ny(
                    buttonVariants({ variant, size, className }),
                    !disableRipple && 'ripple', // Include the ripple class only if disableRipple is false
                )}
                {...props}>
                {loading && <LoaderCircle className="animate-spin" />}

                {props.children}
            </Comp>
        );
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
