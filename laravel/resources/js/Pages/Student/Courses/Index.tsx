import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { CourseResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowRight, SchoolIcon } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
    courses: {
        data: CourseResource[];
    };
}

export default function Index({ courses }: Props) {
    console.log(courses);

    const { t } = useLaravelReactI18n();
    const columnHelper = createColumnHelper<CourseResource>();

    const columns = [
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_courses.common.fields.name')}
                    column={column}
                />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>
                    <Link
                        href={route(`${ROUTES.STUDENT_COURSES}.show`, row.original.id)}
                        className='text-blue-600 hover:underline'
                    >
                        {row.original.name}
                    </Link>
                </div>
            ),
        }),
        columnHelper.accessor('classroom.name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_courses.common.fields.classroom')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('description', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_courses.common.fields.description')}
                    column={column}
                />
            ),
            cell: ({ row }) => (
                <div className='max-w-[300px] truncate'>{row.original.description}</div>
            ),
        }),
        columnHelper.display({
            id: 'action',
            cell: ({ row }) => (
                <Link
                    href={route(`${ROUTES.STUDENT_COURSES}.show`, row.original.id)}
                    className='inline-flex items-center gap-1 text-blue-600 hover:underline'
                >
                    {t('action.view')}
                    <ArrowRight className='h-4 w-4' />
                </Link>
            ),
        }),
    ] as Array<ColumnDef<CourseResource, CourseResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <AuthenticatedLayout title={t('pages.student_courses.index.title')}>
            <Card>
                <CardHeader className='flex flex-col space-y-1'>
                    <CardTitle className='flex items-center gap-2'>
                        <SchoolIcon className='h-5 w-5' />
                        {t('pages.student_courses.index.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={courses.data}
                        columns={memoizedColumns}
                        baseRoute={ROUTES.STUDENT_COURSES}
                        baseKey={TANSTACK_QUERY_KEYS.STUDENT_COURSES}
                    />
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
