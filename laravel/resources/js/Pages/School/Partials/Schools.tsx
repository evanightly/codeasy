import { Button, buttonVariants } from '@/Components/UI/button';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { RoleEnum } from '@/Support/Enums/roleEnum';
import { PaginateMeta, PaginateResponse, ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { Link, usePage } from '@inertiajs/react';
import { UseQueryResult } from '@tanstack/react-query';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AssignAdminDialog } from './AssignAdminDialog';
import { AssignStudentDialog } from './AssignStudentDialog';

interface SchoolsProps {
    response?: UseQueryResult<PaginateResponse<SchoolResource>, Error>;
    meta?: PaginateMeta;
    filters?: ServiceFilterOptions;
    setFilters?: (filters: ServiceFilterOptions) => void;
    baseRoute: string;
    baseKey: string;
}

export function Schools({ response, filters, setFilters, baseKey, baseRoute }: SchoolsProps) {
    const { t } = useLaravelReactI18n();
    const { roles } = usePage().props.auth.user;
    const [selectedSchool, setSelectedSchool] = useState<SchoolResource | null>(null);
    const [showAssignAdmin, setShowAssignAdmin] = useState(false);
    const [showAssignStudent, setShowAssignStudent] = useState(false);

    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<SchoolResource>();

    const deleteMutation = schoolServiceHook.useDelete();
    const assignAdminMutation = schoolServiceHook.useAssignAdmin();
    const assignStudentMutation = schoolServiceHook.useAssignStudent();
    const bulkAssignStudentMutation = schoolServiceHook.useBulkAssignStudents();

    const handleDeleteSchool = async (school: SchoolResource) => {
        if (!school.id) return;
        confirmAction(async () => {
            toast.promise(deleteMutation.mutateAsync({ id: school.id }), {
                loading: t('pages.school.common.messages.pending.delete'),
                success: t('pages.school.common.messages.success.delete'),
                error: t('pages.school.common.messages.error.delete'),
            });
        });
    };

    const handleAssignAdmin = async (userIds: number[]) => {
        if (!selectedSchool) return;

        toast.promise(
            assignAdminMutation.mutateAsync({
                id: selectedSchool.id,
                data: { user_ids: userIds },
            }),
            {
                loading: t('pages.school.common.messages.pending.assign_admin'),
                success: () => {
                    setShowAssignAdmin(false);
                    return t('pages.school.common.messages.success.assign_admin');
                },
                error: t('pages.school.common.messages.error.assign_admin'),
            },
        );
    };

    const handleAssignStudent = async (userIds: number[]) => {
        if (!selectedSchool) return;

        if (userIds.length === 1) {
            // Use single assignment for backward compatibility
            toast.promise(
                assignStudentMutation.mutateAsync({
                    id: selectedSchool.id,
                    data: { user_id: userIds[0] },
                }),
                {
                    loading: t('pages.school.common.messages.pending.assign_student'),
                    success: () => {
                        setShowAssignStudent(false);
                        return t('pages.school.common.messages.success.assign_student');
                    },
                    error: t('pages.school.common.messages.error.assign_student'),
                },
            );
        } else {
            // Use bulk assignment for multiple students
            toast.promise(
                bulkAssignStudentMutation.mutateAsync({
                    id: selectedSchool.id,
                    data: { user_ids: userIds },
                }),
                {
                    loading: t('pages.school.common.messages.pending.assign_students'),
                    success: () => {
                        setShowAssignStudent(false);
                        return t('pages.school.common.messages.success.assign_students', {
                            count: userIds.length,
                        });
                    },
                    error: t('pages.school.common.messages.error.assign_students'),
                },
            );
        }
    };

    const columns = [
        columnHelper.accessor('name', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.school.index.columns.name')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('address', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.school.index.columns.address')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('city', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.school.index.columns.city')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('phone', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.school.index.columns.phone')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('email', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.school.index.columns.email')}
                    column={column}
                />
            ),
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const school = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                                <span className='sr-only'>
                                    {t('components.dropdown_menu.sr_open_menu')}
                                </span>
                                <MoreHorizontal className='h-4 w-4' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                                onClick={() => {
                                    if (!roles.includes(RoleEnum.SUPER_ADMIN)) return;
                                    setSelectedSchool(school);
                                    setShowAssignAdmin(true);
                                }}
                                disabled={!roles.includes(RoleEnum.SUPER_ADMIN)}
                            >
                                {t('pages.school.index.actions.assign_admin')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedSchool(school);
                                    setShowAssignStudent(true);
                                }}
                            >
                                {t('pages.school.index.actions.assign_student')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={route(`${ROUTES.SCHOOLS}.show`, school.id)}>
                                    {t('pages.school.index.actions.show')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={route(`${ROUTES.SCHOOLS}.edit`, school.id)}>
                                    {t('pages.school.index.actions.edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteSchool(school)}>
                                {t('pages.school.index.actions.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ] as Array<ColumnDef<SchoolResource, SchoolResource>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <>
            <DataTable
                setFilters={setFilters}
                meta={response?.data?.meta}
                filters={filters}
                filterComponents={(_) => {
                    return (
                        <Link
                            href={route(`${ROUTES.SCHOOLS}.create`)}
                            className={buttonVariants({ variant: 'create' })}
                        >
                            {t('pages.school.index.actions.create')}
                        </Link>
                    );
                }}
                data={response?.data?.data ?? []}
                columns={memoizedColumns}
                baseRoute={baseRoute}
                baseKey={baseKey}
            />

            <AssignAdminDialog
                onClose={() => {
                    setShowAssignAdmin(false);
                    setSelectedSchool(null);
                }}
                onAssign={handleAssignAdmin}
                loading={assignAdminMutation.isPending}
                isOpen={showAssignAdmin}
            />

            {selectedSchool && (
                <AssignStudentDialog
                    school={selectedSchool}
                    onClose={() => {
                        setShowAssignStudent(false);
                        setSelectedSchool(null);
                    }}
                    onAssign={handleAssignStudent}
                    loading={assignStudentMutation.isPending}
                    isOpen={showAssignStudent}
                />
            )}
        </>
    );
}
