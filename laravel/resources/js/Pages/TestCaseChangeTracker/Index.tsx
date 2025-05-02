import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { DataTable } from '@/Components/UI/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { testCaseChangeTrackerServiceHook } from '@/Services/testCaseChangeTrackerServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { TestCaseChangeTrackerResource } from '@/Support/Interfaces/Resources';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { AlertTriangleIcon, CheckIcon, ClockIcon, PlayIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    stats?: {
        pending: number;
        completed: number;
        failed: number;
    };
}

export default function Index({ stats }: Props) {
    const { t } = useLaravelReactI18n();
    const confirmAction = useConfirmation();
    const [activeTab, setActiveTab] = useState<string>('upcoming');
    const [filters, setFilters] = useState<ServiceFilterOptions>({
        relations: 'course,learning_material,learning_material_question',
    });

    // Query for upcoming re-executions
    const upcomingResponse = testCaseChangeTrackerServiceHook.useGetAll({
        filters: {
            ...filters,
            column_filters: {
                status: 'pending',
            },
            sort_by: 'scheduled_at',
            sort_dir: 'asc',
        },
    });

    // Query for history
    const historyResponse = testCaseChangeTrackerServiceHook.useGetAll({
        filters: {
            ...filters,
            column_filters: {
                status: ['completed', 'failed'],
            },
            sort_by: 'completed_at',
            sort_dir: 'desc',
        },
    });

    console.log(upcomingResponse);

    // For executing a tracker immediately
    const executeMutation = testCaseChangeTrackerServiceHook.useExecuteNow();

    const handleExecuteNow = (tracker: TestCaseChangeTrackerResource) => {
        confirmAction(() => {
            toast.promise(executeMutation.mutateAsync({ id: tracker.id }), {
                loading: t('pages.test_case_change_tracker.messages.pending.execute'),
                success: () => {
                    upcomingResponse.refetch();
                    historyResponse.refetch();
                    return t('pages.test_case_change_tracker.messages.success.execute');
                },
                error: t('pages.test_case_change_tracker.messages.error.execute'),
            });
        });
    };

    const formatTimeRemaining = (tracker: TestCaseChangeTrackerResource) => {
        if (!tracker.scheduled_at) return '--';

        const scheduledDate = new Date(tracker.scheduled_at);
        const now = new Date();

        // If scheduled time is in the past
        if (scheduledDate <= now) {
            return t('pages.test_case_change_tracker.status.imminent');
        }

        const diffMs = scheduledDate.getTime() - now.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffHrs}h ${diffMins}m`;
    };

    const columnHelper = createColumnHelper<TestCaseChangeTrackerResource>();

    // Define columns for both tables
    const upcomingColumns = [
        columnHelper.accessor('course.name', {
            header: t('pages.test_case_change_tracker.columns.course'),
            cell: ({ row }) => row.original.course?.name || '--',
        }),
        columnHelper.accessor('learning_material.title', {
            header: t('pages.test_case_change_tracker.columns.material'),
            cell: ({ row }) => row.original.learning_material?.title || '--',
        }),
        columnHelper.accessor('learning_material_question.title', {
            header: t('pages.test_case_change_tracker.columns.question'),
            cell: ({ row }) => row.original.learning_material_question?.title || '--',
        }),
        columnHelper.accessor('change_type', {
            header: t('pages.test_case_change_tracker.columns.change_type'),
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.change_type === 'created'
                            ? 'success'
                            : row.original.change_type === 'updated'
                              ? 'warning'
                              : 'destructive'
                    }
                >
                    {t(`pages.test_case_change_tracker.change_types.${row.original.change_type}`)}
                </Badge>
            ),
        }),
        columnHelper.accessor('affected_students_count', {
            header: t('pages.test_case_change_tracker.columns.affected_students'),
            cell: ({ row }) => row.original.affected_students_count || 0,
        }),
        columnHelper.accessor('scheduled_at', {
            header: t('pages.test_case_change_tracker.columns.time_remaining'),
            cell: ({ row }) => formatTimeRemaining(row.original),
        }),
        columnHelper.display({
            id: 'actions',
            header: t('pages.test_case_change_tracker.columns.actions'),
            cell: ({ row }) => (
                <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleExecuteNow(row.original)}
                    disabled={executeMutation.isPending}
                >
                    <PlayIcon className='mr-1 h-4 w-4' />
                    {t('pages.test_case_change_tracker.buttons.execute_now')}
                </Button>
            ),
        }),
    ] as Array<ColumnDef<TestCaseChangeTrackerResource, TestCaseChangeTrackerResource>>;

    const historyColumns = [
        columnHelper.accessor('course.name', {
            header: t('pages.test_case_change_tracker.columns.course'),
            cell: ({ row }) => row.original.course?.name || '--',
        }),
        columnHelper.accessor('learning_material.title', {
            header: t('pages.test_case_change_tracker.columns.material'),
            cell: ({ row }) => row.original.learning_material?.title || '--',
        }),
        columnHelper.accessor('change_type', {
            header: t('pages.test_case_change_tracker.columns.change_type'),
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.change_type === 'created'
                            ? 'success'
                            : row.original.change_type === 'updated'
                              ? 'warning'
                              : 'destructive'
                    }
                >
                    {t(`pages.test_case_change_tracker.change_types.${row.original.change_type}`)}
                </Badge>
            ),
        }),
        columnHelper.accessor('status', {
            header: t('pages.test_case_change_tracker.columns.status'),
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.status === 'completed'
                            ? 'success'
                            : row.original.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                    }
                >
                    {t(`pages.test_case_change_tracker.status.${row.original.status}`)}
                </Badge>
            ),
        }),
        columnHelper.accessor('affected_students_count', {
            header: t('pages.test_case_change_tracker.columns.affected_students'),
            cell: ({ row }) => {
                const count = row.original.affected_students_count || 0;
                const executionDetails = row.original.execution_details || {};

                if (row.original.status === 'completed') {
                    return (
                        <div className='flex flex-col'>
                            <span>
                                {count} {t('pages.test_case_change_tracker.labels.total')}
                            </span>
                            <span className='text-xs text-green-600'>
                                {executionDetails.success || 0}{' '}
                                {t('pages.test_case_change_tracker.labels.passed')}
                            </span>
                            <span className='text-xs text-red-600'>
                                {executionDetails.failed || 0}{' '}
                                {t('pages.test_case_change_tracker.labels.failed')}
                            </span>
                        </div>
                    );
                }

                return count;
            },
        }),
        columnHelper.accessor('scheduled_at', {
            header: t('pages.test_case_change_tracker.columns.scheduled_at'),
            cell: ({ row }) => new Date(row.original.scheduled_at).toLocaleString(),
        }),
        columnHelper.accessor('completed_at', {
            header: t('pages.test_case_change_tracker.columns.completed_at'),
            cell: ({ row }) =>
                row.original.completed_at
                    ? new Date(row.original.completed_at).toLocaleString()
                    : '--',
        }),
    ] as Array<ColumnDef<TestCaseChangeTrackerResource, TestCaseChangeTrackerResource>>;

    // Memoize columns to prevent unnecessary re-renders
    const memoizedUpcomingColumns = useMemo(() => upcomingColumns, [t]);
    const memoizedHistoryColumns = useMemo(() => historyColumns, [t]);

    const currentResponse = activeTab === 'upcoming' ? upcomingResponse : historyResponse;

    return (
        <AuthenticatedLayout title={t('pages.test_case_change_tracker.index.title')}>
            <div className='space-y-6'>
                {/* Stats Cards */}
                <div className='grid gap-4 md:grid-cols-3'>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>
                                {t('pages.test_case_change_tracker.stats.pending')}
                            </CardTitle>
                            <ClockIcon className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{stats?.pending || 0}</div>
                            <p className='text-xs text-muted-foreground'>
                                {t('pages.test_case_change_tracker.stats.pending_description')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>
                                {t('pages.test_case_change_tracker.stats.completed')}
                            </CardTitle>
                            <CheckIcon className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{stats?.completed || 0}</div>
                            <p className='text-xs text-muted-foreground'>
                                {t('pages.test_case_change_tracker.stats.completed_description')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>
                                {t('pages.test_case_change_tracker.stats.failed')}
                            </CardTitle>
                            <AlertTriangleIcon className='h-4 w-4 text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>{stats?.failed || 0}</div>
                            <p className='text-xs text-muted-foreground'>
                                {t('pages.test_case_change_tracker.stats.failed_description')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tab Navigation */}
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value)}
                    defaultValue='upcoming'
                >
                    <TabsList className='mb-4'>
                        <TabsTrigger value='upcoming'>
                            {t('pages.test_case_change_tracker.tabs.upcoming')}
                        </TabsTrigger>
                        <TabsTrigger value='history'>
                            {t('pages.test_case_change_tracker.tabs.history')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='upcoming'>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('pages.test_case_change_tracker.sections.upcoming')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    setFilters={setFilters}
                                    meta={upcomingResponse.data?.meta}
                                    // loading={upcomingResponse.isLoading}
                                    filters={filters}
                                    data={upcomingResponse.data?.data ?? []}
                                    columns={memoizedUpcomingColumns}
                                    baseRoute={ROUTES.TEST_CASE_CHANGE_TRACKERS}
                                    baseKey={TANSTACK_QUERY_KEYS.TEST_CASE_CHANGE_TRACKERS}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='history'>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t('pages.test_case_change_tracker.sections.history')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    setFilters={setFilters}
                                    meta={historyResponse.data?.meta}
                                    // loading={historyResponse.isLoading}
                                    filters={filters}
                                    data={historyResponse.data?.data ?? []}
                                    columns={memoizedHistoryColumns}
                                    baseRoute={ROUTES.TEST_CASE_CHANGE_TRACKERS}
                                    baseKey={TANSTACK_QUERY_KEYS.TEST_CASE_CHANGE_TRACKERS}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
