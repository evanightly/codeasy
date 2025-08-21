import CodeEditor from '@/Components/CodeEditor';
import { FilePondUploader } from '@/Components/FilePondUploader';
import { PDFViewer } from '@/Components/PDFViewer';
import { TestCaseDebugger } from '@/Components/TestCaseDebugger';
import { TestCaseExamples } from '@/Components/TestCaseExamples';
import { TestCaseInfoTooltip } from '@/Components/TestCaseInfoTooltip';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Checkbox } from '@/Components/UI/checkbox';
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
import { Separator } from '@/Components/UI/separator';
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
    CognitiveLevelEnum,
    cognitiveLevelLabels,
} from '@/Support/Enums/cognitiveLevelEnum';
import {
    CourseResource,
    LearningMaterialQuestionResource,
    LearningMaterialResource,
} from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
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
    course: CourseResource;
    learningMaterial: LearningMaterialResource;
    question: LearningMaterialQuestionResource;
}

export default function Create({ question, course, learningMaterial }: Props) {
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
        language: z.nativeEnum(ProgrammingLanguageEnum).default(ProgrammingLanguageEnum.PYTHON),
        hidden: z.boolean().default(false),
        active: z.boolean().default(true),
        cognitive_levels: z.array(z.nativeEnum(CognitiveLevelEnum)).optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            learning_material_question_id: question.id,
            description: '',
            input: '',
            expected_output_file: undefined,
            language: ProgrammingLanguageEnum.PYTHON,
            hidden: false,
            active: true,
            cognitive_levels: [],
        },
    });

    const selectedLanguage = form.watch('language');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const testCaseInput = form.watch('input');

    const handleFileChange = (file: File | null) => {
        // Clear existing preview URL if exists
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        form.setValue('expected_output_file', file);

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setFileType(file.type);
        } else {
            setPreviewUrl(null);
            setFileType(null);
        }
    };

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();
        formData.append(
            'learning_material_question_id',
            values.learning_material_question_id.toString(),
        );

        formData.append('description', values.description);
        formData.append('input', values.input);
        formData.append('language', values.language);
        formData.append('hidden', values.hidden ? '1' : '0');
        formData.append('active', values.active ? '1' : '0');
        
        // Handle cognitive levels
        if (values.cognitive_levels && values.cognitive_levels.length > 0) {
            values.cognitive_levels.forEach((level, index) => {
                formData.append(`cognitive_levels[${index}]`, level);
            });
        }

        // Handle file upload
        if (values.expected_output_file instanceof File) {
            formData.append('expected_output_file', values.expected_output_file);
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
                        route(`${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.index`, [
                            course.id,
                            learningMaterial.id,
                            question.id,
                        ]),
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

    const handleExampleClick = (exampleCode: string) => {
        form.setValue('input', exampleCode);
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

                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {t(
                                            'pages.learning_material_question_test_case.common.fields.input',
                                            {
                                                defaultValue: 'Test Case Input',
                                            },
                                        )}
                                    </CardTitle>
                                    <TestCaseInfoTooltip />
                                </CardHeader>
                                <CardContent>
                                    <div className='relative flex flex-col gap-4 md:flex-row'>
                                        <motion.div
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 30,
                                            }}
                                            layout
                                            className='flex-1'
                                        >
                                            <FormField
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className='text-lg font-medium'>
                                                            {t(
                                                                'pages.learning_material_question_test_case.common.fields.input',
                                                                {
                                                                    defaultValue: 'Input',
                                                                },
                                                            )}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <CodeEditor
                                                                value={field.value || ''}
                                                                onChange={field.onChange}
                                                                language={selectedLanguage}
                                                                height='200px'
                                                                headerChildren={
                                                                    <TestCaseExamples
                                                                        onExampleClick={
                                                                            handleExampleClick
                                                                        }
                                                                    />
                                                                }
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
                                        </motion.div>

                                        {testCaseInput.trim() && (
                                            <Separator
                                                orientation='vertical'
                                                className='hidden md:block'
                                            />
                                        )}

                                        <AnimatePresence>
                                            {testCaseInput.trim() && (
                                                <motion.div
                                                    transition={{
                                                        duration: 0.3,
                                                        ease: 'easeInOut',
                                                    }}
                                                    initial={{ opacity: 0, width: 0 }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    className='flex-1'
                                                    animate={{ opacity: 1, width: 'auto' }}
                                                >
                                                    <div className='space-y-2'>
                                                        <h3 className='text-lg font-medium'>
                                                            {t(
                                                                'pages.learning_material_question_test_case.common.debug_section.title',
                                                                {
                                                                    defaultValue:
                                                                        'Test Case Debugging',
                                                                },
                                                            )}
                                                        </h3>

                                                        <TestCaseDebugger
                                                            testCaseInput={testCaseInput}
                                                            language={selectedLanguage}
                                                            initialCode={
                                                                question.example_code || ''
                                                            }
                                                            hideTitle
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </CardContent>
                            </Card>

                            <FormField
                                render={({ field: { onChange: _onChange, value } }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'pages.learning_material_question_test_case.common.fields.expected_output',
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <FilePondUploader
                                                value={value as any}
                                                onChange={handleFileChange}
                                                maxFileSize='5MB'
                                                acceptedFileTypes={[
                                                    'application/pdf',
                                                    'image/*',
                                                    '.pdf',
                                                    '.jpg',
                                                    '.jpeg',
                                                    '.png',
                                                    '.txt',
                                                ]}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t(
                                                'pages.learning_material_question_test_case.common.help.expected_output',
                                                {
                                                    defaultValue:
                                                        'Upload a PDF, image, or text file showing the expected output for this test case.',
                                                },
                                            )}
                                        </FormDescription>

                                        {/* Preview Section */}
                                        {previewUrl && (
                                            <div className='mt-4 rounded-md border p-3'>
                                                <h3 className='mb-2 text-base font-medium'>
                                                    {t(
                                                        'pages.learning_material_question_test_case.create.file_preview',
                                                        { defaultValue: 'File Preview' },
                                                    )}
                                                </h3>
                                                {fileType === 'application/pdf' ? (
                                                    <PDFViewer
                                                        fileUrl={previewUrl}
                                                        filename={
                                                            form.getValues('expected_output_file')
                                                                ?.name ||
                                                            t('components.pdf_viewer.document')
                                                        }
                                                    />
                                                ) : fileType === 'text/plain' ||
                                                  /\.(txt|py|js|java|cpp|c|html|css)$/.test(
                                                      form.getValues('expected_output_file')
                                                          ?.name || '',
                                                  ) ? (
                                                    <div className='mt-2 overflow-auto rounded border bg-gray-50 p-4'>
                                                        <pre className='whitespace-pre-wrap text-sm text-gray-800'>
                                                            <TextFilePreview fileUrl={previewUrl} />
                                                        </pre>
                                                    </div>
                                                ) : fileType?.startsWith('image/') ||
                                                  previewUrl?.match(
                                                      /\.(jpg|jpeg|png|gif|webp)$/i,
                                                  ) ? (
                                                    <div className='mt-2 flex justify-center'>
                                                        <img
                                                            src={previewUrl}
                                                            className='max-h-96 rounded object-contain'
                                                            alt={t(
                                                                'pages.learning_material_question_test_case.create.preview',
                                                                { defaultValue: 'File Preview' },
                                                            )}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='rounded bg-gray-50 p-4 text-center text-gray-500'>
                                                        {t(
                                                            'pages.learning_material_question_test_case.create.no_preview_available',
                                                            {
                                                                defaultValue:
                                                                    'No preview available for this file type',
                                                            },
                                                        )}
                                                    </div>
                                                )}
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
                                                    {
                                                        defaultValue:
                                                            'Hidden test cases are not visible to students but are still used for evaluation.',
                                                    },
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

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                'pages.learning_material_question_test_case.common.fields.cognitive_levels',
                                                { defaultValue: 'Cognitive Levels' },
                                            )}
                                        </FormLabel>
                                        <FormDescription>
                                            {t(
                                                'pages.learning_material_question_test_case.common.help.cognitive_levels',
                                                {
                                                    defaultValue:
                                                        'Select the cognitive levels that this test case evaluates based on Bloom\'s taxonomy.',
                                                },
                                            )}
                                        </FormDescription>
                                        <div className='grid grid-cols-2 gap-4 rounded-lg border p-4'>
                                            {Object.values(CognitiveLevelEnum).map((level) => (
                                                <div
                                                    key={level}
                                                    className='flex items-center space-x-2'
                                                >
                                                    <Checkbox
                                                        onCheckedChange={(checked) => {
                                                            const currentLevels = field.value || [];
                                                            if (checked) {
                                                                field.onChange([...currentLevels, level]);
                                                            } else {
                                                                field.onChange(
                                                                    currentLevels.filter((l) => l !== level),
                                                                );
                                                            }
                                                        }}
                                                        id={`cognitive-level-${level}`}
                                                        checked={field.value?.includes(level) || false}
                                                    />
                                                    <label
                                                        htmlFor={`cognitive-level-${level}`}
                                                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                                    >
                                                        {cognitiveLevelLabels[level]}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='cognitive_levels'
                                control={form.control}
                            />

                            <Separator />

                            <div className='flex justify-between'>
                                <Button
                                    variant='outline'
                                    type='button'
                                    onClick={() =>
                                        router.visit(
                                            route(
                                                `${ROUTES.COURSE_LEARNING_MATERIAL_QUESTION_TEST_CASES}.index`,
                                                [course.id, learningMaterial.id, question.id],
                                            ),
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
                                    {t(
                                        'pages.learning_material_question_test_case.create.buttons.create',
                                        { defaultValue: 'Create Test Case' },
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
