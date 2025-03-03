import { FilePondUploader } from '@/Components/FilePondUploader';
import { PDFViewer } from '@/Components/PDFViewer';
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
import { Switch } from '@/Components/UI/switch';
import { Textarea } from '@/Components/UI/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialQuestionServiceHook } from '@/Services/learningMaterialQuestionServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { CourseResource, LearningMaterialResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

function TextFilePreview({ fileUrl }: { fileUrl: string }) {
    const [content, setContent] = useState<string>('Loading...');

    useEffect(() => {
        fetch(fileUrl)
            .then((response) => response.text())
            .then((text) => {
                setContent(text);
            })
            .catch((error) => {
                console.error('Error loading text file:', error);
                setContent('Error loading file content');
            });
    }, [fileUrl]);

    return <>{content}</>;
}

interface Props {
    course: { data: CourseResource };
    learningMaterial: { data: LearningMaterialResource };
}

export default function Create({
    course: { data: courseData },
    learningMaterial: { data: learningMaterialData },
}: Props) {
    const { t } = useLaravelReactI18n();
    const createMutation = learningMaterialQuestionServiceHook.useCreate();
    const params = new URLSearchParams(window.location.search);

    const formSchema = z.object({
        learning_material_id: z
            .string()
            .min(1, t('pages.learning_material_question.common.validations.material_id.required')),
        title: z
            .string()
            .min(1, t('pages.learning_material_question.common.validations.title.required')),
        description: z
            .string()
            .min(1, t('pages.learning_material_question.common.validations.description.required')),
        type: z.nativeEnum(LearningMaterialTypeEnum),
        clue: z.string().optional(),
        active: z.boolean().default(true),
        file: z.any().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            learning_material_id: learningMaterialData?.id?.toString(),
            title: '',
            description: '',
            type: LearningMaterialTypeEnum.LIVE_CODE,
            clue: '',
            active: true,
            file: undefined,
        },
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);

    const handleFileChange = (file: File | null) => {
        // Clear existing preview URL to prevent memory leaks
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

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

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();

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
                loading: t('pages.learning_material_question.common.messages.pending.create'),
                success: () => {
                    router.visit(
                        route(`${ROUTES.COURSE_LEARNING_MATERIALS}.show`, [
                            courseData.id,
                            learningMaterialData.id,
                        ]),
                    );
                    return t('pages.learning_material_question.common.messages.success.create');
                },
                error: t('pages.learning_material_question.common.messages.error.create'),
            },
        );
    };

    const isLiveCode = learningMaterialData.type === LearningMaterialTypeEnum.LIVE_CODE;

    return (
        <AuthenticatedLayout title={t('pages.learning_material_question.create.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.learning_material_question.create.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit, (err) => console.log(err))}
                            className='space-y-6'
                        >
                            {/* Title field */}
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'pages.learning_material_question.common.fields.title',
                                            )}
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

                            {/* Description field */}
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'pages.learning_material_question.common.fields.description',
                                            )}
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

                            {/* Live code specific fields */}
                            {isLiveCode && (
                                <>
                                    <FormField
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t(
                                                        'pages.learning_material_question.common.fields.clue',
                                                    )}
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                <p className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.learning_material_question.common.help.clue',
                                                    )}
                                                </p>
                                            </FormItem>
                                        )}
                                        name='clue'
                                        control={form.control}
                                    />

                                    <FormField
                                        render={({ field: { onChange, value, ...rest } }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t(
                                                        'pages.learning_material_question.common.fields.file',
                                                    )}
                                                </FormLabel>
                                                <FormControl>
                                                    <FilePondUploader
                                                        value={value}
                                                        onChange={handleFileChange}
                                                        maxFileSize='10MB'
                                                        labelIdle={t(
                                                            'components.filepond.labels.label_idle',
                                                        )}
                                                        acceptedFileTypes={[
                                                            'application/pdf',
                                                            'image/jpeg',
                                                            'image/png',
                                                            'image/gif',
                                                        ]}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                <p className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.learning_material_question.common.help.question_file',
                                                    )}
                                                </p>
                                            </FormItem>
                                        )}
                                        name='file'
                                        control={form.control}
                                    />

                                    {/* Preview Section */}
                                    {previewUrl && (
                                        <div className='rounded-md border p-3'>
                                            <h3 className='mb-2 text-lg font-medium'>
                                                {t(
                                                    'pages.learning_material_question.create.preview',
                                                )}
                                            </h3>
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
                                                            'pages.learning_material_question.create.preview',
                                                        )}
                                                    />
                                                </div>
                                            ) : fileType?.startsWith('text/') ||
                                              fileType === 'application/javascript' ||
                                              /\.(py|js|java|cpp|c|html|css)$/.test(
                                                  form.getValues('file')?.name || '',
                                              ) ? (
                                                <div className='mt-2 overflow-auto rounded border bg-gray-50 p-4'>
                                                    <pre className='whitespace-pre-wrap text-sm text-gray-800'>
                                                        <TextFilePreview fileUrl={previewUrl} />
                                                    </pre>
                                                </div>
                                            ) : (
                                                <div className='rounded bg-gray-50 p-4 text-center text-gray-500'>
                                                    {t(
                                                        'pages.learning_material_question.create.no_preview_available',
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Active status field */}
                            <FormField
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                        <div className='space-y-0.5'>
                                            <FormLabel className='text-base'>
                                                {t(
                                                    'pages.learning_material_question.common.fields.active',
                                                )}
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

                            {/* Buttons */}
                            <div className='flex justify-between'>
                                <Button
                                    variant='outline'
                                    type='button'
                                    onClick={() =>
                                        router.visit(
                                            route(`${ROUTES.COURSE_LEARNING_MATERIALS}.show`, [
                                                courseData.id,
                                                learningMaterialData.id,
                                            ]),
                                        )
                                    }
                                >
                                    {t('action.cancel')}
                                </Button>
                                <Button
                                    type='submit'
                                    loading={createMutation.isPending}
                                    disabled={createMutation.isPending}
                                >
                                    {t('pages.learning_material_question.create.buttons.create')}
                                </Button>
                            </div>

                            {/* Test cases information for Live Code questions */}
                            {isLiveCode && (
                                <div className='mt-6 rounded-lg border p-4'>
                                    <h3 className='mb-4 text-lg font-medium'>
                                        {t(
                                            'pages.learning_material_question.create.test_cases.note',
                                        )}
                                    </h3>
                                    <p className='mb-2 text-sm text-muted-foreground'>
                                        {t(
                                            'pages.learning_material_question.create.test_cases.description',
                                        )}
                                    </p>
                                    <p className='text-sm text-muted-foreground'>
                                        {t(
                                            'pages.learning_material_question.create.test_cases.add_later',
                                        )}
                                    </p>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
