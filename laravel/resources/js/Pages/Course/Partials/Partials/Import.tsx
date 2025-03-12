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
        excel_file: null as File | null,
    });

    // Define Zod schema for validation
    const formSchema = z.object({
        excel_file: z
            .instanceof(File, { message: t('validation.required', { attribute: 'file' }) })
            .refine(
                (file) =>
                    [
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.ms-excel',
                    ].includes(file.type),
                { message: t('validation.mimes', { attribute: 'file', values: '.xlsx, .xls' }) },
            )
            .refine((file) => file.size <= 10 * 1024 * 1024, {
                message: t('validation.max.file', { attribute: 'file', max: '10MB' }),
            }),
    });

    // React Hook Form with Zod validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            excel_file: undefined,
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            form.setValue('excel_file', file, { shouldValidate: true });
            inertiaForm.setData('excel_file', file);
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
        formData.append('excel_file', values.excel_file);

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
                            form.setError('excel_file' as any, { message: message as string });
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
                        form.setError('excel_file' as any, { message: message as string });
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
            form.setValue('excel_file', file, { shouldValidate: true });
            inertiaForm.setData('excel_file', file);
        }
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
                            defaultValue: 'Import courses from an Excel file',
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
                                    defaultValue: 'Upload Course Excel File',
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
                                                                'Drag and drop your Excel file here, or click to browse',
                                                        })}
                                                    </p>
                                                    <p className='text-xs text-gray-500'>
                                                        {t(
                                                            'pages.course.import.supported_formats',
                                                            {
                                                                defaultValue:
                                                                    'Supports .xlsx and .xls files up to 10MB',
                                                            },
                                                        )}
                                                    </p>
                                                    <Input
                                                        type='file'
                                                        onChange={handleFileChange}
                                                        className='hidden'
                                                        accept='.xlsx,.xls'
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    name='excel_file'
                                    control={form.control}
                                />

                                {form.watch('excel_file') && (
                                    <div className='mb-4 flex items-center rounded-md bg-background p-3'>
                                        <FileIcon className='mr-2 h-5 w-5' />
                                        <span className='flex-1 truncate text-sm font-medium'>
                                            {form.watch('excel_file').name}
                                        </span>
                                        <span className='text-xs text-gray-500'>
                                            {(form.watch('excel_file').size / 1024 / 1024).toFixed(
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
                                            !form.watch('excel_file') ||
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
                                        defaultValue: 'Keep a backup of your Excel file',
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
