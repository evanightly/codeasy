import { Badge } from '@/Components/UI/badge';
import { Button, buttonVariants } from '@/Components/UI/button';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { CourseResource } from '@/Support/Interfaces/Resources';
import { Link, usePage } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import Import from './Partials/Import';

interface CoursesProps {
    response?: UseQueryResult<PaginateResponse<CourseResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
}

const Courses = ({ response, filters, setFilters, baseKey, baseRoute }: CoursesProps) => {
    const { t } = useLaravelReactI18n();
    const { roles, teachedSchools } = usePage().props.auth.user;

    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<CourseResource>();
    const deleteMutation = courseServiceHook.useDelete();

    const handleDelete = async (course: CourseResource) => {
        if (!course.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: course.id }), {
                loading: t('pages.course.common.messages.pending.delete'),
                success: t('pages.course.common.messages.success.delete'),
                error: t('pages.course.common.messages.error.delete'),
            });
        });
    };

    const columns = [
        columnHelper.accessor('classroom.name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.course.common.fields.classroom')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('teacher.name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.course.common.fields.teacher')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.course.common.fields.name')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('active', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.course.common.fields.status')}
                    column={column}
                />
            ),
            cell: ({ row }) => (
                <Badge variant={row.original.active ? 'success' : 'destructive'}>
                    {row.original.active
                        ? t('pages.course.common.status.active')
                        : t('pages.course.common.status.inactive')}
                </Badge>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const course = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                data-testid={`course-dropdown-${course.id}`}
                                className='h-8 w-8 p-0'
                            >
                                <span className='sr-only'>
                                    {t('components.dropdown_menu.sr_open_menu')}
                                </span>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route(`${ROUTES.COURSES}.show`, course.id)}
                                    data-testid={`course-show-${course.id}`}
                                >
                                    {t('action.show')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route(
                                        `${ROUTES.COURSES}.test-cases.cognitive-levels`,
                                        course.id,
                                    )}
                                    data-testid={`course-cognitive-levels-${course.id}`}
                                >
                                    Manage Cognitive Levels
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route(`${ROUTES.COURSES}.edit`, course.id)}
                                    data-testid={`course-edit-${course.id}`}
                                >
                                    {t('action.edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(course)}
                                data-testid={`course-delete-${course.id}`}
                            >
                                {t('action.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ] as Array<ColumnDef<CourseResource, CourseResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <DataTable
            setFilters={setFilters}
            meta={response?.data?.meta}
            filters={filters}
            filterComponents={(_) => {
                if (roles.includes(RoleEnum.SUPER_ADMIN) || !teachedSchools.length) {
                    return null;
                }

                return (
                    <>
                        <Link
                            href={route(`${ROUTES.COURSES}.create`)}
                            data-testid='course-create-button'
                            className={buttonVariants({ variant: 'create' })}
                        >
                            {t('pages.course.index.buttons.create')}
                        </Link>
                        <Import />
                    </>
                );
            }}
            data={response?.data?.data ?? []}
            columns={memoizedColumns}
            baseRoute={baseRoute}
            baseKey={baseKey}
        />
    );
};

export { Courses };
