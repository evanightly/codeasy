import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Input } from '@/Components/UI/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/UI/tooltip';
import { ny } from '@/Lib/Utils';
import { STYLING } from '@/Support/Constants/styling';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { Resource } from '@/Support/Interfaces/Resources';
import { useForm } from '@inertiajs/react';
import { useDebounce, useIsFirstRender } from '@uidotdev/usehooks';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowDownAZ, ArrowUpAZ, Search, SortAsc, X } from 'lucide-react';
import { HTMLAttributes, useEffect, useState } from 'react';
import SortOptionsDialog from './SortOptionsDialog';

interface GenericFiltersProps<R extends Resource = Resource> {
    filters: ServiceFilterOptions<R>;
    setFilters: (filters: ServiceFilterOptions<R>) => void;
    /**
     * Data array for auto-detecting columns and relations
     */
    data?: R[];
    /**
     * Additional columns to make available for sorting
     */
    additionalSortColumns?: Array<{ key: string; label: string }>;
    /**
     * Relations available for relation count sorting
     */
    availableSortRelations?: Array<{ key: string; label: string }>;
}

/**
 * Converts any string format (snake_case, camelCase, kebab-case) to a human-readable format
 * with spaces and proper capitalization.
 *
 * @param str The string to format
 * @returns A human-readable string
 */
function toHumanReadableText(str: string): string {
    if (!str) return '';

    // Replace special characters with spaces
    let result = str.replace(/[-_]/g, ' ');

    // Insert a space before capital letters in camelCase
    result = result.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Capitalize first letter of each word
    result = result
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return result;
}

export default function GenericFilters<R extends Resource = Resource>({
    filters,
    setFilters,
    data = [],
    additionalSortColumns = [],
    availableSortRelations = [],
    children,
    className,
}: GenericFiltersProps<R> & HTMLAttributes<HTMLDivElement>) {
    const { t } = useLaravelReactI18n();
    const isFirstRender = useIsFirstRender();
    const { data: formData, setData } = useForm({
        search: filters.search || '',
        per_page: filters.page_size || 10,
    });

    const [sortDialogOpen, setSortDialogOpen] = useState(false);
    const debouncedSearch = useDebounce(formData.search, 500);

    useEffect(() => {
        if (isFirstRender) return;
        setFilters({
            ...filters,
            search: debouncedSearch,
            page_size: formData.per_page,
        });
    }, [debouncedSearch, formData.per_page]);

    // Determine current sorts for display
    const getSortInfo = () => {
        const result = [];

        // Handle column sort
        if (filters.sort_by) {
            // Find a label for the column sort
            let columnLabel = filters.sort_by;

            // Check in additional columns and default columns
            const column = [
                ...additionalSortColumns,
                { key: 'id', label: t('pages.common.columns.id') },
                { key: 'created_at', label: t('pages.common.columns.created_at') },
                { key: 'updated_at', label: t('pages.common.columns.updated_at') },
            ].find((c) => c.key === filters.sort_by);

            if (column) {
                columnLabel = column.label;
            } else {
                // If no custom label, convert to human readable format
                columnLabel = toHumanReadableText(filters.sort_by);
            }

            result.push({
                field: filters.sort_by,
                label: columnLabel,
                direction: filters.sort_dir || 'desc',
                isRelationSort: false,
            });
        }

        // Handle relation sort
        if (filters.sort_by_relation_count) {
            // Find a label for the relation sort
            let relationLabel = filters.sort_by_relation_count;

            // Check in available relations
            const relation = availableSortRelations.find(
                (r) => r.key === filters.sort_by_relation_count,
            );
            if (relation) {
                relationLabel = relation.label;
            } else {
                // If no custom label, convert to human readable format
                relationLabel = toHumanReadableText(filters.sort_by_relation_count);
            }

            result.push({
                field: filters.sort_by_relation_count,
                label: relationLabel,
                direction: filters.sort_dir_relation_count || 'desc',
                isRelationSort: true,
            });
        }

        return result.length > 0 ? result : null;
    };

    const sortInfo = getSortInfo();

    return (
        <div className={ny('flex items-center gap-4', className)}>
            <div className='form-control relative w-fit'>
                <Input
                    value={formData.search}
                    type='text'
                    placeholder={t('components.generic_filters.fields.search_placeholder')}
                    onChange={(e) => setData('search', e.target.value)}
                    className='max-w-full'
                />
                {formData?.search?.length > 0 ? (
                    <span
                        onClick={() => setData('search', '')}
                        className='absolute inset-y-0 right-4 inline-flex items-center transition-all hover:text-primary'
                    >
                        <X size={STYLING.ICON.SIZE.EXTRA_SMALL} />
                    </span>
                ) : (
                    <span className='absolute inset-y-0 right-4 inline-flex items-center transition-all hover:text-primary'>
                        <Search size={STYLING.ICON.SIZE.EXTRA_SMALL} />
                    </span>
                )}
            </div>

            <Select
                value={formData.per_page === 'all' ? 'all' : formData.per_page.toString()}
                onValueChange={(value) => {
                    if (value === 'all') {
                        setData('per_page', value);
                        return;
                    }
                    setData('per_page', +value);
                }}
                name='per_page'
            >
                <SelectTrigger className='w-fit'>
                    <SelectValue
                        placeholder={t('components.generic_filters.fields.pagination_placeholder')}
                    />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='25'>25</SelectItem>
                    <SelectItem value='50'>50</SelectItem>
                    <SelectItem value='100'>100</SelectItem>
                    <SelectItem value='200'>200</SelectItem>
                    <SelectItem value='500'>500</SelectItem>
                    <SelectItem value='1000'>1000</SelectItem>
                    <SelectItem value='all'>
                        {t('components.generic_filters.fields.all')}
                    </SelectItem>
                </SelectContent>
            </Select>

            {/* Sort Button */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='outline'
                            size='icon'
                            onClick={() => setSortDialogOpen(true)}
                            // className={ny(sortInfo ? 'text-primary' : '')}
                        >
                            <SortAsc size={STYLING.ICON.SIZE.SMALL} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className='flex flex-col gap-2'>
                            {t('components.sort_options_dialog.title')}

                            <div className='flex flex-wrap gap-4'>
                                {/* Active Sort Display - Multiple badges possible */}
                                {sortInfo &&
                                    sortInfo.map((info, index) => (
                                        <Badge
                                            variant='outline'
                                            key={index}
                                            className='items-center gap-1 text-primary-foreground'
                                        >
                                            {info.label}
                                            {info.direction === 'asc' ? (
                                                <ArrowUpAZ className='h-3 w-3' />
                                            ) : (
                                                <ArrowDownAZ className='h-3 w-3' />
                                            )}
                                        </Badge>
                                    ))}
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {children}

            {/* Sort Dialog */}
            <SortOptionsDialog
                setFilters={setFilters}
                open={sortDialogOpen}
                onOpenChange={setSortDialogOpen}
                filters={filters}
                data={data}
                availableRelations={availableSortRelations}
                additionalColumns={additionalSortColumns}
            />
        </div>
    );
}
