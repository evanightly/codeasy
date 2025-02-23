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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/UI/select';
import { Textarea } from '@/Components/UI/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { schoolRequestServiceHook } from '@/Services/schoolRequestServiceHook';
import { schoolServiceHook } from '@/Services/schoolServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { SchoolRequestResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    school_id: z.coerce.number().min(1, 'School is required'),
    message: z.string().min(1, 'Message is required'),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
    data: { data: SchoolRequestResource };
}

export default function Edit({ data: { data: request } }: Props) {
    const updateMutation = schoolRequestServiceHook.useUpdate();
    const { data: schools } = schoolServiceHook.useGetAll();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            school_id: request.school_id,
            message: request.message,
        },
    });

    const handleSubmit = async (values: FormData) => {
        toast.promise(
            updateMutation.mutateAsync({
                id: request.id,
                data: values,
            }),
            {
                loading: 'Updating request...',
                success: () => {
                    router.visit(route(`${ROUTES.SCHOOL_REQUESTS}.index`));
                    return 'Request updated successfully';
                },
                error: 'An error occurred while updating request',
            },
        );
    };

    return (
        <AuthenticatedLayout title={`Edit School Request: ${request.id}`}>
            <Card>
                <CardHeader>
                    <CardTitle>Edit School Request</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>School</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select a school' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {schools?.data?.map((school) => (
                                                    <SelectItem
                                                        value={school.id.toString()}
                                                        key={school.id}
                                                    >
                                                        {school.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='school_id'
                                control={form.control}
                            />

                            <FormField
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder='Enter request message'
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
                                variant='update'
                                type='submit'
                                loading={updateMutation.isPending}
                                disabled={updateMutation.isPending}
                            >
                                Update Request
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
