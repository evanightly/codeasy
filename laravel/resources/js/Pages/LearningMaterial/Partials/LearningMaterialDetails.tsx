import { PDFViewer } from '@/Components/PDFViewer';
import { Badge } from '@/Components/UI/badge';
import { Button } from '@/Components/UI/button';
import { ROUTES } from '@/Support/Constants/routes';
import { LearningMaterialTypeEnum } from '@/Support/Enums/learningMaterialTypeEnum';
import { LearningMaterialResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    BookIcon,
    CalendarIcon,
    FileIcon,
    FileTextIcon,
    GraduationCapIcon,
    ListOrderedIcon,
} from 'lucide-react';

interface LearningMaterialDetailsProps {
    material: LearningMaterialResource;
}

export const LearningMaterialDetails = ({ material }: LearningMaterialDetailsProps) => {
    const { t } = useLaravelReactI18n();

    const renderContent = () => {
        if (material.file && material.file_extension) {
            return (
                <div className='mt-6 rounded-lg border p-6'>
                    <div className='mb-4 flex items-center gap-2'>
                        <FileTextIcon className='h-5 w-5 text-muted-foreground' />
                        <span className='font-semibold'>
                            {t('pages.learning_material.common.fields.file')}
                        </span>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                        {t('pages.learning_material.show.file_info', {
                            name: material.file,
                            extension: material.file_extension,
                        })}
                    </p>

                    {material.file_extension.toLowerCase() === 'pdf' ? (
                        <div className='mt-4'>
                            <PDFViewer
                                fileUrl={material?.file_url || ''}
                                filename={`${material.title}.${material.file_extension}`}
                                className='mt-2'
                            />
                        </div>
                    ) : (
                        <div className='mt-2'>
                            <a
                                target='_blank'
                                rel='noreferrer'
                                href={`/storage/learning-materials/${material.type === 'live_code' ? 'code' : 'other'}/${material.file}.${material.file_extension}`}
                                className='text-primary hover:underline'
                            >
                                {t('action.view_file')}
                            </a>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className='space-y-6'>
            <div className='flex flex-col gap-4 md:flex-row md:justify-between'>
                <div className='flex items-center gap-2'>
                    <Badge
                        variant={
                            material.type === LearningMaterialTypeEnum.LIVE_CODE
                                ? 'default'
                                : material.type === LearningMaterialTypeEnum.QUIZ
                                  ? 'secondary'
                                  : 'outline'
                        }
                    >
                        {t(`pages.learning_material.common.types.${material?.type?.toLowerCase()}`)}
                    </Badge>
                    <Badge variant={material.active ? 'success' : 'destructive'}>
                        {material.active
                            ? t('pages.learning_material.common.status.active')
                            : t('pages.learning_material.common.status.inactive')}
                    </Badge>
                </div>
                <div className='flex items-center gap-2'>
                    <Link
                        href={route(`${ROUTES.COURSES}.show`, material.course?.id)}
                        className={material.course ? 'text-blue-600 hover:underline' : ''}
                    >
                        <Button variant='outline' size='sm'>
                            <GraduationCapIcon className='mr-2 h-4 w-4' />
                            {material.course?.name || t('pages.learning_material.common.no_course')}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className='space-y-4'>
                <h3 className='text-lg font-medium'>
                    {t('pages.learning_material.show.sections.details')}
                </h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='flex items-center gap-2'>
                        <BookIcon className='h-5 w-5 text-muted-foreground' />
                        <span className='font-semibold'>
                            {t('pages.learning_material.common.fields.title')}:
                        </span>
                        <span>{material.title}</span>
                    </div>

                    <div className='flex items-center gap-2'>
                        <ListOrderedIcon className='h-5 w-5 text-muted-foreground' />
                        <span className='font-semibold'>
                            {t('pages.learning_material.common.fields.order')}:
                        </span>
                        <span>{material.order_number}</span>
                    </div>
                </div>

                {material.description && (
                    <div className='mt-2'>
                        <div className='flex items-start gap-2'>
                            <FileIcon className='mt-1 h-5 w-5 text-muted-foreground' />
                            <div>
                                <span className='block font-semibold'>
                                    {t('pages.learning_material.common.fields.description')}:
                                </span>
                                <p className='mt-1 whitespace-pre-line'>{material.description}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {renderContent()}

            {(material.created_at || material.updated_at) && (
                <div className='space-y-4 border-t pt-4'>
                    <h3 className='text-lg font-medium'>
                        {t('pages.learning_material.common.sections.timestamps')}
                    </h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {material.created_at && (
                            <div className='flex items-center gap-2'>
                                <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                                <span className='font-semibold'>
                                    {t('pages.common.columns.created_at')}:
                                </span>
                                <span>{new Date(material.created_at).toLocaleString()}</span>
                            </div>
                        )}
                        {material.updated_at && (
                            <div className='flex items-center gap-2'>
                                <CalendarIcon className='h-5 w-5 text-muted-foreground' />
                                <span className='font-semibold'>
                                    {t('pages.common.columns.updated_at')}:
                                </span>
                                <span>{new Date(material.updated_at).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
