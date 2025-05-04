import { Button } from '@/Components/UI/button';
import { DataTable } from '@/Components/UI/data-table';
import { DataTableColumnHeader } from '@/Components/UI/data-table-column-header';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/UI/dropdown-menu';
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import { studentCognitiveClassificationServiceHook } from '@/Services/studentCognitiveClassificationServiceHook';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { StudentCognitiveClassificationResource } from '@/Support/Interfaces/Resources';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { MoreHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ClassificationDetails } from './ClassificationDetails';

interface ClassificationsProps {
    baseRoute: string;
    baseKey: string;
}

export function Classifications({ baseRoute, baseKey }: ClassificationsProps) {
    const { t } = useLaravelReactI18n();
    const confirmAction = useConfirmation();
    const columnHelper = createColumnHelper<StudentCognitiveClassificationResource>();
    const [filters, setFilters] = useState<ServiceFilterOptions>({
        page: 1,
        page_size: 10,
        relations: 'user,course',
    });

    const response = studentCognitiveClassificationServiceHook.useGetAll({ filters });
    const deleteMutation = studentCognitiveClassificationServiceHook.useDelete();

    const handleDelete = async (classification: StudentCognitiveClassificationResource) => {
        if (!classification.id) return;
        confirmAction(
            async () => {
                toast.promise(deleteMutation.mutateAsync({ id: classification.id }), {
                    loading: t('pages.student_cognitive_classification.messages.deleting'),
                    success: t('pages.student_cognitive_classification.messages.delete_success'),
                    error: t('pages.student_cognitive_classification.messages.delete_error'),
                });
            },
            {
                confirmationTitle: t('pages.student_cognitive_classification.dialogs.delete.title'),
                confirmationMessage: t(
                    'pages.student_cognitive_classification.dialogs.delete.description',
                ),
            },
        );
    };

    const columns = [
        columnHelper.accessor('id', {
            header: ({ column }) => <DataTableColumnHeader title='ID' column={column} />,
        }),
        columnHelper.accessor('user.name', {
            id: 'user_name',
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_cognitive_classification.columns.student')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('course.name', {
            id: 'course_name',
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_cognitive_classification.columns.course')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('classification_type', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_cognitive_classification.columns.classification_type')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('classification_level', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_cognitive_classification.columns.classification_level')}
                    column={column}
                />
            ),
        }),
        columnHelper.accessor('classification_score', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_cognitive_classification.columns.classification_score')}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                return parseFloat(row.original.classification_score.toString()).toFixed(2);
            },
        }),
        columnHelper.accessor('classified_at', {
            header: ({ column }) => (
                <DataTableColumnHeader
                    title={t('pages.student_cognitive_classification.columns.classified_at')}
                    column={column}
                />
            ),
            cell: ({ row }) => {
                return new Date(row.original.classified_at).toLocaleString();
            },
        }),
        columnHelper.display({
            id: 'actions',
            cell: ({ row }) => {
                const classification = row.original;

                return (
                    <div className='flex items-center space-x-2'>
                        <ClassificationDetails classificationId={row.original.id} />
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
                                <DropdownMenuItem onClick={() => handleDelete(classification)}>
                                    {t('action.delete')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        }),
    ] as Array<ColumnDef<StudentCognitiveClassificationResource, any>>;

    const memoizedColumns = useMemo(() => columns, []);

    return (
        <DataTable
            setFilters={setFilters}
            meta={response?.data?.meta}
            filters={filters}
            data={response?.data?.data ?? []}
            columns={memoizedColumns}
            baseRoute={baseRoute}
            baseKey={baseKey}
        />
    );
}
