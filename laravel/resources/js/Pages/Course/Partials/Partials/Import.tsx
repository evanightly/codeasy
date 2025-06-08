import { ImportPreviewDialog } from '@/Components/ImportPreviewDialog';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { CourseImportPreview } from '@/Support/Interfaces/Others';
import { FilePondCallbackProps, FilePondFile } from 'filepond';
import 'filepond/dist/filepond.min.css';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { FileSpreadsheet, ListChecks, Loader2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { FilePond } from 'react-filepond';
import { toast } from 'sonner';

const Import = () => {
    const { t } = useLaravelReactI18n();
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<FilePondFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<CourseImportPreview | null>(null);

    const templateMutation = courseServiceHook.downloadImportTemplate();
    const docxTemplateMutation = courseServiceHook.downloadImportDocxTemplate();
    const courseImportMutation = courseServiceHook.importCourses();
    const previewImportMutation = courseServiceHook.previewImport();

    const handleDownloadTemplate = () => {
        toast.promise(templateMutation.mutateAsync({}), {
            loading: t('pages.course.import.downloading_template', {
                defaultValue: 'Downloading template...',
            }),
            success: (response) => {
                // Create a blob from the response
                const blob = new Blob([response.data], { type: response.headers['content-type'] });

                // Create a temporary URL for the blob
                const url = window.URL.createObjectURL(blob);

                // Create a temporary anchor element
                const link = document.createElement('a');
                link.href = url;

                // Get the filename from Content-Disposition header or use a default
                const contentDisposition = response.headers['content-disposition'];
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                const filename =
                    matches && matches[1]
                        ? matches[1].replace(/['"]/g, '')
                        : 'course_import_template.xlsx';

                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();

                // Clean up
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);

                return t('pages.course.import.download_success', {
                    defaultValue: 'Template downloaded successfully',
                });
            },
            error: () =>
                t('pages.course.import.download_error', {
                    defaultValue: 'Failed to download template',
                }),
        });
    };

    const handleDownloadDocxTemplate = () => {
        toast.promise(docxTemplateMutation.mutateAsync({}), {
            loading: t('pages.course.import.downloading_material_template', {
                defaultValue: 'Downloading DOCX template...',
            }),
            success: (response) => {
                const blob = new Blob([response.data], { type: response.headers['content-type'] });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const contentDisposition = response.headers['content-disposition'];
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(contentDisposition);
                const filename =
                    matches && matches[1]
                        ? matches[1].replace(/['"]/g, '')
                        : 'course_import_template.docx';
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
                return t('pages.course.import.download_material_success', {
                    defaultValue: 'DOCX template downloaded successfully',
                });
            },
            error: () =>
                t('pages.course.import.download_material_error', {
                    defaultValue: 'Failed to download DOCX template',
                }),
        });
    };

    const handleImport = () => {
        if (files.length === 0) {
            toast.error(
                t('pages.course.import.validation.file_required', {
                    defaultValue: 'Please select a file to import',
                }),
            );
            return;
        }

        // Prepare form data with the selected file
        const formData = new FormData();
        const fileData = files[0].file as File;
        formData.append('import_file', fileData);

        // First generate a preview
        toast.promise(previewImportMutation.mutateAsync(formData), {
            loading: t('pages.course.import.previewing', {
                defaultValue: 'Analyzing import file...',
            }),
            success: (response) => {
                if (response.data?.status === 'success') {
                    setPreviewData(response.data.preview);
                    setPreviewOpen(true);
                    return t('pages.course.import.preview_success', {
                        defaultValue: 'Preview generated successfully',
                    });
                } else {
                    throw new Error(response.data?.message || 'Unknown error');
                }
            },
            error: (error) => {
                console.error('Preview error:', error);
                return t('pages.course.import.preview_error', {
                    defaultValue: 'Failed to generate preview',
                });
            },
        });
    };

    const handleConfirmImport = () => {
        if (files.length === 0) return;

        // Prepare form data with the selected file
        const formData = new FormData();
        const fileData = files[0].file as File;
        formData.append('import_file', fileData);

        // Actual import after preview confirmation
        toast.promise(courseImportMutation.mutateAsync(formData), {
            loading: t('pages.course.import.importing', {
                defaultValue: 'Importing courses...',
            }),
            success: (response) => {
                setPreviewOpen(false);
                setOpen(false);
                setFiles([]);
                return t('pages.course.import.import_success', {
                    defaultValue: 'Courses imported successfully',
                });
            },
            error: (error) => {
                console.error('Import error:', error);
                return t('pages.course.import.import_error', {
                    defaultValue: 'Failed to import courses',
                });
            },
        });
    };

    const onProcessFile: FilePondCallbackProps['onprocessfile'] = useCallback(() => {
        // This is a placeholder for any post-processing after file is uploaded to FilePond
    }, []);

    const onUpdateFiles: FilePondCallbackProps['onupdatefiles'] = useCallback((fileItems: any) => {
        setFiles(fileItems);
    }, []);

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Upload />
                {t('pages.course.import.buttons.open_import', {
                    defaultValue: 'Import',
                })}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle>
                            {t('pages.course.import.title', {
                                defaultValue: 'Import Courses',
                            })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('pages.course.import.description', {
                                defaultValue:
                                    'Import courses from an Excel file or ZIP archive containing Excel and related files',
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    <CardContent className='flex flex-col gap-4'>
                        <Card className='bg-background'>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-base'>
                                    {t('pages.course.import.upload_title', {
                                        defaultValue: 'Upload Course Import File',
                                    })}
                                </CardTitle>
                                <CardDescription>
                                    <Button
                                        variant='link'
                                        size='sm'
                                        onClick={handleDownloadTemplate}
                                        disabled={templateMutation.isPending}
                                        className='h-auto p-0 text-xs'
                                    >
                                        {templateMutation.isPending ? (
                                            <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                                        ) : (
                                            <FileSpreadsheet className='mr-1 h-3 w-3' />
                                        )}
                                        {t('pages.course.import.download_template', {
                                            defaultValue: 'Download Template',
                                        })}
                                    </Button>
                                    <Button
                                        variant='link'
                                        size='sm'
                                        onClick={handleDownloadDocxTemplate}
                                        disabled={docxTemplateMutation.isPending}
                                        className='ml-2 h-auto p-0 text-xs'
                                    >
                                        {docxTemplateMutation.isPending ? (
                                            <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                                        ) : (
                                            <FileSpreadsheet className='mr-1 h-3 w-3' />
                                        )}
                                        {t('pages.course.import.download_material_template', {
                                            defaultValue: 'Download DOCX Template',
                                        })}
                                    </Button>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='pb-2'>
                                <FilePond
                                    onupdatefiles={onUpdateFiles}
                                    onprocessfile={onProcessFile}
                                    maxFiles={1}
                                    labelIdle={t('pages.course.import.drag_drop', {
                                        defaultValue:
                                            'Drag and drop your Excel file or ZIP archive here, or click to browse',
                                    })}
                                    files={files.map((file) => file.file)}
                                    credits={false}
                                    allowRevert={false}
                                    allowMultiple={false}
                                    acceptedFileTypes={[
                                        'application/vnd.ms-excel',
                                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                        'application/zip',
                                        'application/x-zip-compressed',
                                    ]}
                                />
                                <p className='mt-2 text-center text-xs text-muted-foreground'>
                                    {t('pages.course.import.supported_formats', {
                                        defaultValue:
                                            'Supports .xlsx, .xls and .zip files up to 50MB',
                                    })}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className='bg-background'>
                            <CardHeader className='pb-2'>
                                <CardTitle className='text-base'>
                                    {t('pages.course.import.instructions_title', {
                                        defaultValue: 'Instructions',
                                    })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className='ml-6 list-disc text-sm text-muted-foreground [&>li]:mt-2'>
                                    <li>
                                        {t('pages.course.import.instructions.download', {
                                            defaultValue:
                                                'Download the template and fill in your course data',
                                        })}
                                    </li>
                                    <li>
                                        {t('pages.course.import.instructions.identifiers', {
                                            defaultValue:
                                                'You can use classroom names and teacher emails instead of IDs',
                                        })}
                                    </li>
                                    <li>
                                        {t('pages.course.import.instructions.materials', {
                                            defaultValue:
                                                'Materials must reference courses by name',
                                        })}
                                    </li>
                                    <li>
                                        {t('pages.course.import.instructions.questions', {
                                            defaultValue:
                                                'Questions must reference materials by title and include the course name',
                                        })}
                                    </li>
                                    <li>
                                        {t('pages.course.import.instructions.test_cases', {
                                            defaultValue:
                                                'Test cases must reference questions by title and include the material title and course name',
                                        })}
                                    </li>
                                    <li>
                                        {t('pages.course.import.instructions.order', {
                                            defaultValue:
                                                'Fill out sheets in order: Courses → Materials → Questions → TestCases',
                                        })}
                                    </li>
                                    <li>
                                        {t('pages.course.import.instructions.backup', {
                                            defaultValue:
                                                'Keep a backup of your Excel file and attachments',
                                        })}
                                    </li>
                                    <li>
                                        {t('pages.course.import.instructions.zip_use', {
                                            defaultValue:
                                                'For file attachments, use a ZIP file containing both Excel and referenced files',
                                        })}
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <div className='flex justify-end space-x-2'>
                            <Button
                                variant='default'
                                type='button'
                                onClick={handleImport}
                                disabled={files.length === 0}
                            >
                                <ListChecks className='mr-2 h-4 w-4' />
                                {t('pages.course.import.buttons.import', {
                                    defaultValue: 'Import Courses',
                                })}
                            </Button>
                        </div>
                    </CardContent>
                </DialogContent>
            </Dialog>

            {/* Import Preview Dialog */}
            <ImportPreviewDialog
                previewData={previewData}
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                onConfirmImport={handleConfirmImport}
                isLoading={courseImportMutation.isPending}
            />
        </>
    );
};

export default Import;
