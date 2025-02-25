import { Input } from '@/Components/UI/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import { ny } from '@/Lib/Utils';
import { STYLING } from '@/Support/Constants/styling';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { Resource } from '@/Support/Interfaces/Resources';
import { useForm } from '@inertiajs/react';
import { useDebounce, useIsFirstRender } from '@uidotdev/usehooks';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Search, X } from 'lucide-react';
import { HTMLAttributes, useEffect } from 'react';

interface GenericFiltersProps<R extends Resource = Resource> {
    filters: ServiceFilterOptions<R>;
    setFilters: (filters: ServiceFilterOptions<R>) => void;
}

export default function GenericFilters<R extends Resource = Resource>({
    filters,
    setFilters,
    children,
    className,
}: GenericFiltersProps<R> & HTMLAttributes<HTMLDivElement>) {
    const { t } = useLaravelReactI18n();
    const isFirstRender = useIsFirstRender();
    const { data, setData } = useForm({
        search: filters.search || '',
        perPage: filters.page_size || 10,
    });

    const debouncedSearch = useDebounce(data.search, 500);

    useEffect(() => {
        if (isFirstRender) return;
        setFilters({
            ...filters,
            search: debouncedSearch,
            page_size: data.perPage,
        });
    }, [debouncedSearch, data.perPage]);

    return (
        <div className={ny('flex items-center gap-4', className)}>
            <div className='form-control relative w-fit'>
                <Input
                    value={data.search}
                    type='text'
                    placeholder={t('components.generic_filters.fields.search_placeholder')}
                    onChange={(e) => setData('search', e.target.value)}
                    className='max-w-full'
                />
                {data?.search?.length > 0 ? (
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
                value={data.perPage === 'all' ? 'all' : data.perPage.toString()}
                onValueChange={(value) => {
                    if (value === 'all') {
                        setData('perPage', value);
                        return;
                    }
                    setData('perPage', +value);
                }}
                name='perPage'
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
                </SelectContent>
            </Select>

            {children}
        </div>
    );
}
