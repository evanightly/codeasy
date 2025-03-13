import { Button } from '@/Components/UI/button';
import { Card, CardContent } from '@/Components/UI/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/UI/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/Components/UI/form';
import { Input } from '@/Components/UI/input';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm as useInertiaForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { FileIcon, UploadIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface ImportProps {
    errors?: Record<string, string>;
    stats?: {
        courses: number;
        materials: number;
        questions: number;
        testCases: number;
    };
    message?: string;
    status?: 'success' | 'error';
}

export default function Import({ errors, stats, message, status }: ImportProps) {
    const { t } = useLaravelReactI18n();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const courseImportMutation = courseServiceHook.importCourses();
    const courseDownloadImportTemplateMutation = courseServiceHook.downloadImportTemplate();

    // Inertia form for file upload progress
    const inertiaForm = useInertiaForm({
        import_file: null as File | null,
    });

    // Define Zod schema for validation
    const formSchema = z.object({
        import_file: z
            .instanceof(File, { message: t('validation.required', { attribute: 'file' }) })
            .refine(
                (file) =>
                    [
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.ms-excel',
                        'application/zip',
                        'application/x-zip-compressed',
                        'multipart/x-zip',
                    ].includes(file.type) ||
                    file.name.endsWith('.xlsx') ||
                    file.name.endsWith('.xls') ||
                    file.name.endsWith('.zip'),
                {
                    message: t('validation.mimes', {
                        attribute: 'file',
                        values: '.xlsx, .xls, .zip',
                    }),
                },
            )
            .refine((file) => file.size <= 50 * 1024 * 1024, {
                message: t('validation.max.file', { attribute: 'file', max: '50MB' }),
            }),
    });

    // React Hook Form with Zod validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            import_file: undefined,
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            form.setValue('import_file', file, { shouldValidate: true });
            inertiaForm.setData('import_file', file);
        }
    };

    const handleDownload = () => {
        toast.promise(courseDownloadImportTemplateMutation.mutateAsync({}), {
            loading: t('pages.course.import.downloading_template', {
                defaultValue: 'Downloading template...',
            }),
            success: (res) => {
                // Handle the blob response correctly
                const blob = new Blob([res.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;

                // Extract filename from Content-Disposition header if available
                let filename = 'course_import_template.xlsx';
                const disposition = res.headers?.['content-disposition'];
                if (disposition) {
                    const filenameMatch = disposition.match(
                        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
                    );
                    if (filenameMatch && filenameMatch[1]) {
                        filename = filenameMatch[1].replace(/['"]/g, '');
                    }
                }

                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(link);
                return t('pages.course.import.download_success', {
                    defaultValue: 'Template downloaded successfully',
                });
            },
            error: t('pages.course.import.download_error', {
                defaultValue: 'Failed to download template',
            }),
        });
    };

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();
        formData.append('import_file', values.import_file);

        toast.promise(courseImportMutation.mutateAsync(formData), {
            loading: t('pages.course.import.importing', {
                defaultValue: 'Importing courses...',
            }),
            success: (response) => {
                console.log('success', response);

                // Check if we got an error status in the response
                if (response.data?.status === 'error') {
                    // Handle API errors with success HTTP status but error in payload
                    if (response.data?.errors) {
                        Object.entries(response.data.errors).forEach(([key, messages]) => {
                            const message = Array.isArray(messages) ? messages[0] : messages;
                            form.setError('import_file' as any, { message: message as string });
                        });
                    }

                    throw new Error(response.data.message || 'Import failed');
                }

                return t('pages.course.import.import_success', {
                    defaultValue: 'Courses imported successfully',
                });
            },
            error: (err) => {
                console.log('error', err);
                // Display validation errors
                if (err.response?.data?.errors) {
                    Object.entries(err.response.data.errors).forEach(([key, messages]) => {
                        const message = Array.isArray(messages) ? messages[0] : messages;
                        form.setError('import_file' as any, { message: message as string });
                    });
                }

                return t('pages.course.import.import_error', {
                    defaultValue: 'Failed to import courses',
                });
            },
        });
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            form.setValue('import_file', file, { shouldValidate: true });
            inertiaForm.setData('import_file', file);
        }
    };

    // Get file type label for display
    const getFileTypeLabel = (file?: File) => {
        if (!file) return '';

        if (
            file.name.endsWith('.zip') ||
            file.type === 'application/zip' ||
            file.type === 'application/x-zip-compressed' ||
            file.type === 'multipart/x-zip'
        ) {
            return 'ZIP';
        } else if (
            file.name.endsWith('.xlsx') ||
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            return 'Excel (XLSX)';
        } else if (file.name.endsWith('.xls') || file.type === 'application/vnd.ms-excel') {
            return 'Excel (XLS)';
        }

        return file.type;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    {t('pages.course.import.buttons.open_import', { defaultValue: 'Import' })}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t('pages.course.import.title', { defaultValue: 'Import Courses' })}
                    </DialogTitle>
                    <DialogDescription>
                        {t('pages.course.import.description', {
                            defaultValue:
                                'Import courses from an Excel file or ZIP archive containing Excel and related files',
                        })}
                    </DialogDescription>
                </DialogHeader>
                <Card className='mx-auto max-w-4xl'>
                    <CardContent className='mt-6'>
                        {status === 'success' && (
                            <div className='mb-6 rounded-md bg-green-50 p-4 text-green-800'>
                                <p>{message}</p>
                                {stats && (
                                    <div className='mt-2'>
                                        <p>
                                            {t('pages.course.import.stats', {
                                                defaultValue:
                                                    'Imported: {courses} courses, {materials} materials, {questions} questions, {testCases} test cases',
                                                courses: stats.courses,
                                                materials: stats.materials,
                                                questions: stats.questions,
                                                testCases: stats.testCases,
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {status === 'error' && (
                            <div className='mb-6 rounded-md bg-red-50 p-4 text-red-800'>
                                <p>{message}</p>
                                {errors && Object.keys(errors).length > 0 && (
                                    <div className='mt-2'>
                                        <strong>
                                            {t('pages.course.import.errors', {
                                                defaultValue: 'Errors:',
                                            })}
                                        </strong>
                                        <ul className='list-inside list-disc'>
                                            {Object.entries(errors).map(([key, error]) => (
                                                <li key={key}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className='mb-6 flex items-center justify-between'>
                            <h3 className='text-lg font-semibold'>
                                {t('pages.course.import.upload_title', {
                                    defaultValue: 'Upload Course Import File',
                                })}
                            </h3>
                            <Button
                                onClick={handleDownload}
                                className='inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700'
                            >
                                <FileIcon className='mr-2 h-4 w-4' />
                                {t('pages.course.import.download_template', {
                                    defaultValue: 'Download Template',
                                })}
                            </Button>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    render={({ field: { onChange, value, ...field } }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div
                                                    onDrop={handleDrop}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                                                        isDragging
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-gray-300'
                                                    } p-6 transition-colors duration-200`}
                                                >
                                                    <UploadIcon className='mb-2 h-8 w-8 text-gray-500' />
                                                    <p className='mb-2 text-center text-sm text-gray-700'>
                                                        {t('pages.course.import.drag_drop', {
                                                            defaultValue:
                                                                'Drag and drop your Excel file or ZIP archive here, or click to browse',
                                                        })}
                                                    </p>
                                                    <p className='text-xs text-gray-500'>
                                                        {t(
                                                            'pages.course.import.supported_formats',
                                                            {
                                                                defaultValue:
                                                                    'Supports .xlsx, .xls and .zip files up to 50MB',
                                                            },
                                                        )}
                                                    </p>
                                                    <Input
                                                        type='file'
                                                        // ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                        className='hidden'
                                                        accept='.xlsx,.xls,.zip'
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    name='import_file'
                                    control={form.control}
                                />

                                {form.watch('import_file') && (
                                    <div className='mb-4 flex items-center rounded-md bg-background p-3'>
                                        <FileIcon className='mr-2 h-5 w-5' />
                                        <span className='flex-1 truncate text-sm font-medium'>
                                            {form.watch('import_file').name}
                                        </span>
                                        <span className='ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800'>
                                            {getFileTypeLabel(form.watch('import_file'))}
                                        </span>
                                        <span className='ml-2 text-xs text-gray-500'>
                                            {(form.watch('import_file').size / 1024 / 1024).toFixed(
                                                2,
                                            )}{' '}
                                            MB
                                        </span>
                                    </div>
                                )}

                                {inertiaForm.progress && (
                                    <div className='mb-4'>
                                        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200'>
                                            <div
                                                style={{
                                                    width: `${inertiaForm.progress.percentage}%`,
                                                }}
                                                className='h-full bg-blue-600 transition-all duration-300'
                                            />
                                        </div>
                                        <p className='mt-1 text-right text-xs text-gray-500'>
                                            {inertiaForm.progress.percentage}%
                                        </p>
                                    </div>
                                )}

                                <div className='mt-4 flex justify-end'>
                                    <Button
                                        type='submit'
                                        loading={courseImportMutation.isPending}
                                        disabled={
                                            !form.watch('import_file') ||
                                            courseImportMutation.isPending
                                        }
                                    >
                                        {t('pages.course.import.buttons.import', {
                                            defaultValue: 'Import Courses',
                                        })}
                                    </Button>
                                </div>
                            </form>
                        </Form>

                        <div className='mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700'>
                            <h4 className='mb-2 font-semibold'>
                                {t('pages.course.import.instructions_title', {
                                    defaultValue: 'Instructions',
                                })}
                            </h4>
                            <ul className='list-disc space-y-1 pl-5 text-sm'>
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
                                        defaultValue: 'Materials must reference courses by name',
                                    })}
                                </li>
                                <li>
                                    {t('pages.course.import.instructions.zip_use', {
                                        defaultValue:
                                            'For file attachments, use a ZIP file containing both Excel and referenced files',
                                    })}
                                </li>
                                <li>
                                    {t('pages.course.import.instructions.file_references', {
                                        defaultValue:
                                            'In Excel, add file paths relative to the ZIP root (e.g., "materials/lecture1.pdf")',
                                    })}
                                </li>
                                <li>
                                    {t('pages.course.import.instructions.backup', {
                                        defaultValue:
                                            'Keep a backup of your Excel file and attachments',
                                    })}
                                </li>
                                <li>
                                    {t('pages.course.import.instructions.file_handling', {
                                        defaultValue:
                                            'Referenced files are stored with unique names - you only need to specify the path within the ZIP',
                                    })}
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
