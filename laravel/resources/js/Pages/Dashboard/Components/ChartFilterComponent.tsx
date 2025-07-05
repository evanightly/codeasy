import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Input } from '@/Components/UI/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import { CourseResource } from '@/Support/Interfaces/Resources/CourseResource';
import { ChartFilters } from '@/Support/Interfaces/Resources/DashboardResource';
import { endOfDay, format, startOfMonth, startOfQuarter, startOfWeek, startOfYear } from 'date-fns';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface ChartFilterProps {
    filters: ChartFilters;
    onFiltersChange: (filters: ChartFilters) => void;
    courses?: CourseResource[];
    showCourseFilter?: boolean;
    showDateFilters?: boolean;
}

export function ChartFilterComponent({
    filters,
    onFiltersChange,
    courses = [],
    showCourseFilter = true,
    showDateFilters = true,
}: ChartFilterProps) {
    const { t } = useLaravelReactI18n();
    const handlePeriodChange = (period: string) => {
        const now = new Date();
        let startDate: Date;
        const endDate = endOfDay(now);

        switch (period) {
            case 'week':
                startDate = startOfWeek(now);
                break;
            case 'month':
                startDate = startOfMonth(now);
                break;
            case 'quarter':
                startDate = startOfQuarter(now);
                break;
            case 'year':
                startDate = startOfYear(now);
                break;
            default:
                return;
        }

        onFiltersChange({
            ...filters,
            period: period as ChartFilters['period'],
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd'),
        });
    };

    const handleDateChange = (field: 'start_date' | 'end_date', date: Date | undefined) => {
        if (date) {
            onFiltersChange({
                ...filters,
                [field]: format(date, 'yyyy-MM-dd'),
                period: undefined, // Clear period when custom dates are selected
            });
        }
    };

    const handleCourseChange = (courseId: string) => {
        onFiltersChange({
            ...filters,
            course_id: courseId === 'all' ? undefined : parseInt(courseId),
        });
    };

    return (
        <Card className='mb-4'>
            <CardHeader>
                <CardTitle className='text-sm'>
                    {t('pages.dashboard.student.charts.filters.title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className='flex flex-wrap gap-4'>
                    {/* Course Filter */}
                    {showCourseFilter && courses.length > 0 && (
                        <div className='min-w-[200px]'>
                            <label className='mb-1 block text-sm font-medium'>
                                {t('pages.dashboard.student.charts.filters.course')}
                            </label>
                            <Select
                                value={filters.course_id?.toString() || 'all'}
                                onValueChange={handleCourseChange}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={t(
                                            'pages.dashboard.student.charts.filters.select_course',
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>
                                        {t('pages.dashboard.student.charts.filters.all_courses')}
                                    </SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem value={course.id.toString()} key={course.id}>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Period Filter */}
                    {showDateFilters && (
                        <div className='min-w-[150px]'>
                            <label className='mb-1 block text-sm font-medium'>
                                {t('pages.dashboard.student.charts.filters.time_period')}
                            </label>
                            <Select value={filters.period || ''} onValueChange={handlePeriodChange}>
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={t(
                                            'pages.dashboard.student.charts.filters.select_period',
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='week'>
                                        {t(
                                            'pages.dashboard.student.charts.filters.periods.this_week',
                                        )}
                                    </SelectItem>
                                    <SelectItem value='month'>
                                        {t(
                                            'pages.dashboard.student.charts.filters.periods.this_month',
                                        )}
                                    </SelectItem>
                                    <SelectItem value='quarter'>
                                        {t(
                                            'pages.dashboard.student.charts.filters.periods.this_quarter',
                                        )}
                                    </SelectItem>
                                    <SelectItem value='year'>
                                        {t(
                                            'pages.dashboard.student.charts.filters.periods.this_year',
                                        )}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Custom Date Range */}
                    {showDateFilters && (
                        <>
                            <div className='min-w-[150px]'>
                                <label className='mb-1 block text-sm font-medium'>
                                    {t('pages.dashboard.student.charts.filters.start_date')}
                                </label>
                                <Input
                                    value={filters.start_date || ''}
                                    type='date'
                                    onChange={(e) =>
                                        handleDateChange(
                                            'start_date',
                                            e.target.value ? new Date(e.target.value) : undefined,
                                        )
                                    }
                                    className='w-full rounded-md border border-gray-300 px-3 py-2'
                                />
                            </div>

                            <div className='min-w-[150px]'>
                                <label className='mb-1 block text-sm font-medium'>
                                    {t('pages.dashboard.student.charts.filters.end_date')}
                                </label>
                                <Input
                                    value={filters.end_date || ''}
                                    type='date'
                                    onChange={(e) =>
                                        handleDateChange(
                                            'end_date',
                                            e.target.value ? new Date(e.target.value) : undefined,
                                        )
                                    }
                                    className='w-full rounded-md border border-gray-300 px-3 py-2'
                                />
                            </div>
                        </>
                    )}

                    {/* Clear Filters */}
                    <div className='flex items-end'>
                        <Button
                            variant='outline'
                            onClick={() => onFiltersChange({})}
                            className='mt-auto'
                        >
                            {t('pages.dashboard.student.charts.filters.clear_filters')}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
