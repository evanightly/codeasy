import { Button } from '@/Components/UI/button';
import { ny } from '@/Lib/Utils';
import { Column } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={ny(className)}>{title}</div>;
    }

    return (
        <div className={ny('flex items-center space-x-2', className)}>
            <Button
                variant='ghost'
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className='group-[.table-compact]:h-8 group-[.table-compact]:p-0 group-[.table-compact]:px-4'
            >
                <span>{title}</span>
                <div className='relative h-4 w-4'>
                    <ChevronUp
                        className={ny(
                            'absolute -top-1 transition-colors',
                            column.getIsSorted() === 'asc'
                                ? 'text-primary'
                                : 'text-muted-foreground',
                        )}
                    />
                    <ChevronDown
                        className={ny(
                            'absolute top-1 transition-colors',
                            column.getIsSorted() === 'desc'
                                ? 'text-primary'
                                : 'text-muted-foreground',
                        )}
                    />
                </div>
            </Button>
        </div>
    );
}
