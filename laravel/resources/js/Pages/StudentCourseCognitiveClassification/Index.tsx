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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { courseServiceHook } from '@/Services/courseServiceHook';
import { studentScoreServiceHook } from '@/Services/studentScoreServiceHook';
import { userServiceHook } from '@/Services/userServiceHook';
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
    const [enhancedExportDialogOpen, setEnhancedExportDialogOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [selectedCourseForExport, setSelectedCourseForExport] = useState<number | null>(null);

    const { data: courses, isLoading } = courseServiceHook.useGetAll({
        filters: { page_size: 'all' },
    });
    const exportStudentScores = studentScoreServiceHook.useExportTabularData();
    const exportEnhancedData = studentScoreServiceHook.useExportEnhancedData();

    // Form schema for report generation
    const reportFormSchema = z.object({
        course_id: z.coerce.number().min(1, t('validation.required', { attribute: 'course' })),
        classification_type: z.string().default('topsis'),
    });

    // Form schema for student scores export
    const exportFormSchema = z.object({
        course_id: z.coerce.number().min(1, t('validation.required', { attribute: 'course' })),
    });

    // Form schema for enhanced export with student and classification selection
    const enhancedExportFormSchema = z.object({
        course_id: z.coerce.number().min(1, t('validation.required', { attribute: 'course' })),
        classification_type: z.string().default('topsis'),
        classification_date: z.string().optional(),
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

    const enhancedExportForm = useForm<z.infer<typeof enhancedExportFormSchema>>({
        resolver: zodResolver(enhancedExportFormSchema),
        defaultValues: {
            course_id: 0,
            classification_type: 'topsis',
            classification_date: 'latest',
        },
    });

    // Watch form values for dependencies
    const watchedCourseId = enhancedExportForm.watch('course_id');
    const watchedClassificationType = enhancedExportForm.watch('classification_type');

    // Get students for selected course in enhanced export
    const { data: courseStudents, isLoading: isLoadingStudents } =
        userServiceHook.useGetStudentsByCourse(selectedCourseForExport || undefined);

    // Get classification history dates for selected course and type
    const { data: classificationHistoryDates, isLoading: isLoadingHistoryDates } =
        studentScoreServiceHook.useGetClassificationHistoryDates(
            watchedCourseId || undefined,
            watchedClassificationType,
        );

    const handleGenerateReport = async (values: z.infer<typeof reportFormSchema>) => {
        setSelectedCourseId(values.course_id);
        setReportDialogOpen(true);
    };

    const handleExportStudentScores = async (values: z.infer<typeof exportFormSchema>) => {
        exportStudentScores.mutate({
            course_id: values.course_id,
        });
    };

    const handleEnhancedExportCourseSelect = (courseId: number) => {
        setSelectedCourseForExport(courseId);
        setSelectedStudents([]);
    };

    const handleStudentSelection = (studentId: number, isSelected: boolean) => {
        if (isSelected) {
            setSelectedStudents((prev) => [...prev, studentId]);
        } else {
            setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
        }
    };

    const handleSelectAllStudents = (isSelected: boolean) => {
        if (isSelected && courseStudents) {
            setSelectedStudents(courseStudents.map((student: any) => student.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleEnhancedExport = async (values: z.infer<typeof enhancedExportFormSchema>) => {
        exportEnhancedData.mutate({
            course_id: values.course_id,
            classification_type: values.classification_type,
            classification_date:
                values.classification_date === 'latest' ? undefined : values.classification_date,
            selected_student_ids: selectedStudents,
        });
        setEnhancedExportDialogOpen(false);
        // Reset form and selections
        setSelectedCourseForExport(null);
        setSelectedStudents([]);
        enhancedExportForm.reset();
    };

    return (
        <AuthenticatedLayout title={t('pages.student_course_cognitive_classification.index.title')}>
            <div className='container space-y-6 py-6'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-2xl font-bold tracking-tight'>
                        {t('pages.student_course_cognitive_classification.index.title')}
                    </h1>
                    <div className='flex flex-wrap gap-2'>
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

                        <Dialog
                            open={enhancedExportDialogOpen}
                            onOpenChange={setEnhancedExportDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button variant='outline'>
                                    <FileSpreadsheet className='mr-2 h-4 w-4' />
                                    {t(
                                        'pages.student_course_cognitive_classification.buttons.enhanced_export',
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                                <DialogHeader>
                                    <DialogTitle>
                                        {t(
                                            'pages.student_course_cognitive_classification.dialogs.enhanced_export.title',
                                        )}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {t(
                                            'pages.student_course_cognitive_classification.dialogs.enhanced_export.description',
                                        )}
                                    </DialogDescription>
                                </DialogHeader>

                                <Form {...enhancedExportForm}>
                                    <form
                                        onSubmit={enhancedExportForm.handleSubmit(
                                            handleEnhancedExport,
                                        )}
                                        className='space-y-6'
                                    >
                                        {/* Course Selection */}
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_course_cognitive_classification.dialogs.enhanced_export.course_label',
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            const courseId = parseInt(value);
                                                            field.onChange(courseId);
                                                            handleEnhancedExportCourseSelect(
                                                                courseId,
                                                            );
                                                        }}
                                                        defaultValue={field.value?.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        'pages.student_course_cognitive_classification.dialogs.enhanced_export.select_course_placeholder',
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
                                            control={enhancedExportForm.control}
                                        />

                                        {/* Classification Type Selection */}
                                        <FormField
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_course_cognitive_classification.dialogs.enhanced_export.classification_type_label',
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
                                                                        'pages.student_course_cognitive_classification.dialogs.enhanced_export.select_classification_type_placeholder',
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
                                            control={enhancedExportForm.control}
                                        />

                                        {/* Classification Date Selection */}
                                        {(isLoadingHistoryDates ||
                                            (classificationHistoryDates &&
                                                classificationHistoryDates.length > 0)) && (
                                            <FormField
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            {t(
                                                                'pages.student_course_cognitive_classification.dialogs.enhanced_export.classification_date_label',
                                                            )}
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger
                                                                    disabled={isLoadingHistoryDates}
                                                                >
                                                                    <SelectValue
                                                                        placeholder={
                                                                            isLoadingHistoryDates
                                                                                ? t(
                                                                                      'pages.student_course_cognitive_classification.dialogs.enhanced_export.loading_dates',
                                                                                  )
                                                                                : t(
                                                                                      'pages.student_course_cognitive_classification.dialogs.enhanced_export.latest_classification',
                                                                                  )
                                                                        }
                                                                    />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value='latest'>
                                                                    {t(
                                                                        'pages.student_course_cognitive_classification.dialogs.enhanced_export.latest_classification',
                                                                    )}
                                                                </SelectItem>
                                                                {!isLoadingHistoryDates &&
                                                                    classificationHistoryDates?.map(
                                                                        (historyDate: any) => (
                                                                            <SelectItem
                                                                                value={
                                                                                    historyDate.date
                                                                                }
                                                                                key={
                                                                                    historyDate.date
                                                                                }
                                                                            >
                                                                                {historyDate.label}
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                        <p className='text-xs text-muted-foreground'>
                                                            {isLoadingHistoryDates
                                                                ? t(
                                                                      'pages.student_course_cognitive_classification.dialogs.enhanced_export.loading_dates_description',
                                                                  )
                                                                : t(
                                                                      'pages.student_course_cognitive_classification.dialogs.enhanced_export.classification_date_description',
                                                                  )}
                                                        </p>
                                                    </FormItem>
                                                )}
                                                name='classification_date'
                                                control={enhancedExportForm.control}
                                            />
                                        )}

                                        {/* Student Selection */}
                                        {selectedCourseForExport && courseStudents && (
                                            <div className='space-y-4'>
                                                <div className='flex items-center justify-between'>
                                                    <FormLabel>
                                                        {t(
                                                            'pages.student_course_cognitive_classification.dialogs.enhanced_export.select_students_label',
                                                        )}
                                                    </FormLabel>
                                                    <div className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            onCheckedChange={
                                                                handleSelectAllStudents
                                                            }
                                                            checked={
                                                                selectedStudents.length ===
                                                                courseStudents.length
                                                            }
                                                        />
                                                        <label className='text-sm'>
                                                            {t(
                                                                'pages.student_course_cognitive_classification.dialogs.enhanced_export.select_all',
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className='max-h-60 overflow-y-auto rounded-md border'>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className='w-12'>
                                                                    {t(
                                                                        'pages.student_course_cognitive_classification.dialogs.enhanced_export.table_headers.select',
                                                                    )}
                                                                </TableHead>
                                                                <TableHead>
                                                                    {t(
                                                                        'pages.student_course_cognitive_classification.dialogs.enhanced_export.table_headers.name',
                                                                    )}
                                                                </TableHead>
                                                                <TableHead>
                                                                    {t(
                                                                        'pages.student_course_cognitive_classification.dialogs.enhanced_export.table_headers.email',
                                                                    )}
                                                                </TableHead>
                                                                <TableHead>
                                                                    {t(
                                                                        'pages.student_course_cognitive_classification.dialogs.enhanced_export.table_headers.username',
                                                                    )}
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {isLoadingStudents ? (
                                                                <TableRow>
                                                                    <TableCell
                                                                        colSpan={4}
                                                                        className='text-center'
                                                                    >
                                                                        {t(
                                                                            'pages.student_course_cognitive_classification.dialogs.enhanced_export.loading_students',
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ) : (
                                                                courseStudents.map(
                                                                    (student: any) => (
                                                                        <TableRow key={student.id}>
                                                                            <TableCell>
                                                                                <Checkbox
                                                                                    onCheckedChange={(
                                                                                        checked,
                                                                                    ) =>
                                                                                        handleStudentSelection(
                                                                                            student.id,
                                                                                            !!checked,
                                                                                        )
                                                                                    }
                                                                                    checked={selectedStudents.includes(
                                                                                        student.id,
                                                                                    )}
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell className='font-medium'>
                                                                                {student.name}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {student.email}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {student.username}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ),
                                                                )
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>

                                                <p className='text-sm text-muted-foreground'>
                                                    {t(
                                                        'pages.student_course_cognitive_classification.dialogs.enhanced_export.students_selected',
                                                        {
                                                            selected: selectedStudents.length,
                                                            total: courseStudents.length,
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        <DialogFooter>
                                            <Button
                                                type='submit'
                                                disabled={
                                                    exportEnhancedData.isPending ||
                                                    selectedStudents.length === 0
                                                }
                                            >
                                                {exportEnhancedData.isPending
                                                    ? t(
                                                          'pages.student_course_cognitive_classification.dialogs.enhanced_export.exporting',
                                                      )
                                                    : t(
                                                          'pages.student_course_cognitive_classification.dialogs.enhanced_export.export_button',
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
