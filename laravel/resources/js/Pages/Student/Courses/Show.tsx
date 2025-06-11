import { PDFViewer } from '@/Components/PDFViewer';
import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/UI/dialog';
import { Progress } from '@/Components/UI/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/UI/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { CourseResource, LearningMaterialResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ArrowLeft, BookIcon, Code, Eye, FileTextIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    course: {
        data: CourseResource;
    };
    materials: {
        data: LearningMaterialResource[];
    };
}

export default function Show({ course, materials }: Props) {
    const { t } = useLaravelReactI18n();
    const [previewMaterial, setPreviewMaterial] = useState<LearningMaterialResource | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleOpenPreview = (material: LearningMaterialResource) => {
        setPreviewMaterial(material);
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setPreviewMaterial(null);
    };

    const renderTypeIcon = (type: string) => {
        switch (type) {
            case LearningMaterialTypeEnum.LIVE_CODE:
                return <Code className='mr-1 h-4 w-4' />;
            default:
                return <FileTextIcon className='mr-1 h-4 w-4' />;
        }
    };

    const renderTypeName = (type: string) => {
        switch (type) {
            case LearningMaterialTypeEnum.LIVE_CODE:
                return t('pages.learning_material.common.types.live_code');
            default:
                return type;
        }
    };

    return (
        <AuthenticatedLayout title={course.data.name}>
            <div className='mb-6 flex items-center justify-between'>
                <Link href={route('student.courses.index')}>
                    <Button variant='outline' size='sm' className='gap-1'>
                        <ArrowLeft className='h-4 w-4' />
                        {t('pages.student_courses.actions.back_to_courses')}
                    </Button>
                </Link>
            </div>

            <Card className='mb-6'>
                <CardHeader>
                    <CardTitle>{course.data.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col gap-4'>
                        <div>
                            <h3 className='font-semibold'>
                                {t('pages.student_courses.common.fields.classroom')}:
                            </h3>
                            <p>{course.data.classroom?.name}</p>
                        </div>

                        {course.data.description && (
                            <div>
                                <h3 className='font-semibold'>
                                    {t('pages.student_courses.common.fields.description')}:
                                </h3>
                                <p>{course.data.description}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className='flex flex-col space-y-1'>
                    <CardTitle className='flex items-center gap-2'>
                        <BookIcon className='h-5 w-5' />
                        {t('pages.student_materials.index.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table className='min-h-[600px]'>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {t('pages.student_materials.common.fields.title')}
                                </TableHead>
                                <TableHead>
                                    {t('pages.student_materials.common.fields.type')}
                                </TableHead>
                                <TableHead>
                                    {t('pages.student_materials.common.fields.description')}
                                </TableHead>
                                <TableHead>
                                    {t('pages.student_courses.common.fields.progress')}
                                </TableHead>
                                <TableHead className='text-right'>{t('action.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materials.data.map((material) => (
                                <TableRow key={material.id}>
                                    <TableCell className='font-medium'>
                                        <Link
                                            href={route(`${ROUTES.STUDENT_COURSE_MATERIALS}.show`, [
                                                course.data.id,
                                                material.id,
                                            ])}
                                            className='text-blue-600 hover:underline'
                                        >
                                            {material.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant='outline'
                                            className='flex w-fit items-center'
                                        >
                                            {renderTypeIcon(material?.type ?? '')}
                                            {renderTypeName(material?.type ?? '')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className='max-w-[300px] truncate'>
                                            {material.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className='group relative flex min-w-[120px] items-center'>
                                            <Progress
                                                value={material.progress_percentage ?? 0}
                                                indicatorClassName={
                                                    (material.progress_percentage ?? 0) === 100
                                                        ? 'bg-green-500'
                                                        : 'bg-blue-500'
                                                }
                                            />
                                            <span className='absolute right-2 text-xs font-semibold text-white drop-shadow'>
                                                {material.progress_percentage ?? 0}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {material.file_url &&
                                            material.file_extension?.toLowerCase() === 'pdf' && (
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => handleOpenPreview(material)}
                                                    className='ml-auto flex items-center gap-1'
                                                >
                                                    <Eye />
                                                    <span>
                                                        {t(
                                                            'pages.learning_material.show.view_file',
                                                        )}
                                                    </span>
                                                </Button>
                                            )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* PDF Viewer Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={handleClosePreview}>
                <DialogContent className='max-h-[90vh] max-w-[90vw] overflow-hidden'>
                    <DialogHeader>
                        <DialogTitle>{previewMaterial?.title}</DialogTitle>m
                        <DialogDescription />
                    </DialogHeader>
                    <div className='overflow-auto'>
                        {previewMaterial?.file_url &&
                            previewMaterial?.file_extension?.toLowerCase() === 'pdf' && (
                                <PDFViewer
                                    fileUrl={previewMaterial.file_url}
                                    filename={previewMaterial.file || previewMaterial.title}
                                    className='max-h-[80vh]'
                                />
                            )}
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
