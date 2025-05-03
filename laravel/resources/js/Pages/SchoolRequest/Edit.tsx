import GenericDataSelector from '@/Components/GenericDataSelector';
import { Button } from '@/Components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/UI/form';
import { Textarea } from '@/Components/UI/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { schoolRequestServiceHook } from '@/Services/schoolRequestServiceHook';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { ServiceFilterOptions } from '@/Support/Interfaces/Others';
import { SchoolRequestResource, SchoolResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface EditProps {
    data: SchoolRequestResource;
}

export default function Edit({ data }: EditProps) {
    const { t } = useLaravelReactI18n();
    const { teachedSchools } = usePage().props.auth.user;
    const updateMutation = schoolRequestServiceHook.useUpdate();
    const [schools, setSchools] = useState<SchoolResource[]>([]);

    const formSchema = z.object({
        user_id: z.coerce
            .number()
            .min(1, t('pages.school_request.common.validations.user_id.required')),
        school_id: z.coerce
            .number()
            .min(1, t('pages.school_request.common.validations.school_id.required')),
        message: z.string().min(1, t('pages.school_request.common.validations.message.required')),
    });

    type FormData = z.infer<typeof formSchema>;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_id: data.user_id,
            school_id: data.school_id,
            message: data.message || '',
        },
    });

    const fetchSchools = async (filters: ServiceFilterOptions) => {
        const response = await schoolServiceHook.getAll({
            filters: {
                ...filters,
            },
        });
        return response.data as SchoolResource[];
    };

    useEffect(() => {
        // Fetch all schools and filter out schools the user is already teaching at
        fetchSchools({}).then((schools) => {
            // For edit, we need to include the currently selected school, even if it's in teachedSchools
            const filteredSchools = schools.filter(
                (school) => !teachedSchools.includes(school.id) || school.id === data.school_id,
            );
            setSchools(filteredSchools);
        });
    }, [teachedSchools, data.school_id]);

    const handleSubmit = async (values: FormData) => {
        toast.promise(
            updateMutation.mutateAsync({
                id: data.id,
                data: values,
            }),
            {
                loading: t('pages.school_request.common.messages.pending.update'),
                success: () => {
                    router.visit(route(`${ROUTES.SCHOOL_REQUESTS}.index`));
                    return t('pages.school_request.common.messages.success.update');
                },
                error: t('pages.school_request.common.messages.error.update'),
            },
        );
    };

    return (
        <AuthenticatedLayout title={t('pages.school_request.edit.title')}>
            <Head title={t('pages.school_request.edit.title')} />
            <Card>
                <CardHeader>
                    <CardTitle>{t('pages.school_request.edit.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.school_request.common.fields.school')}
                                        </FormLabel>
                                        <FormControl>
                                            <GenericDataSelector<SchoolResource>
                                                setSelectedData={(school) => {
                                                    field.onChange(school);
                                                }}
                                                selectedDataId={field.value}
                                                renderItem={(school) => school?.name ?? ''}
                                                placeholder={t(
                                                    'pages.school_request.common.placeholders.school',
                                                )}
                                                nullable={false}
                                                initialSearch={data.school?.name}
                                                data={schools}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='school_id'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t('pages.school_request.common.fields.message')}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t(
                                                    'pages.school_request.common.placeholders.message',
                                                )}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='message'
                                control={form.control}
                            />

                            <Button
                                type='submit'
                                loading={updateMutation.isPending}
                                disabled={updateMutation.isPending}
                            >
                                {t('pages.school_request.edit.buttons.update')}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
