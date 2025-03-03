import CodeEditor from '@/Components/CodeEditor';
import { FilePondUploader } from '@/Components/FilePondUploader';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/UI/form';
import { Switch } from '@/Components/UI/switch';
import { Textarea } from '@/Components/UI/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialQuestionTestCaseServiceHook } from '@/Services/learningMaterialQuestionTestCaseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
    course: {
        data: CourseResource;
    };
    learningMaterial: {
        data: LearningMaterialResource;
    };
    question: {
        data: LearningMaterialQuestionResource;
    };
}

export default function Create({
    question: { data: question },
    course: { data: course },
    learningMaterial: { data: learningMaterial },
}: Props) {
    const { t } = useLaravelReactI18n();
    const createMutation = learningMaterialQuestionTestCaseServiceHook.useCreate();

    const formSchema = z.object({
        learning_material_question_id: z.number(),
        description: z
            .string()
            .min(
                1,
                t(
                    'pages.learning_material_question_test_case.common.validations.description.required',
                    { defaultValue: 'Description is required' },
                ),
            ),
        input: z.string(),
        expected_output_file: z.any().optional(),
        hidden: z.boolean().default(false),
        active: z.boolean().default(true),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            learning_material_question_id: question.id,
            description: '',
            input: '',
            expected_output_file: undefined,
            hidden: false,
            active: true,
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();
        formData.append(
            'learning_material_question_id',
            values.learning_material_question_id.toString(),
        );

        // Add other fields to form data
        formData.append('description', values.description);
        formData.append('input', values.input);
        formData.append('hidden', values.hidden ? '1' : '0');
        formData.append('active', values.active ? '1' : '0');

        // Handle file upload
        if (values.expected_output_file instanceof File) {
            formData.append('expected_output_file', values.expected_output_file);
        }

        // debug form data
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }

        toast.promise(
            createMutation.mutateAsync({
                data: formData,
            }),
            {
                loading: t(
                    'pages.learning_material_question_test_case.common.messages.pending.create',
                    { defaultValue: 'Creating test case...' },
                ),
                success: () => {
                    router.visit(
                        route(`${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.index`, {
                            course: course.id,
                            learningMaterial: learningMaterial.id,
                            question: question.id,
                        }),
                    );
                    return t(
                        'pages.learning_material_question_test_case.common.messages.success.create',
                        { defaultValue: 'Test case created successfully' },
                    );
                },
                error: (err) => {
                    console.error(err);
                    return t(
                        'pages.learning_material_question_test_case.common.messages.error.create',
                        { defaultValue: 'Failed to create test case' },
                    );
                },
            },
        );
    };

    return (
        <AuthenticatedLayout title={t('pages.learning_material_question_test_case.create.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {t('pages.learning_material_question_test_case.create.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'pages.learning_material_question_test_case.common.fields.description',
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            {t(
                                                'pages.learning_material_question_test_case.common.help.description',
                                                {
                                                    defaultValue:
                                                        'Describe what this test case is checking for.',
                                                },
                                            )}
                                        </FormDescription>
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
                                            {t(
                                                'pages.learning_material_question_test_case.common.fields.input',
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <CodeEditor
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                language='python'
                                                height='200px'
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t(
                                                'pages.learning_material_question_test_case.common.help.input',
                                                {
                                                    defaultValue:
                                                        'Enter code or sample input for testing the question',
                                                },
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='input'
                                control={form.control}
                            />

                            <FormField
                                render={({ field: { onChange, value, ...rest } }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'pages.learning_material_question_test_case.common.fields.expected_output',
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <FilePondUploader
                                                value={value as any}
                                                onChange={(file) => onChange(file)}
                                                maxFileSize='5MB'
                                                acceptedFileTypes={[
                                                    'application/pdf',
                                                    'image/*',
                                                    '.pdf',
                                                    '.jpg',
                                                    '.jpeg',
                                                    '.png',
                                                ]}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t(
                                                'pages.learning_material_question_test_case.common.help.expected_output',
                                                {
                                                    defaultValue:
                                                        'Upload a PDF or image file showing the expected output for this test case.',
                                                },
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='expected_output_file'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                        <div className='space-y-0.5'>
                                            <FormLabel>
                                                {t(
                                                    'pages.learning_material_question_test_case.common.fields.hidden',
                                                )}
                                            </FormLabel>
                                            <FormDescription>
                                                {t(
                                                    'pages.learning_material_question_test_case.common.help.hidden',
                                                )}
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                onCheckedChange={field.onChange}
                                                checked={field.value}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                                name='hidden'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                        <div className='space-y-0.5'>
                                            <FormLabel>
                                                {t(
                                                    'pages.learning_material_question_test_case.common.fields.active',
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

                            <Button
                                type='submit'
                                loading={createMutation.isPending}
                                disabled={createMutation.isPending}
                            >
                                {t(
                                    'pages.learning_material_question_test_case.create.buttons.create',
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
