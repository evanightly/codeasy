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
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
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
    learningMaterialQuestion: { data: LearningMaterialQuestionResource };
}

export default function Edit({
    course: { data: courseData },
    learningMaterial: { data: learningMaterialData },
    learningMaterialQuestion: { data: questionData },
}: Props) {
    const { t } = useLaravelReactI18n();
    const updateMutation = learningMaterialQuestionServiceHook.useUpdate();

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
        _method: z.string().default('PUT'),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            learning_material_id: learningMaterialData.id?.toString(),
            title: questionData.title,
            description: questionData.description,
            type: questionData.type as LearningMaterialTypeEnum,
            clue: questionData.clue || '',
            active: questionData.active,
            file: undefined,
            _method: 'PUT',
        },
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(questionData.file_url || null);
    const [fileType, setFileType] = useState<string | null>(
        questionData.file_url?.endsWith('.pdf') ? 'application/pdf' : null,
    );
    const [newFileUploaded, setNewFileUploaded] = useState(false);

    const handleFileChange = (file: File | null) => {
        // Clear existing preview URL to prevent memory leaks
        if (previewUrl && newFileUploaded) {
            URL.revokeObjectURL(previewUrl);
        }

        form.setValue('file', file);

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setFileType(file.type);
            setNewFileUploaded(true);
        } else if (!newFileUploaded && questionData.file_url) {
            // Reset to original file if exists
            setPreviewUrl(questionData.file_url);
            setFileType(
                questionData.file_url?.endsWith('.pdf')
                    ? 'application/pdf'
                    : questionData.file_url?.match(/\.(txt|py|js|java|cpp|c|html|css)$/)
                      ? 'text/plain'
                      : null,
            );
        } else {
            setPreviewUrl(null);
            setFileType(null);
        }
    };

    // Clean up object URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl && newFileUploaded) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, newFileUploaded]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        Object.entries(values).forEach(([key, value]) => {
            if (key === 'file' && value instanceof File) {
                formData.append(key, value);
            } else if (
                value !== undefined &&
                value !== null &&
                key !== 'file' &&
                key !== '_method'
            ) {
                formData.append(key, String(value));
            }
        });

        formData.set('active', values.active ? '1' : '0');

        toast.promise(
            updateMutation.mutateAsync({
                id: questionData.id,
                data: formData,
            }),
            {
                loading: t('pages.learning_material_question.common.messages.pending.update'),
                success: () => {
                    router.visit(
                        route(`${ROUTES.COURSE_LEARNING_MATERIALS}.show`, [
                            courseData.id,
                            learningMaterialData.id,
                        ]),
                    );
                    return t('pages.learning_material_question.common.messages.success.update');
                },
                error: t('pages.learning_material_question.common.messages.error.update'),
            },
        );
    };

    const isLiveCode = learningMaterialData.type === LearningMaterialTypeEnum.LIVE_CODE;

    return (
        <AuthenticatedLayout title={t('pages.learning_material_question.edit.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.learning_material_question.edit.title')}</CardTitle>
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
                                                            // 'text/plain',
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
                                                {questionData.file_url && !newFileUploaded && (
                                                    <p className='text-sm text-muted-foreground'>
                                                        {t(
                                                            'pages.learning_material_question.edit.current_file',
                                                        )}
                                                        : {questionData.file}
                                                    </p>
                                                )}
                                                <p className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.learning_material_question.common.help.starter_code',
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
                                                {newFileUploaded
                                                    ? t(
                                                          'pages.learning_material_question.edit.new_file_preview',
                                                      )
                                                    : t(
                                                          'pages.learning_material_question.edit.current_file_preview',
                                                      )}
                                            </h3>
                                            {fileType === 'application/pdf' ? (
                                                <PDFViewer
                                                    withPagination={true}
                                                    fileUrl={previewUrl}
                                                    filename={
                                                        newFileUploaded
                                                            ? form.getValues('file')?.name
                                                            : questionData.file ||
                                                              t('components.pdf_viewer.document')
                                                    }
                                                />
                                            ) : fileType?.startsWith('image/') ? (
                                                <div className='mt-2 flex justify-center'>
                                                    <img
                                                        src={previewUrl}
                                                        className='max-h-96 rounded object-contain'
                                                        alt={t(
                                                            'pages.learning_material_question.edit.preview',
                                                        )}
                                                    />
                                                </div>
                                            ) : fileType?.startsWith('text/') ||
                                              fileType === 'application/javascript' ||
                                              /\.(py|js|java|cpp|c|html|css)$/.test(
                                                  (newFileUploaded
                                                      ? form.getValues('file')?.name
                                                      : questionData.file) || '',
                                              ) ? (
                                                <div className='mt-2 overflow-auto rounded border bg-gray-50 p-4'>
                                                    <pre className='whitespace-pre-wrap text-sm text-gray-800'>
                                                        <TextFilePreview fileUrl={previewUrl} />
                                                    </pre>
                                                </div>
                                            ) : (
                                                <div className='rounded bg-gray-50 p-4 text-center text-gray-500'>
                                                    {t(
                                                        'pages.learning_material_question.edit.no_preview_available',
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
                                    loading={updateMutation.isPending}
                                    disabled={updateMutation.isPending}
                                >
                                    {t('pages.learning_material_question.edit.buttons.update')}
                                </Button>
                            </div>

                            {/* Test cases information for Live Code questions */}
                            {isLiveCode && (
                                <div className='mt-6 rounded-lg border p-4'>
                                    <h3 className='mb-4 text-lg font-medium'>
                                        {t(
                                            'pages.learning_material_question.edit.test_cases.title',
                                        )}
                                    </h3>
                                    <p className='mb-2 text-sm text-muted-foreground'>
                                        {t(
                                            'pages.learning_material_question.edit.test_cases.description',
                                        )}
                                    </p>

                                    <div className='mt-4'>
                                        <Button
                                            variant='outline'
                                            type='button'
                                            onClick={() =>
                                                router.visit(
                                                    route(
                                                        `${ROUTES.LEARNING_MATERIAL_QUESTIONS}.test-cases.index`,
                                                        questionData.id,
                                                    ),
                                                )
                                            }
                                        >
                                            {t(
                                                'pages.learning_material_question.edit.test_cases.manage_button',
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
