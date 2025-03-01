import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CourseResource } from '@/Support/Interfaces/Resources';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CourseDetails } from './Partials/CourseDetails';

interface Props {
    data: {
        data: CourseResource;
    };
}

export default function Show({ data: { data } }: Props) {
    const { t } = useLaravelReactI18n();

    if (!data) return null;

    return (
        <AuthenticatedLayout title={t('pages.course.show.title')}>
            <Card>
                <CardHeader>
                    <CardTitle>{data.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='details'>
                        <TabsList>
                            <TabsTrigger value='details'>
                                {t('pages.course.show.sections.information')}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value='details'>
                            <CourseDetails course={data} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
