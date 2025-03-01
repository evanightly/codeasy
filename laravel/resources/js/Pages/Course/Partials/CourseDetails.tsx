import { Badge } from '@/Components/UI/badge';

import { ROUTES } from '@/Support/Constants/routes';
import { CourseResource } from '@/Support/Interfaces/Resources';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CalendarIcon, School2Icon, UserIcon } from 'lucide-react';

interface CourseDetailsProps {
    course: CourseResource;
}

export const CourseDetails = ({ course }: CourseDetailsProps) => {
    const { t } = useLaravelReactI18n();

    return (
        <div className='space-y-6'>
            <div className='flex flex-col gap-4 md:flex-row md:justify-between'>
                <div className='flex items-center gap-2'>
                    <School2Icon className='h-5 w-5' />
                    <span className='font-semibold'>
                        {t('pages.course.common.fields.classroom')}:
                    </span>
                    {course.classroom ? (
                        <Link
                            href={route(`${ROUTES.CLASS_ROOMS}.show`, course.classroom.id)}
                            className='text-blue-600 hover:underline'
                        >
                            {course.classroom.name}
                        </Link>
                    ) : (
                        <span>{t('pages.course.common.not_assigned')}</span>
                    )}
                </div>

                <div className='flex items-center gap-2'>
                    <UserIcon className='h-5 w-5' />
                    <span className='font-semibold'>
                        {t('pages.course.common.fields.teacher')}:
                    </span>
                    {course.teacher ? (
                        <span>{course.teacher.name}</span>
                    ) : (
                        <span>{t('pages.course.common.not_assigned')}</span>
                    )}
                </div>

                <div className='flex items-center gap-2'>
                    <Badge variant={course.active ? 'success' : 'destructive'}>
                        {course.active
                            ? t('pages.course.common.status.active')
                            : t('pages.course.common.status.inactive')}
                    </Badge>
                </div>
            </div>

            <div className='space-y-4'>
                <h3 className='text-lg font-medium'>{t('pages.course.common.sections.details')}</h3>
                <div className='space-y-2'>
                    <div>
                        <span className='font-semibold'>
                            {t('pages.course.common.fields.name')}:
                        </span>
                        <span className='ml-2'>{course.name}</span>
                    </div>

                    {course.description && (
                        <div>
                            <span className='font-semibold'>
                                {t('pages.course.common.fields.description')}:
                            </span>
                            <p className='mt-1'>{course.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {(course.created_at || course.updated_at) && (
                <div className='space-y-4 border-t pt-4'>
                    <h3 className='text-lg font-medium'>
                        {t('pages.course.common.sections.timestamps')}
                    </h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {course.created_at && (
                            <div className='flex items-center gap-2'>
                                <CalendarIcon className='h-5 w-5' />
                                <span className='font-semibold'>
                                    {t('pages.common.columns.created_at')}:
                                </span>
                                <span>{new Date(course.created_at).toLocaleString()}</span>
                            </div>
                        )}
                        {course.updated_at && (
                            <div className='flex items-center gap-2'>
                                <CalendarIcon className='h-5 w-5' />
                                <span className='font-semibold'>
                                    {t('pages.common.columns.updated_at')}:
                                </span>
                                <span>{new Date(course.updated_at).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
