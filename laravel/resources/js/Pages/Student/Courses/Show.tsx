import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { CourseResource, LearningMaterialResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowLeft, ArrowRight, BookIcon, Code, FileTextIcon } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
    course: {
        data: CourseResource;
    };
    materials: {
        data: LearningMaterialResource[];
    };
}

export default function Show({ course, materials }: Props) {
    const { t } = useLaravelReactI18n();
    const columnHelper = createColumnHelper<LearningMaterialResource>();

    const renderTypeIcon = (type: string) => {
        switch (type) {
            case LearningMaterialTypeEnum.LIVE_CODE:
                return <Code className='mr-1 h-4 w-4' />;
            default:
                return <FileTextIcon className='mr-1 h-4 w-4' />;
        }
    };

    const renderTypeName = (type: string) => {
        switch (type) {
            case LearningMaterialTypeEnum.LIVE_CODE:
                return t('pages.learning_material.common.types.live_code');
            default:
                return type;
        }
    };

    const columns = [
        columnHelper.accessor('title', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_materials.common.fields.title')}
                    column={column}
                />
            ),
            cell: ({ row }) => (
                <div className='font-medium'>
                    <Link
                        href={route('student.materials.show', [course.data.id, row.original.id])}
                        className='text-blue-600 hover:underline'
                    >
                        {row.original.title}
                    </Link>
                </div>
            ),
        }),
        columnHelper.accessor('type', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_materials.common.fields.type')}
                    column={column}
                />
            ),
            cell: ({ row }) => (
                <div className='flex items-center'>
                    <Badge variant='outline' className='flex items-center'>
                        {renderTypeIcon(row?.original?.type ?? '')}
                        {renderTypeName(row?.original?.type ?? '')}
                    </Badge>
                </div>
            ),
        }),
        columnHelper.accessor('description', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_materials.common.fields.description')}
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
                    href={route('student.materials.show', [course.data.id, row.original.id])}
                    className='inline-flex items-center gap-1 text-blue-600 hover:underline'
                >
                    {t('action.view')}
                    <ArrowRight className='h-4 w-4' />
                </Link>
            ),
        }),
    ] as Array<ColumnDef<LearningMaterialResource, LearningMaterialResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <AuthenticatedLayout title={course.data.name}>
            <div className='mb-6 flex items-center justify-between'>
                <Link href={route('student.courses.index')}>
                    <Button variant='outline' size='sm' className='gap-1'>
                        <ArrowLeft className='h-4 w-4' />
                        {t('pages.student_courses.actions.back_to_courses')}
                    </Button>
                </Link>
            </div>

            <Card className='mb-6'>
                <CardHeader>
                    <CardTitle>{course.data.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col gap-4'>
                        <div>
                            <h3 className='font-semibold'>
                                {t('pages.student_courses.common.fields.classroom')}:
                            </h3>
                            <p>{course.data.classroom?.name}</p>
                        </div>

                        {course.data.description && (
                            <div>
                                <h3 className='font-semibold'>
                                    {t('pages.student_courses.common.fields.description')}:
                                </h3>
                                <p>{course.data.description}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className='flex flex-col space-y-1'>
                    <CardTitle className='flex items-center gap-2'>
                        <BookIcon className='h-5 w-5' />
                        {t('pages.student_materials.index.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={materials.data}
                        columns={memoizedColumns}
                        baseRoute='student.materials'
                        baseKey='student-materials'
                    />
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
