import { Badge } from '@/Components/UI/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { SchoolResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Props {
    school: SchoolResource;
}

export function SchoolDetails({ school }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('pages.school.common.sections.information')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                    <Badge variant={school.active ? 'success' : 'destructive'}>
                        {school.active
                            ? t('pages.school.common.status.active')
                            : t('pages.school.common.status.inactive')}
                    </Badge>
                </div>

                <div className='space-y-2'>
                    <h3 className='text-sm font-medium'>
                        {t('pages.school.common.sections.contact_information')}
                    </h3>
                    <div className='grid gap-2 text-sm'>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>
                                {t('pages.school.common.fields.address')}:
                            </span>
                            <span className='col-span-2'>{school.address}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>
                                {t('pages.school.common.fields.city')}:
                            </span>
                            <span className='col-span-2'>{school.city}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>
                                {t('pages.school.common.fields.state')}:
                            </span>
                            <span className='col-span-2'>{school.state}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>
                                {t('pages.school.common.fields.zip')}:
                            </span>
                            <span className='col-span-2'>{school.zip}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>
                                {t('pages.school.common.fields.phone')}:
                            </span>
                            <span className='col-span-2'>{school.phone}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>
                                {t('pages.school.common.fields.email')}:
                            </span>
                            <span className='col-span-2'>{school.email}</span>
                        </div>
                        <div className='grid grid-cols-3'>
                            <span className='font-medium'>
                                {t('pages.school.common.fields.website')}:
                            </span>
                            <span className='col-span-2'>
                                {school.website && (
                                    <a
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        href={school.website}
                                        className='text-primary hover:underline'
                                    >
                                        {school.website}
                                    </a>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
