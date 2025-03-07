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
import { learningMaterialQuestionTestCaseServiceHook } from '@/Services/learningMaterialQuestionTestCaseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import {
    ProgrammingLanguageEnum,
    programmingLanguageLabels,
} from '@/Support/Enums/programmingLanguageEnum';
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialQuestionTestCaseResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect } from 'react';
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
    testCase: {
        data: LearningMaterialQuestionTestCaseResource;
    };
}

export default function Edit({
    course: { data: course },
    learningMaterial: { data: learningMaterial },
    question: { data: question },
    testCase: { data: testCase },
}: Props) {
    const { t } = useLaravelReactI18n();
    const updateMutation = learningMaterialQuestionTestCaseServiceHook.useUpdate();

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
        input: z.string().optional(),
        expected_output_file: z.any().optional(),
        hidden: z.boolean().default(false),
        active: z.boolean().default(true),
        language: z.nativeEnum(ProgrammingLanguageEnum).default(ProgrammingLanguageEnum.PYTHON),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            learning_material_question_id: testCase.learning_material_question_id,
            description: testCase.description || '',
            input: testCase.input || '',
            expected_output_file: undefined,
            hidden: testCase.hidden,
            active: testCase.active,
            language:
                (testCase.language as ProgrammingLanguageEnum) || ProgrammingLanguageEnum.PYTHON,
        },
    });

    useEffect(() => {
        if (testCase) {
            form.reset({
                learning_material_question_id: testCase.learning_material_question_id,
                description: testCase.description || '',
                input: testCase.input || '',
                expected_output_file: undefined,
                hidden: testCase.hidden,
                active: testCase.active,
                language:
                    (testCase.language as ProgrammingLanguageEnum) ||
                    ProgrammingLanguageEnum.PYTHON,
            });
        }
    }, [testCase, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();

        formData.append(
            'learning_material_question_id',
            String(values.learning_material_question_id),
        );
        formData.append('description', values.description);
        if (values.input) formData.append('input', values.input);
        formData.append('language', values.language);
        formData.append('hidden', values.hidden ? '1' : '0');
        formData.append('active', values.active ? '1' : '0');

        if (values.expected_output_file instanceof File) {
            formData.append('expected_output_file', values.expected_output_file);
        }

        toast.promise(
            updateMutation.mutateAsync({
                id: testCase.id,
                data: formData,
            }),
            {
                loading: t(
                    'pages.learning_material_question_test_case.common.messages.pending.update',
                    { defaultValue: 'Updating test case...' },
                ),
                success: () => {
                    router.visit(
                        route(`${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.index`, [
                            course.id,
                            learningMaterial.id,
                            question.id,
                        ]),
                    );
                    return t(
                        'pages.learning_material_question_test_case.common.messages.success.update',
                        { defaultValue: 'Test case updated successfully' },
                    );
                },
                error: t(
                    'pages.learning_material_question_test_case.common.messages.error.update',
                    { defaultValue: 'Error updating test case' },
                ),
            },
        );
    };

    if (!testCase) return null;

    const selectedLanguage = form.watch('language');

    return (
        <AuthenticatedLayout title={t('pages.learning_material_question_test_case.edit.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {t('pages.learning_material_question_test_case.edit.title')}
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
                                                'pages.learning_material_question_test_case.common.fields.language',
                                            )}
                                        </FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value as ProgrammingLanguageEnum);
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={t(
                                                            'pages.learning_material_question_test_case.common.placeholders.language',
                                                            { defaultValue: 'Select a language' },
                                                        )}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(ProgrammingLanguageEnum).map(
                                                    (lang) => (
                                                        <SelectItem value={lang} key={lang}>
                                                            {programmingLanguageLabels[lang]}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            {t(
                                                'pages.learning_material_question_test_case.common.help.language',
                                                {
                                                    defaultValue:
                                                        'Select the programming language for this test case',
                                                },
                                            )}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='language'
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
                                                language={selectedLanguage}
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
                                        {testCase.expected_output_file && (
                                            <div className='mt-2'>
                                                <p className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.learning_material_question_test_case.edit.current_file',
                                                        {
                                                            defaultValue: 'Current file:',
                                                        },
                                                    )}
                                                    :
                                                </p>
                                                <a
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    href={testCase.expected_output_file_url}
                                                    className='text-sm text-primary hover:underline'
                                                >
                                                    {testCase.expected_output_file}
                                                </a>
                                            </div>
                                        )}
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
                                loading={updateMutation.isPending}
                                disabled={updateMutation.isPending}
                            >
                                {t(
                                    'pages.learning_material_question_test_case.edit.buttons.update',
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
