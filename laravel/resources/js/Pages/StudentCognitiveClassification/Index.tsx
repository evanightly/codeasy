import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
import { Checkbox } from '@/Components/UI/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/UI/dialog';
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
import { useConfirmation } from '@/Contexts/ConfirmationDialogContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { studentCognitiveClassificationServiceHook } from '@/Services/studentCognitiveClassificationServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Database, FileSpreadsheet, FileUp } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Classifications } from './Partials/Classifications';

export default function Index() {
    const { t } = useLaravelReactI18n();
    const confirmAction = useConfirmation();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [rawDataDialogOpen, setRawDataDialogOpen] = useState(false);
    const { data: courses, isLoading } = courseServiceHook.useGetAll();
    const runClassification = studentCognitiveClassificationServiceHook.useRunClassification();
    const exportExcel = studentCognitiveClassificationServiceHook.useExportExcel();
    const exportRawDataExcel = studentCognitiveClassificationServiceHook.useExportRawDataExcel();

    const formSchema = z.object({
        course_id: z.coerce.number().min(1, t('validation.required', { attribute: 'course' })),
        classification_type: z.string().optional(),
    });

    const rawDataFormSchema = z.object({
        course_id: z.coerce.number().min(1, t('validation.required', { attribute: 'course' })),
        export_format: z.string().default('raw'),
        include_classification: z.boolean().default(false),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course_id: 0,
            classification_type: 'topsis',
        },
    });

    const rawDataForm = useForm<z.infer<typeof rawDataFormSchema>>({
        resolver: zodResolver(rawDataFormSchema),
        defaultValues: {
            course_id: 0,
            export_format: 'raw',
            include_classification: false,
        },
    });

    const handleRunClassification = async (values: z.infer<typeof formSchema>) => {
        toast.promise(runClassification.mutateAsync(values), {
            loading: t('pages.student_cognitive_classification.messages.classification_running'),
            success: () => {
                setDialogOpen(false);
                form.reset();
                return t('pages.student_cognitive_classification.messages.classification_success');
            },
            error: t('pages.student_cognitive_classification.messages.classification_error'),
        });
    };

    const handleExportExcel = () => {
        confirmAction(
            () => {
                exportExcel.mutateAsync({});
                toast.success(t('pages.student_cognitive_classification.messages.export_started'));
            },
            {
                confirmationTitle: t('pages.student_cognitive_classification.dialogs.export.title'),
                confirmationMessage: t(
                    'pages.student_cognitive_classification.dialogs.export.description',
                ),
            },
        );
    };

    const handleExportRawDataExcel = (values: z.infer<typeof rawDataFormSchema>) => {
        exportRawDataExcel.mutateAsync(values);
        setRawDataDialogOpen(false);
        rawDataForm.reset();
        toast.success(t('pages.student_cognitive_classification.messages.raw_data_export_started'));
    };

    return (
        <AuthenticatedLayout title={t('pages.student_cognitive_classification.index.title')}>
            <div className='flex flex-col gap-4'>
                <div className='flex flex-col justify-between gap-4 sm:flex-row'>
                    <h1 className='text-2xl font-bold'>
                        {t('pages.student_cognitive_classification.index.title')}
                    </h1>
                    <div className='flex flex-wrap gap-2'>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant='default'>
                                    <FileUp className='mr-2 h-4 w-4' />
                                    {t(
                                        'pages.student_cognitive_classification.buttons.run_classification',
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {t(
                                            'pages.student_cognitive_classification.dialogs.classification.title',
                                        )}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t(
                                            'pages.student_cognitive_classification.dialogs.classification.description',
                                        )}
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(handleRunClassification)}
                                        className='space-y-4'
                                    >
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_cognitive_classification.fields.course',
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={(value) =>
                                                            field.onChange(parseInt(value))
                                                        }
                                                        defaultValue={field.value.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'pages.student_cognitive_classification.placeholders.select_course',
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isLoading ? (
                                                                <SelectItem value='0' disabled>
                                                                    {t('action.loading')}
                                                                </SelectItem>
                                                            ) : (
                                                                courses?.data?.map((course) => (
                                                                    <SelectItem
                                                                        value={course.id.toString()}
                                                                        key={course.id}
                                                                    >
                                                                        {course.name}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                            name='course_id'
                                            control={form.control}
                                        />

                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_cognitive_classification.fields.classification_type',
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'pages.student_cognitive_classification.placeholders.select_classification_type',
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='topsis'>
                                                                {t(
                                                                    'pages.student_cognitive_classification.classification_types.topsis',
                                                                )}
                                                            </SelectItem>
                                                            <SelectItem value='fuzzy'>
                                                                {t(
                                                                    'pages.student_cognitive_classification.classification_types.fuzzy',
                                                                )}
                                                            </SelectItem>
                                                            <SelectItem value='cognitive_levels'>
                                                                {t(
                                                                    'pages.student_cognitive_classification.classification_types.cognitive_levels',
                                                                    {
                                                                        defaultValue:
                                                                            'Cognitive Levels',
                                                                    },
                                                                )}
                                                            </SelectItem>
                                                            <SelectItem value='neural'>
                                                                {t(
                                                                    'pages.student_cognitive_classification.classification_types.neural',
                                                                )}
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                            name='classification_type'
                                            control={form.control}
                                        />

                                        <DialogFooter>
                                            <Button
                                                type='submit'
                                                loading={runClassification.isPending}
                                            >
                                                {t(
                                                    'pages.student_cognitive_classification.buttons.start_classification',
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={rawDataDialogOpen} onOpenChange={setRawDataDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant='outline'>
                                    <Database className='mr-2 h-4 w-4' />
                                    {t(
                                        'pages.student_cognitive_classification.buttons.export_raw_data',
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {t(
                                            'pages.student_cognitive_classification.dialogs.export_raw_data.title',
                                        )}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t(
                                            'pages.student_cognitive_classification.dialogs.export_raw_data.description',
                                        )}
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...rawDataForm}>
                                    <form
                                        onSubmit={rawDataForm.handleSubmit(
                                            handleExportRawDataExcel,
                                        )}
                                        className='space-y-4'
                                    >
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_cognitive_classification.fields.course',
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={(value) =>
                                                            field.onChange(parseInt(value))
                                                        }
                                                        defaultValue={field.value.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'pages.student_cognitive_classification.placeholders.select_course',
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isLoading ? (
                                                                <SelectItem value='0' disabled>
                                                                    {t('action.loading')}
                                                                </SelectItem>
                                                            ) : (
                                                                courses?.data?.map((course) => (
                                                                    <SelectItem
                                                                        value={course.id.toString()}
                                                                        key={course.id}
                                                                    >
                                                                        {course.name}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                            name='course_id'
                                            control={rawDataForm.control}
                                        />

                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_cognitive_classification.fields.export_format',
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'pages.student_cognitive_classification.placeholders.select_export_format',
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='raw'>
                                                                {t(
                                                                    'pages.student_cognitive_classification.export_formats.raw',
                                                                )}
                                                            </SelectItem>
                                                            <SelectItem value='ml_tool'>
                                                                {t(
                                                                    'pages.student_cognitive_classification.export_formats.ml_tool',
                                                                )}
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                            name='export_format'
                                            control={rawDataForm.control}
                                        />

                                        <FormField
                                            render={({ field }) => (
                                                <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                                                    <FormControl>
                                                        <Checkbox
                                                            onCheckedChange={field.onChange}
                                                            checked={field.value}
                                                        />
                                                    </FormControl>
                                                    <div className='space-y-1 leading-none'>
                                                        <FormLabel>
                                                            {t(
                                                                'pages.student_cognitive_classification.fields.include_classification',
                                                            )}
                                                        </FormLabel>
                                                        <FormDescription>
                                                            {t(
                                                                'pages.student_cognitive_classification.fields.include_classification_description',
                                                            )}
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                            name='include_classification'
                                            control={rawDataForm.control}
                                        />

                                        <DialogFooter>
                                            <Button
                                                type='submit'
                                                loading={exportRawDataExcel.isPending}
                                            >
                                                {t(
                                                    'pages.student_cognitive_classification.buttons.start_export',
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>

                        <Button variant='outline' onClick={handleExportExcel}>
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            {t('pages.student_cognitive_classification.buttons.export_excel')}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {t('pages.student_cognitive_classification.sections.classifications')}
                        </CardTitle>
                        <CardDescription>
                            {t(
                                'pages.student_cognitive_classification.descriptions.classifications',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Classifications
                            baseRoute={ROUTES.STUDENT_COGNITIVE_CLASSIFICATIONS}
                            baseKey={TANSTACK_QUERY_KEYS.STUDENT_COGNITIVE_CLASSIFICATIONS}
                        />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
