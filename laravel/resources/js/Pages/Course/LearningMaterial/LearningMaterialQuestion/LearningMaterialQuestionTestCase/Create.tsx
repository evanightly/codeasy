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
import { Switch } from '@/Components/UI/switch';
import { Textarea } from '@/Components/UI/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { learningMaterialQuestionTestCaseServiceHook } from '@/Services/learningMaterialQuestionTestCaseServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
    question_id: string;
}

export default function Create({ question_id }: Props) {
    const { t } = useLaravelReactI18n();
    const createMutation = learningMaterialQuestionTestCaseServiceHook.useCreate();

    const formSchema = z.object({
        learning_material_question_id: z.string().min(1),
        input: z.string().optional(),
        expected_output_file: z.any().optional(),
        description: z.string().optional(),
        hidden: z.boolean().default(false),
        active: z.boolean().default(true),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            learning_material_question_id: question_id,
            input: '',
            expected_output_file: undefined,
            description: '',
            hidden: false,
            active: true,
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
            if (key === 'expected_output_file' && value instanceof File) {
                formData.append(key, value);
            } else if (value !== undefined && value !== null && key !== 'expected_output_file') {
                formData.append(key, String(value));
            }
        });

        toast.promise(
            createMutation.mutateAsync({
                data: formData,
            }),
            {
                loading: t(
                    'pages.learning_material_question_test_case.common.messages.pending.create',
                ),
                success: () => {
                    router.visit(
                        route(
                            `${ROUTES.LEARNING_MATERIAL_QUESTIONS}.test-cases.index`,
                            question_id,
                        ),
                    );
                    return t(
                        'pages.learning_material_question_test_case.common.messages.success.create',
                    );
                },
                error: t('pages.learning_material_question_test_case.common.messages.error.create'),
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
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        <p className='text-sm text-muted-foreground'>
                                            {t(
                                                'pages.learning_material_question_test_case.common.help.input',
                                            )}
                                        </p>
                                    </FormItem>
                                )}
                                name='input'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                        <div className='space-y-0.5'>
                                            <FormLabel className='text-base'>
                                                {t(
                                                    'pages.learning_material_question_test_case.common.fields.hidden',
                                                )}
                                            </FormLabel>
                                            <p className='text-sm text-muted-foreground'>
                                                {t(
                                                    'pages.learning_material_question_test_case.common.help.hidden',
                                                )}
                                            </p>
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
                                            <FormLabel className='text-base'>
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

                            <div className='flex justify-between'>
                                <Button
                                    variant='outline'
                                    type='button'
                                    onClick={() =>
                                        router.visit(
                                            route(
                                                `${ROUTES.LEARNING_MATERIAL_QUESTIONS}.test-cases.index`,
                                                question_id,
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
