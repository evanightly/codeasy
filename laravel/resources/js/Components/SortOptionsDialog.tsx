import { Button } from '@/Components/UI/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import { Label } from '@/Components/UI/label';
import { RadioGroup, RadioGroupItem } from '@/Components/UI/radio-group';
import { ScrollArea } from '@/Components/UI/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { ny } from '@/Lib/Utils';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { Resource } from '@/Support/Interfaces/Resources';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowDownAZ, ArrowUpAZ, SortAsc } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// Default column properties available on all models
const DEFAULT_MODEL_COLUMNS = ['id', 'created_at', 'updated_at'];

// Common sortable fields to include even if not explicitly defined
const COMMON_SORTABLE_FIELDS = [
    { key: 'id', label: 'ID' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' },
];

// Keys to exclude from auto-detection (typically non-sortable fields or complex objects)
const EXCLUDED_KEYS = ['metadata', 'pivot', 'permissions'];

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

interface SortOption {
    key: string;
    label: string;
    type: 'column' | 'relation';
}

interface SortOptionsDialogProps<R extends Resource = Resource> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: ServiceFilterOptions<R>;
    setFilters: (filters: ServiceFilterOptions<R>) => void;
    // Data for auto-detecting columns and relations
    data?: R[];
    // Optional props to extend the available sort options
    additionalColumns?: Array<{ key: string; label: string }>;
    availableRelations?: Array<{ key: string; label: string }>;
}

