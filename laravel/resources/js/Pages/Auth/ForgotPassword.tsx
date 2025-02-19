import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title='Forgot Password' />

            <div className='mb-4 text-sm text-gray-600'>
                Forgot your password? No problem. Just let us know your email address and we will
                email you a password reset link that will allow you to choose a new one.
            </div>

            {status && <div className='mb-4 text-sm font-medium text-green-600'>{status}</div>}

            <form onSubmit={submit}>
                <TextInput
                    value={data.email}
                    type='email'
                    onChange={(e) => setData('email', e.target.value)}
                    name='email'
                    isFocused={true}
                    id='email'
                    className='mt-1 block w-full'
                />

                <InputError message={errors.email} className='mt-2' />

                <div className='mt-4 flex items-center justify-end'>
                    <PrimaryButton disabled={processing} className='ms-4'>
                        Email Password Reset Link
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
