import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ClassRoomResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ClassRoomDetails } from './Partials/ClassRoomDetails';
import { StudentsList } from './Partials/StudentsList';

interface Props {
    data: ClassRoomResource;
}

export default function Show({ data }: Props) {
    const { t } = useLaravelReactI18n();

    if (!data) return null;

    return (
        <AuthenticatedLayout title={t('pages.classroom.show.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{data.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='details'>
                        <TabsList>
                            <TabsTrigger value='details'>
                                {t('pages.classroom.show.sections.information')}
                            </TabsTrigger>
                            <TabsTrigger value='students'>
                                {t('pages.classroom.show.sections.students')}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value='details'>
                            <ClassRoomDetails classroom={data} />
                        </TabsContent>
                        <TabsContent value='students'>
                            <StudentsList classroom={data} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
