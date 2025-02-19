import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import type { ButtonProps } from '@/Components/UI/button';
import { buttonVariants } from '@/Components/UI/button';
import { ny } from '@/Lib/Utils';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role='navigation'
            className={ny('mx-auto flex w-full justify-center', className)}
            aria-label='pagination'
            {...props}
        />
    );
}
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
    ({ className, ...props }, ref) => (
        <ul ref={ref} className={ny('flex flex-row items-center gap-1', className)} {...props} />
    ),
);
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
    ({ className, ...props }, ref) => <li ref={ref} className={ny('', className)} {...props} />,
);
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
    isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
    React.ComponentProps<'a'>;

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
    return (
        <a
            className={ny(
                buttonVariants({
                    variant: isActive ? 'outline' : 'ghost',
                    size,
                }),
                className,
            )}
            aria-current={isActive ? 'page' : undefined}
            {...props}
        />
    );
}
PaginationLink.displayName = 'PaginationLink';

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            size='default'
            className={ny('gap-1 pl-2.5', className)}
            aria-label='Go to previous page'
            {...props}
        >
            <ChevronLeftIcon className='size-4' />
            <span>Previous</span>
        </PaginationLink>
    );
}
PaginationPrevious.displayName = 'PaginationPrevious';

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            size='default'
            className={ny('gap-1 pr-2.5', className)}
            aria-label='Go to next page'
            {...props}
        >
            <span>Next</span>
            <ChevronRightIcon className='size-4' />
        </PaginationLink>
    );
}
PaginationNext.displayName = 'PaginationNext';

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            className={ny('flex size-9 items-center justify-center', className)}
            aria-hidden
            {...props}
        >
            <DotsHorizontalIcon className='size-4' />
            <span className='sr-only'>More pages</span>
        </span>
    );
}
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
};
