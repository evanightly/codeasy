import { FilePondUploader } from '@/Components/FilePondUploader';
import { PDFViewer } from '@/Components/PDFViewer';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/UI/accordion';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/UI/form';
import { Input } from '@/Components/UI/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import { Switch } from '@/Components/UI/switch';
import { Textarea } from '@/Components/UI/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialServiceHook } from '@/Services/learningMaterialServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Create() {
    const { t } = useLaravelReactI18n();
    const params = new URLSearchParams(window.location.search);
    const course_id = params.get('course_id') ?? '';
    const createMutation = learningMaterialServiceHook.useCreate();
    const formSchema = z.object({
        course_id: z
            .string()
            .min(1, t('pages.learning_material.common.validations.course_id.required')), // Changed from min(-1) to min(1)
        title: z.string().min(1, t('pages.learning_material.common.validations.title.required')),
        description: z.string().optional(),
        type: z.nativeEnum(LearningMaterialTypeEnum, {
            errorMap: () => ({
                message: t('pages.learning_material.common.validations.type.required'),
            }),
        }),
        active: z.boolean().default(true),
        file: z.any().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course_id: course_id,
            title: '',
            description: '',
            type: LearningMaterialTypeEnum.LIVE_CODE,
            active: true,
            file: undefined,
        },
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();

        // Explicitly add course_id to ensure it's included
        formData.append('course_id', course_id);

        // Then handle the rest of the values
        Object.entries(values).forEach(([key, value]) => {
            if (key === 'file' && value instanceof File) {
                formData.append(key, value);
            } else if (value !== undefined && value !== null && key !== 'file') {
                formData.append(key, String(value));
            }
        });

        formData.set('active', values.active ? '1' : '0');

        toast.promise(
            createMutation.mutateAsync({
                data: formData,
            }),
            {
                loading: t('pages.learning_material.common.messages.pending.create'),
                success: () => {
                    router.visit(route(`${ROUTES.COURSES}.show`, course_id));
                    return t('pages.learning_material.common.messages.success.create');
                },
                error: t('pages.learning_material.common.messages.error.create'),
            },
        );
    };

    // Function to handle file changes and create preview URL
    const handleFileChange = (file: File | null) => {
        // Clear existing preview URL to prevent memory leaks
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        // Set the file in the form
        form.setValue('file', file);

        // If there's a file, create a preview URL
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setFileType(file.type);
        } else {
            setFileType(null);
        }
    };

    // Clean up object URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    return (
        <AuthenticatedLayout title={t('pages.learning_material.create.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.learning_material.create.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit, (e) => console.log(e))}
                            className='space-y-6'
                        >
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.learning_material.common.fields.title')}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='title'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.learning_material.common.fields.description')}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='description'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.learning_material.common.fields.type')}
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={t(
                                                            'pages.learning_material.common.placeholders.type',
                                                        )}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* Re-ordered to prioritize LIVE_CODE */}
                                                <SelectItem
                                                    value={LearningMaterialTypeEnum.LIVE_CODE}
                                                    key={LearningMaterialTypeEnum.LIVE_CODE}
                                                >
                                                    {t(
                                                        `pages.learning_material.common.types.live_code`,
                                                    )}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='type'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                        <div className='space-y-0.5'>
                                            <FormLabel className='text-base'>
                                                {t('pages.learning_material.common.fields.active')}
                                            </FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                onCheckedChange={field.onChange}
                                                checked={field.value}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                                name='active'
                                control={form.control}
                            />

                            <FormField
                                render={({ field: { onChange, value, ...rest } }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.learning_material.common.fields.file')}
                                        </FormLabel>
                                        <FormControl>
                                            <FilePondUploader
                                                value={value}
                                                onChange={handleFileChange}
                                                maxFileSize='10MB'
                                                acceptedFileTypes={[
                                                    'application/pdf',
                                                    // 'image/*',
                                                    // 'text/*',
                                                    // '.py',
                                                    // '.js',
                                                    // '.java',
                                                    // '.cpp',
                                                    // '.html',
                                                    // '.css',
                                                ]}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='file'
                                control={form.control}
                            />

                            {/* Preview Section */}
                            {previewUrl && (
                                <Accordion type='single' defaultValue='file_preview' collapsible>
                                    <AccordionItem value='file_preview'>
                                        <AccordionTrigger>
                                            {t('pages.learning_material.create.preview')}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className='rounded-md border p-3'>
                                                {fileType === 'application/pdf' ? (
                                                    <PDFViewer
                                                        fileUrl={previewUrl}
                                                        filename={
                                                            form.getValues('file')?.name ||
                                                            t('components.pdf_viewer.document')
                                                        }
                                                    />
                                                ) : fileType?.startsWith('image/') ? (
                                                    <div className='mt-2 flex justify-center'>
                                                        <img
                                                            src={previewUrl}
                                                            className='max-h-96 rounded object-contain'
                                                            alt={t(
                                                                'pages.learning_material.create.preview',
                                                            )}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='rounded bg-gray-50 p-4 text-center text-gray-500'>
                                                        {t(
                                                            'pages.learning_material.create.no_preview_available',
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}

                            <Button
                                type='submit'
                                loading={createMutation.isPending}
                                disabled={createMutation.isPending}
                            >
                                {t('pages.learning_material.create.buttons.create')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
