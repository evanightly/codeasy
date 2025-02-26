import { Badge } from '@/Components/UI/badge';
import { ClassRoomResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Props {
    classroom: ClassRoomResource;
}

export function ClassRoomDetails({ classroom }: Props) {
    const { t } = useLaravelReactI18n();

    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <h3 className='font-medium'>{t('pages.classroom.common.fields.school')}</h3>
                    <p>{classroom.school?.name}</p>
                </div>
                <div>
                    <h3 className='font-medium'>{t('pages.classroom.common.fields.name')}</h3>
                    <p>{classroom.name}</p>
                </div>
                <div>
                    <h3 className='font-medium'>{t('pages.classroom.common.fields.grade')}</h3>
                    <p>{classroom.grade}</p>
                </div>
                <div>
                    <h3 className='font-medium'>{t('pages.classroom.common.fields.year')}</h3>
                    <p>{classroom.year}</p>
                </div>
                <div>
                    <h3 className='font-medium'>{t('pages.classroom.common.fields.status')}</h3>
                    <Badge variant={classroom.active ? 'success' : 'destructive'}>
                        {classroom.active
                            ? t('pages.classroom.common.status.active')
                            : t('pages.classroom.common.status.inactive')}
                    </Badge>
                </div>
                {classroom.description && (
                    <div className='col-span-2'>
                        <h3 className='font-medium'>
                            {t('pages.classroom.common.fields.description')}
                        </h3>
                        <p>{classroom.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
