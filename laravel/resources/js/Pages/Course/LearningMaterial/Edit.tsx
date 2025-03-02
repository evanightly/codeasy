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
import { CourseResource, LearningMaterialResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
    course: CourseResource;
    learningMaterial: LearningMaterialResource;
}

export default function Edit({ course, learningMaterial }: Props) {
    const { t } = useLaravelReactI18n();
    const updateMutation = learningMaterialServiceHook.useUpdate();

    const formSchema = z.object({
        course_id: z.string().min(1),
        title: z.string().min(1, t('pages.learning_material.common.validations.title.required')),
        description: z.string().optional(),
        type: z.nativeEnum(LearningMaterialTypeEnum),
        active: z.boolean().default(true),
        file: z.any().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course_id: course.id.toString(),
            title: learningMaterial.title || '',
            description: learningMaterial.description || '',
            type:
                (learningMaterial.type as LearningMaterialTypeEnum) ||
                LearningMaterialTypeEnum.LIVE_CODE,
            active: learningMaterial.active || true,
            file: undefined,
        },
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(learningMaterial.file_url || null);
    const [fileType, setFileType] = useState<string | null>(
        learningMaterial.file_extension ? `application/${learningMaterial.file_extension}` : null,
    );

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
            updateMutation.mutateAsync({
                id: learningMaterial.id,
                data: formData,
            }),
            {
                loading: t('pages.learning_material.common.messages.pending.update'),
                success: () => {
                    router.visit(
                        route(`${ROUTES.COURSE_LEARNING_MATERIALS}.show`, [
                            course.id,
                            learningMaterial.id,
                        ]),
                    );
                    return t('pages.learning_material.common.messages.success.update');
                },
                error: t('pages.learning_material.common.messages.error.update'),
            },
        );
    };

    const handleFileChange = (file: File | null) => {
        if (previewUrl && previewUrl !== learningMaterial.file_url) {
            URL.revokeObjectURL(previewUrl);
        }

        form.setValue('file', file);

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setFileType(file.type);
        } else {
            setPreviewUrl(learningMaterial?.file_url || null);
            setFileType(
                learningMaterial.file_extension
                    ? `application/${learningMaterial.file_extension}`
                    : null,
            );
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl !== learningMaterial.file_url) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, learningMaterial.file_url]);

    return (
        <AuthenticatedLayout
            title={`${t('pages.learning_material.edit.title')} - ${learningMaterial.title}`}
        >
            <Head
                title={`${t('pages.learning_material.edit.title')} - ${learningMaterial.title}`}
            />

            <Card>
                <CardHeader>
                    <CardTitle>
                        {t('pages.learning_material.edit.title')}: {learningMaterial.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
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
                                            {t('pages.learning_material.common.fields.file')} (
                                            {t('pages.learning_material.edit.file_help')})
                                        </FormLabel>
                                        <FormControl>
                                            <FilePondUploader
                                                value={value}
                                                onChange={handleFileChange}
                                                maxFileSize='10MB'
                                                acceptedFileTypes={['application/pdf']}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='file'
                                control={form.control}
                            />

                            {previewUrl && (
                                <div className='rounded-md border p-3'>
                                    <h3 className='mb-2 font-medium'>
                                        {t('pages.learning_material.edit.current_file')}
                                    </h3>
                                    {fileType === 'application/pdf' ? (
                                        <PDFViewer
                                            fileUrl={previewUrl}
                                            filename={`${learningMaterial.title}.pdf`}
                                        />
                                    ) : (
                                        <div className='flex justify-center p-4 text-center'>
                                            <a
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                href={previewUrl}
                                                className='text-blue-600 hover:underline'
                                            >
                                                {t('pages.learning_material.edit.view_file')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className='flex justify-between'>
                                <Button
                                    variant='outline'
                                    type='button'
                                    onClick={() =>
                                        router.visit(
                                            route(`${ROUTES.COURSE_LEARNING_MATERIALS}.show`, [
                                                course.id,
                                                learningMaterial.id,
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
                                    {t('pages.learning_material.edit.buttons.update')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
