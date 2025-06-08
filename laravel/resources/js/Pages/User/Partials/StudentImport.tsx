import { FilePondUploader } from '@/Components/FilePondUploader';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import { userServiceHook } from '@/Services/userServiceHook';
import 'filepond/dist/filepond.min.css';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChartLine, FileSpreadsheet, Loader2, Upload, Users } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface StudentImportPreview {
    students: Array<{
        name: string;
        email: string;
        nim: string;
        phone?: string;
    }>;
    stats: {
        students: number;
    };
}

interface StudentImportProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const StudentImport = ({ open: propOpen, onOpenChange }: StudentImportProps = {}) => {
    const { t } = useLaravelReactI18n();
    const [internalOpen, setInternalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<StudentImportPreview | null>(null);

    // Use controlled or uncontrolled state
    const open = propOpen !== undefined ? propOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    const downloadTemplateMutation = userServiceHook.useDownloadStudentImportTemplate();
    const downloadCsvTemplateMutation = userServiceHook.useDownloadStudentImportCsvTemplate();
    const importStudentsMutation = userServiceHook.useImportStudents();
    const previewImportMutation = userServiceHook.usePreviewImportStudents();

    const handleDownloadTemplate = () => {
        toast.promise(downloadTemplateMutation.mutateAsync({}), {
            loading: t('pages.user.import.downloading_template', {
                defaultValue: 'Downloading Excel template...',
            }),
            success: () => {
                return t('pages.user.import.download_success', {
                    defaultValue: 'Excel template downloaded successfully',
                });
            },
            error: (error) => {
                console.error('Download template error:', error);
                return t('pages.user.import.download_error', {
                    defaultValue: 'Failed to download Excel template',
                });
            },
        });
    };

    const handleDownloadCsvTemplate = () => {
        toast.promise(downloadCsvTemplateMutation.mutateAsync({}), {
            loading: t('pages.user.import.downloading_csv_template', {
                defaultValue: 'Downloading CSV template...',
            }),
            success: () => {
                return t('pages.user.import.download_csv_success', {
                    defaultValue: 'CSV template downloaded successfully',
                });
            },
            error: (error) => {
                console.error('Download CSV template error:', error);
                return t('pages.user.import.download_csv_error', {
                    defaultValue: 'Failed to download CSV template',
                });
            },
        });
    };

    const handlePreview = useCallback(() => {
        if (!selectedFile) {
            toast.error(
                t('pages.user.import.no_file_selected', {
                    defaultValue: 'Please select a file first',
                }),
            );
            return;
        }

        toast.promise(previewImportMutation.mutateAsync(selectedFile), {
            loading: t('pages.user.import.previewing', {
                defaultValue: 'Previewing import...',
            }),
            success: (data) => {
                setPreviewData(data.data.preview);
                setPreviewOpen(true);
                return t('pages.user.import.preview_success', {
                    defaultValue: 'Preview loaded successfully',
                });
            },
            error: (error) => {
                console.error('Preview error:', error);
                return t('pages.user.import.preview_error', {
                    defaultValue: 'Failed to preview file',
                });
            },
        });
    }, [selectedFile, previewImportMutation, t]);

    const handleImport = useCallback(() => {
        if (!selectedFile) return;

        toast.promise(importStudentsMutation.mutateAsync(selectedFile), {
            loading: t('pages.user.import.importing', {
                defaultValue: 'Importing students...',
            }),
            success: (data) => {
                setPreviewData(null);
                setPreviewOpen(false);
                setSelectedFile(null);
                setOpen(false);
                return t('pages.user.import.import_success', {
                    students: data.data.stats.students,
                    defaultValue: `Successfully imported ${data.data.stats.students} students`,
                });
            },
            error: (error) => {
                console.error('Import error:', error);
                return t('pages.user.import.import_error', {
                    defaultValue: 'Failed to import students',
                });
            },
        });
    }, [selectedFile, importStudentsMutation, t]);

    return (
        <>
            {propOpen === undefined && (
                <Button onClick={() => setOpen(true)}>
                    <Upload />
                    {t('pages.user.import.buttons.open_import', {
                        defaultValue: 'Import Students',
                    })}
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle>
                            {t('pages.user.import.title', {
                                defaultValue: 'Import Students',
                            })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('pages.user.import.description', {
                                defaultValue:
                                    'Import students from an Excel (.xlsx) or CSV (.csv) file. Students will be automatically assigned to your school.',
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    <CardContent className='mt-4 flex flex-col gap-4 p-0'>
                        <Card className='bg-background'>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-base'>
                                    {t('pages.user.import.upload_title', {
                                        defaultValue: 'Upload Student Import File',
                                    })}
                                </CardTitle>
                                <CardDescription></CardDescription>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Button
                                        variant='link'
                                        size='sm'
                                        onClick={handleDownloadTemplate}
                                        disabled={downloadTemplateMutation.isPending}
                                        className='h-auto p-0 text-xs'
                                    >
                                        {downloadTemplateMutation.isPending ? (
                                            <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                                        ) : (
                                            <FileSpreadsheet className='mr-1 h-3 w-3' />
                                        )}
                                        {t('pages.user.import.download_excel_template', {
                                            defaultValue: 'Download Excel Template',
                                        })}
                                    </Button>
                                    <span className='text-muted-foreground'>•</span>
                                    <Button
                                        variant='link'
                                        size='sm'
                                        onClick={handleDownloadCsvTemplate}
                                        disabled={downloadCsvTemplateMutation.isPending}
                                        className='h-auto p-0 text-xs'
                                    >
                                        {downloadCsvTemplateMutation.isPending ? (
                                            <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                                        ) : (
                                            <FileSpreadsheet className='mr-1 h-3 w-3' />
                                        )}
                                        {t('pages.user.import.download_csv_template', {
                                            defaultValue: 'Download CSV Template',
                                        })}
                                    </Button>
                                </div>
                                <div className='mt-1 text-xs'>
                                    {t('pages.user.import.template_description', {
                                        defaultValue:
                                            'Download and fill the template with student data. Supports both Excel (.xlsx) and CSV (.csv) formats.',
                                    })}
                                </div>
                            </CardHeader>
                            <CardContent className='pt-0'>
                                <FilePondUploader
                                    value={selectedFile}
                                    onChange={setSelectedFile}
                                    disabled={
                                        previewImportMutation.isPending ||
                                        importStudentsMutation.isPending
                                    }
                                    acceptedFileTypes={[
                                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                        'application/vnd.ms-excel',
                                        'text/csv',
                                    ]}
                                />
                            </CardContent>
                        </Card>

                        <div className='flex justify-end gap-2'>
                            <Button
                                variant='outline'
                                onClick={() => setOpen(false)}
                                disabled={
                                    previewImportMutation.isPending ||
                                    importStudentsMutation.isPending
                                }
                            >
                                {t('pages.user.import.buttons.cancel', {
                                    defaultValue: 'Cancel',
                                })}
                            </Button>
                            <Button
                                onClick={handlePreview}
                                disabled={
                                    !selectedFile ||
                                    previewImportMutation.isPending ||
                                    importStudentsMutation.isPending
                                }
                            >
                                {previewImportMutation.isPending ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <Upload className='mr-2 h-4 w-4' />
                                )}
                                {t('pages.user.import.buttons.preview', {
                                    defaultValue: 'Preview Import',
                                })}
                            </Button>
                        </div>
                    </CardContent>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>
                            {t('pages.user.import.preview.title', {
                                defaultValue: 'Import Preview',
                            })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('pages.user.import.preview.description', {
                                defaultValue: 'Review the students that will be imported',
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    {previewData && (
                        <div className='mt-2 space-y-4'>
                            {/* Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2 text-sm'>
                                        <ChartLine className='h-4 w-4' />
                                        {t('pages.user.import.preview.stats', {
                                            defaultValue: 'Import Statistics',
                                        })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='text-sm text-muted-foreground'>
                                        {t('pages.user.import.preview.student_count', {
                                            defaultValue: `${previewData.stats?.students} students will be imported`,
                                            count: previewData.stats?.students,
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Students Preview */}
                            {previewData.students.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='flex items-center gap-2 text-sm'>
                                            <Users className='h-4 w-4' />
                                            {t('pages.user.import.preview.students_list', {
                                                defaultValue: 'Students to Import',
                                            })}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='max-h-60 overflow-y-auto'>
                                            <div className='space-y-2'>
                                                {previewData.students.map((student, index) => (
                                                    <div
                                                        key={index}
                                                        className='flex items-center justify-between rounded border p-2 text-sm'
                                                    >
                                                        <div>
                                                            <div className='font-medium'>
                                                                {student.name}
                                                            </div>
                                                            <div className='text-xs text-muted-foreground'>
                                                                {student.email} • NIM: {student.nim}
                                                                {student.phone &&
                                                                    ` • ${student.phone}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className='flex justify-end gap-2'>
                                <Button
                                    variant='outline'
                                    onClick={() => setPreviewOpen(false)}
                                    disabled={importStudentsMutation.isPending}
                                >
                                    {t('pages.user.import.buttons.cancel', {
                                        defaultValue: 'Cancel',
                                    })}
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={importStudentsMutation.isPending}
                                >
                                    {importStudentsMutation.isPending ? (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                        <Upload className='mr-2 h-4 w-4' />
                                    )}
                                    {t('pages.user.import.buttons.confirm_import', {
                                        defaultValue: 'Confirm Import',
                                    })}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StudentImport;
export { StudentImport };
