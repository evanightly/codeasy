import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/card';
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { studentScoreServiceHook } from '@/Services/studentScoreServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { TANSTACK_QUERY_KEYS } from '@/Support/Constants/tanstackQueryKeys';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { BarChart2, Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CourseClassifications } from './Partials/CourseClassifications';
import { CourseReport } from './Partials/CourseReport';

export default function Index() {
    const { t } = useLaravelReactI18n();
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const { data: courses, isLoading } = courseServiceHook.useGetAll({
        filters: { page_size: 'all' },
    });
    const exportStudentScores = studentScoreServiceHook.useExportTabularData();

    // Form schema for report generation
    const reportFormSchema = z.object({
        course_id: z.coerce.number().min(1, t('validation.required', { attribute: 'course' })),
        classification_type: z.string().default('topsis'),
    });

    // Form schema for student scores export
    const exportFormSchema = z.object({
        course_id: z.coerce.number().min(1, t('validation.required', { attribute: 'course' })),
    });

    const reportForm = useForm<z.infer<typeof reportFormSchema>>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            course_id: 0,
            classification_type: 'topsis',
        },
    });

    const exportForm = useForm<z.infer<typeof exportFormSchema>>({
        resolver: zodResolver(exportFormSchema),
        defaultValues: {
            course_id: 0,
        },
    });

    const handleGenerateReport = async (values: z.infer<typeof reportFormSchema>) => {
        setSelectedCourseId(values.course_id);
        setReportDialogOpen(true);
    };

    const handleExportStudentScores = async (values: z.infer<typeof exportFormSchema>) => {
        exportStudentScores.mutate({
            course_id: values.course_id,
        });
    };

    return (
        <AuthenticatedLayout title='Student Course Cognitive Classifications'>
            <div className='container space-y-6 py-6'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-2xl font-bold tracking-tight'>
                        {t('pages.student_course_cognitive_classification.index.title')}
                    </h1>
                    <div className='flex flex-wrap gap-2'>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant='outline'>
                                    <Download className='mr-2 h-4 w-4' />
                                    {t('pages.student_score.export.dialog.title')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {t('pages.student_score.export.dialog.title')}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t('pages.student_score.export.dialog.description')}
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...exportForm}>
                                    <form
                                        onSubmit={exportForm.handleSubmit(
                                            handleExportStudentScores,
                                        )}
                                        className='space-y-4'
                                    >
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_score.export.dialog.course_label',
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={(value) =>
                                                            field.onChange(parseInt(value))
                                                        }
                                                        defaultValue={field.value?.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'pages.student_score.export.dialog.select_course_placeholder',
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isLoading ? (
                                                                <SelectItem value='0' disabled>
                                                                    {t(
                                                                        'pages.student_score.export.dialog.loading',
                                                                    )}
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
                                            control={exportForm.control}
                                        />

                                        <DialogFooter>
                                            <Button
                                                type='submit'
                                                disabled={exportStudentScores.isPending}
                                            >
                                                {exportStudentScores.isPending
                                                    ? t(
                                                          'pages.student_score.export.dialog.buttons.exporting',
                                                      )
                                                    : t(
                                                          'pages.student_score.export.dialog.buttons.export_excel',
                                                      )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant='outline'>
                                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                                    {t(
                                        'pages.student_course_cognitive_classification.buttons.export_excel',
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {t(
                                            'pages.student_course_cognitive_classification.dialogs.export.title',
                                        )}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t(
                                            'pages.student_course_cognitive_classification.dialogs.export.description',
                                        )}
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...reportForm}>
                                    <form
                                        onSubmit={reportForm.handleSubmit(handleGenerateReport)}
                                        className='space-y-4'
                                    >
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_course_cognitive_classification.fields.course',
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={(value) =>
                                                            field.onChange(parseInt(value))
                                                        }
                                                        defaultValue={field.value?.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'pages.student_course_cognitive_classification.placeholders.select_course',
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
                                            control={reportForm.control}
                                        />

                                        <DialogFooter>
                                            <Button type='submit'>
                                                {t(
                                                    'pages.student_course_cognitive_classification.buttons.export_excel',
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <BarChart2 className='mr-2 h-4 w-4' />
                                    {t(
                                        'pages.student_course_cognitive_classification.buttons.view_report',
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {t(
                                            'pages.student_course_cognitive_classification.dialogs.report.title',
                                        )}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t(
                                            'pages.student_course_cognitive_classification.dialogs.report.description',
                                        )}
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...reportForm}>
                                    <form
                                        onSubmit={reportForm.handleSubmit(handleGenerateReport)}
                                        className='space-y-4'
                                    >
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_course_cognitive_classification.fields.course',
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={(value) =>
                                                            field.onChange(parseInt(value))
                                                        }
                                                        defaultValue={field.value?.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'pages.student_course_cognitive_classification.placeholders.select_course',
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
                                            control={reportForm.control}
                                        />
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_course_cognitive_classification.fields.classification_type',
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
                                                                        'pages.student_course_cognitive_classification.placeholders.select_classification_type',
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value='topsis'>
                                                                TOPSIS
                                                            </SelectItem>
                                                            <SelectItem value='fuzzy'>
                                                                Fuzzy
                                                            </SelectItem>
                                                            <SelectItem value='neural'>
                                                                Neural Network
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                            name='classification_type'
                                            control={reportForm.control}
                                        />

                                        <DialogFooter>
                                            <Button type='submit'>
                                                {t(
                                                    'pages.student_course_cognitive_classification.buttons.generate_report',
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {t(
                                'pages.student_course_cognitive_classification.sections.classifications',
                            )}
                        </CardTitle>
                        <CardDescription>
                            {t(
                                'pages.student_course_cognitive_classification.descriptions.classifications',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CourseClassifications
                            baseRoute={ROUTES.STUDENT_COURSE_COGNITIVE_CLASSIFICATIONS}
                            baseKey={TANSTACK_QUERY_KEYS.STUDENT_COURSE_COGNITIVE_CLASSIFICATIONS}
                        />
                    </CardContent>
                </Card>

                <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <DialogContent className='max-h-[90vh] max-w-screen-lg overflow-y-auto'>
                        <DialogHeader>
                            <DialogTitle>
                                {t(
                                    'pages.student_course_cognitive_classification.dialogs.report.title',
                                )}
                            </DialogTitle>
                            <DialogDescription>
                                {courses?.data?.find((course) => course.id === selectedCourseId)
                                    ?.name ||
                                    t(
                                        'pages.student_course_cognitive_classification.dialogs.report.description',
                                    )}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedCourseId && (
                            <CourseReport
                                courseId={selectedCourseId}
                                classificationType={reportForm.getValues('classification_type')}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
