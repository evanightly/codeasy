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
import { userServiceHook } from '@/Services/userServiceHook';
import { ROUTES } from '@/Support/Constants/routes';
import { SchoolRequestStatusEnum } from '@/Support/Enums/schoolRequestStatusEnum';
import { SchoolRequestResource } from '@/Support/Interfaces/Resources';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    user_id: z.coerce.number().min(1, 'User is required'),
    school_id: z.coerce.number().min(1, 'School is required'),
    status: z.nativeEnum(SchoolRequestStatusEnum, {
        required_error: 'Status is required',
        invalid_type_error: 'Status must be a valid status type',
    }),
    message: z.string().min(1, 'Message is required'),
});

type FormData = z.infer<typeof formSchema>;
type SchoolRequestStatus = keyof typeof SchoolRequestStatusEnum;

interface Props {
    data: { data: SchoolRequestResource };
}

export default function Edit({ data: { data: request } }: Props) {
    const updateMutation = schoolRequestServiceHook.useUpdate();
    const { data: users } = userServiceHook.useGetAll();
    const { data: schools } = schoolServiceHook.useGetAll();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_id: request.user_id,
            school_id: request.school_id,
            status: request.status,
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
                                        <FormLabel>User</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select a user' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {users?.data?.map((user) => (
                                                    <SelectItem
                                                        value={user.id.toString()}
                                                        key={user.id}
                                                    >
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='user_id'
                                control={form.control}
                            />

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
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={(value: SchoolRequestStatus) => {
                                                field.onChange(SchoolRequestStatusEnum[value]);
                                            }}
                                            defaultValue={
                                                Object.keys(SchoolRequestStatusEnum).find(
                                                    (key) =>
                                                        SchoolRequestStatusEnum[
                                                            key as SchoolRequestStatus
                                                        ] === field.value,
                                                ) || ''
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select status' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {(
                                                    Object.keys(
                                                        SchoolRequestStatusEnum,
                                                    ) as SchoolRequestStatus[]
                                                ).map((statusKey) => (
                                                    <SelectItem
                                                        value={statusKey}
                                                        key={statusKey}
                                                        className='capitalize'
                                                    >
                                                        {statusKey}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                name='status'
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