export default function SortOptionsDialog<R extends Resource = Resource>({
    open,
    onOpenChange,
    filters,
    setFilters,
    data = [],
    additionalColumns = [],
    availableRelations = [],
}: SortOptionsDialogProps<R>) {
    const { t } = useLaravelReactI18n();

    // Track sort options for both column and relation independently
    const [activeTab, setActiveTab] = useState<'columns' | 'relations'>('columns');

    // Column sorting state
    const [selectedColumnOption, setSelectedColumnOption] = useState<string | null>(null);
    const [columnSortDirection, setColumnSortDirection] = useState<'asc' | 'desc'>('desc');

    // Relation sorting state
    const [selectedRelationOption, setSelectedRelationOption] = useState<string | null>(null);
    const [relationSortDirection, setRelationSortDirection] = useState<'asc' | 'desc'>('desc');

    // Auto-detect columns from the first data item
    const autoDetectedColumns = useMemo(() => {
        if (!data || data.length === 0) return [];

        const firstItem = data[0];
        const columns: Array<{ key: string; label: string }> = [];

        if (firstItem) {
            // Extract keys from the first item, excluding relations and complex objects
            Object.keys(firstItem).forEach((key) => {
                // Skip if it's in excluded keys list
                if (EXCLUDED_KEYS.some((excluded) => key.includes(excluded))) return;

                // Skip if it's an array or object (likely a relation)
                const value = firstItem[key as keyof typeof firstItem];
                if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return;

                // Skip if it's already in common sortable fields
                if (COMMON_SORTABLE_FIELDS.some((field) => field.key === key)) return;

                // Add to auto-detected columns with human-readable label
                columns.push({
                    key,
                    label: toHumanReadableText(key),
                });
            });
        }

        return columns;
    }, [data]);

    // Auto-detect relations from the first data item
    const autoDetectedRelations = useMemo(() => {
        if (!data || data.length === 0) return [];

        const firstItem = data[0];
        const relations: Array<{ key: string; label: string }> = [];

        if (firstItem) {
            // Look for potential relation keys (typically ending with _count for counts)
            Object.keys(firstItem).forEach((key) => {
                // Check for relation count fields
                if (key.endsWith('_count')) {
                    const relationName = key.replace('_count', '');

                    // Skip if already in available relations
                    if (availableRelations.some((rel) => rel.key === relationName)) return;

                    relations.push({
                        key: relationName,
                        label: toHumanReadableText(relationName),
                    });
                }

                // Check for actual relation objects
                const value = firstItem[key as keyof typeof firstItem];
                if (
                    Array.isArray(value) ||
                    (typeof value === 'object' &&
                        value !== null &&
                        key !== 'pivot' &&
                        !key.includes('metadata'))
                ) {
                    // Skip if already in available relations
                    if (availableRelations.some((rel) => rel.key === key)) return;

                    relations.push({
                        key,
                        label: toHumanReadableText(key),
                    });
                }
            });
        }

        return relations;
    }, [data, availableRelations]);

    // Generate column options combining defaults, auto-detected, and additional
    const columnOptions: SortOption[] = useMemo(() => {
        return [...COMMON_SORTABLE_FIELDS, ...autoDetectedColumns, ...additionalColumns]
            .filter(
                (column, index, self) =>
                    // Remove duplicates
                    index === self.findIndex((c) => c.key === column.key),
            )
            .map((col) => ({
                key: col.key,
                label: col.label || toHumanReadableText(col.key),
                type: 'column',
            }));
    }, [autoDetectedColumns, additionalColumns]);

    // Generate relation options combining auto-detected and available
    const relationOptions: SortOption[] = useMemo(() => {
        return [...autoDetectedRelations, ...availableRelations]
            .filter(
                (relation, index, self) =>
                    // Remove duplicates
                    index === self.findIndex((r) => r.key === relation.key),
            )
            .map((rel) => ({
                key: rel.key,
                label: rel.label || toHumanReadableText(rel.key),
                type: 'relation',
            }));
    }, [autoDetectedRelations, availableRelations]);

    // Initialize the state based on current filters
    useEffect(() => {
        // Initialize column sort
        if (filters.sort_by) {
            setSelectedColumnOption(typeof filters.sort_by === 'string' ? filters.sort_by : null);
            setColumnSortDirection(filters.sort_dir || 'desc');
        } else {
            setSelectedColumnOption(null);
        }

        // Initialize relation sort
        if (filters.sort_by_relation_count) {
            setSelectedRelationOption(filters.sort_by_relation_count);
            setRelationSortDirection(filters.sort_dir_relation_count || 'desc');
        } else {
            setSelectedRelationOption(null);
        }
    }, [filters]);

    const handleApplySorting = () => {
        const newFilters = { ...filters };

        // Update column sort if tab is active
        if (selectedColumnOption) {
            newFilters.sort_by = selectedColumnOption;
            newFilters.sort_dir = columnSortDirection;
        } else {
            delete newFilters.sort_by;
            delete newFilters.sort_dir;
        }

        // Update relation sort if tab is active
        if (selectedRelationOption) {
            newFilters.sort_by_relation_count = selectedRelationOption;
            newFilters.sort_dir_relation_count = relationSortDirection;
        } else {
            delete newFilters.sort_by_relation_count;
            delete newFilters.sort_dir_relation_count;
        }

        // Reset to page 1 when sorting changes
        newFilters.page = 1;

        setFilters(newFilters);
        onOpenChange(false);
    };

    // Reset only the column sorting
    const handleResetColumnSorting = () => {
        setSelectedColumnOption(null);
        setColumnSortDirection('desc');
    };

    // Reset only the relation sorting
    const handleResetRelationSorting = () => {
        setSelectedRelationOption(null);
        setRelationSortDirection('desc');
    };

    // Reset all sorting options
    const handleResetAllSorting = () => {
        const newFilters = { ...filters };

        // Clear all sorting parameters
        delete newFilters.sort_by;
        delete newFilters.sort_dir;
        delete newFilters.sort_by_relation_count;
        delete newFilters.sort_dir_relation_count;

        // Reset to page 1
        newFilters.page = 1;

        setFilters(newFilters);
        onOpenChange(false);
    };

    // Toggle direction for column sort
    const toggleColumnSortDirection = () => {
        setColumnSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    // Toggle direction for relation sort
    const toggleRelationSortDirection = () => {
        setRelationSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const getSortDirectionIcon = (direction: 'asc' | 'desc') => {
        return direction === 'asc' ? (
            <ArrowUpAZ className='h-4 w-4' />
        ) : (
            <ArrowDownAZ className='h-4 w-4' />
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[450px]'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <SortAsc className='h-5 w-5' />
                        {t('components.sort_options_dialog.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('components.sort_options_dialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className='py-4'>
                    <Tabs
                        onValueChange={(value) => setActiveTab(value as 'columns' | 'relations')}
                        defaultValue='columns'
                    >
                        <TabsList className='w-full'>
                            <TabsTrigger value='columns' className='flex-1'>
                                {t('components.sort_options_dialog.columns_tab')}
                                {selectedColumnOption && (
                                    <span className='ml-1 text-primary'>•</span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value='relations' className='flex-1'>
                                {t('components.sort_options_dialog.relations_tab')}
                                {selectedRelationOption && (
                                    <span className='ml-1 text-primary'>•</span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <div className='mt-4'>
                            <TabsContent value='columns'>
                                <div className='flex items-center justify-between'>
                                    <h4 className='text-sm font-medium'>
                                        {t('components.sort_options_dialog.column_sort')}
                                    </h4>

                                    <div className='flex gap-2'>
                                        {selectedColumnOption && (
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={toggleColumnSortDirection}
                                            >
                                                {getSortDirectionIcon(columnSortDirection)}
                                            </Button>
                                        )}
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={handleResetColumnSorting}
                                        >
                                            {t('components.sort_options_dialog.reset_column')}
                                        </Button>
                                    </div>
                                </div>

                                {columnOptions.length > 0 ? (
                                    <ScrollArea className='h-[200px] pr-2'>
                                        <RadioGroup
                                            value={selectedColumnOption || undefined}
                                            onValueChange={setSelectedColumnOption}
                                            className='mt-2 space-y-1'
                                        >
                                            {columnOptions.map((option) => (
                                                <div
                                                    key={option.key}
                                                    className={ny(
                                                        'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 hover:bg-muted',
                                                        selectedColumnOption === option.key &&
                                                            'bg-muted',
                                                    )}
                                                >
                                                    <Label
                                                        key={option.key}
                                                        htmlFor={`column-${option.key}`}
                                                        className='w-full cursor-pointer'
                                                    >
                                                        <RadioGroupItem
                                                            value={option.key}
                                                            id={`column-${option.key}`}
                                                            className='sr-only'
                                                        />
                                                        {option.label}
                                                    </Label>
                                                    {selectedColumnOption === option.key && (
                                                        <span>
                                                            {getSortDirectionIcon(
                                                                columnSortDirection,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </ScrollArea>
                                ) : (
                                    <div className='py-8 text-center text-muted-foreground'>
                                        {t('components.sort_options_dialog.no_options')}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value='relations'>
                                <div className='flex items-center justify-between'>
                                    <h4 className='text-sm font-medium'>
                                        {t('components.sort_options_dialog.relation_sort')}
                                    </h4>

                                    <div className='flex gap-2'>
                                        {selectedRelationOption && (
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={toggleRelationSortDirection}
                                            >
                                                {getSortDirectionIcon(relationSortDirection)}
                                            </Button>
                                        )}
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={handleResetRelationSorting}
                                        >
                                            {t('components.sort_options_dialog.reset_relation')}
                                        </Button>
                                    </div>
                                </div>

                                {relationOptions.length > 0 ? (
                                    <ScrollArea className='h-[200px] pr-2'>
                                        <RadioGroup
                                            value={selectedRelationOption || undefined}
                                            onValueChange={setSelectedRelationOption}
                                            className='mt-2 space-y-1'
                                        >
                                            {relationOptions.map((option) => (
                                                <div
                                                    key={option.key}
                                                    className={ny(
                                                        'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 hover:bg-muted',
                                                        selectedRelationOption === option.key &&
                                                            'bg-muted',
                                                    )}
                                                >
                                                    <Label
                                                        key={option.key}
                                                        htmlFor={`relation-${option.key}`}
                                                        className='w-full cursor-pointer'
                                                    >
                                                        <RadioGroupItem
                                                            value={option.key}
                                                            id={`relation-${option.key}`}
                                                            className='sr-only'
                                                        />
                                                        {toHumanReadableText(option.label)}
                                                    </Label>
                                                    {selectedRelationOption === option.key && (
                                                        <span>
                                                            {getSortDirectionIcon(
                                                                relationSortDirection,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </ScrollArea>
                                ) : (
                                    <div className='py-8 text-center text-muted-foreground'>
                                        {t('components.sort_options_dialog.no_options')}
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={handleResetAllSorting}>
                        {t('components.sort_options_dialog.reset')}
                    </Button>
                    <Button
                        onClick={handleApplySorting}
                        disabled={!selectedColumnOption && !selectedRelationOption}
                    >
                        {t('components.sort_options_dialog.apply')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
